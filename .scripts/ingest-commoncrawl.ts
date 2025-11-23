#!/usr/bin/env tsx

/**
 * Ingest Common Crawl Hyperlink Graph (Host-Level)
 *
 * Ingests the Common Crawl host-level hyperlink graph:
 * - Vertices (468M nodes) → domains table with id (nodeIndex) + name (reversed hostname)
 * - Edges (8B edges) → relationships table using dictGet() for URL lookups
 *
 * Note: Hostnames are stored in reverse DNS notation (com.example.subdomain)
 * and converted to URLs in queries using dictGet() + string manipulation
 */

import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, createReadStream } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createInterface } from 'readline';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD,
  request_timeout: 7200000, // 2 hours for large dataset
});

const BASE_URL = 'https://data.commoncrawl.org/projects/hyperlinkgraph/cc-main-2025-aug-sep-oct/host';
const VERTICES_PATHS_URL = `${BASE_URL}/cc-main-2025-aug-sep-oct-host-vertices.paths.gz`;
const EDGES_PATHS_URL = `${BASE_URL}/cc-main-2025-aug-sep-oct-host-edges.paths.gz`;
const RANKINGS_URL = `${BASE_URL}/cc-main-2025-aug-sep-oct-host-ranks.txt.gz`;

/**
 * Download and extract a .paths.gz file to get list of data file URLs
 */
async function downloadPathsList(url: string, localFile: string): Promise<string[]> {
  console.log(`📥 Downloading ${path.basename(url)}...`);

  await execAsync(`curl -L -o "${localFile}" "${url}"`);
  console.log(`✅ Downloaded\n`);

  console.log(`📦 Extracting paths list...`);
  await execAsync(`gunzip -f "${localFile}"`);
  const txtFile = localFile.replace('.gz', '');
  console.log(`✅ Extracted\n`);

  // Read paths from file
  const paths: string[] = [];
  const fileStream = createReadStream(txtFile);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) {
      paths.push(`https://data.commoncrawl.org/${line.trim()}`);
    }
  }

  console.log(`   Found ${paths.length} data files\n`);
  return paths;
}

/**
 * Process vertices files → domains AND things tables with rankings
 */
async function ingestVertices(pathsFiles: string[], batchTimestamp: string) {
  console.log('🔷 Processing vertices (nodes)...\n');

  // First, create a temp table and load rankings
  console.log('📊 Loading rankings data...');
  await client.exec({
    query: `
      CREATE TABLE IF NOT EXISTS temp_rankings (
        harmonicc_pos UInt64,
        harmonicc_val Float64,
        pr_pos UInt64,
        pr_val Float64,
        host_rev String
      ) ENGINE = Memory
    `
  });

  await client.exec({
    query: `
      INSERT INTO temp_rankings
      SELECT
        c1 AS harmonicc_pos,
        c2 AS harmonicc_val,
        c3 AS pr_pos,
        c4 AS pr_val,
        c5 AS host_rev
      FROM url('${RANKINGS_URL}', 'TabSeparatedWithNames',
        'harmonicc_pos UInt64, harmonicc_val Float64, pr_pos UInt64, pr_val Float64, host_rev String')
      WHERE harmonicc_pos > 0  -- Skip header row
    `
  });
  console.log('✅ Rankings loaded\n');

  let totalVertices = 0;

  for (let i = 0; i < pathsFiles.length; i++) {
    const url = pathsFiles[i];
    console.log(`   [${i + 1}/${pathsFiles.length}] ${path.basename(url)}`);

    // Insert into domains table
    const domainsInsert = `
      INSERT INTO public.domains (id, name)
      SELECT
        c1 AS id,
        arrayStringConcat(arrayReverse(splitByChar('.', c2)), '.') AS name
      FROM url('${url}', 'TabSeparated', 'c1 UInt64, c2 String')
    `;

    await client.exec({
      query: domainsInsert,
      clickhouse_settings: {
        max_execution_time: 600,
      }
    });

    // Insert into things table with rankings data
    const thingsInsert = `
      INSERT INTO public.things (ns, type, id, url, data, createdAt, updatedAt, version)
      SELECT
        'web.org.ai' AS ns,
        'Host' AS type,
        arrayStringConcat(arrayReverse(splitByChar('.', v.c2)), '.') AS id,
        concat('https://', arrayStringConcat(arrayReverse(splitByChar('.', v.c2)), '.')) AS url,
        JSONExtractRaw('{' ||
          '"harmonicc_pos":' || toString(r.harmonicc_pos) || ',' ||
          '"harmonicc_val":' || toString(r.harmonicc_val) || ',' ||
          '"pr_pos":' || toString(r.pr_pos) || ',' ||
          '"pr_val":' || toString(r.pr_val) ||
        '}') AS data,
        toDateTime('${batchTimestamp}') AS createdAt,
        toDateTime('${batchTimestamp}') AS updatedAt,
        1 AS version
      FROM url('${url}', 'TabSeparated', 'c1 UInt64, c2 String') AS v
      LEFT JOIN temp_rankings AS r ON v.c2 = r.host_rev
    `;

    await client.exec({
      query: thingsInsert,
      clickhouse_settings: {
        max_execution_time: 600,
      }
    });

    const countResult = await client.query({
      query: `SELECT count() as count FROM url('${url}', 'TabSeparated', 'c1 UInt64, c2 String')`,
      format: 'JSONEachRow',
    });
    const countData = await countResult.json<{ count: string }>();
    const count = parseInt(countData[0].count);
    totalVertices += count;

    console.log(`      Inserted ${count.toLocaleString()} to domains and things\n`);
  }

  // Cleanup temp table
  await client.exec({ query: 'DROP TABLE IF EXISTS temp_rankings' });

  console.log(`✅ Total vertices ingested: ${totalVertices.toLocaleString()}\n`);
}

async function main() {
  console.log('\n🌐 Ingesting Common Crawl Host-Level Hyperlink Graph\n');
  console.log('   Dataset: cc-main-2025-aug-sep-oct');
  console.log('   Nodes: 468.4 million hosts');
  console.log('   Edges: 8.0 billion hyperlinks\n');

  try {
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    const sourceDir = path.join(PROJECT_ROOT, '.source', 'CommonCrawl');
    if (!existsSync(sourceDir)) {
      mkdirSync(sourceDir, { recursive: true });
    }

    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    // Download paths files
    const verticesPathsFile = path.join(sourceDir, 'vertices.paths.gz');

    const verticesPaths = await downloadPathsList(VERTICES_PATHS_URL, verticesPathsFile);

    // Process vertices
    await ingestVertices(verticesPaths, batchTimestamp);

    console.log('✅ Common Crawl vertices ingestion complete!\n');
    console.log('📝 Summary:');
    console.log('   - Vertices → domains table (id, name)');
    console.log('   - Vertices → things table (ns, type, id, url, data with rankings)');
    console.log('   - Next: Ingest edges\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

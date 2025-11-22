#!/usr/bin/env tsx

/**
 * Ingest Common Crawl Hyperlink Graph (Host-Level)
 *
 * Ingests the Common Crawl host-level hyperlink graph:
 * - Vertices (468M nodes) → domains table with id + name + url
 * - Edges (8B edges) → relationships table using dictGet() for URL lookups
 *
 * Note: Hostnames are in reverse DNS notation (com.example.subdomain)
 * and need to be converted to full URLs (https://subdomain.example.com)
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
 * Process vertices files → domains table using url()
 */
async function ingestVertices(pathsFiles: string[], batchTimestamp: string) {
  console.log('🔷 Processing vertices (nodes)...\n');

  let totalVertices = 0;

  for (let i = 0; i < pathsFiles.length; i++) {
    const url = pathsFiles[i];
    console.log(`   [${i + 1}/${pathsFiles.length}] ${path.basename(url)}`);

    // Format: nodeIndex TAB reversedHostname
    // Insert using ClickHouse url() function - stream directly from remote URL
    const insertQuery = `
      INSERT INTO public.domains (id, name, url, createdAt)
      SELECT
        c1 AS id,  -- nodeIndex as UInt64
        c2 AS name,  -- Reversed hostname
        concat('https://', arrayStringConcat(arrayReverse(splitByChar('.', c2)), '.')) AS url,
        toDateTime('${batchTimestamp}') AS createdAt
      FROM url('${url}', 'TabSeparated', 'c1 UInt64, c2 String')
    `;

    await client.exec({
      query: insertQuery,
      clickhouse_settings: {
        max_execution_time: 600,
      }
    });

    // Get count - also use url()
    const countResult = await client.query({
      query: `SELECT count() as count FROM url('${url}', 'TabSeparated', 'c1 UInt64, c2 String')`,
      format: 'JSONEachRow',
    });
    const countData = await countResult.json<{ count: string }>();
    const count = parseInt(countData[0].count);
    totalVertices += count;

    console.log(`      Inserted ${count.toLocaleString()} vertices\n`);
  }

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
    console.log('   - Vertices → domains table (id, name, url)');
    console.log('   - Next: Create dictionary and ingest edges\n');

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

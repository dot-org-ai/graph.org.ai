#!/usr/bin/env tsx

/**
 * Ingest Common Crawl Edges (Host-Level Hyperlinks)
 *
 * Ingests 8.0 billion edges from Common Crawl using dictGet() for fast URL lookups
 * from the domains dictionary (no JOINs at this scale).
 *
 * Format: fromIndex TAB toIndex
 * Uses dictGet('public.domains_dict', 'url', nodeIndex) for URL resolution
 */

import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, createReadStream } from 'fs';
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
 * Process edges files → relationships table using dictGet()
 */
async function ingestEdges(pathsFiles: string[], batchTimestamp: string) {
  console.log('🔶 Processing edges (relationships)...\n');

  let totalEdges = 0;
  let totalSkipped = 0;

  for (let i = 0; i < pathsFiles.length; i++) {
    const url = pathsFiles[i];
    console.log(`   [${i + 1}/${pathsFiles.length}] ${path.basename(url)}`);

    // Format: fromIndex TAB toIndex
    // Direct JOIN with domains table (no dictionary needed at this scale)
    const insertQuery = `
      INSERT INTO public.relationships (ns, \`from\`, predicate, reverse, \`to\`, createdAt, updatedAt)
      SELECT
        'web.org.ai' AS ns,
        d1.url AS \`from\`,
        'linksTo' AS predicate,
        'linksFrom' AS reverse,
        d2.url AS \`to\`,
        toDateTime('${batchTimestamp}') AS createdAt,
        toDateTime('${batchTimestamp}') AS updatedAt
      FROM url('${url}', 'TabSeparated', 'c1 UInt64, c2 UInt64') AS edges
      INNER JOIN public.domains AS d1 ON edges.c1 = d1.id
      INNER JOIN public.domains AS d2 ON edges.c2 = d2.id
    `;

    await client.exec({
      query: insertQuery,
      clickhouse_settings: {
        max_execution_time: 600,
      }
    });

    // Get counts
    const totalCountResult = await client.query({
      query: `SELECT count() as count FROM url('${url}', 'TabSeparated', 'c1 UInt64, c2 UInt64')`,
      format: 'JSONEachRow',
    });
    const totalCountData = await totalCountResult.json<{ count: string }>();
    const totalCount = parseInt(totalCountData[0].count);

    const insertedCountResult = await client.query({
      query: `
        SELECT count() as count
        FROM url('${url}', 'TabSeparated', 'c1 UInt64, c2 UInt64')
        WHERE dictHas('public.domains_dict', c1) AND dictHas('public.domains_dict', c2)
      `,
      format: 'JSONEachRow',
    });
    const insertedCountData = await insertedCountResult.json<{ count: string }>();
    const insertedCount = parseInt(insertedCountData[0].count);

    const skippedCount = totalCount - insertedCount;

    totalEdges += insertedCount;
    totalSkipped += skippedCount;

    console.log(`      Inserted ${insertedCount.toLocaleString()} edges (skipped ${skippedCount.toLocaleString()} with missing domains)\n`);
  }

  console.log(`✅ Total edges ingested: ${totalEdges.toLocaleString()}`);
  console.log(`   Total skipped (missing domains): ${totalSkipped.toLocaleString()}\n`);
}

async function main() {
  console.log('\n🌐 Ingesting Common Crawl Host-Level Edges (Hyperlinks)\n');
  console.log('   Dataset: cc-main-2025-aug-sep-oct');
  console.log('   Edges: 8.0 billion hyperlinks');
  console.log('   Method: dictGet() lookups (no JOINs)\n');

  try {
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    const sourceDir = path.join(PROJECT_ROOT, '.source', 'CommonCrawl');
    if (!existsSync(sourceDir)) {
      throw new Error('Source directory not found - run ingest-commoncrawl.ts first');
    }

    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    // Download paths file
    const edgesPathsFile = path.join(sourceDir, 'edges.paths.gz');
    const edgesPaths = await downloadPathsList(EDGES_PATHS_URL, edgesPathsFile);

    // Process edges
    await ingestEdges(edgesPaths, batchTimestamp);

    console.log('✅ Common Crawl edges ingestion complete!\n');
    console.log('📝 Summary:');
    console.log('   - Edges → relationships table (from, predicate, to)');
    console.log('   - URLs resolved via dictGet() from domains dictionary');
    console.log('   - Only edges with both domains in dictionary were inserted\n');

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

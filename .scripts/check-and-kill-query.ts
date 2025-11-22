#!/usr/bin/env tsx

/**
 * Check for running queries and kill the incorrect Wikidata ingestion query
 */

import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD,
  request_timeout: 30000,
});

async function main() {
  console.log('\n🔍 Checking for running queries...\n');

  try {
    // List all running queries
    const result = await client.query({
      query: `
        SELECT
          query_id,
          query,
          user,
          elapsed,
          formatReadableSize(memory_usage) as memory,
          formatReadableQuantity(read_rows) as rows_read,
          formatReadableQuantity(written_rows) as rows_written
        FROM system.processes
        WHERE query NOT LIKE '%system.processes%'
      `,
      format: 'Vertical',
    });

    const output = await result.text();
    console.log('Running queries:');
    console.log(output);
    console.log('');

    // Ask if we should kill queries containing wikidata_staging
    const killResult = await client.query({
      query: `
        SELECT query_id
        FROM system.processes
        WHERE query LIKE '%wikidata_staging%'
        AND query NOT LIKE '%system.processes%'
      `,
      format: 'JSONEachRow',
    });

    const queries = await killResult.json<{ query_id: string }>();

    if (queries.length > 0) {
      console.log(`Found ${queries.length} wikidata_staging queries to kill:\n`);

      for (const q of queries) {
        console.log(`Killing query: ${q.query_id}`);
        await client.command({
          query: `KILL QUERY WHERE query_id = '${q.query_id}' SYNC`,
        });
        console.log(`✅ Killed ${q.query_id}\n`);
      }
    } else {
      console.log('No wikidata_staging queries found to kill');
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

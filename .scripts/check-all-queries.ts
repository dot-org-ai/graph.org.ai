#!/usr/bin/env tsx

/**
 * Check ALL running queries
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
  console.log('\n📊 All Running Queries\n');

  try {
    const result = await client.query({
      query: `
        SELECT
          query_id,
          user,
          elapsed,
          formatReadableSize(memory_usage) as memory,
          formatReadableQuantity(read_rows) as rows_read,
          formatReadableQuantity(written_rows) as rows_written,
          query
        FROM system.processes
        WHERE query NOT LIKE '%system.processes%'
      `,
      format: 'Vertical',
    });

    const output = await result.text();
    console.log(output || 'No active queries found');
    console.log('');

    // Also check query log for recent queries
    console.log('📋 Recent queries (last 5 minutes):');
    const logResult = await client.query({
      query: `
        SELECT
          query_id,
          type,
          query_duration_ms,
          formatReadableQuantity(read_rows) as rows_read,
          formatReadableQuantity(written_rows) as rows_written,
          substring(query, 1, 80) as query_preview,
          exception
        FROM system.query_log
        WHERE event_time >= now() - INTERVAL 5 MINUTE
        AND query LIKE '%wikidata%'
        AND query NOT LIKE '%system.query_log%'
        ORDER BY event_time DESC
        LIMIT 10
      `,
      format: 'Vertical',
    });

    const logOutput = await logResult.text();
    console.log(logOutput || 'No recent wikidata queries found');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

#!/usr/bin/env tsx

/**
 * Check extended query log for errors
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
  console.log('\n📋 Extended Query Log (last 10 minutes)\n');

  try {
    const result = await client.query({
      query: `
        SELECT
          event_time,
          query_id,
          type,
          query_duration_ms,
          formatReadableQuantity(read_rows) as rows_read,
          formatReadableQuantity(written_rows) as rows_written,
          substring(query, 1, 100) as query_preview,
          substring(exception, 1, 200) as exception_preview
        FROM system.query_log
        WHERE event_time >= now() - INTERVAL 10 MINUTE
        AND (query LIKE '%wikidata%' OR query LIKE '%url(%')
        AND query NOT LIKE '%system.query_log%'
        ORDER BY event_time DESC
        LIMIT 20
      `,
      format: 'Vertical',
    });

    const output = await result.text();
    console.log(output || 'No recent queries found');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

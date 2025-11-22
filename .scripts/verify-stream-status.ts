#!/usr/bin/env tsx

/**
 * Verify Wikidata Stream Status
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
  console.log('\n📊 Wikidata Stream Status\n');

  try {
    // Check running queries
    console.log('🔍 Running queries:');
    const procResult = await client.query({
      query: `
        SELECT
          query_id,
          substring(query, 1, 100) as query_preview,
          elapsed,
          formatReadableSize(memory_usage) as memory,
          formatReadableQuantity(read_rows) as rows_read,
          formatReadableQuantity(written_rows) as rows_written
        FROM system.processes
        WHERE query LIKE '%wikidata_staging%'
        AND query NOT LIKE '%system.processes%'
      `,
      format: 'Vertical',
    });
    const procOutput = await procResult.text();
    console.log(procOutput || '  No active wikidata_staging queries found');
    console.log('');

    // Check staging table
    console.log('📋 Staging table status:');
    const countResult = await client.query({
      query: 'SELECT count() as count FROM public.wikidata_staging',
      format: 'JSONEachRow',
    });
    const countData = await countResult.json<any>();
    console.log(`  Total rows: ${countData[0].count.toLocaleString()}`);

    // Sample a few entities if any exist
    if (countData[0].count > 0) {
      const sampleResult = await client.query({
        query: `
          SELECT
            JSONExtractString(toJSONString(entity), 'id') as id,
            JSONExtractString(toJSONString(entity), 'labels', 'en', 'value') as label,
            JSONExtractString(toJSONString(entity), 'descriptions', 'en', 'value') as description
          FROM public.wikidata_staging
          WHERE JSONExtractString(toJSONString(entity), 'labels', 'en', 'value') != ''
          LIMIT 5
        `,
        format: 'JSONEachRow',
      });
      const samples = await sampleResult.json<any>();

      console.log('\n  Sample entities:');
      for (const s of samples) {
        console.log(`    ${s.id}: ${s.label}`);
        if (s.description) {
          console.log(`      ${s.description}`);
        }
      }
    }

    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

#!/usr/bin/env tsx

/**
 * Start Wiktionary Streaming to Unified Source Table
 *
 * Submits the long-running INSERT query to ClickHouse and disconnects
 * The query continues running server-side for several hours
 *
 * Uses the unified source table with:
 *   - source: 'wiktionary'
 *   - data: raw JSON line
 *   - batch: timestamp from start of ingest
 *   - ingested: timestamp when row was inserted (auto)
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
  // No request_timeout - let it run as long as needed
});

async function main() {
  console.log('\n📚 Starting Wiktionary Stream to Unified Source Table\n');
  console.log(`📡 Server: ${process.env.CLICKHOUSE_URL}\n`);

  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    // Check if unified source table exists
    console.log('📋 Checking schema...');
    const tables = await client.query({
      query: 'SHOW TABLES FROM public',
      format: 'JSONEachRow',
    });
    const tableList = await tables.json<any>();
    const hasSource = tableList.some((t: any) => t.name === 'source');

    const hasSources = tableList.some((t: any) => t.name === 'sources');

    if (!hasSources) {
      console.log('❌ Unified sources table not found. Run setup first:');
      console.log('   npx tsx .scripts/create-unified-staging.ts');
      process.exit(1);
    }
    console.log('✅ Schema ready\n');

    // Get current timestamp for batch identifier
    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    // Submit the streaming query
    console.log('🚀 Submitting streaming query...');
    console.log(`   Source: wiktionary`);
    console.log(`   Batch: ${batchTimestamp}`);
    console.log('   Source: kaikki.org pre-processed JSONL (2.3 GB compressed)');
    console.log('   This will run server-side for several hours');
    console.log('   You can close this script - the query continues on the server\n');

    await client.exec({
      query: `
        INSERT INTO public.sources (source, data, batch)
        SELECT
          'wiktionary' as source,
          line as data,
          parseDateTimeBestEffort('${batchTimestamp}') as batch
        FROM url(
          'https://kaikki.org/dictionary/raw-wiktextract-data.jsonl.gz',
          LineAsString
        )
        WHERE length(line) > 10
      `
    });

    console.log('✅ Query submitted successfully!\n');
    console.log('📊 The query is now running server-side on ClickHouse Cloud');
    console.log('   - Streaming 2.3 GB from kaikki.org');
    console.log('   - Processing ~1.7M English word entries');
    console.log('   - Processing will take a few hours\n');

    console.log('📝 Monitor progress:');
    console.log('   - ClickHouse Cloud Console: https://clickhouse.cloud');
    console.log(`   - Check row count: SELECT count() FROM public.sources WHERE source = 'wiktionary'`);
    console.log('   - View running queries in the Cloud console\n');

  } catch (error) {
    if (error instanceof Error && error.message.includes('Timeout')) {
      console.log('\n⚠️  Client timeout (this is normal!)');
      console.log('✅ Query was submitted and is running server-side');
      console.log('📊 Monitor progress in ClickHouse Cloud console\n');
    } else {
      console.error('\n❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  } finally {
    await client.close();
  }
}

main().catch(console.error);

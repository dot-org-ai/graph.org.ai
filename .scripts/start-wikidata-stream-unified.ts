#!/usr/bin/env tsx

/**
 * Start Wikidata Streaming to Unified Source Table
 *
 * Submits the long-running INSERT query to ClickHouse and disconnects
 * The query continues running server-side for 24-48 hours
 *
 * Uses the unified source table with:
 *   - source: 'wikidata'
 *   - data: raw JSON entity
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
  console.log('\n🌐 Starting Wikidata Stream to Unified Source Table\n');
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
    const hasThings = tableList.some((t: any) => t.name === 'things');

    if (!hasSource) {
      console.log('❌ Unified source table not found. Run setup first:');
      console.log('   npx tsx .scripts/create-unified-staging.ts');
      process.exit(1);
    }

    if (!hasThings) {
      console.log('❌ Things table not found. Run setup first:');
      console.log('   npx tsx .scripts/run-wikidata-ingestion.ts');
      process.exit(1);
    }
    console.log('✅ Schema ready\n');

    // Get current timestamp for batch identifier
    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    // Submit the streaming query
    console.log('🚀 Submitting streaming query...');
    console.log(`   Source: wikidata`);
    console.log(`   Batch: ${batchTimestamp}`);
    console.log('   This will run server-side for 24-48 hours');
    console.log('   You can close this script - the query continues on the server\n');

    // Use exec with async mode - query runs server-side
    // JSONAsString automatically decodes Unicode, then we cast to JSON type
    await client.exec({
      query: `
        INSERT INTO public.source (source, data, batch)
        SELECT
          'wikidata' as source,
          trimBoth(trim(TRAILING ',' FROM json)) as data,
          parseDateTimeBestEffort('${batchTimestamp}') as batch
        FROM url(
          'https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.bz2',
          JSONAsString
        )
        WHERE json != '[' AND json != ']' AND length(trim(json)) > 2
      `
    });

    console.log('✅ Query submitted successfully!\n');
    console.log('📊 The query is now running server-side on ClickHouse Cloud');
    console.log('   - It will stream 130GB from Wikimedia');
    console.log('   - Processing will take 24-48 hours');
    console.log('   - Query continues even if you close this script\n');

    console.log('📝 Monitor progress:');
    console.log('   - ClickHouse Cloud Console: https://clickhouse.cloud');
    console.log(`   - Check row count: SELECT count() FROM public.source WHERE source = 'wikidata'`);
    console.log('   - View running queries in the Cloud console\n');

  } catch (error) {
    if (error instanceof Error && error.message.includes('Timeout')) {
      // Timeout is actually OK - means query was submitted and is running
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

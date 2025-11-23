#!/usr/bin/env tsx

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
});

async function main() {
  console.log('\n🌐 Starting TLD Ingestion from IANA\n');
  console.log(`📡 Server: ${process.env.CLICKHOUSE_URL}\n`);

  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    // Create table
    console.log('📋 Creating table if not exists...');
    await client.exec({
      query: `
        CREATE TABLE IF NOT EXISTS source.tlds (
          tld String,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY tld
      `
    });
    console.log('✅ Table ready\n');

    // Get current timestamp for batch identifier
    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    // Submit the streaming query
    console.log('🚀 Submitting streaming query...');
    console.log(`   Source: IANA TLD list`);
    console.log(`   Batch: ${batchTimestamp}`);
    console.log('   URL: https://data.iana.org/TLD/tlds-alpha-by-domain.txt');
    console.log('   This will run server-side\n');

    await client.exec({
      query: `
        INSERT INTO source.tlds (tld, ingested_at)
        SELECT
          lower(line) as tld,
          parseDateTimeBestEffort('${batchTimestamp}') as ingested_at
        FROM url(
          'https://data.iana.org/TLD/tlds-alpha-by-domain.txt',
          LineAsString
        )
        WHERE length(line) > 0
          AND line NOT LIKE '#%'
      `
    });

    console.log('✅ Query submitted successfully!\n');

    // Check count
    const result = await client.query({
      query: 'SELECT count() as count FROM source.tlds',
      format: 'JSONEachRow'
    });
    const data = await result.json<{count: string}>();
    console.log(`📊 Total TLDs in database: ${data[0].count}\n`);

    console.log('✅ TLD ingestion complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

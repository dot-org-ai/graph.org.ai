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
  console.log('\n💱 Starting ISO 4217 Currency Codes Ingestion\n');
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
        CREATE TABLE IF NOT EXISTS source.currencies (
          code String,
          number String,
          decimal String,
          currency String,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY code
      `
    });
    console.log('✅ Table ready\n');

    // Get current timestamp for batch identifier
    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    // Submit the streaming query
    console.log('🚀 Submitting streaming query...');
    console.log(`   Source: ISO 4217 Currency Codes`);
    console.log(`   Batch: ${batchTimestamp}`);
    console.log('   URL: https://raw.githubusercontent.com/datasets/currency-codes/master/data/codes-all.csv');
    console.log('   This will run server-side\n');

    await client.exec({
      query: `
        INSERT INTO source.currencies (code, number, decimal, currency, ingested_at)
        SELECT
          AlphabeticCode as code,
          NumericCode as number,
          MinorUnit as decimal,
          Currency as currency,
          parseDateTimeBestEffort('${batchTimestamp}') as ingested_at
        FROM url(
          'https://raw.githubusercontent.com/datasets/currency-codes/master/data/codes-all.csv',
          CSV
        )
        WHERE length(AlphabeticCode) > 0
      `
    });

    console.log('✅ Query submitted successfully!\n');

    // Check count
    const result = await client.query({
      query: 'SELECT count() as count FROM source.currencies',
      format: 'JSONEachRow'
    });
    const data = await result.json<{count: string}>();
    console.log(`📊 Total currency codes: ${data[0].count}\n`);

    // Show some examples
    const examples = await client.query({
      query: 'SELECT code, currency FROM source.currencies WHERE length(code) = 3 LIMIT 10',
      format: 'JSONEachRow'
    });
    const exampleData = await examples.json<{code: string, currency: string}>();
    console.log('📝 Example currencies:');
    exampleData.forEach(row => {
      console.log(`   ${row.code}: ${row.currency}`);
    });

    console.log('\n✅ Currency codes ingestion complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

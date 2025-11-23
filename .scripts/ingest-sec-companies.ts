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
  console.log('\n🏢 Starting SEC Public Companies Ingestion\n');
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
        CREATE TABLE IF NOT EXISTS source.sec_companies (
          cik_str String,
          ticker String,
          title String,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (ticker, cik_str)
      `
    });
    console.log('✅ Table ready\n');

    // Fetch and parse the JSON
    console.log('🚀 Fetching SEC company tickers...');
    console.log('   URL: https://www.sec.gov/files/company_tickers.json\n');

    const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
      headers: {
        'User-Agent': 'graph.org.ai nate@nathanclevenger.com'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as Record<string, {cik_str: number, ticker: string, title: string}>;

    const companies = Object.values(data).map(company => ({
      cik_str: String(company.cik_str).padStart(10, '0'),
      ticker: company.ticker,
      title: company.title
    }));

    console.log(`📥 Received ${companies.length} companies\n`);

    // Insert into ClickHouse
    console.log('💾 Inserting into ClickHouse...');
    await client.insert({
      table: 'source.sec_companies',
      values: companies,
      format: 'JSONEachRow'
    });

    console.log('✅ Insert complete!\n');

    // Check count
    const result = await client.query({
      query: 'SELECT count() as count FROM source.sec_companies',
      format: 'JSONEachRow'
    });
    const countData = await result.json<{count: string}>();
    console.log(`📊 Total companies in database: ${countData[0].count}\n`);

    // Show some examples
    const examples = await client.query({
      query: 'SELECT cik_str, ticker, title FROM source.sec_companies LIMIT 10',
      format: 'JSONEachRow'
    });
    const exampleData = await examples.json<{cik_str: string, ticker: string, title: string}>();
    console.log('📝 Example companies:');
    exampleData.forEach(row => {
      console.log(`   ${row.ticker.padEnd(6)} (CIK ${row.cik_str}): ${row.title}`);
    });

    console.log('\n✅ SEC companies ingestion complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

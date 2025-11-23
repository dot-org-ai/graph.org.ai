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

// Sample stock exchange data following ISO 10383 MIC format
const sampleExchanges = [
  ['XNSE', 'XNSE', 'National Stock Exchange of India', 'NSE', 'Mumbai', 'IN', 'https://www.nseindia.com'],
  ['XBOM', 'XBOM', 'Bombay Stock Exchange', 'BSE', 'Mumbai', 'IN', 'https://www.bseindia.com'],
  ['XETR', 'XETR', 'Xetra', 'Deutsche Börse', 'Frankfurt', 'DE', 'https://www.xetra.com'],
  ['XETRA', 'XETR', 'Xetra Trading', 'Deutsche Börse', 'Frankfurt', 'DE', 'https://www.xetra.com'],
  ['XLSE', 'XLON', 'London Stock Exchange', 'LSE', 'London', 'GB', 'https://www.lseg.com'],
  ['XLON', 'XLON', 'London Stock Exchange Equities', 'LSE', 'London', 'GB', 'https://www.lseg.com'],
  ['XNAS', 'XNAS', 'NASDAQ', 'NASDAQ', 'New York', 'US', 'https://www.nasdaq.com'],
  ['XNYS', 'XNYS', 'New York Stock Exchange', 'NYSE', 'New York', 'US', 'https://www.nyse.com'],
  ['XTSE', 'XTSE', 'Toronto Stock Exchange', 'TMX', 'Toronto', 'CA', 'https://www.tmx.com'],
  ['XHKG', 'XHKG', 'Hong Kong Stock Exchange', 'HKEX', 'Hong Kong', 'HK', 'https://www.hkex.com.hk'],
  ['XSHG', 'XSHG', 'Shanghai Stock Exchange', 'SSE', 'Shanghai', 'CN', 'https://www.sse.com.cn'],
  ['XSHE', 'XSHE', 'Shenzhen Stock Exchange', 'SZSE', 'Shenzhen', 'CN', 'https://www.szse.cn'],
  ['XTKS', 'XTKS', 'Tokyo Stock Exchange', 'JPX', 'Tokyo', 'JP', 'https://www.jpx.co.jp'],
  ['XKRX', 'XKRX', 'Korea Exchange', 'KRX', 'Seoul', 'KR', 'https://www.krx.co.kr'],
  ['XBKK', 'XBKK', 'Stock Exchange of Thailand', 'SET', 'Bangkok', 'TH', 'https://www.set.or.th'],
  ['XMAE', 'XMAE', 'Madrid Stock Exchange', 'BME', 'Madrid', 'ES', 'https://www.bolsasymercados.es'],
  ['XMIL', 'XETR', 'Borsa Italiana', 'Borsa Italiana', 'Milan', 'IT', 'https://www.borsaitaliana.it'],
];

async function main() {
  console.log('\n📈 Starting ISO 10383 MIC (Stock Exchange) Codes Ingestion\n');
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
        CREATE TABLE IF NOT EXISTS source.stock_exchanges (
          mic String,
          operating_mic String,
          market_name String,
          legal_entity_name String,
          city String,
          country String,
          website String,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (country, mic)
      `
    });
    console.log('✅ Table ready\n');

    // Get current timestamp for batch identifier
    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    // Submit the streaming query
    console.log('🚀 Inserting stock exchange data...');
    console.log(`   Source: ISO 10383 MIC Codes (Stock Exchanges)`);
    console.log(`   Batch: ${batchTimestamp}`);
    console.log('   Format: Direct insertion with sample MIC codes');
    console.log(`   Records: ${sampleExchanges.length}`);
    console.log('   This will run server-side\n');

    // Build INSERT statement
    const values = sampleExchanges.map(ex =>
      `('${ex[0]}', '${ex[1]}', '${ex[2]}', '${ex[3]}', '${ex[4]}', '${ex[5]}', '${ex[6]}', '${batchTimestamp}')`
    ).join(',\n    ');

    const insertQuery = `
      INSERT INTO source.stock_exchanges
      (mic, operating_mic, market_name, legal_entity_name, city, country, website, ingested_at)
      VALUES
      ${values}
    `;

    await client.exec({ query: insertQuery });
    console.log('✅ Data inserted successfully!\n');

    // Check count
    const result = await client.query({
      query: 'SELECT count() as count FROM source.stock_exchanges',
      format: 'JSONEachRow'
    });
    const data = await result.json<{count: string}>();
    console.log(`📊 Total stock exchanges: ${data[0].count}\n`);

    // Show some examples
    const examples = await client.query({
      query: 'SELECT mic, market_name, country FROM source.stock_exchanges LIMIT 10',
      format: 'JSONEachRow'
    });
    const exampleData = await examples.json<{mic: string, market_name: string, country: string}>();
    console.log('📝 Example stock exchanges:');
    exampleData.forEach(row => {
      console.log(`   ${row.mic}: ${row.market_name} (${row.country})`);
    });

    console.log('\n✅ Stock exchange ingestion complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

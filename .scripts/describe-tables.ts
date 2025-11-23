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
  console.log('\n📊 Describing table schemas\n');

  // Get list of tables
  const tablesResult = await client.query({
    query: 'SHOW TABLES FROM public',
    format: 'JSONEachRow'
  });
  const tables = await tablesResult.json<{name: string}>();

  // Focus on key tables
  const keyTables = ['things', 'relationships', 'sources', 'staging', 'domains'];

  for (const tableName of keyTables) {
    const table = tables.find(t => t.name === tableName);
    if (!table) {
      console.log(`❌ Table ${tableName} not found\n`);
      continue;
    }

    console.log(`📁 Table: public.${tableName}`);

    const descResult = await client.query({
      query: `DESCRIBE TABLE public.${tableName}`,
      format: 'JSONEachRow'
    });
    const schema = await descResult.json<{name: string, type: string}>();

    console.log('   Columns:');
    schema.forEach(col => {
      console.log(`     ${col.name.padEnd(20)} ${col.type}`);
    });

    // Get sample row
    console.log('   Sample data:');
    const sampleResult = await client.query({
      query: `SELECT * FROM public.${tableName} LIMIT 1`,
      format: 'JSONEachRow'
    });
    const sample = await sampleResult.json<any>();
    if (sample.length > 0) {
      console.log('     ', JSON.stringify(sample[0], null, 2).split('\n').join('\n      '));
    }
    console.log('');
  }

  await client.close();
}

main().catch(console.error);

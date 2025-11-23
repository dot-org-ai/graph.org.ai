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
  console.log('\n📊 Verifying public.sources table\n');

  const result = await client.query({
    query: 'SELECT source, count() as count, max(batch) as latest FROM public.sources GROUP BY source ORDER BY source',
    format: 'JSONEachRow'
  });

  const data = await result.json<{source: string, count: string, latest: string}>();
  console.log('Sources in public.sources:');
  data.forEach(row => {
    console.log(`  ${row.source.padEnd(20)} ${String(row.count).padStart(10)} records (batch: ${row.latest})`);
  });

  // Show sample data
  const sample = await client.query({
    query: "SELECT source, substring(data, 1, 100) as sample FROM public.sources WHERE source = 'tlds' LIMIT 5",
    format: 'JSONEachRow'
  });

  const sampleData = await sample.json<{source: string, sample: string}>();
  console.log('\nSample TLD data:');
  sampleData.forEach(row => console.log(`  ${row.sample}`));

  await client.close();
}

main().catch(console.error);

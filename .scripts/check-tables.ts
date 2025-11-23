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
  console.log('\n📊 Checking tables in public database\n');

  const result = await client.query({
    query: 'SHOW TABLES FROM public',
    format: 'JSONEachRow'
  });

  const tables = await result.json<{name: string}>();
  console.log(`Found ${tables.length} tables:\n`);

  for (const table of tables) {
    console.log(`  📁 ${table.name}`);

    // Get row count
    const count = await client.query({
      query: `SELECT count() as count FROM public.${table.name}`,
      format: 'JSONEachRow'
    });
    const countData = await count.json<{count: string}>();
    console.log(`     ${String(countData[0].count).padStart(15)} rows\n`);
  }

  await client.close();
}

main().catch(console.error);

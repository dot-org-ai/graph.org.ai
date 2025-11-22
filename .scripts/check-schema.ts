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
  const result = await client.query({
    query: 'DESCRIBE TABLE public.relationships',
    format: 'JSONEachRow',
  });
  const cols = await result.json<any>();
  console.log('\nRelationships table columns:');
  cols.forEach((c: any) => console.log(`  ${c.name}: ${c.type}`));
  await client.close();
}

main();

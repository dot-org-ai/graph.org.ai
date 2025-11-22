#!/usr/bin/env tsx

import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

async function main() {
  const client = createClient({
    url: process.env.CLICKHOUSE_URL,
    username: process.env.CLICKHOUSE_USERNAME || 'default',
    password: process.env.CLICKHOUSE_PASSWORD,
  });

  const result = await client.query({
    query: 'SELECT count() as count FROM source.wikinews',
    format: 'JSONEachRow'
  });
  const data = await result.json<{count: string}>();
  console.log('Wikinews records in ClickHouse:', data[0].count);

  await client.close();
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});

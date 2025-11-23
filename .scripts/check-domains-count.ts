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
  try {
    const result = await client.query({
      query: 'SELECT count() as count FROM public.domains',
      format: 'JSONEachRow',
    });

    const data = await result.json<{ count: string }>();
    console.log('Domains count:', parseInt(data[0].count).toLocaleString());
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  } finally {
    await client.close();
  }
}

main();

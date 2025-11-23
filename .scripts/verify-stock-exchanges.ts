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
    console.log('\n📊 Stock Exchanges Table Summary\n');
    
    const result = await client.query({
      query: 'SELECT country, count() as exchange_count FROM source.stock_exchanges GROUP BY country ORDER BY exchange_count DESC',
      format: 'PrettyCompact'
    });
    console.log('Exchanges by Country:');
    console.log(await result.text());
  } finally {
    await client.close();
  }
}

main();

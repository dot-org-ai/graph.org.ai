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
  console.log('\n📊 Checking ClickHouse things table\n');

  try {
    // Check if table exists
    const tablesResult = await client.query({
      query: 'SHOW TABLES FROM default',
      format: 'JSONEachRow',
    });
    const tables = await tablesResult.json<any>();
    console.log('Tables in default database:', tables.map((t: any) => t.name).join(', '));

    // Check count
    const result = await client.query({
      query: 'SELECT count(*) as count FROM default.things',
      format: 'JSONEachRow',
    });
    const data = await result.json<any>();
    console.log('\nTotal things:', data[0]?.count || 0);

    // Check sample types
    if (data[0]?.count > 0) {
      const typesResult = await client.query({
        query: 'SELECT DISTINCT type, count(*) as count FROM default.things GROUP BY type ORDER BY count DESC LIMIT 10',
        format: 'JSONEachRow',
      });
      const types = await typesResult.json<any>();
      console.log('\nTop 10 types:');
      types.forEach((t: any) => {
        console.log(`  ${t.type}: ${t.count}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }

  await client.close();
}

main().catch(console.error);

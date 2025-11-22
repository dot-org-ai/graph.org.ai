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
  console.log('\n📊 Checking all ClickHouse tables\n');

  try {
    // Get all databases
    const dbResult = await client.query({
      query: 'SHOW DATABASES',
      format: 'JSONEachRow',
    });
    const databases = await dbResult.json<any>();
    console.log('Databases:', databases.map((d: any) => d.name).join(', '));

    // Check each database for tables
    for (const db of databases) {
      if (db.name.startsWith('system') || db.name === 'INFORMATION_SCHEMA' || db.name === 'information_schema') continue;

      console.log(`\n📁 Database: ${db.name}`);

      const tablesResult = await client.query({
        query: `SHOW TABLES FROM ${db.name}`,
        format: 'JSONEachRow',
      });
      const tables = await tablesResult.json<any>();

      if (tables.length === 0) {
        console.log('  (no tables)');
        continue;
      }

      for (const table of tables) {
        const tableName = table.name;
        if (tableName.startsWith('.inner')) continue;

        const countResult = await client.query({
          query: `SELECT count(*) as count FROM ${db.name}.${tableName}`,
          format: 'JSONEachRow',
        });
        const count = await countResult.json<any>();
        console.log(`  📋 ${tableName}: ${parseInt(count[0]?.count || 0).toLocaleString()} rows`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }

  await client.close();
}

main().catch(console.error);

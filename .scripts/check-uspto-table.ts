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
    console.log('Checking USPTO Trademarks Table\n');

    // Check schema
    const schemaCheck = await client.query({
      query: "DESCRIBE source.uspto_trademarks",
      format: 'JSONEachRow'
    });
    const schemaData = await schemaCheck.json<any>();
    console.log('Table Schema:');
    schemaData.forEach((col: any) => {
      console.log(`  ${col.name}: ${col.type}`);
    });

    // Check data count
    const countCheck = await client.query({
      query: "SELECT count() as count FROM source.uspto_trademarks",
      format: 'JSONEachRow'
    });
    const countData = await countCheck.json<{count: string}>();
    const count = parseInt(countData[0].count);
    console.log(`\nTotal records: ${count}`);

    // Show data
    if (count > 0) {
      const dataCheck = await client.query({
        query: "SELECT serial_number, mark_text, owner_name, status FROM source.uspto_trademarks",
        format: 'JSONEachRow'
      });
      const data = await dataCheck.json<any>();
      console.log('\nRecords:');
      data.forEach((row: any) => {
        console.log(`  ${row.serial_number}: ${row.mark_text} (${row.owner_name}) - ${row.status}`);
      });
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

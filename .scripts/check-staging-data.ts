#!/usr/bin/env tsx

/**
 * Check what's actually in the staging table
 */

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
  request_timeout: 30000,
});

async function main() {
  console.log('\n📊 Staging Table Contents\n');

  try {
    // Check count
    const countResult = await client.query({
      query: 'SELECT count() as count FROM public.wikidata_staging',
      format: 'JSONEachRow',
    });
    const countData = await countResult.json<any>();
    console.log(`Total rows: ${countData[0].count}\n`);

    if (countData[0].count > 0) {
      // Check first few entities
      console.log('First 3 entities (raw):');
      const rawResult = await client.query({
        query: `
          SELECT entity
          FROM public.wikidata_staging
          LIMIT 3
        `,
        format: 'JSONEachRow',
      });
      const rawData = await rawResult.json<any>();

      for (let i = 0; i < rawData.length; i++) {
        console.log(`\nEntity ${i + 1}:`);
        console.log(JSON.stringify(rawData[i].entity, null, 2).substring(0, 500));
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

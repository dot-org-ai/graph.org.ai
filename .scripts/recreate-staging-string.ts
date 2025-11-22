#!/usr/bin/env tsx

/**
 * Recreate staging table with String type (not JSON)
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
  console.log('\n🔄 Recreating staging table with String type\n');

  try {
    // Drop existing table
    console.log('🗑️  Dropping old staging table...');
    await client.exec({
      query: 'DROP TABLE IF EXISTS public.wikidata_staging'
    });
    console.log('✅ Dropped\n');

    // Create new table with String type
    console.log('📋 Creating new staging table with String type...');
    await client.exec({
      query: `
        CREATE TABLE public.wikidata_staging (
          entity String CODEC(ZSTD)
        ) ENGINE = MergeTree()
        ORDER BY tuple()
        SETTINGS index_granularity = 8192
      `
    });
    console.log('✅ Created\n');

    console.log('✅ Staging table ready with String type');
    console.log('   This will use much less memory during ingestion\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

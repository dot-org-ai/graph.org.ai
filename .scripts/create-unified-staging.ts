#!/usr/bin/env tsx

/**
 * Create Unified Staging Table for All Data Sources
 *
 * Table: public.source
 * Columns:
 *   - source: String (e.g., 'wikidata', 'wiktionary', 'crunchbase')
 *   - data: String (raw data)
 *   - batch: DateTime (timestamp from start of ingest)
 *   - ingested: DateTime (timestamp when row was inserted)
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
  console.log('\n📦 Creating Unified Staging Table\n');

  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    // Drop existing tables if they exist
    console.log('🗑️  Dropping old tables (if exist)...');
    await client.exec({
      query: 'DROP TABLE IF EXISTS public.source'
    });
    await client.exec({
      query: 'DROP TABLE IF EXISTS public.sources'
    });
    console.log('✅ Dropped\n');

    // Create unified staging table
    console.log('📋 Creating unified sources table...');
    await client.exec({
      query: `
        CREATE TABLE public.sources (
          source String,                    -- 'wikidata', 'wiktionary', 'crunchbase', etc.
          data String CODEC(ZSTD),         -- Raw data string
          batch DateTime,                   -- Timestamp from start of ingest
          ingested DateTime DEFAULT now()   -- Timestamp when row was inserted
        ) ENGINE = MergeTree()
        PARTITION BY source
        ORDER BY (source, batch, ingested)
        SETTINGS index_granularity = 8192
      `
    });
    console.log('✅ Created unified sources table\n');

    // Show table structure
    console.log('📊 Table structure:');
    const describe = await client.query({
      query: 'DESCRIBE TABLE public.sources',
      format: 'JSONEachRow',
    });
    const columns = await describe.json<any>();
    for (const col of columns) {
      console.log(`  ${col.name}: ${col.type}`);
    }

    console.log('\n✅ Unified staging table ready!\n');
    console.log('📝 Usage:');
    console.log('  - Partition by source for efficient querying');
    console.log('  - Ordered by (source, batch, ingested) for time-series access');
    console.log('  - ZSTD compression for data column\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

#!/usr/bin/env tsx

/**
 * Create domains table and dictionary for Common Crawl
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
});

async function main() {
  console.log('\n🔧 Creating domains table and dictionary\n');

  try {
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    // Drop existing table and dictionary if they exist
    console.log('🗑️  Dropping existing domains table and dictionary...');
    await client.exec({ query: 'DROP DICTIONARY IF EXISTS public.domains_dict' });
    await client.exec({ query: 'DROP TABLE IF EXISTS public.domains' });
    console.log('✅ Dropped\n');

    // Create domains table
    console.log('📋 Creating domains table...');
    await client.exec({
      query: `
        CREATE TABLE public.domains (
          id UInt64,                        -- Node index from Common Crawl
          name String,                      -- Reversed domain name (com.example.subdomain)
          url String,                       -- Full URL (https://subdomain.example.com)
          createdAt DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY id
        SETTINGS index_granularity = 8192
      `
    });
    console.log('✅ Created domains table\n');

    // Create dictionary with max 1M entries (configurable)
    console.log('📖 Creating domains dictionary (max 1M entries)...');
    await client.exec({
      query: `
        CREATE DICTIONARY public.domains_dict (
          id UInt64,
          url String
        )
        PRIMARY KEY id
        SOURCE(CLICKHOUSE(
          HOST 'localhost'
          PORT 9000
          USER '${process.env.CLICKHOUSE_USERNAME || 'default'}'
          PASSWORD '${process.env.CLICKHOUSE_PASSWORD || ''}'
          DB 'public'
          TABLE 'domains'
        ))
        LAYOUT(HASHED(SIZE_IN_CELLS 1000000))
        LIFETIME(MIN 300 MAX 360)
      `
    });
    console.log('✅ Created domains dictionary\n');

    console.log('✅ Setup complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. Run ingest-commoncrawl.ts to populate domains table');
    console.log('   2. Relationships will use dictGet() for fast URL lookups\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

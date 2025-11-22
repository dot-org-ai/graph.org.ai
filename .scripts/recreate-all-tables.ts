#!/usr/bin/env tsx

/**
 * Recreate All Tables with Correct Schema
 * 
 * - source (not sources) - singular
 * - search (not searches) - singular  
 * - things - camelCase timestamps
 * - relationships - no id, full URLs, camelCase timestamps
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
  console.log('\n🔄 Recreating All Tables with Correct Schema\n');

  try {
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    // Drop old tables
    console.log('🗑️  Dropping old tables...');
    await client.exec({ query: 'DROP TABLE IF EXISTS public.sources' });
    await client.exec({ query: 'DROP TABLE IF EXISTS public.searches' });
    await client.exec({ query: 'DROP TABLE IF EXISTS public.things' });
    await client.exec({ query: 'DROP TABLE IF EXISTS public.relationships' });
    console.log('✅ Dropped\n');

    // Create source table (singular)
    console.log('📋 Creating source table...');
    await client.exec({
      query: `
        CREATE TABLE public.source (
          source String,                    -- Source type (e.g., 'wikidata', 'wiktionary')
          data String CODEC(ZSTD),          -- Raw data string
          batch DateTime,                   -- Timestamp from start of ingest
          ingested DateTime DEFAULT now()   -- Timestamp when row was inserted
        ) ENGINE = MergeTree()
        PARTITION BY source
        ORDER BY (source, batch, ingested)
        SETTINGS index_granularity = 8192
      `
    });
    console.log('✅ Created source table\n');

    // Create search table (singular)
    console.log('📋 Creating search table...');
    await client.exec({
      query: `
        CREATE TABLE public.search (
          id String,                        -- Search ID
          query String,                     -- Search query
          results String CODEC(ZSTD),       -- Search results
          createdAt DateTime DEFAULT now()  -- When search was created
        ) ENGINE = MergeTree()
        ORDER BY (id, createdAt)
        SETTINGS index_granularity = 8192
      `
    });
    console.log('✅ Created search table\n');

    // Create things table
    console.log('📋 Creating things table...');
    await client.exec({
      query: `
        CREATE TABLE public.things (
          ns String,                        -- Namespace
          type String,                      -- Type
          id String,                        -- ID
          url String,                       -- Full URL
          data String CODEC(ZSTD),          -- JSON properties
          code String,                      -- Code/symbol
          content String CODEC(ZSTD),       -- Markdown content
          meta String CODEC(ZSTD),          -- Metadata
          createdAt DateTime DEFAULT now(), -- Created timestamp
          updatedAt DateTime DEFAULT now()  -- Updated timestamp
        ) ENGINE = MergeTree()
        PARTITION BY ns
        ORDER BY (ns, type, id)
        SETTINGS index_granularity = 8192
      `
    });
    console.log('✅ Created things table\n');

    // Create relationships table
    console.log('📋 Creating relationships table...');
    await client.exec({
      query: `
        CREATE TABLE public.relationships (
          ns String,                        -- Namespace from "from" thing
          \`from\` String,                  -- Full URL of source
          predicate String,                 -- Relationship type
          reverse String,                   -- Inverse relationship
          \`to\` String,                    -- Full URL of target
          data String CODEC(ZSTD),          -- Relationship properties only
          content String CODEC(ZSTD),       -- Markdown content
          createdAt DateTime DEFAULT now(), -- Created timestamp
          updatedAt DateTime DEFAULT now()  -- Updated timestamp
        ) ENGINE = MergeTree()
        PARTITION BY ns
        ORDER BY (ns, \`from\`, predicate, \`to\`)
        SETTINGS index_granularity = 8192
      `
    });
    console.log('✅ Created relationships table\n');

    // Show all tables
    console.log('📊 All tables:');
    const tables = await client.query({
      query: 'SHOW TABLES FROM public',
      format: 'JSONEachRow',
    });
    const tableList = await tables.json<any>();
    for (const t of tableList) {
      console.log(`  - ${t.name}`);
    }

    console.log('\n✅ All tables recreated successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

#!/usr/bin/env tsx

/**
 * Recreate Things Table with Correct Schema
 *
 * Schema with camelCase for timestamp columns
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
  console.log('\n🔄 Recreating Things Table\n');

  try {
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    console.log('🗑️  Dropping old things table...');
    await client.exec({
      query: 'DROP TABLE IF EXISTS public.things'
    });
    console.log('✅ Dropped\n');

    console.log('📋 Creating new things table...');
    await client.exec({
      query: `
        CREATE TABLE public.things (
          ns String,                        -- Namespace (e.g., 'wiki.org.ai', 'wikidata.org', 'schema.org')
          type String,                      -- Type (e.g., 'Noun', 'Verb', 'Person', 'Organization')
          id String,                        -- ID (PascalCase for nouns, camelCase for others)
          url String,                       -- Full URL (e.g., 'https://nouns.org.ai/AirportBook')
          data String CODEC(ZSTD),          -- JSON with thing properties
          code String,                      -- Code/symbol representation
          content String CODEC(ZSTD),       -- Markdown content
          meta String CODEC(ZSTD),          -- Metadata/external references
          createdAt DateTime DEFAULT now(), -- When thing was created
          updatedAt DateTime DEFAULT now(), -- When thing was last updated
          version UInt64 DEFAULT 1          -- Version number for ReplacingMergeTree (can be incremented or use timestamp)
        ) ENGINE = ReplacingMergeTree(version)
        ORDER BY (ns, id, version)
        SETTINGS index_granularity = 8192
      `
    });
    console.log('✅ Created things table\n');

    console.log('📊 Table structure:');
    const describe = await client.query({
      query: 'DESCRIBE TABLE public.things',
      format: 'JSONEachRow',
    });
    const columns = await describe.json<any>();
    for (const col of columns) {
      console.log(`  ${col.name}: ${col.type}`);
    }

    console.log('\n✅ Things table ready!\n');
    console.log('📝 Schema notes:');
    console.log('  - ReplacingMergeTree engine with version column');
    console.log('  - No partitioning (would create too many partitions)');
    console.log('  - Ordered by (ns, id, version) - type not in sorting key');
    console.log('  - version is UInt64 DEFAULT 1 (can increment or use timestamp)\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

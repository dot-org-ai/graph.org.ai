#!/usr/bin/env tsx

/**
 * Recreate Relationships Table with Correct Schema
 *
 * Schema:
 * - ns: String (namespace from the "from" thing)
 * - from: String (full URL of source thing)
 * - predicate: String (relationship type)
 * - reverse: String (inverse relationship type)
 * - to: String (full URL of target thing)
 * - data: String (JSON with relationship properties only)
 * - content: String (markdown content about the relationship)
 * - createdAt: DateTime (when relationship was created)
 * - updatedAt: DateTime (when relationship was last updated)
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
  console.log('\n🔄 Recreating Relationships Table\n');

  try {
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    console.log('🗑️  Dropping old relationships table...');
    await client.exec({
      query: 'DROP TABLE IF EXISTS public.relationships'
    });
    console.log('✅ Dropped\n');

    console.log('📋 Creating new relationships table...');
    await client.exec({
      query: `
        CREATE TABLE public.relationships (
          ns String,                        -- Namespace from the "from" thing
          \`from\` String,                  -- Full URL of source thing
          predicate String,                 -- Relationship type (e.g., 'synonym', 'suffix')
          reverse String,                   -- Inverse relationship type
          \`to\` String,                    -- Full URL of target thing
          data String CODEC(ZSTD),          -- JSON with relationship properties only
          content String CODEC(ZSTD),       -- Markdown content about the relationship
          createdAt DateTime DEFAULT now(), -- When relationship was created
          updatedAt DateTime DEFAULT now()  -- When relationship was last updated
        ) ENGINE = MergeTree()
        PARTITION BY ns
        ORDER BY (ns, \`from\`, predicate, \`to\`)
        SETTINGS index_granularity = 8192
      `
    });
    console.log('✅ Created relationships table\n');

    console.log('📊 Table structure:');
    const describe = await client.query({
      query: 'DESCRIBE TABLE public.relationships',
      format: 'JSONEachRow',
    });
    const columns = await describe.json<any>();
    for (const col of columns) {
      console.log(`  ${col.name}: ${col.type}`);
    }

    console.log('\n✅ Relationships table ready!\n');
    console.log('📝 Schema notes:');
    console.log('  - No id column (use combination of ns, from, predicate, to)');
    console.log('  - ns is the namespace from the "from" thing');
    console.log('  - from and to are full URLs');
    console.log('  - data contains only relationship properties');
    console.log('  - camelCase naming for createdAt and updatedAt\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

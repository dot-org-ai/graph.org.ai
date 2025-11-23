#!/usr/bin/env tsx

/**
 * Recreate graph schema with correct mdxdb-compatible structure
 *
 * Drops existing public.things and public.relationships tables
 * and recreates them with the proper schema from .mdxdb/
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

async function recreateSchema() {
  console.log('\n🔄 Recreating graph schema with correct mdxdb structure\n');
  console.log(`📡 Server: ${process.env.CLICKHOUSE_URL}\n`);

  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    // Drop existing tables
    console.log('🗑️  Dropping existing tables...');
    await client.exec({ query: 'DROP TABLE IF EXISTS public.things' });
    await client.exec({ query: 'DROP TABLE IF EXISTS public.relationships' });
    console.log('✅ Dropped old tables\n');

    // Create things table with correct schema
    console.log('📋 Creating public.things table...');
    await client.exec({
      query: `
        CREATE TABLE public.things (
          url String,
          ns String,
          type String,
          id String,
          name String,
          data String,
          code String,
          content String,
          meta String,
          createdAt DateTime DEFAULT now(),
          updatedAt DateTime DEFAULT now(),
          INDEX idx_ns ns TYPE bloom_filter GRANULARITY 1,
          INDEX idx_type type TYPE bloom_filter GRANULARITY 1,
          INDEX idx_ns_type (ns, type) TYPE bloom_filter GRANULARITY 1,
          INDEX idx_id id TYPE bloom_filter GRANULARITY 1,
          INDEX idx_name name TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1
        ) ENGINE = MergeTree()
        ORDER BY (ns, type, url)
        PARTITION BY ns
      `
    });
    console.log('✅ Created public.things table\n');

    // Create relationships table with correct schema
    console.log('📋 Creating public.relationships table...');
    await client.exec({
      query: `
        CREATE TABLE public.relationships (
          id UInt64 DEFAULT rand64(),
          \`from\` String,
          predicate String,
          reverse String,
          \`to\` String,
          data String,
          content String,
          createdAt DateTime DEFAULT now(),
          INDEX idx_from \`from\` TYPE bloom_filter GRANULARITY 1,
          INDEX idx_to \`to\` TYPE bloom_filter GRANULARITY 1,
          INDEX idx_predicate predicate TYPE bloom_filter GRANULARITY 1
        ) ENGINE = MergeTree()
        ORDER BY (\`from\`, predicate, \`to\`)
        PARTITION BY substring(predicate, 1, 2)
      `
    });
    console.log('✅ Created public.relationships table\n');

    // Show schema
    console.log('📊 Schema Summary:\n');

    const thingsSchema = await client.query({
      query: 'DESCRIBE TABLE public.things',
      format: 'JSONEachRow'
    });
    const thingsCols = await thingsSchema.json<{name: string, type: string}>();

    console.log('public.things columns:');
    thingsCols.forEach(col => {
      console.log(`  ${col.name.padEnd(20)} ${col.type}`);
    });

    console.log('\npublic.relationships columns:');
    const relsSchema = await client.query({
      query: 'DESCRIBE TABLE public.relationships',
      format: 'JSONEachRow'
    });
    const relsCols = await relsSchema.json<{name: string, type: string}>();
    relsCols.forEach(col => {
      console.log(`  ${col.name.padEnd(20)} ${col.type}`);
    });

    console.log('\n✅ Schema recreation complete!\n');
    console.log('💡 Next steps:');
    console.log('   - Transform sources → things + relationships');
    console.log('   - Transform domains → things + relationships');
    console.log('   - Transform wikidata → things + relationships');
    console.log('   - Transform wikipedia → things + relationships\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

recreateSchema().catch(console.error);

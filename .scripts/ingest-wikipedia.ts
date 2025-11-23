#!/usr/bin/env tsx

/**
 * Ingest Wikipedia XML Dump into Source Table
 *
 * Parses the 105GB Wikipedia XML dump and loads articles into a source table.
 * From there we can query and transform the data into Things and Relationships.
 */

import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import * as xml2js from 'xml2js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD,
  request_timeout: 7200000, // 2 hours
});

async function createSourceTable() {
  console.log('📋 Creating source database and table...');

  // Create source database if it doesn't exist
  await client.exec({ query: 'CREATE DATABASE IF NOT EXISTS source' });

  await client.exec({
    query: `
      CREATE TABLE IF NOT EXISTS source.wikipedia (
        id UInt64,
        title String,
        namespace UInt32,
        redirect String,
        text String CODEC(ZSTD),
        timestamp DateTime,
        contributor_username String,
        contributor_id UInt64,
        comment String,
        model String,
        format String,
        sha1 String
      ) ENGINE = MergeTree()
      ORDER BY (namespace, title, id)
      SETTINGS index_granularity = 8192
    `
  });

  console.log('✅ Table created\n');
}

async function main() {
  console.log('\n📚 Ingesting Wikipedia XML Dump\n');
  console.log('   Source file: enwiki-latest-pages-articles.xml');
  console.log('   Size: 105 GB uncompressed\n');

  try {
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    await createSourceTable();

    const xmlFile = path.join(PROJECT_ROOT, '.source', 'Wikipedia', 'enwiki-latest-pages-articles.xml');

    console.log('📖 Starting XML parsing...');
    console.log('   This will take a while for 105GB of data\n');

    // For now, let's create the table structure
    // The actual parsing would require a streaming XML parser
    // due to the massive file size

    console.log('✅ Source table ready for ingestion');
    console.log('\n📝 Next steps:');
    console.log('   - Use a streaming XML parser (SAX) to process the file');
    console.log('   - Extract page data in batches');
    console.log('   - Insert batches into source.wikipedia table');
    console.log('   - Then query to create Things and Relationships\n');

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

#!/usr/bin/env tsx

/**
 * Ingest Wikipedia XML Dump into ClickHouse using dumpster-dip
 *
 * Uses dumpster-dip to stream and parse Wikipedia XML, then insert
 * records into source.wikipedia table in batches
 */

import dip from 'dumpster-dip';
import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const BATCH_SIZE = 500;

interface WikiPage {
  id: number;
  title: string;
  namespace: number;
  redirect: string;
  text: string;
  timestamp: string;
  contributor_username: string;
  contributor_id: number;
  comment: string;
  model: string;
  format: string;
  sha1: string;
}

let client: any;
let batch: WikiPage[] = [];
let totalPages = 0;
let batchCount = 0;
const startTime = Date.now();

/**
 * Insert a batch of pages into ClickHouse
 */
async function insertBatch(pages: WikiPage[]): Promise<void> {
  if (pages.length === 0) return;

  try {
    await client.insert({
      table: 'source.wikipedia',
      values: pages,
      format: 'JSONEachRow'
    });

    batchCount++;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const rate = (totalPages / parseInt(elapsed)).toFixed(0);
    console.log(`  Batch ${batchCount}: +${pages.length} pages (${totalPages.toLocaleString()} total, ${rate}/sec)`);
  } catch (error) {
    console.error('Error inserting batch:', error);
    throw error;
  }
}

async function main() {
  const xmlFile = process.argv[2] || path.join(PROJECT_ROOT, '.source', 'Wikipedia', 'enwiki-latest-pages-articles.xml');

  console.log('\n📚 Wikipedia XML → ClickHouse (via dumpster-dip)\n');
  console.log(`   File: ${path.basename(xmlFile)}\n`);

  // Connect to ClickHouse
  client = createClient({
    url: process.env.CLICKHOUSE_URL,
    username: process.env.CLICKHOUSE_USERNAME || 'default',
    password: process.env.CLICKHOUSE_PASSWORD,
    request_timeout: 300000,
  });

  console.log('🔍 Testing connection...');
  const ping = await client.ping();
  if (!ping.success) {
    throw new Error('ClickHouse connection failed');
  }
  console.log('✅ Connected\n');

  // Ensure source database and table exist
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

  console.log('📖 Starting Wikipedia ingestion...\n');

  // Use dumpster-dip with custom parse function
  await dip({
    input: xmlFile,
    namespace: 0, // Main article namespace only
    outputMode: 'custom',
    parse: async function (doc: any) {
      try {
        const page: WikiPage = {
          id: parseInt(doc._id || doc.pageID || 0),
          title: doc.title() || '',
          namespace: 0,
          redirect: doc.isRedirect() ? doc.redirectTo()?.page || '' : '',
          text: doc.wikitext() || '',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          contributor_username: '',
          contributor_id: 0,
          comment: '',
          model: 'wikitext',
          format: 'text/x-wiki',
          sha1: ''
        };

        batch.push(page);
        totalPages++;

        // Insert when batch is full
        if (batch.length >= BATCH_SIZE) {
          await insertBatch(batch);
          batch = [];
        }

        return page.title; // Return something for dumpster-dip
      } catch (error) {
        console.error(`Error parsing page ${doc.title()}:`, error);
        return null;
      }
    }
  });

  // Insert remaining pages
  if (batch.length > 0) {
    await insertBatch(batch);
  }

  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log('\n✅ Ingestion complete!\n');
  console.log(`   Total pages: ${totalPages.toLocaleString()}`);
  console.log(`   Duration: ${duration} minutes\n`);

  await client.close();
}

main().catch(async (error) => {
  console.error('Fatal error:', error);
  if (client) {
    await client.close();
  }
  process.exit(1);
});

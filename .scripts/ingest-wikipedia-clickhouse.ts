#!/usr/bin/env tsx

/**
 * Ingest Wikipedia XML Dump into ClickHouse source.wikipedia table
 *
 * Refactored from dumpster-dive to use ClickHouse instead of MongoDB
 * - Streams Wikipedia XML dump
 * - Parses pages with wtf_wikipedia
 * - Loads into source.wikipedia table in batches
 */

import { createClient } from '@clickhouse/client';
import { createReadStream } from 'fs';
import { statSync } from 'fs';
import * as path from 'path';
import * as wtf from 'wtf_wikipedia';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// @ts-ignore - sunday-driver is a JS module
import driver from 'sunday-driver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const BATCH_SIZE = 500;
const TARGET_NAMESPACE = 0; // Main article namespace

interface WikiPage {
  id: string;
  title: string;
  namespace: number;
  redirect: string;
  text: string;
  timestamp: string;
  contributor_username: string;
  contributor_id: string;
  comment: string;
  model: string;
  format: string;
  sha1: string;
}

interface ParsedPage {
  pageID: string;
  title: string;
  wiki: string;
}

/**
 * Parse a raw Wikipedia page XML into structured data
 */
function parsePage(pageXml: string): ParsedPage | null {
  // Check namespace
  const nsMatch = pageXml.match(/<ns>(\d+)<\/ns>/);
  if (nsMatch && parseInt(nsMatch[1]) !== TARGET_NAMESPACE) {
    return null; // Skip non-article namespaces
  }

  const page: ParsedPage = {
    pageID: '',
    title: '',
    wiki: ''
  };

  // Extract title
  const titleMatch = pageXml.match(/<title>([\s\S]+?)<\/title>/);
  if (titleMatch) {
    page.title = titleMatch[1];
  }

  // Extract page ID
  const idMatch = pageXml.match(/<id>([0-9]+?)<\/id>/);
  if (idMatch) {
    page.pageID = idMatch[1];
  }

  // Extract wiki text
  const textMatch = pageXml.match(/<text[\s\S]*?>([\s\S]*?)<\/text>/);
  if (textMatch) {
    page.wiki = textMatch[1]
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&');
  }

  return page;
}

/**
 * Convert parsed page to WikiPage for insertion
 */
function pageToRecord(pageXml: string, parsed: ParsedPage): WikiPage | null {
  try {
    // Extract additional metadata from XML
    const nsMatch = pageXml.match(/<ns>(\d+)<\/ns>/);
    const namespace = nsMatch ? parseInt(nsMatch[1]) : 0;

    const redirectMatch = pageXml.match(/<redirect title="([^"]+)"/);
    const redirect = redirectMatch ? redirectMatch[1] : '';

    const timestampMatch = pageXml.match(/<timestamp>([^<]+)<\/timestamp>/);
    const timestamp = timestampMatch ? timestampMatch[1].replace('T', ' ').replace('Z', '') : '';

    const usernameMatch = pageXml.match(/<username>([^<]+)<\/username>/);
    const contributor_username = usernameMatch ? usernameMatch[1] : '';

    const contributorIdMatch = pageXml.match(/<contributor>[\s\S]*?<id>(\d+)<\/id>/);
    const contributor_id = contributorIdMatch ? contributorIdMatch[1] : '';

    const commentMatch = pageXml.match(/<comment>([^<]*)<\/comment>/);
    const comment = commentMatch ? commentMatch[1] : '';

    const modelMatch = pageXml.match(/<model>([^<]+)<\/model>/);
    const model = modelMatch ? modelMatch[1] : '';

    const formatMatch = pageXml.match(/<format>([^<]+)<\/format>/);
    const format = formatMatch ? formatMatch[1] : '';

    const sha1Match = pageXml.match(/<sha1>([^<]+)<\/sha1>/);
    const sha1 = sha1Match ? sha1Match[1] : '';

    return {
      id: parsed.pageID,
      title: parsed.title,
      namespace,
      redirect,
      text: parsed.wiki,
      timestamp,
      contributor_username,
      contributor_id,
      comment,
      model,
      format,
      sha1
    };
  } catch (error) {
    console.error(`Error converting page ${parsed.title}:`, error);
    return null;
  }
}

/**
 * Insert a batch of pages into ClickHouse
 */
async function insertBatch(client: any, pages: WikiPage[]): Promise<number> {
  if (pages.length === 0) return 0;

  try {
    await client.insert({
      table: 'source.wikipedia',
      values: pages,
      format: 'JSONEachRow'
    });
    return pages.length;
  } catch (error) {
    console.error('Error inserting batch:', error);
    return 0;
  }
}

/**
 * Main ingestion function
 */
async function main() {
  const xmlFile = process.argv[2] || path.join(process.cwd(), '.source', 'Wikipedia', 'enwiki-latest-pages-articles.xml');

  console.log('\n📚 Wikipedia XML → ClickHouse Ingestion\n');
  console.log(`   File: ${path.basename(xmlFile)}`);

  const stats = statSync(xmlFile);
  const sizeGB = (stats.size / (1024 * 1024 * 1024)).toFixed(2);
  console.log(`   Size: ${sizeGB} GB\n`);

  // Connect to ClickHouse
  const client = createClient({
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

  console.log('📖 Starting XML stream...\n');

  let batch: WikiPage[] = [];
  let totalPages = 0;
  let skippedPages = 0;
  let batchCount = 0;
  const startTime = Date.now();

  // Stream the XML file
  const stream = createReadStream(xmlFile);

  // Use sunday-driver to parse XML stream
  const xmlStream = driver({
    file: xmlFile,
    splitBy: '</page>'
  });

  xmlStream.on('page', async (pageXml: string) => {
    // Parse the page
    const parsed = parsePage(pageXml);
    if (!parsed) {
      skippedPages++;
      return;
    }

    // Convert to record
    const record = pageToRecord(pageXml, parsed);
    if (!record) {
      skippedPages++;
      return;
    }

    batch.push(record);
    totalPages++;

    // Insert when batch is full
    if (batch.length >= BATCH_SIZE) {
      const inserted = await insertBatch(client, batch);
      batchCount++;

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const rate = (totalPages / parseInt(elapsed)).toFixed(0);
      console.log(`  Batch ${batchCount}: +${inserted} pages (${totalPages.toLocaleString()} total, ${rate}/sec)`);

      batch = [];
    }
  });

  xmlStream.on('done', async () => {
    // Insert remaining pages
    if (batch.length > 0) {
      const inserted = await insertBatch(client, batch);
      batchCount++;
      console.log(`  Final batch: +${inserted} pages\n`);
    }

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    console.log('✅ Ingestion complete!\n');
    console.log(`   Total pages: ${totalPages.toLocaleString()}`);
    console.log(`   Skipped: ${skippedPages.toLocaleString()}`);
    console.log(`   Duration: ${duration} minutes\n`);

    await client.close();
    process.exit(0);
  });

  xmlStream.on('error', (error: Error) => {
    console.error('Stream error:', error);
    client.close();
    process.exit(1);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

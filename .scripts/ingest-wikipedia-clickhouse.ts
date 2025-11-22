#!/usr/bin/env tsx

/**
 * Ingest Wikipedia Data to ClickHouse
 *
 * Uses dumpster-dip to parse Wikipedia XML dumps and stream to ClickHouse
 */

import { createClient } from '@clickhouse/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(PROJECT_ROOT, '.source');
const WIKIPEDIA_DIR = path.join(SOURCE_DIR, 'Wikipedia');

if (!fs.existsSync(WIKIPEDIA_DIR)) {
  fs.mkdirSync(WIKIPEDIA_DIR, { recursive: true });
}

const client = createClient({
  host: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
});

interface WikipediaArticle {
  page_id: number;
  title: string;
  domain: string;
  namespace: string;
  description: string;
  text: string;
  categories: string[];
  templates: string[];
  infobox_type: string;
  infobox_data: string;
  redirects_to: string;
  is_disambiguation: boolean;
  coordinates: [number, number] | null;
  wikidata_id: string;
}

async function ingestWikipedia(dumpPath: string, lang: string = 'en'): Promise<void> {
  console.log('\n📚 Ingesting Wikipedia Data...\n');

  if (!fs.existsSync(dumpPath)) {
    console.log('  ❌ Dump file not found:', dumpPath);
    console.log('\n  To download Wikipedia dumps:');
    console.log(`    1. Visit: https://dumps.wikimedia.org/${lang}wiki/latest/`);
    console.log(`    2. Download: ${lang}wiki-latest-pages-articles.xml.bz2`);
    console.log(`    3. Place in: ${WIKIPEDIA_DIR}\n`);
    return;
  }

  console.log(`  Processing: ${path.basename(dumpPath)}`);
  console.log('  This will take several hours for large dumps...\n');

  // Dynamic import of dumpster-dip (will be installed separately)
  let dip: any;
  try {
    dip = (await import('dumpster-dip')).default;
  } catch (error) {
    console.log('  ❌ dumpster-dip not installed');
    console.log('     Run: pnpm add dumpster-dip wtf_wikipedia\n');
    return;
  }

  let batchCount = 0;
  let totalCount = 0;
  const BATCH_SIZE = 1000;
  let batch: WikipediaArticle[] = [];

  // Parse Wikipedia dump with custom function
  await dip({
    file: dumpPath,

    // Filter function - only process main articles
    doPage: function(doc: any) {
      // Skip talk pages, user pages, etc.
      const ns = doc.namespace();
      if (ns !== 'main') return false;

      // Optionally skip redirects
      // if (doc.isRedirect()) return false;

      return true;
    },

    // Parse function - extract data for ClickHouse
    parse: async function(doc: any) {
      const infobox = doc.infobox();
      const coords = doc.coordinates();

      const article: WikipediaArticle = {
        page_id: doc.pageID() || 0,
        title: doc.title() || '',
        domain: doc.domain() || lang,
        namespace: doc.namespace() || 'main',
        description: doc.summary() || '',
        text: doc.text() || '',
        categories: doc.categories().map((c: any) => c.name || c),
        templates: doc.templates().map((t: any) => t.name || t),
        infobox_type: infobox?.type() || '',
        infobox_data: infobox ? JSON.stringify(infobox.json()) : '',
        redirects_to: doc.isRedirect() ? (doc.redirectTo()?.page || '') : '',
        is_disambiguation: doc.isDisambiguation() || false,
        coordinates: coords ? [coords.lat, coords.lon] : null,
        wikidata_id: doc.wikidata() || '',
      };

      batch.push(article);
      totalCount++;

      // Insert batch when full
      if (batch.length >= BATCH_SIZE) {
        await insertBatch(batch);
        batchCount++;

        if (batchCount % 10 === 0) {
          console.log(`  Processed: ${totalCount.toLocaleString()} articles`);
        }

        batch = [];
      }
    },
  });

  // Insert remaining batch
  if (batch.length > 0) {
    await insertBatch(batch);
  }

  console.log(`\n  ✅ Total articles ingested: ${totalCount.toLocaleString()}\n`);
}

async function insertBatch(articles: WikipediaArticle[]): Promise<void> {
  if (articles.length === 0) return;

  try {
    await client.insert({
      table: 'graph_org_ai.wikipedia_articles',
      values: articles,
      format: 'JSONEachRow',
    });
  } catch (error) {
    console.error('  ❌ Error inserting batch:', error instanceof Error ? error.message : error);
  }
}

async function verifyData(): Promise<void> {
  console.log('\n📊 Verifying Wikipedia data...\n');

  // Count total articles
  const totalCount = await client.query({
    query: 'SELECT count() as count FROM graph_org_ai.wikipedia_articles',
    format: 'JSONEachRow',
  });
  const totalData = await totalCount.json<any>();
  console.log(`  Total articles: ${Number(totalData[0].count).toLocaleString()}`);

  // Count by namespace
  const namespaceCount = await client.query({
    query: `
      SELECT namespace, count() as count
      FROM graph_org_ai.wikipedia_articles
      GROUP BY namespace
      ORDER BY count DESC
      LIMIT 10
    `,
    format: 'JSONEachRow',
  });
  const namespaceData = await namespaceCount.json<any>();
  console.log('\n  Articles by namespace:');
  namespaceData.forEach((row: any) => {
    console.log(`    ${row.namespace}: ${Number(row.count).toLocaleString()}`);
  });

  // Count articles with coordinates
  const geoCount = await client.query({
    query: `
      SELECT count() as count
      FROM graph_org_ai.wikipedia_articles
      WHERE coordinates IS NOT NULL
    `,
    format: 'JSONEachRow',
  });
  const geoData = await geoCount.json<any>();
  console.log(`\n  Articles with coordinates: ${Number(geoData[0].count).toLocaleString()}`);

  // Sample query - articles with infoboxes
  const infoboxCount = await client.query({
    query: `
      SELECT infobox_type, count() as count
      FROM graph_org_ai.wikipedia_articles
      WHERE infobox_type != ''
      GROUP BY infobox_type
      ORDER BY count DESC
      LIMIT 10
    `,
    format: 'JSONEachRow',
  });
  const infoboxData = await infoboxCount.json<any>();
  console.log('\n  Top infobox types:');
  infoboxData.forEach((row: any) => {
    console.log(`    ${row.infobox_type}: ${Number(row.count).toLocaleString()}`);
  });

  console.log();
}

async function main(): Promise<void> {
  try {
    console.log('\n📚 Wikipedia → ClickHouse Ingestion\n');

    // Test connection
    console.log('  Testing ClickHouse connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Failed to connect to ClickHouse');
    }
    console.log('  ✅ Connected\n');

    // Check for dump file
    const dumpPath = process.argv[2] || path.join(WIKIPEDIA_DIR, 'enwiki-latest-pages-articles.xml.bz2');
    const lang = process.argv[3] || 'en';

    await ingestWikipedia(dumpPath, lang);

    // Verify
    const hasData = await client.query({
      query: 'SELECT count() as count FROM graph_org_ai.wikipedia_articles',
      format: 'JSONEachRow',
    });
    const data = await hasData.json<any>();

    if (Number(data[0].count) > 0) {
      await verifyData();
    }

    console.log('✅ Processing complete!\n');

    console.log('📝 Usage:');
    console.log('  npx tsx .scripts/ingest-wikipedia-clickhouse.ts [dump-path] [lang]\n');
    console.log('  Examples:');
    console.log('    npx tsx .scripts/ingest-wikipedia-clickhouse.ts ./enwiki.xml.bz2 en');
    console.log('    npx tsx .scripts/ingest-wikipedia-clickhouse.ts ./frwiki.xml.bz2 fr\n');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    throw error;
  } finally {
    await client.close();
  }
}

main().catch(console.error);

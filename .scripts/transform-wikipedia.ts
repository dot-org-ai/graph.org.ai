#!/usr/bin/env tsx

/**
 * Transform Wikipedia source data into Things and Relationships
 *
 * Creates:
 * - Things: One Thing per Wikipedia article
 * - Relationships: Links between articles (from wikitext parsing)
 */

import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const BATCH_SIZE = 10000;
const SOURCE = 'wikipedia';

async function main() {
  const client = createClient({
    url: process.env.CLICKHOUSE_URL,
    username: process.env.CLICKHOUSE_USERNAME || 'default',
    password: process.env.CLICKHOUSE_PASSWORD,
    request_timeout: 300000,
  });

  console.log('\n📚 Wikipedia → Things & Relationships Transformation\n');

  // Test connection
  console.log('🔍 Testing connection...');
  const ping = await client.ping();
  if (!ping.success) {
    throw new Error('ClickHouse connection failed');
  }
  console.log('✅ Connected\n');

  // Check source data
  const countResult = await client.query({
    query: 'SELECT count() as count FROM source.wikipedia',
    format: 'JSONEachRow'
  });
  const countData = await countResult.json<{count: string}>();
  const totalPages = parseInt(countData[0].count);
  console.log(`📊 Source pages: ${totalPages.toLocaleString()}\n`);

  // Transform to Things
  console.log('🔄 Transforming Wikipedia articles to Things...\n');

  const transformQuery = `
    INSERT INTO public.things (
      ns,
      type,
      id,
      url,
      data,
      code,
      content,
      meta,
      createdAt,
      updatedAt,
      version
    )
    SELECT
      'wikipedia.org' as ns,
      'Article' as type,
      toString(id) as id,
      'https://en.wikipedia.org/wiki/' || replaceAll(title, ' ', '_') as url,
      toJSONString(map(
        'title', title,
        'id', toString(id),
        'description', substring(text, 1, 500)
      )) as data,
      '' as code,
      text as content,
      toJSONString(map(
        'timestamp', toString(timestamp),
        'namespace', toString(namespace),
        'format', format
      )) as meta,
      timestamp as createdAt,
      timestamp as updatedAt,
      1 as version
    FROM source.wikipedia
    WHERE redirect = ''
      AND namespace = 0
      AND length(title) > 0
      AND title NOT LIKE 'List of%'
      AND title NOT LIKE 'Index of%'
      AND title NOT LIKE 'Template:%'
      AND title NOT LIKE 'Category:%'
  `;

  const startTime = Date.now();
  await client.exec({ query: transformQuery });
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  // Check results
  const thingsResult = await client.query({
    query: `SELECT count() as count FROM public.things WHERE ns = 'wikipedia.org'`,
    format: 'JSONEachRow'
  });
  const thingsData = await thingsResult.json<{count: string}>();
  const thingsCount = parseInt(thingsData[0].count);

  console.log(`✅ Created ${thingsCount.toLocaleString()} Things (${duration}s)\n`);

  // Sample a few Things
  console.log('📋 Sample Things:\n');
  const sampleResult = await client.query({
    query: `
      SELECT id, type, url, data
      FROM public.things
      WHERE ns = 'wikipedia.org'
      LIMIT 5
    `,
    format: 'JSONEachRow'
  });
  const samples = await sampleResult.json<{id: string, type: string, url: string, data: string}>();
  samples.forEach(s => {
    const data = JSON.parse(s.data);
    console.log(`   ${data.title} (${s.type})`);
    console.log(`   ID: ${s.id}`);
    console.log(`   URL: ${s.url}`);
    console.log(`   ${data.description.substring(0, 100)}...`);
    console.log();
  });

  // TODO: Extract relationships from wikitext links
  // This would require parsing the wikitext to find [[links]]
  // For now, we'll skip this and focus on getting the Things created
  console.log('⏭️  Skipping relationship extraction for now\n');
  console.log('   (Wikitext link parsing would go here)\n');

  console.log('✅ Transformation complete!\n');

  await client.close();
}

main().catch(async (error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

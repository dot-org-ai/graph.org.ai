#!/usr/bin/env tsx

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
  console.log('\n🔍 Verifying Unicode Decoding\n');

  // Test Greek labels (should show Βέλγιο not \u0392\u03ad\u03bb\u03b3\u03b9\u03bf)
  console.log('Greek labels:');
  const greekResult = await client.query({
    query: `
      SELECT
        entity.id as id,
        entity.labels.el.value as label
      FROM public.wikidata_staging
      WHERE entity.labels.el.value != ''
      LIMIT 5
    `,
    format: 'JSONEachRow',
  });
  const greekData = await greekResult.json<any>();

  for (const row of greekData) {
    const hasEscapes = row.label.includes('\\u');
    const status = hasEscapes ? '❌ ESCAPED' : '✅ DECODED';
    console.log(`   ${status} ${row.id}: ${row.label}`);
  }

  // Test Arabic labels
  console.log('\nArabic labels:');
  const arabicResult = await client.query({
    query: `
      SELECT
        entity.id as id,
        entity.labels.ar.value as label
      FROM public.wikidata_staging
      WHERE entity.labels.ar.value != ''
      LIMIT 5
    `,
    format: 'JSONEachRow',
  });
  const arabicData = await arabicResult.json<any>();

  for (const row of arabicData) {
    const hasEscapes = row.label.includes('\\u');
    const status = hasEscapes ? '❌ ESCAPED' : '✅ DECODED';
    console.log(`   ${status} ${row.id}: ${row.label}`);
  }

  // Test Japanese
  console.log('\nJapanese labels:');
  const japaneseResult = await client.query({
    query: `
      SELECT
        entity.id as id,
        entity.labels.ja.value as label
      FROM public.wikidata_staging
      WHERE entity.labels.ja.value != ''
      LIMIT 5
    `,
    format: 'JSONEachRow',
  });
  const japaneseData = await japaneseResult.json<any>();

  for (const row of japaneseData) {
    const hasEscapes = row.label.includes('\\u');
    const status = hasEscapes ? '❌ ESCAPED' : '✅ DECODED';
    console.log(`   ${status} ${row.id}: ${row.label}`);
  }

  console.log('');
  await client.close();
}

main().catch(console.error);

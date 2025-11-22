#!/usr/bin/env tsx

/**
 * Test Unicode Decoding with JSONEachRow
 *
 * Ingests 100 rows to verify Unicode characters display properly
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
  request_timeout: 120000,
});

async function main() {
  console.log('\n🧪 Testing Unicode Decoding with JSONEachRow\n');

  try {
    // Create staging table
    console.log('📋 Creating staging table...');
    await client.exec({
      query: `
        CREATE TABLE IF NOT EXISTS public.wikidata_staging (
          entity JSON(max_dynamic_paths=2048)
        ) ENGINE = MergeTree()
        ORDER BY tuple()
        SETTINGS index_granularity = 8192
      `
    });
    console.log('✅ Staging table ready\n');

    // Insert 100 test rows
    console.log('📥 Ingesting 100 test rows...');
    await client.exec({
      query: `
        INSERT INTO public.wikidata_staging
        SELECT * FROM url(
          'https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.bz2',
          JSONEachRow
        )
        LIMIT 100
        SETTINGS
          max_insert_block_size = 100,
          input_format_allow_errors_ratio = 0.1
      `
    });
    console.log('✅ Ingestion complete\n');

    // Check row count
    const countResult = await client.query({
      query: 'SELECT count() as count FROM public.wikidata_staging',
      format: 'JSONEachRow',
    });
    const countData = await countResult.json<any>();
    console.log(`📊 Rows ingested: ${countData[0].count}\n`);

    // Test Unicode decoding - Japanese labels
    console.log('🔍 Testing Japanese Unicode decoding...');
    const japaneseResult = await client.query({
      query: `
        SELECT
          entity.id as id,
          entity.labels.ja.value as japanese_label
        FROM public.wikidata_staging
        WHERE entity.labels.ja.value != ''
        LIMIT 5
      `,
      format: 'JSONEachRow',
    });
    const japaneseData = await japaneseResult.json<any>();

    if (japaneseData.length > 0) {
      console.log('✅ Japanese labels:');
      for (const row of japaneseData) {
        console.log(`   ${row.id}: ${row.japanese_label}`);
        // Check if still showing escape sequences
        if (row.japanese_label.includes('\\u')) {
          console.log('   ⚠️  WARNING: Unicode escape sequences still present!');
        }
      }
    } else {
      console.log('⚠️  No Japanese labels found in first 100 rows');
    }
    console.log('');

    // Test Chinese labels
    console.log('🔍 Testing Chinese Unicode decoding...');
    const chineseResult = await client.query({
      query: `
        SELECT
          entity.id as id,
          entity.labels.zh.value as chinese_label
        FROM public.wikidata_staging
        WHERE entity.labels.zh.value != ''
        LIMIT 5
      `,
      format: 'JSONEachRow',
    });
    const chineseData = await chineseResult.json<any>();

    if (chineseData.length > 0) {
      console.log('✅ Chinese labels:');
      for (const row of chineseData) {
        console.log(`   ${row.id}: ${row.chinese_label}`);
        if (row.chinese_label.includes('\\u')) {
          console.log('   ⚠️  WARNING: Unicode escape sequences still present!');
        }
      }
    } else {
      console.log('⚠️  No Chinese labels found in first 100 rows');
    }
    console.log('');

    // Test English labels (baseline)
    console.log('🔍 English labels (baseline):');
    const englishResult = await client.query({
      query: `
        SELECT
          entity.id as id,
          entity.labels.en.value as english_label,
          entity.descriptions.en.value as description
        FROM public.wikidata_staging
        WHERE entity.labels.en.value != ''
        LIMIT 5
      `,
      format: 'JSONEachRow',
    });
    const englishData = await englishResult.json<any>();

    for (const row of englishData) {
      console.log(`   ${row.id}: ${row.english_label}`);
      if (row.description) {
        console.log(`      ${row.description.substring(0, 80)}...`);
      }
    }
    console.log('');

    console.log('✅ Unicode test complete!\n');
    console.log('📝 Next steps:');
    console.log('   - If Unicode is decoded correctly → Start full ingestion');
    console.log('   - If still seeing \\uXXXX codes → Need different approach\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

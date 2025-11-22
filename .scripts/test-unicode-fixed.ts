#!/usr/bin/env tsx

/**
 * Test Unicode Decoding with JSONEachRow (Fixed)
 *
 * Tests that Unicode escape sequences are properly decoded
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
  console.log('\n🧪 Testing Unicode Decoding with JSONEachRow (Fixed)\n');

  try {
    // Drop and recreate staging table
    console.log('🗑️  Dropping old staging table...');
    await client.exec({ query: 'DROP TABLE IF EXISTS public.wikidata_staging' });

    console.log('📋 Creating new staging table...');
    await client.exec({
      query: `
        CREATE TABLE public.wikidata_staging (
          entity JSON(max_dynamic_paths=2048)
        ) ENGINE = MergeTree()
        ORDER BY tuple()
        SETTINGS index_granularity = 8192
      `
    });
    console.log('✅ Staging table ready\n');

    // Insert 100 test rows using JSONEachRow
    console.log('📥 Ingesting 100 test rows with JSONEachRow...');
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

    // Get a sample entity to check structure
    console.log('🔍 Sample entity structure:');
    const sampleResult = await client.query({
      query: `
        SELECT
          entity.id as id,
          entity.type as type,
          JSONExtractKeys(toJSONString(entity.labels)) as available_languages
        FROM public.wikidata_staging
        LIMIT 1
      `,
      format: 'JSONEachRow',
    });
    const sampleData = await sampleResult.json<any>();
    if (sampleData.length > 0) {
      console.log(`   ID: ${sampleData[0].id}`);
      console.log(`   Type: ${sampleData[0].type}`);
      console.log(`   Languages: ${sampleData[0].available_languages.slice(0, 10).join(', ')}...\n`);
    }

    // Test Greek (should show actual Greek characters, not \uXXXX)
    console.log('🔍 Testing Greek Unicode decoding:');
    const greekResult = await client.query({
      query: `
        SELECT
          entity.id as id,
          entity.labels.el.value as greek_label
        FROM public.wikidata_staging
        WHERE entity.labels.el.value != ''
        LIMIT 3
      `,
      format: 'JSONEachRow',
    });
    const greekData = await greekResult.json<any>();

    if (greekData.length > 0) {
      console.log('✅ Greek labels:');
      for (const row of greekData) {
        console.log(`   ${row.id}: ${row.greek_label}`);
        if (row.greek_label.includes('\\u')) {
          console.log('   ❌ ERROR: Unicode escape sequences still present!');
        } else {
          console.log('   ✅ Unicode properly decoded!');
        }
      }
    } else {
      console.log('⚠️  No Greek labels found');
    }
    console.log('');

    // Test Arabic
    console.log('🔍 Testing Arabic Unicode decoding:');
    const arabicResult = await client.query({
      query: `
        SELECT
          entity.id as id,
          entity.labels.ar.value as arabic_label
        FROM public.wikidata_staging
        WHERE entity.labels.ar.value != ''
        LIMIT 3
      `,
      format: 'JSONEachRow',
    });
    const arabicData = await arabicResult.json<any>();

    if (arabicData.length > 0) {
      console.log('✅ Arabic labels:');
      for (const row of arabicData) {
        console.log(`   ${row.id}: ${row.arabic_label}`);
        if (row.arabic_label.includes('\\u')) {
          console.log('   ❌ ERROR: Unicode escape sequences still present!');
        } else {
          console.log('   ✅ Unicode properly decoded!');
        }
      }
    } else {
      console.log('⚠️  No Arabic labels found');
    }
    console.log('');

    // Test English (baseline)
    console.log('🔍 English labels (baseline):');
    const englishResult = await client.query({
      query: `
        SELECT
          entity.id as id,
          entity.labels.en.value as label,
          entity.descriptions.en.value as description
        FROM public.wikidata_staging
        WHERE entity.labels.en.value != ''
        LIMIT 5
      `,
      format: 'JSONEachRow',
    });
    const englishData = await englishResult.json<any>();

    for (const row of englishData) {
      console.log(`   ${row.id}: ${row.label}`);
      if (row.description) {
        console.log(`      ${row.description.substring(0, 60)}...`);
      }
    }
    console.log('');

    console.log('✅ Unicode test complete!\n');
    console.log('📝 Results:');
    console.log('   - JSONEachRow format: ✅');
    console.log('   - JSON type column: ✅');
    console.log('   - Unicode decoding: Check output above\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

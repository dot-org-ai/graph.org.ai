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
  request_timeout: 120000,
});

async function main() {
  console.log('\n🧪 Testing JSONAsString approach\n');

  try {
    // Drop and recreate
    await client.exec({ query: 'DROP TABLE IF EXISTS public.wikidata_staging' });
    await client.exec({
      query: `
        CREATE TABLE public.wikidata_staging (
          entity JSON(max_dynamic_paths=2048)
        ) ENGINE = MergeTree()
        ORDER BY tuple()
      `
    });
    console.log('✅ Table recreated\n');

    // Test with LIMIT 10
    console.log('📥 Ingesting 10 rows with JSONAsString...');
    await client.exec({
      query: `
        INSERT INTO public.wikidata_staging
        SELECT
          trimBoth(trim(TRAILING ',' FROM json))::JSON as entity
        FROM url(
          'https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.bz2',
          JSONAsString
        )
        WHERE json != '[' AND json != ']' AND length(trim(json)) > 2
        LIMIT 10
      `
    });
    console.log('✅ Done\n');

    // Check what we got
    const result = await client.query({
      query: `
        SELECT
          entity.id as id,
          entity.labels.en.value as english,
          entity.labels.ja.value as japanese
        FROM public.wikidata_staging
        LIMIT 10
      `,
      format: 'JSONEachRow',
    });
    const data = await result.json<any>();

    console.log('📊 Results:');
    for (const row of data) {
      console.log(`  ${row.id || '(no id)'}: ${row.english || '(no english)'} | JA: ${row.japanese || '(none)'}`);
      if (row.japanese && row.japanese.includes('\\u')) {
        console.log(`    ❌ Japanese has escape sequences!`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

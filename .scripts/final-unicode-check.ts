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
  console.log('\n🔍 Final Unicode Decoding Verification\n');

  // Check if we have Q8 (happiness) which we know has Unicode in many languages
  const result = await client.query({
    query: `
      SELECT
        entity.id as id,
        entity.labels.ja.value as japanese,
        entity.labels.el.value as greek,
        entity.labels.ar.value as arabic,
        entity.labels.zh.value as chinese
      FROM public.wikidata_staging
      WHERE entity.id = 'Q8'
    `,
    format: 'JSONEachRow',
  });
  const data = await result.json<any>();

  if (data.length > 0) {
    console.log('✅ Found Q8 (happiness) entity\n');
    const row = data[0];

    console.log(`ID: ${row.id}`);
    console.log(`\nJapanese: ${row.japanese}`);
    console.log(`  Expected: 幸福 (from raw data: \\u5e78\\u798f)`);
    console.log(`  Has escapes? ${row.japanese.includes('\\u') ? '❌ YES' : '✅ NO'}`);

    console.log(`\nGreek: ${row.greek}`);
    console.log(`  Expected: ευτυχία (from raw: \\u03b5\\u03c5\\u03c4...)`);
    console.log(`  Has escapes? ${row.greek.includes('\\u') ? '❌ YES' : '✅ NO'}`);

    console.log(`\nArabic: ${row.arabic}`);
    console.log(`  Expected: سعادة (from raw: \\u0633\\u0639\\u0627...)`);
    console.log(`  Has escapes? ${row.arabic.includes('\\u') ? '❌ YES' : '✅ NO'}`);

    console.log(`\nChinese: ${row.chinese}`);
    console.log(`  Expected: 快樂 (from raw: \\u5feb\\u6a02)`);
    console.log(`  Has escapes? ${row.chinese.includes('\\u') ? '❌ YES' : '✅ NO'}`);

    // Overall verdict
    const hasAnyEscapes = [row.japanese, row.greek, row.arabic, row.chinese].some(v => v.includes('\\u'));
    console.log(`\n${hasAnyEscapes ? '❌ FAIL' : '✅ SUCCESS'}: Unicode ${hasAnyEscapes ? 'NOT' : 'IS'} properly decoded!`);

  } else {
    console.log('❌ Q8 not found in staging table');
    console.log('   This means the first 100 rows might not include Q8');
    console.log('   Checking what IDs we do have...\n');

    const idsResult = await client.query({
      query: `SELECT entity.id as id FROM public.wikidata_staging LIMIT 20`,
      format: 'JSONEachRow',
    });
    const ids = await idsResult.json<any>();
    console.log('   Available IDs:', ids.map((r: any) => r.id).join(', '));
  }

  await client.close();
}

main().catch(console.error);

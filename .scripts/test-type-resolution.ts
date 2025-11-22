#!/usr/bin/env tsx

/**
 * Test Type Resolution
 *
 * Resolve P31 (instance of) Q-codes to human-readable type names
 * by looking them up in the same staging table
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
  console.log('\n🔍 Testing Type Resolution\n');

  try {
    // First, let's see what P31 types we have
    console.log('📊 P31 (instance of) types in our test data:');
    const typesResult = await client.query({
      query: `
        SELECT
          JSONExtractString(toJSONString(entity), 'id') as entity_id,
          JSONExtractString(toJSONString(entity), 'labels', 'en', 'value') as entity_name,
          JSONExtractString(toJSONString(entity), 'claims', 'P31', '1', 'mainsnak', 'datavalue', 'value', 'id') as type_qcode
        FROM public.wikidata_staging
        WHERE JSONExtractString(toJSONString(entity), 'claims', 'P31', '1', 'mainsnak', 'datavalue', 'value', 'id') != ''
      `,
      format: 'JSONEachRow',
    });
    const types = await typesResult.json<any>();

    for (const row of types) {
      console.log(`  ${row.entity_name} (${row.entity_id}) → type: ${row.type_qcode}`);
    }

    // Now let's try to resolve one of these type Q-codes
    console.log('\n🔄 Attempting to resolve type Q-codes to names...');

    const resolvedResult = await client.query({
      query: `
        WITH entity_types AS (
          SELECT
            JSONExtractString(toJSONString(entity), 'id') as entity_id,
            JSONExtractString(toJSONString(entity), 'labels', 'en', 'value') as entity_name,
            JSONExtractString(toJSONString(entity), 'claims', 'P31', '1', 'mainsnak', 'datavalue', 'value', 'id') as type_qcode
          FROM public.wikidata_staging
          WHERE JSONExtractString(toJSONString(entity), 'claims', 'P31', '1', 'mainsnak', 'datavalue', 'value', 'id') != ''
        ),
        type_labels AS (
          SELECT
            JSONExtractString(toJSONString(entity), 'id') as qcode,
            replace(JSONExtractString(toJSONString(entity), 'labels', 'en', 'value'), ' ', '_') as type_name
          FROM public.wikidata_staging
        )
        SELECT
          et.entity_name,
          et.entity_id,
          et.type_qcode,
          coalesce(tl.type_name, et.type_qcode) as type_name_resolved
        FROM entity_types et
        LEFT JOIN type_labels tl ON et.type_qcode = tl.qcode
      `,
      format: 'JSONEachRow',
    });
    const resolved = await resolvedResult.json<any>();

    if (resolved.length > 0) {
      console.log('✅ Type resolution results:');
      for (const row of resolved) {
        console.log(`  ${row.entity_name} (${row.entity_id})`);
        console.log(`    Type Q-code: ${row.type_qcode}`);
        console.log(`    Type resolved: ${row.type_name_resolved}`);
        console.log(`    URL would be: https://wiki.org.ai/${row.type_name_resolved}/${replace(row.entity_name, ' ', '_')}`);
        console.log('');
      }
    } else {
      console.log('⚠️  No type resolutions found (types not in our 10-entity test set)');
      console.log('   This is expected - type entities (Q5=human, etc) may not be in first 10 entities');
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

#!/usr/bin/env tsx

/**
 * Test Transformation with Correct Schema
 *
 * - ns: https://wiki.org.ai
 * - type: Human-readable type name (not Q-code)
 * - id: Wikipedia_Style_Name (spaces replaced with _)
 * - code: Q-code (e.g., Q23)
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
  console.log('\n🔄 Testing Corrected Transformation Schema\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await client.exec({ query: 'TRUNCATE TABLE public.things' });
    await client.exec({ query: 'TRUNCATE TABLE public.relationships' });

    // Check staging count
    const stagingCount = await client.query({
      query: 'SELECT count() as count FROM public.wikidata_staging',
      format: 'JSONEachRow',
    });
    const stagingData = await stagingCount.json<any>();
    console.log(`📊 Staging table: ${stagingData[0].count} entities\n`);

    // Transform to things table with corrected schema
    console.log('🔄 Transforming entities → things (corrected schema)...');
    await client.exec({
      query: `
        INSERT INTO public.things
        SELECT
          'https://wiki.org.ai' AS ns,

          -- Type: Q-code from P31 (instance of), fallback to 'item'
          -- TODO: Resolve Q-codes to human-readable names in a second pass
          coalesce(
            JSONExtractString(toJSONString(entity), 'claims', 'P31', '1', 'mainsnak', 'datavalue', 'value', 'id'),
            'item'
          ) AS type,

          -- ID: Wikipedia-style name (replace spaces with underscores)
          replace(
            coalesce(
              JSONExtractString(toJSONString(entity), 'labels', 'en', 'value'),
              JSONExtractString(toJSONString(entity), 'id')
            ),
            ' ', '_'
          ) AS id,

          -- URL: https://wiki.org.ai/{type}/{id}
          concat(
            'https://wiki.org.ai/',
            coalesce(
              JSONExtractString(toJSONString(entity), 'claims', 'P31', '1', 'mainsnak', 'datavalue', 'value', 'id'),
              'item'
            ),
            '/',
            replace(
              coalesce(
                JSONExtractString(toJSONString(entity), 'labels', 'en', 'value'),
                JSONExtractString(toJSONString(entity), 'id')
              ),
              ' ', '_'
            )
          ) AS url,

          -- Data: Store full entity as JSON
          toJSONString(entity) AS data,

          -- Code: Store the Q-code here (e.g., Q23)
          JSONExtractString(toJSONString(entity), 'id') AS code,

          -- Content: English label + description
          concat(
            coalesce(JSONExtractString(toJSONString(entity), 'labels', 'en', 'value'), ''),
            '\\n\\n',
            coalesce(JSONExtractString(toJSONString(entity), 'descriptions', 'en', 'value'), '')
          ) AS content,

          -- Meta: Store modified date
          toJSONString(map(
            'modified', JSONExtractString(toJSONString(entity), 'modified')
          )) AS meta,

          parseDateTime64BestEffortOrNull(JSONExtractString(toJSONString(entity), 'modified')) AS created_at,
          parseDateTime64BestEffortOrNull(JSONExtractString(toJSONString(entity), 'modified')) AS updated_at

        FROM public.wikidata_staging
        WHERE
          JSONExtractString(toJSONString(entity), 'id') != ''
          AND JSONExtractString(toJSONString(entity), 'labels', 'en', 'value') != ''
      `
    });

    // Check things count
    const thingsCount = await client.query({
      query: 'SELECT count() as count FROM public.things',
      format: 'JSONEachRow',
    });
    const thingsData = await thingsCount.json<any>();
    console.log(`✅ Created ${thingsData[0].count} things\n`);

    // Show sample things
    console.log('📋 Sample things:');
    const thingsResult = await client.query({
      query: `
        SELECT
          ns,
          type,
          id,
          code,
          url,
          substring(content, 1, 60) as content_preview
        FROM public.things
        LIMIT 5
      `,
      format: 'JSONEachRow',
    });
    const things = await thingsResult.json<any>();
    for (const thing of things) {
      console.log(`  ${thing.id} (code: ${thing.code})`);
      console.log(`    NS: ${thing.ns}`);
      console.log(`    Type: ${thing.type}`);
      console.log(`    URL: ${thing.url}`);
      console.log(`    Content: ${thing.content_preview}...`);
      console.log('');
    }

    console.log('✅ Transformation test complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('\nStack:', error.stack);
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

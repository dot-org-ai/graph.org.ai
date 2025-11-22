#!/usr/bin/env tsx

/**
 * Test Clean Data Extraction
 *
 * Instead of storing massive nested JSON, extract clean key:value pairs
 * for properties and relationships
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
  console.log('\n🔄 Testing Clean Data Extraction\n');

  try {
    // Clear existing data
    await client.exec({ query: 'TRUNCATE TABLE public.things' });

    // Transform with clean data - just extract simple key:value properties
    console.log('🔄 Transforming with clean data field...');
    await client.exec({
      query: `
        INSERT INTO public.things
        SELECT
          'https://wiki.org.ai' AS ns,

          -- Type: Q-code from P31
          coalesce(
            JSONExtractString(toJSONString(entity), 'claims', 'P31', '1', 'mainsnak', 'datavalue', 'value', 'id'),
            'item'
          ) AS type,

          -- ID: Wikipedia-style name
          replace(
            coalesce(
              JSONExtractString(toJSONString(entity), 'labels', 'en', 'value'),
              JSONExtractString(toJSONString(entity), 'id')
            ),
            ' ', '_'
          ) AS id,

          -- URL
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

          -- Data: Clean key:value pairs only
          toJSONString(map(
            'qcode', JSONExtractString(toJSONString(entity), 'id'),
            'label', JSONExtractString(toJSONString(entity), 'labels', 'en', 'value'),
            'description', JSONExtractString(toJSONString(entity), 'descriptions', 'en', 'value'),
            'modified', JSONExtractString(toJSONString(entity), 'modified'),
            'type', JSONExtractString(toJSONString(entity), 'type')
          )) AS data,

          -- Code: Q-code
          JSONExtractString(toJSONString(entity), 'id') AS code,

          -- Content: label + description
          concat(
            coalesce(JSONExtractString(toJSONString(entity), 'labels', 'en', 'value'), ''),
            '\\n\\n',
            coalesce(JSONExtractString(toJSONString(entity), 'descriptions', 'en', 'value'), '')
          ) AS content,

          -- Meta: sitelink count and other metadata
          toJSONString(map(
            'modified', JSONExtractString(toJSONString(entity), 'modified'),
            'sitelink_count', toString(length(JSONExtractKeys(toJSONString(entity), 'sitelinks')))
          )) AS meta,

          parseDateTime64BestEffortOrNull(JSONExtractString(toJSONString(entity), 'modified')) AS created_at,
          parseDateTime64BestEffortOrNull(JSONExtractString(toJSONString(entity), 'modified')) AS updated_at

        FROM public.wikidata_staging
        WHERE
          JSONExtractString(toJSONString(entity), 'id') != ''
          AND JSONExtractString(toJSONString(entity), 'labels', 'en', 'value') != ''
      `
    });

    // Check results
    const result = await client.query({
      query: `
        SELECT
          id,
          code,
          data,
          substring(content, 1, 40) as content_preview
        FROM public.things
        LIMIT 3
      `,
      format: 'JSONEachRow',
    });
    const things = await result.json<any>();

    console.log('✅ Clean data examples:\n');
    for (const thing of things) {
      console.log(`${thing.id} (${thing.code})`);
      console.log(`  Content: ${thing.content_preview}...`);
      console.log(`  Data: ${thing.data}`);

      // Parse and show clean
      const data = JSON.parse(thing.data);
      console.log(`  Parsed data:`);
      for (const [key, value] of Object.entries(data)) {
        console.log(`    ${key}: ${value}`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

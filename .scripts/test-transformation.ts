#!/usr/bin/env tsx

/**
 * Test Transformation: wikidata_staging → things + relationships
 *
 * Tests the SQL transformation logic with the 10 test entities we loaded
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
  console.log('\n🔄 Testing Wikidata → Things + Relationships Transformation\n');

  try {
    // Check staging count
    const stagingCount = await client.query({
      query: 'SELECT count() as count FROM public.wikidata_staging',
      format: 'JSONEachRow',
    });
    const stagingData = await stagingCount.json<any>();
    console.log(`📊 Staging table: ${stagingData[0].count} entities\n`);

    // Transform to things table (English only for now)
    console.log('🔄 Transforming entities → things...');
    await client.exec({
      query: `
        INSERT INTO public.things
        SELECT
          'wikidata' AS ns,

          -- Use P31 (instance of) as type, fallback to 'item'
          coalesce(
            JSONExtractString(toJSONString(entity), 'claims', 'P31', '1', 'mainsnak', 'datavalue', 'value', 'id'),
            JSONExtractString(toJSONString(entity), 'type')
          ) AS type,

          JSONExtractString(toJSONString(entity), 'id') AS id,

          -- URL format: wikidata/{type}/{id}
          concat(
            'wikidata/',
            coalesce(
              JSONExtractString(toJSONString(entity), 'claims', 'P31', '1', 'mainsnak', 'datavalue', 'value', 'id'),
              JSONExtractString(toJSONString(entity), 'type')
            ),
            '/',
            JSONExtractString(toJSONString(entity), 'id')
          ) AS url,

          -- Store full entity as JSON string (with proper Unicode)
          toJSONString(entity) AS data,

          -- No code for Wikidata entities
          '' AS code,

          -- Content: combine label and description (English only)
          concat(
            coalesce(JSONExtractString(toJSONString(entity), 'labels', 'en', 'value'), ''),
            '\\n\\n',
            coalesce(JSONExtractString(toJSONString(entity), 'descriptions', 'en', 'value'), '')
          ) AS content,

          -- Meta: simplified for now - just store modified date
          toJSONString(map(
            'modified', JSONExtractString(toJSONString(entity), 'modified')
          )) AS meta,

          parseDateTime64BestEffortOrNull(JSONExtractString(toJSONString(entity), 'modified')) AS created_at,
          parseDateTime64BestEffortOrNull(JSONExtractString(toJSONString(entity), 'modified')) AS updated_at

        FROM public.wikidata_staging
        WHERE
          JSONExtractString(toJSONString(entity), 'id') != ''
          AND JSONExtractString(toJSONString(entity), 'labels', 'en', 'value') != ''  -- English labels only
      `
    });

    // Check things count
    const thingsCount = await client.query({
      query: 'SELECT count() as count FROM public.things WHERE ns = \'wikidata\'',
      format: 'JSONEachRow',
    });
    const thingsData = await thingsCount.json<any>();
    console.log(`✅ Created ${thingsData[0].count} things\n`);

    // Show sample things
    console.log('📋 Sample things:');
    const thingsResult = await client.query({
      query: `
        SELECT
          id,
          type,
          url,
          substring(content, 1, 80) as content_preview
        FROM public.things
        WHERE ns = 'wikidata'
        LIMIT 5
      `,
      format: 'JSONEachRow',
    });
    const things = await thingsResult.json<any>();
    for (const thing of things) {
      console.log(`  ${thing.id} (${thing.type})`);
      console.log(`    URL: ${thing.url}`);
      console.log(`    Content: ${thing.content_preview}...`);
      console.log('');
    }

    // Transform to relationships (extract claims)
    console.log('🔄 Transforming claims → relationships...');
    await client.exec({
      query: `
        INSERT INTO public.relationships
        WITH
          -- Flatten claims into individual property-value pairs
          flattened_claims AS (
            SELECT
              JSONExtractString(toJSONString(entity), 'id') as entity_id,
              arrayJoin(JSONExtractKeys(toJSONString(entity), 'claims')) as property_key,
              JSONExtractString(toJSONString(entity), 'claims') as all_claims
            FROM public.wikidata_staging
            WHERE JSONExtractString(toJSONString(entity), 'id') != ''
            AND JSONHas(toJSONString(entity), 'claims')
          ),
          -- Extract individual claims for each property
          expanded_claims AS (
            SELECT
              entity_id,
              property_key,
              arrayJoin(JSONExtractArrayRaw(all_claims, property_key)) as claim
            FROM flattened_claims
          )

        SELECT
          -- Generate sequential ID using row_number
          row_number() OVER () AS id,

          -- From: construct URL for source entity
          concat('wikidata/item/', entity_id) AS \`from\`,

          -- Predicate: use Wikidata property ID
          property_key AS predicate,

          -- Reverse: empty for now
          '' AS reverse,

          -- To: construct URL for target entity (only for entity references)
          concat('wikidata/item/', JSONExtractString(claim, 'mainsnak', 'datavalue', 'value', 'id')) AS \`to\`,

          -- Data: store full claim as JSON string
          claim AS data,

          -- Content: empty
          '' AS content,

          now() AS created_at

        FROM expanded_claims
        WHERE
          JSONExtractString(claim, 'mainsnak', 'snaktype') = 'value'
          AND JSONExtractString(claim, 'mainsnak', 'datavalue', 'type') = 'wikibase-entityid'
          AND JSONExtractString(claim, 'mainsnak', 'datavalue', 'value', 'id') != ''
        LIMIT 1000  -- Limit for testing
      `
    });

    // Check relationships count
    const relsCount = await client.query({
      query: 'SELECT count() as count FROM public.relationships',
      format: 'JSONEachRow',
    });
    const relsData = await relsCount.json<any>();
    console.log(`✅ Created ${relsData[0].count} relationships\n`);

    // Show sample relationships
    console.log('📋 Sample relationships:');
    const relsResult = await client.query({
      query: `
        SELECT
          \`from\`,
          predicate,
          \`to\`
        FROM public.relationships
        LIMIT 10
      `,
      format: 'JSONEachRow',
    });
    const rels = await relsResult.json<any>();
    for (const rel of rels) {
      console.log(`  ${rel.from} --[${rel.predicate}]--> ${rel.to}`);
    }

    console.log('\n✅ Transformation test complete!\n');

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

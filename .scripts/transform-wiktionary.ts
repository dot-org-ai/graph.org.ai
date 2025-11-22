#!/usr/bin/env tsx

/**
 * Transform Wiktionary Data to Things and Relationships
 *
 * Schema:
 * - ns: https://wiki.org.ai
 * - type: word type (noun, verb, adjective, etc.)
 * - id: word (lowercase, underscores for spaces)
 * - url: https://wiki.org.ai/{type}/{id}
 * - data: Clean key:value pairs (word, pos, definitions, etymology, etc.)
 * - content: Word + definitions + examples
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
  request_timeout: 300000, // 5 minutes for transformation
});

async function main() {
  console.log('\n🔄 Transforming Wiktionary → Things + Relationships\n');

  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    // Check source table
    console.log('📊 Checking Wiktionary data...');
    const countResult = await client.query({
      query: `SELECT count() as count FROM public.source WHERE source = 'wiktionary'`,
      format: 'JSONEachRow',
    });
    const countData = await countResult.json<any>();
    console.log(`   Found ${countData[0].count} Wiktionary entries\n`);

    if (countData[0].count === 0) {
      console.log('⚠️  No Wiktionary data yet - ingestion still running');
      console.log('   Wait for some rows to be ingested first\n');
      return;
    }

    // Sample a few entries to understand structure
    console.log('📋 Sampling Wiktionary data structure...');
    const sampleResult = await client.query({
      query: `
        SELECT data
        FROM public.source
        WHERE source = 'wiktionary'
        LIMIT 3
      `,
      format: 'JSONEachRow',
    });
    const samples = await sampleResult.json<any>();
    console.log('   Sample entry:');
    console.log('   ' + samples[0].data.substring(0, 200) + '...\n');

    // Transform to things table
    console.log('🔄 Transforming Wiktionary → things...');
    await client.exec({
      query: `
        INSERT INTO public.things
        SELECT
          -- NS: wiki.org.ai (no https://)
          'wiki.org.ai' AS ns,

          -- Type: TitleCase (Noun, Verb, Adjective, etc.)
          concat(
            upper(substring(coalesce(JSONExtractString(data, 'pos'), 'word'), 1, 1)),
            substring(coalesce(JSONExtractString(data, 'pos'), 'word'), 2)
          ) AS type,

          -- ID: PascalCase for nouns, camelCase for others
          CASE
            WHEN JSONExtractString(data, 'pos') = 'noun' THEN
              -- PascalCase: capitalize each word, remove spaces and underscores
              arrayStringConcat(
                arrayMap(
                  w -> concat(upper(substring(w, 1, 1)), lower(substring(w, 2))),
                  splitByChar(' ', replace(replace(JSONExtractString(data, 'word'), '_', ' '), '-', ' '))
                ),
                ''
              )
            ELSE
              -- camelCase: first word lowercase, rest capitalized, remove spaces and underscores
              concat(
                lower(arrayElement(splitByChar(' ', replace(replace(JSONExtractString(data, 'word'), '_', ' '), '-', ' ')), 1)),
                arrayStringConcat(
                  arrayMap(
                    w -> concat(upper(substring(w, 1, 1)), lower(substring(w, 2))),
                    arraySlice(splitByChar(' ', replace(replace(JSONExtractString(data, 'word'), '_', ' '), '-', ' ')), 2)
                  ),
                  ''
                )
              )
          END AS id,

          -- URL: https:// + namespace based on POS
          CASE
            WHEN JSONExtractString(data, 'pos') = 'noun' THEN
              concat(
                'https://nouns.org.ai/',
                arrayStringConcat(
                  arrayMap(
                    w -> concat(upper(substring(w, 1, 1)), substring(w, 2)),
                    splitByChar(' ', JSONExtractString(data, 'word'))
                  ),
                  ''
                )
              )
            WHEN JSONExtractString(data, 'pos') = 'verb' THEN
              concat(
                'https://verbs.org.ai/',
                concat(
                  lower(arrayElement(splitByChar(' ', JSONExtractString(data, 'word')), 1)),
                  arrayStringConcat(
                    arrayMap(
                      w -> concat(upper(substring(w, 1, 1)), substring(w, 2)),
                      arraySlice(splitByChar(' ', JSONExtractString(data, 'word')), 2)
                    ),
                    ''
                  )
                )
              )
            ELSE
              concat(
                'https://language.org.ai/',
                lower(coalesce(JSONExtractString(data, 'pos'), 'word')),
                's/',
                concat(
                  lower(arrayElement(splitByChar(' ', JSONExtractString(data, 'word')), 1)),
                  arrayStringConcat(
                    arrayMap(
                      w -> concat(upper(substring(w, 1, 1)), substring(w, 2)),
                      arraySlice(splitByChar(' ', JSONExtractString(data, 'word')), 2)
                    ),
                    ''
                  )
                )
              )
          END AS url,

          -- Data: camelCase keys (including suffix extraction)
          toJSONString(map(
            'word', JSONExtractString(data, 'word'),
            'partOfSpeech', JSONExtractString(data, 'pos'),
            'language', JSONExtractString(data, 'lang'),
            'langCode', JSONExtractString(data, 'lang_code'),
            'etymologyText', JSONExtractString(data, 'etymology_text'),
            'suffix', extractAll(JSONExtractString(data, 'etymology_text'), '-([a-z]+)(?:\\s|\\)|,|\\.)')[1]
          )) AS data,

          -- Code: word itself
          JSONExtractString(data, 'word') AS code,

          -- Content: Markdown formatted with definitions, synonyms, antonyms, examples
          concat(
            '# ', coalesce(JSONExtractString(data, 'word'), ''), '\\n\\n',
            '**', concat(upper(substring(coalesce(JSONExtractString(data, 'pos'), ''), 1, 1)), substring(coalesce(JSONExtractString(data, 'pos'), ''), 2)), '**\\n\\n',
            if(JSONExtractString(data, 'etymology_text') != '', concat('## Etymology\\n', JSONExtractString(data, 'etymology_text'), '\\n\\n'), ''),
            '## Definitions\\n',
            coalesce(
              arrayStringConcat(
                arrayMap(
                  s -> concat('- ', JSONExtractString(s, 'glosses', '1')),
                  JSONExtractArrayRaw(data, 'senses')
                ),
                '\\n'
              ),
              ''
            )
          ) AS content,

          -- Meta: full raw Wiktionary JSON for testing
          data AS meta,

          now() AS createdAt,
          now() AS updatedAt

        FROM public.source
        WHERE
          source = 'wiktionary'
          AND JSONExtractString(data, 'word') != ''
          AND JSONExtractString(data, 'lang_code') = 'en'  -- English only for now
        LIMIT 1000
      `
    });

    // Check things count
    const thingsCount = await client.query({
      query: `SELECT count() as count FROM public.things WHERE ns = 'wiki.org.ai'`,
      format: 'JSONEachRow',
    });
    const thingsData = await thingsCount.json<any>();
    console.log(`✅ Created ${thingsData[0].count} things from Wiktionary\n`);

    // Show sample things grouped by type
    console.log('📋 Sample Wiktionary things:\n');

    console.log('  Nouns:');
    const nounsResult = await client.query({
      query: `
        SELECT type, id, code, url, substring(data, 1, 100) as data_preview
        FROM public.things
        WHERE ns = 'wiki.org.ai' AND type = 'Noun'
        LIMIT 3
      `,
      format: 'JSONEachRow',
    });
    const nouns = await nounsResult.json<any>();
    for (const thing of nouns) {
      console.log(`    ${thing.id} (${thing.type}) → ${thing.url}`);
      console.log(`      Data: ${thing.data_preview}...`);
    }

    console.log('\n  Verbs:');
    const verbsResult = await client.query({
      query: `
        SELECT type, id, code, url, substring(data, 1, 100) as data_preview
        FROM public.things
        WHERE ns = 'wiki.org.ai' AND type = 'Verb'
        LIMIT 3
      `,
      format: 'JSONEachRow',
    });
    const verbs = await verbsResult.json<any>();
    for (const thing of verbs) {
      console.log(`    ${thing.id} (${thing.type}) → ${thing.url}`);
      console.log(`      Data: ${thing.data_preview}...`);
    }

    console.log('\n  Adjectives:');
    const adjResult = await client.query({
      query: `
        SELECT type, id, code, url, substring(content, 1, 150) as content_preview
        FROM public.things
        WHERE ns = 'wiki.org.ai' AND type = 'Adj'
        LIMIT 2
      `,
      format: 'JSONEachRow',
    });
    const adjs = await adjResult.json<any>();
    for (const thing of adjs) {
      console.log(`\n    ${thing.id} (${thing.type}) → ${thing.url}`);
      console.log(`      Content: ${thing.content_preview}...`);
    }

    // TODO: Extract relationships (synonyms, antonyms, suffixes)
    // Need to update relationship extraction to:
    // 1. Add ns column (wiki.org.ai)
    // 2. Use full URLs for from/to (not just IDs)
    // 3. Remove sourceWord/targetWord from data (only relationship properties)
    console.log('\n⚠️  Skipping relationships for now (needs schema update)\n');

    /*
    // Synonyms - symmetric relationship
    console.log('  Extracting synonyms...');
    await client.exec({
      query: `
        INSERT INTO public.relationships (from, predicate, reverse, to, data, content, createdAt)
        SELECT
          -- From: word ID (TitleCase for nouns, camelCase for others)
          CASE
            WHEN JSONExtractString(data, 'pos') = 'noun' THEN
              arrayStringConcat(
                arrayMap(w -> concat(upper(substring(w, 1, 1)), substring(w, 2)), splitByChar(' ', JSONExtractString(data, 'word'))),
                ''
              )
            ELSE
              concat(
                lower(arrayElement(splitByChar(' ', JSONExtractString(data, 'word')), 1)),
                arrayStringConcat(
                  arrayMap(w -> concat(upper(substring(w, 1, 1)), substring(w, 2)), arraySlice(splitByChar(' ', JSONExtractString(data, 'word')), 2)),
                  ''
                )
              )
          END AS from,

          'synonym' AS predicate,
          'synonym' AS reverse,  -- Symmetric relationship

          -- To: synonym word (same casing logic)
          CASE
            WHEN JSONExtractString(data, 'pos') = 'noun' THEN
              arrayStringConcat(
                arrayMap(w -> concat(upper(substring(w, 1, 1)), substring(w, 2)), splitByChar(' ', synonym)),
                ''
              )
            ELSE
              concat(
                lower(arrayElement(splitByChar(' ', synonym), 1)),
                arrayStringConcat(
                  arrayMap(w -> concat(upper(substring(w, 1, 1)), substring(w, 2)), arraySlice(splitByChar(' ', synonym), 2)),
                  ''
                )
              )
          END AS to,

          toJSONString(map(
            'sourceWord', JSONExtractString(data, 'word'),
            'targetWord', synonym,
            'partOfSpeech', JSONExtractString(data, 'pos')
          )) AS data,

          '' AS content,  -- Empty for now
          now() AS createdAt

        FROM (
          SELECT
            data,
            arrayJoin(
              arrayMap(
                s -> JSONExtractString(s, '1'),
                JSONExtractArrayRaw(
                  arrayElement(
                    arrayFilter(
                      sense -> JSONExtractString(sense, 'tags', '1') = 'synonym',
                      JSONExtractArrayRaw(data, 'senses')
                    ),
                    1
                  ),
                  'links'
                )
              )
            ) AS synonym
          FROM public.source
          WHERE source = 'wiktionary'
            AND JSONExtractString(data, 'lang_code') = 'en'
            AND JSONExtractString(data, 'word') != ''
            AND JSONHas(data, 'senses')
        )
        WHERE synonym != ''
        LIMIT 1000
      `
    });

    // Antonyms - symmetric relationship
    console.log('  Extracting antonyms...');
    await client.exec({
      query: `
        INSERT INTO public.relationships (from, predicate, reverse, to, data, content, createdAt)
        SELECT
          CASE
            WHEN JSONExtractString(data, 'pos') = 'noun' THEN
              arrayStringConcat(
                arrayMap(w -> concat(upper(substring(w, 1, 1)), substring(w, 2)), splitByChar(' ', JSONExtractString(data, 'word'))),
                ''
              )
            ELSE
              concat(
                lower(arrayElement(splitByChar(' ', JSONExtractString(data, 'word')), 1)),
                arrayStringConcat(
                  arrayMap(w -> concat(upper(substring(w, 1, 1)), substring(w, 2)), arraySlice(splitByChar(' ', JSONExtractString(data, 'word')), 2)),
                  ''
                )
              )
          END AS from,

          'antonym' AS predicate,
          'antonym' AS reverse,  -- Symmetric relationship

          CASE
            WHEN JSONExtractString(data, 'pos') = 'noun' THEN
              arrayStringConcat(
                arrayMap(w -> concat(upper(substring(w, 1, 1)), substring(w, 2)), splitByChar(' ', antonym)),
                ''
              )
            ELSE
              concat(
                lower(arrayElement(splitByChar(' ', antonym), 1)),
                arrayStringConcat(
                  arrayMap(w -> concat(upper(substring(w, 1, 1)), substring(w, 2)), arraySlice(splitByChar(' ', antonym), 2)),
                  ''
                )
              )
          END AS to,

          toJSONString(map(
            'sourceWord', JSONExtractString(data, 'word'),
            'targetWord', antonym,
            'partOfSpeech', JSONExtractString(data, 'pos')
          )) AS data,

          '' AS content,  -- Empty for now
          now() AS createdAt

        FROM (
          SELECT
            data,
            arrayJoin(
              arrayMap(
                a -> JSONExtractString(a, '1'),
                JSONExtractArrayRaw(
                  arrayElement(
                    arrayFilter(
                      sense -> JSONExtractString(sense, 'tags', '1') = 'antonym',
                      JSONExtractArrayRaw(data, 'senses')
                    ),
                    1
                  ),
                  'links'
                )
              )
            ) AS antonym
          FROM public.source
          WHERE source = 'wiktionary'
            AND JSONExtractString(data, 'lang_code') = 'en'
            AND JSONExtractString(data, 'word') != ''
            AND JSONHas(data, 'senses')
        )
        WHERE antonym != ''
        LIMIT 1000
      `
    });

    // Suffix relationships - word --[hasSuffix]--> suffix
    console.log('  Extracting suffixes...');
    await client.exec({
      query: `
        INSERT INTO public.relationships (from, predicate, reverse, to, data, content, createdAt)
        SELECT
          -- From: word ID (same casing logic as things)
          CASE
            WHEN JSONExtractString(data, 'pos') = 'noun' THEN
              arrayStringConcat(
                arrayMap(w -> concat(upper(substring(w, 1, 1)), lower(substring(w, 2))), splitByChar(' ', replace(replace(JSONExtractString(data, 'word'), '_', ' '), '-', ' '))),
                ''
              )
            ELSE
              concat(
                lower(arrayElement(splitByChar(' ', replace(replace(JSONExtractString(data, 'word'), '_', ' '), '-', ' ')), 1)),
                arrayStringConcat(
                  arrayMap(w -> concat(upper(substring(w, 1, 1)), lower(substring(w, 2))), arraySlice(splitByChar(' ', replace(replace(JSONExtractString(data, 'word'), '_', ' '), '-', ' ')), 2)),
                  ''
                )
              )
          END AS from,

          'suffix' AS predicate,
          'suffixOf' AS reverse,

          -- To: suffix (camelCase)
          suffix AS to,

          toJSONString(map(
            'sourceWord', JSONExtractString(data, 'word'),
            'suffix', suffix,
            'partOfSpeech', JSONExtractString(data, 'pos'),
            'etymologyText', JSONExtractString(data, 'etymology_text')
          )) AS data,

          '' AS content,
          now() AS createdAt

        FROM (
          SELECT
            data,
            arrayJoin(extractAll(JSONExtractString(data, 'etymology_text'), '-([a-z]+)(?:\\\\s|\\\\)|,|\\\\.)')) AS suffix
          FROM public.source
          WHERE source = 'wiktionary'
            AND JSONExtractString(data, 'lang_code') = 'en'
            AND JSONExtractString(data, 'word') != ''
            AND JSONHas(data, 'etymology_text')
            AND positionCaseInsensitive(JSONExtractString(data, 'etymology_text'), 'suffix') > 0
        )
        WHERE suffix != ''
        LIMIT 1000
      `
    });

    */

    console.log('\n\n✅ Wiktionary transformation complete!\n');
    console.log('📝 Next steps:');
    console.log('   - Update relationship extraction to use new schema');
    console.log('   - Process all Wiktionary data (remove LIMIT 1000)');
    console.log('   - Add more relationship types (prefixes, derived terms, related words, etc.)\n');

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

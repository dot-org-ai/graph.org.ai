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
  request_timeout: 60000,
});

async function main() {
  try {
    // Test the transformation logic on a few samples
    const result = await client.query({
      query: `
        SELECT
          'wiki.org.ai' AS ns,
          concat(
            upper(substring(coalesce(JSONExtractString(data, 'pos'), 'word'), 1, 1)),
            substring(coalesce(JSONExtractString(data, 'pos'), 'word'), 2)
          ) AS type,
          CASE
            WHEN JSONExtractString(data, 'pos') = 'noun' THEN
              arrayStringConcat(
                arrayMap(
                  w -> concat(upper(substring(w, 1, 1)), substring(w, 2)),
                  splitByChar(' ', JSONExtractString(data, 'word'))
                ),
                ''
              )
            ELSE
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
          END AS id,
          JSONExtractString(data, 'word') AS word,
          JSONExtractString(data, 'pos') AS pos
        FROM public.sources
        WHERE source = 'wiktionary'
          AND JSONExtractString(data, 'lang_code') = 'en'
          AND JSONExtractString(data, 'word') != ''
        LIMIT 10
      `,
      format: 'JSONEachRow',
    });

    const samples = await result.json<any>();
    console.log('\n📋 Sample transformations:\n');
    for (const s of samples) {
      console.log(`Word: "${s.word}" | POS: ${s.pos} | Type: ${s.type} | ID: ${s.id} | NS: ${s.ns}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

main();

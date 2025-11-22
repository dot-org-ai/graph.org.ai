#!/usr/bin/env tsx

import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD,
  request_timeout: 30000
});

async function main() {
  // Check entries with suffix in etymology
  const result = await client.query({
    query: `
      SELECT data
      FROM public.sources
      WHERE source = 'wiktionary'
        AND JSONExtractString(data, 'lang_code') = 'en'
        AND (JSONHas(data, 'etymology_text') AND positionCaseInsensitive(JSONExtractString(data, 'etymology_text'), 'suffix') > 0)
      LIMIT 10
    `,
    format: 'JSONEachRow'
  });

  const samples = await result.json<any>();
  console.log('\nEntries with suffix in etymology:\n');
  samples.forEach((s: any) => {
    const parsed = JSON.parse(s.data);
    console.log('Word:', parsed.word);
    console.log('POS:', parsed.pos);
    console.log('Etymology:', parsed.etymology_text);
    console.log('---\n');
  });

  await client.close();
}

main();

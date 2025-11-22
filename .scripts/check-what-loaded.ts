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
  console.log('\n📦 Checking loaded data\n');

  // Get raw JSON to see what we actually have
  const result = await client.query({
    query: `SELECT toJSONString(entity) as json FROM public.wikidata_staging LIMIT 1`,
    format: 'JSONEachRow',
  });
  const data = await result.json<any>();

  if (data.length > 0) {
    const json = JSON.parse(data[0].json);
    console.log('First entity:');
    console.log(`  ID: ${json.id}`);
    console.log(`  Type: ${json.type}`);

    // Check labels
    if (json.labels) {
      const languages = Object.keys(json.labels);
      console.log(`  Label languages: ${languages.slice(0, 20).join(', ')}...`);

      // Show first few labels
      console.log('\n  Sample labels:');
      for (const lang of languages.slice(0, 5)) {
        const value = json.labels[lang].value;
        const hasEscapes = value.includes('\\u');
        const status = hasEscapes ? '❌' : '✅';
        console.log(`    ${status} ${lang}: ${value}`);
      }
    }
  }

  await client.close();
}

main().catch(console.error);

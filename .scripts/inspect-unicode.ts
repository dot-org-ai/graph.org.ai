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
  console.log('\n🔍 Inspecting Wikidata Staging Data\n');

  // Get sample raw entity
  const rawResult = await client.query({
    query: `SELECT entity FROM public.wikidata_staging LIMIT 1`,
    format: 'JSONEachRow',
  });
  const rawData = await rawResult.json<any>();

  if (rawData.length > 0) {
    console.log('📦 Raw entity structure:');
    console.log(JSON.stringify(rawData[0].entity, null, 2).substring(0, 2000));
    console.log('\n...\n');
  }

  // Try different label access patterns
  console.log('🔍 Testing different access patterns:\n');

  // Pattern 1: Check what labels exist
  const labelsResult = await client.query({
    query: `
      SELECT
        JSONExtractKeys(toJSONString(entity.labels)) as label_languages
      FROM public.wikidata_staging
      WHERE entity.labels IS NOT NULL
      LIMIT 5
    `,
    format: 'JSONEachRow',
  });
  const labelsData = await labelsResult.json<any>();
  console.log('Available label languages:', labelsData);

  await client.close();
}

main().catch(console.error);

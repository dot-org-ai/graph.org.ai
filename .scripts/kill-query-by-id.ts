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
  request_timeout: 30000,
});

const queryId = process.argv[2];

async function main() {
  if (!queryId) {
    console.error('Usage: npx tsx .scripts/kill-query-by-id.ts <query_id>');
    process.exit(1);
  }

  try {
    console.log(`Killing query: ${queryId}`);
    await client.command({
      query: `KILL QUERY WHERE query_id = '${queryId}' SYNC`,
    });
    console.log(`✅ Killed ${queryId}`);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

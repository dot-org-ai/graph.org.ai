#!/usr/bin/env tsx

/**
 * Submit Async INSERT for Wikidata Stream
 *
 * Uses async_insert mode to ensure query runs server-side
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
  request_timeout: 10000, // Short timeout - just to submit
});

async function main() {
  console.log('\n🚀 Submitting Async Wikidata Stream\n');

  try {
    // Use command() instead of exec() with wait_end_of_query=0
    // This submits the query and returns immediately
    const result = await client.command({
      query: `
        INSERT INTO public.wikidata_staging
        SELECT
          trimBoth(trim(TRAILING ',' FROM json))::JSON as entity
        FROM url(
          'https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.bz2',
          JSONAsString
        )
        WHERE json != '[' AND json != ']' AND length(trim(json)) > 2
        SETTINGS
          max_insert_block_size = 100000,
          max_insert_threads = 8,
          max_download_threads = 4,
          max_download_buffer_size = 1048576,
          input_format_allow_errors_ratio = 0.1,
          input_format_allow_errors_num = 10000
      `,
      clickhouse_settings: {
        wait_end_of_query: 0, // Don't wait for query to complete
        send_timeout: 10,
        receive_timeout: 10,
      }
    });

    console.log('✅ Query submitted!');
    console.log(`   Response: ${result.query_id}`);
    console.log('');
    console.log('📊 The query should now be running server-side');
    console.log('   Check system.processes to verify\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

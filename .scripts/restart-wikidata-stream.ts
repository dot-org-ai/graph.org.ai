#!/usr/bin/env tsx

/**
 * Restart Wikidata Stream (with cleanup)
 *
 * 1. Clear bad data from staging table
 * 2. Submit correct streaming query
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
  request_timeout: 300000,
});

async function main() {
  console.log('\n🔄 Restarting Wikidata Stream\n');

  try {
    // Clear bad data
    console.log('🗑️  Clearing staging table (removing bad data)...');
    await client.exec({
      query: 'TRUNCATE TABLE public.wikidata_staging'
    });
    console.log('✅ Staging table cleared\n');

    // Verify it's empty
    const countResult = await client.query({
      query: 'SELECT count() as count FROM public.wikidata_staging',
      format: 'JSONEachRow',
    });
    const countData = await countResult.json<any>();
    console.log(`📊 Current row count: ${countData[0].count}\n`);

    // Submit the correct streaming query
    console.log('🚀 Submitting corrected streaming query...');
    console.log('   Using JSONAsString format for proper Unicode decoding');
    console.log('   This will run server-side for 24-48 hours\n');

    await client.exec({
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
        max_execution_time: 0,
        send_timeout: 300,
        receive_timeout: 300,
      }
    });

    console.log('✅ Query submitted successfully!\n');
    console.log('📊 The corrected query is now running server-side');
    console.log('   - Streaming 130GB from Wikimedia');
    console.log('   - Processing will take 24-48 hours');
    console.log('   - Unicode will be properly decoded\n');

    console.log('📝 Monitor progress:');
    console.log('   SELECT count() FROM public.wikidata_staging');
    console.log('   SELECT * FROM system.processes WHERE query LIKE \'%wikidata_staging%\'\n');

  } catch (error) {
    if (error instanceof Error && error.message.includes('Timeout')) {
      console.log('\n⚠️  Client timeout (this is normal!)');
      console.log('✅ Query was submitted and is running server-side\n');
    } else {
      console.error('\n❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  } finally {
    await client.close();
  }
}

main().catch(console.error);

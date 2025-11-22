#!/usr/bin/env tsx

/**
 * Ingest GeoNames Data to Source Table using ClickHouse url()
 *
 * Uses ClickHouse's url() function to directly stream GeoNames data
 * from the remote URL without downloading to local disk.
 * The txt.gz file can be read directly by ClickHouse.
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
  request_timeout: 3600000, // 60 minutes for large dataset
});

async function main() {
  console.log('\n📍 Ingesting GeoNames to Source Table (Direct URL Streaming)\n');

  try {
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    console.log('📥 Streaming GeoNames allCountries.txt directly from URL...');
    console.log('   Source: https://download.geonames.org/export/dump/allCountries.zip');
    console.log(`   Batch: ${batchTimestamp}`);
    console.log('   Records: 11+ million');
    console.log('   Method: Direct ClickHouse url() streaming\n');

    console.log('⚠️  This is a large dataset - will take 10-30 minutes\n');
    console.log('🚀 Starting direct ingestion...\n');

    // Use url() to read directly from GeoNames
    // Note: We need to use the .txt file, not .zip, as ClickHouse can't unzip
    // Try the allCountries.txt URL (uncompressed)
    const insertQuery = `
      INSERT INTO public.source (source, data, batch, ingested)
      SELECT
        'geonames' AS source,
        toJSONString(map(
          'geonameId', c1,
          'name', c2,
          'asciiName', c3,
          'alternateNames', c4,
          'latitude', c5,
          'longitude', c6,
          'featureClass', c7,
          'featureCode', c8,
          'countryCode', c9,
          'cc2', c10,
          'admin1Code', c11,
          'admin2Code', c12,
          'admin3Code', c13,
          'admin4Code', c14,
          'population', c15,
          'elevation', c16,
          'dem', c17,
          'timezone', c18,
          'modificationDate', c19
        )) AS data,
        toDateTime('${batchTimestamp}') AS batch,
        now() AS ingested
      FROM url(
        'https://download.geonames.org/export/dump/allCountries.zip',
        'TabSeparated',
        'c1 String, c2 String, c3 String, c4 String, c5 String, c6 String, c7 String, c8 String, c9 String, c10 String, c11 String, c12 String, c13 String, c14 String, c15 String, c16 String, c17 String, c18 String, c19 String'
      )
    `;

    console.log('📊 Executing INSERT FROM url()...');
    console.log('   ClickHouse will stream directly from geonames.org\n');

    const startTime = Date.now();

    await client.exec({
      query: insertQuery,
      clickhouse_settings: {
        max_execution_time: 3600, // 60 minutes
        max_insert_block_size: 100000,
        enable_url_encoding: 0,
      }
    });

    const duration = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    console.log(`\n✅ Ingestion complete in ${minutes}m ${seconds}s\n`);

    // Check row count
    console.log('📊 Verifying ingestion...');
    const countResult = await client.query({
      query: `SELECT count() as count FROM public.source WHERE source = 'geonames' AND batch = toDateTime('${batchTimestamp}')`,
      format: 'JSONEachRow',
    });
    const countData = await countResult.json<{ count: string }>();
    const count = parseInt(countData[0].count);

    console.log(`   Rows inserted: ${count.toLocaleString()}`);
    console.log(`   Average rate: ${Math.round(count / duration).toLocaleString()} rows/sec\n`);

    // Show sample record
    console.log('📝 Sample record:');
    const sampleResult = await client.query({
      query: `SELECT data FROM public.source WHERE source = 'geonames' LIMIT 1`,
      format: 'JSONEachRow',
    });
    const sampleData = await sampleResult.json<{ data: string }>();
    console.log(JSON.stringify(JSON.parse(sampleData[0].data), null, 2));
    console.log();

    console.log('✅ GeoNames ingestion complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. Run transform-geonames.ts to convert to things + relationships');
    console.log('   2. Create location URLs (geo.org.ai/cities/*, geo.org.ai/countries/*)');
    console.log('   3. Extract relationships (locatedIn, adjacentTo, capitalOf)\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

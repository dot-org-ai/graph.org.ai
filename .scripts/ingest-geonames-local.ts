#!/usr/bin/env tsx

/**
 * Ingest GeoNames Data via Local Download
 *
 * Downloads GeoNames ZIP file, extracts locally, and streams to ClickHouse
 * using the SDK's insert() method with a streaming interface.
 *
 * This bypasses the url() function's ZIP limitation.
 */

import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, createReadStream } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createInterface } from 'readline';
import { createGunzip } from 'zlib';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD,
  request_timeout: 7200000, // 2 hours
});

const GEONAMES_URL = 'https://download.geonames.org/export/dump/allCountries.zip';

async function main() {
  console.log('\n📍 Ingesting GeoNames (Local Download Method)\n');

  try {
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    const sourceDir = path.join(PROJECT_ROOT, '.source', 'GeoNames');
    if (!existsSync(sourceDir)) {
      mkdirSync(sourceDir, { recursive: true });
    }

    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    const zipFile = path.join(sourceDir, 'allCountries.zip');
    const txtFile = path.join(sourceDir, 'allCountries.txt');

    // Download if not exists
    if (!existsSync(zipFile)) {
      console.log('📥 Downloading allCountries.zip...');
      console.log('   Source: ' + GEONAMES_URL);
      console.log('   Size: ~1.5 GB\n');

      await execAsync(`curl -L -o "${zipFile}" "${GEONAMES_URL}"`);
      console.log('✅ Downloaded\n');
    } else {
      console.log('✅ ZIP file already exists, skipping download\n');
    }

    // Extract if not exists
    if (!existsSync(txtFile)) {
      console.log('📦 Extracting allCountries.txt...');
      await execAsync(`unzip -o "${zipFile}" -d "${sourceDir}"`);
      console.log('✅ Extracted\n');
    } else {
      console.log('✅ TXT file already exists, skipping extraction\n');
    }

    console.log('📊 Streaming to ClickHouse...');
    console.log(`   Batch: ${batchTimestamp}`);
    console.log('   Records: 11+ million\n');

    const startTime = Date.now();
    let recordCount = 0;
    const batchSize = 10000;
    let batch: any[] = [];

    // Stream the file line by line
    const fileStream = createReadStream(txtFile);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      if (!line.trim()) continue;

      const parts = line.split('\t');
      if (parts.length < 19) continue;

      const record = {
        source: 'geonames',
        data: JSON.stringify({
          geonameId: parts[0],
          name: parts[1],
          asciiName: parts[2],
          alternateNames: parts[3],
          latitude: parts[4],
          longitude: parts[5],
          featureClass: parts[6],
          featureCode: parts[7],
          countryCode: parts[8],
          cc2: parts[9],
          admin1Code: parts[10],
          admin2Code: parts[11],
          admin3Code: parts[12],
          admin4Code: parts[13],
          population: parts[14],
          elevation: parts[15],
          dem: parts[16],
          timezone: parts[17],
          modificationDate: parts[18],
        }),
        batch: batchTimestamp,
        ingested: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      batch.push(record);
      recordCount++;

      if (batch.length >= batchSize) {
        await client.insert({
          table: 'public.source',
          values: batch,
          format: 'JSONEachRow',
        });
        batch = [];

        if (recordCount % 100000 === 0) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          const rate = Math.round(recordCount / elapsed);
          console.log(`   ${recordCount.toLocaleString()} records (${rate.toLocaleString()} rows/sec)`);
        }
      }
    }

    // Insert remaining records
    if (batch.length > 0) {
      await client.insert({
        table: 'public.source',
        values: batch,
        format: 'JSONEachRow',
      });
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    console.log(`\n✅ Ingestion complete in ${minutes}m ${seconds}s`);
    console.log(`   Total records: ${recordCount.toLocaleString()}`);
    console.log(`   Average rate: ${Math.round(recordCount / duration).toLocaleString()} rows/sec\n`);

    // Verify count
    console.log('📊 Verifying ingestion...');
    const countResult = await client.query({
      query: `SELECT count() as count FROM public.source WHERE source = 'geonames' AND batch = toDateTime('${batchTimestamp}')`,
      format: 'JSONEachRow',
    });
    const countData = await countResult.json<{ count: string }>();
    console.log(`   Rows in database: ${parseInt(countData[0].count).toLocaleString()}\n`);

    // Show sample
    console.log('📝 Sample record:');
    const sampleResult = await client.query({
      query: `SELECT data FROM public.source WHERE source = 'geonames' LIMIT 1`,
      format: 'JSONEachRow',
    });
    const sampleData = await sampleResult.json<{ data: string }>();
    console.log(JSON.stringify(JSON.parse(sampleData[0].data), null, 2));
    console.log();

    console.log('✅ GeoNames ingestion complete!\n');

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

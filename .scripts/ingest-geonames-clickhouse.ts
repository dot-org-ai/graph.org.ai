#!/usr/bin/env tsx

/**
 * Ingest GeoNames Data to ClickHouse
 *
 * Downloads and ingests GeoNames geographic data directly to ClickHouse
 */

import { createClient } from '@clickhouse/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { Readable, Transform } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(PROJECT_ROOT, '.source');
const GEONAMES_DIR = path.join(SOURCE_DIR, 'GeoNames');

if (!fs.existsSync(GEONAMES_DIR)) {
  fs.mkdirSync(GEONAMES_DIR, { recursive: true });
}

const client = createClient({
  host: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
});

async function downloadFile(url: string, outputPath: string): Promise<void> {
  console.log(`  Downloading: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  const fileStream = fs.createWriteStream(outputPath);
  await pipeline(
    Readable.fromWeb(response.body as any),
    fileStream
  );

  const stats = fs.statSync(outputPath);
  console.log(`  ✅ Downloaded ${(stats.size / 1024 / 1024).toFixed(1)}MB`);
}

async function extractGzip(inputPath: string, outputPath: string): Promise<void> {
  console.log(`  Extracting: ${path.basename(inputPath)}`);

  await pipeline(
    fs.createReadStream(inputPath),
    createGunzip(),
    fs.createWriteStream(outputPath)
  );

  const stats = fs.statSync(outputPath);
  console.log(`  ✅ Extracted ${(stats.size / 1024 / 1024).toFixed(1)}MB`);
}

async function ingestPlaces(): Promise<void> {
  console.log('\n📦 Ingesting GeoNames Places...\n');

  const url = 'https://download.geonames.org/export/dump/allCountries.zip';
  const zipPath = path.join(GEONAMES_DIR, 'allCountries.zip');
  const txtPath = path.join(GEONAMES_DIR, 'allCountries.txt');

  // Download if not exists
  if (!fs.existsSync(txtPath)) {
    if (!fs.existsSync(zipPath)) {
      await downloadFile(url, zipPath);
    }

    // Note: ZIP extraction would require additional library
    console.log('\n  ⚠️  Please manually extract allCountries.zip');
    console.log('     Run: unzip allCountries.zip\n');
    return;
  }

  console.log('  Ingesting to ClickHouse...');

  // Stream the TSV file directly to ClickHouse
  const fileStream = fs.createReadStream(txtPath);

  await client.insert({
    table: 'graph_org_ai.geo_places',
    values: fileStream,
    format: 'TabSeparated',
  });

  console.log('  ✅ Places ingested\n');
}

async function ingestPostalCodes(): Promise<void> {
  console.log('\n📦 Ingesting Postal Codes...\n');

  const url = 'https://download.geonames.org/export/zip/allCountries.zip';
  const zipPath = path.join(GEONAMES_DIR, 'postal_allCountries.zip');
  const txtPath = path.join(GEONAMES_DIR, 'allCountries_postal.txt');

  // Download if not exists
  if (!fs.existsSync(txtPath)) {
    if (!fs.existsSync(zipPath)) {
      await downloadFile(url, zipPath);
    }

    console.log('\n  ⚠️  Please manually extract postal_allCountries.zip');
    console.log('     Run: unzip postal_allCountries.zip -d postal/\n');
    return;
  }

  console.log('  Ingesting to ClickHouse...');

  const fileStream = fs.createReadStream(txtPath);

  await client.insert({
    table: 'graph_org_ai.postal_codes',
    values: fileStream,
    format: 'TabSeparated',
  });

  console.log('  ✅ Postal codes ingested\n');
}

async function ingestCountries(): Promise<void> {
  console.log('\n📦 Ingesting Country Info...\n');

  const url = 'https://download.geonames.org/export/dump/countryInfo.txt';
  const txtPath = path.join(GEONAMES_DIR, 'countryInfo.txt');

  if (!fs.existsSync(txtPath)) {
    await downloadFile(url, txtPath);
  }

  // Read and filter out comment lines
  const content = fs.readFileSync(txtPath, 'utf-8');
  const lines = content.split('\n').filter(line => !line.startsWith('#') && line.trim());

  console.log(`  Processing ${lines.length} countries...`);

  // Create a stream from the filtered lines
  const dataStream = Readable.from(lines.join('\n'));

  await client.insert({
    table: 'graph_org_ai.countries',
    values: dataStream,
    format: 'TabSeparated',
  });

  console.log('  ✅ Countries ingested\n');
}

async function verifyData(): Promise<void> {
  console.log('\n📊 Verifying data...\n');

  // Count places
  const placesCount = await client.query({
    query: 'SELECT count() as count FROM graph_org_ai.geo_places',
    format: 'JSONEachRow',
  });
  const placesData = await placesCount.json<any>();
  console.log(`  Places: ${Number(placesData[0].count).toLocaleString()}`);

  // Count postal codes
  const postalCount = await client.query({
    query: 'SELECT count() as count FROM graph_org_ai.postal_codes',
    format: 'JSONEachRow',
  });
  const postalData = await postalCount.json<any>();
  console.log(`  Postal codes: ${Number(postalData[0].count).toLocaleString()}`);

  // Count countries
  const countriesCount = await client.query({
    query: 'SELECT count() as count FROM graph_org_ai.countries',
    format: 'JSONEachRow',
  });
  const countriesData = await countriesCount.json<any>();
  console.log(`  Countries: ${Number(countriesData[0].count).toLocaleString()}`);

  // Sample query - find major US cities
  console.log('\n  Sample query - Major US cities:');
  const cities = await client.query({
    query: `
      SELECT name, admin1_code as state, population
      FROM graph_org_ai.geo_places
      WHERE country_code = 'US'
        AND feature_class = 'P'
        AND population > 100000
      ORDER BY population DESC
      LIMIT 10
    `,
    format: 'JSONEachRow',
  });

  const citiesData = await cities.json<any>();
  citiesData.forEach((city: any) => {
    console.log(`    ${city.name}, ${city.state}: ${Number(city.population).toLocaleString()}`);
  });

  console.log();
}

async function main(): Promise<void> {
  try {
    console.log('\n🌍 GeoNames → ClickHouse Ingestion\n');

    // Test connection
    console.log('  Testing ClickHouse connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Failed to connect to ClickHouse');
    }
    console.log('  ✅ Connected\n');

    // Ingest data
    await ingestCountries();

    // Note: Large files require manual extraction
    console.log('📝 Note: For large datasets, please download and extract manually:');
    console.log('   1. Download: https://download.geonames.org/export/dump/allCountries.zip');
    console.log('   2. Extract: unzip allCountries.zip');
    console.log('   3. Download: https://download.geonames.org/export/zip/allCountries.zip');
    console.log('   4. Extract: unzip allCountries.zip -d postal/');
    console.log('   5. Run this script again to complete ingestion\n');

    // Try to ingest if files exist
    if (fs.existsSync(path.join(GEONAMES_DIR, 'allCountries.txt'))) {
      await ingestPlaces();
    }

    if (fs.existsSync(path.join(GEONAMES_DIR, 'allCountries_postal.txt'))) {
      await ingestPostalCodes();
    }

    // Verify
    await verifyData();

    console.log('✅ Ingestion complete!\n');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    throw error;
  } finally {
    await client.close();
  }
}

main().catch(console.error);

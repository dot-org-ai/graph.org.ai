#!/usr/bin/env tsx

/**
 * Ingest GeoNames Reference Data
 *
 * Ingests countries, timezones, and languages from GeoNames:
 * - Countries (countryInfo.txt) → things table with type='Country'
 * - Timezones (timeZones.txt) → things table with type='TimeZone'
 * - Languages (iso-languagecodes.txt) → things table with type='Language'
 */

import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD,
  request_timeout: 300000, // 5 minutes
});

const BASE_URL = 'http://download.geonames.org/export/dump';

/**
 * Download a file from GeoNames
 */
async function downloadFile(url: string, localPath: string) {
  if (existsSync(localPath)) {
    console.log(`   File already exists: ${path.basename(localPath)}`);
    return;
  }

  console.log(`   Downloading ${path.basename(url)}...`);
  await execAsync(`curl -L -o "${localPath}" "${url}"`);
  console.log(`   ✅ Downloaded`);
}

/**
 * Ingest countries from countryInfo.txt
 */
async function ingestCountries(filePath: string, batchTimestamp: string) {
  console.log('\n🌍 Ingesting countries...');

  // Read and parse the file
  const fs = await import('fs');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');

  const values: string[] = [];
  for (const line of lines) {
    if (line.startsWith('#') || line.trim() === '') continue;

    const fields = line.split('\t');
    if (fields[0] === 'ISO' || fields.length < 18) continue; // Skip header

    const [iso, iso3, isoNumeric, fips, name, capital, area, population, continent, tld,
           currencyCode, currencyName, phone, postalFormat, postalRegex, languages, geonameid, neighbours] = fields;

    const data = JSON.stringify({
      iso,
      iso3,
      iso_numeric: isoNumeric,
      fips,
      name,
      capital,
      area_km2: area ? parseFloat(area) : null,
      population: population ? parseInt(population) : null,
      continent,
      tld,
      currency_code: currencyCode,
      currency_name: currencyName,
      phone,
      postal_code_format: postalFormat,
      postal_code_regex: postalRegex,
      languages,
      geonameid: parseInt(geonameid),
      neighbours,
    });

    values.push(`('places.org.ai', 'Country', '${iso}', 'https://places.org.ai/country/${iso}', '${data.replace(/'/g, "\\'")}', '${batchTimestamp}', '${batchTimestamp}', 1)`);
  }

  if (values.length > 0) {
    const query = `INSERT INTO public.things (ns, type, id, url, data, createdAt, updatedAt, version) VALUES ${values.join(', ')}`;
    await client.exec({ query });
  }

  console.log(`✅ Inserted ${values.length} countries\n`);
}

/**
 * Ingest timezones from timeZones.txt
 */
async function ingestTimeZones(filePath: string, batchTimestamp: string) {
  console.log('🕐 Ingesting timezones...');

  const fs = await import('fs');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');

  const values: string[] = [];
  for (const line of lines) {
    if (line.trim() === '') continue;

    const fields = line.split('\t');
    if (fields[0] === 'CountryCode' || fields.length < 5) continue; // Skip header

    const [countryCode, timezoneId, gmtOffsetJan, dstOffsetJul, rawOffset] = fields;

    const data = JSON.stringify({
      country_code: countryCode,
      timezone_id: timezoneId,
      gmt_offset_jan: parseFloat(gmtOffsetJan),
      dst_offset_jul: parseFloat(dstOffsetJul),
      raw_offset: parseFloat(rawOffset),
    });

    const urlSafeId = timezoneId.replace(/\//g, '-');
    values.push(`('places.org.ai', 'TimeZone', '${timezoneId}', 'https://places.org.ai/timezone/${urlSafeId}', '${data.replace(/'/g, "\\'")}', '${batchTimestamp}', '${batchTimestamp}', 1)`);
  }

  if (values.length > 0) {
    const query = `INSERT INTO public.things (ns, type, id, url, data, createdAt, updatedAt, version) VALUES ${values.join(', ')}`;
    await client.exec({ query });
  }

  console.log(`✅ Inserted ${values.length} timezones\n`);
}

/**
 * Ingest languages from iso-languagecodes.txt
 */
async function ingestLanguages(filePath: string, batchTimestamp: string) {
  console.log('🗣️  Ingesting languages...');

  const fs = await import('fs');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');

  const values: string[] = [];
  for (const line of lines) {
    if (line.trim() === '') continue;

    const fields = line.split('\t');
    if (fields.length < 4 || fields[0] === 'ISO 639-3') continue; // Skip header

    const [iso639_3, iso639_2, iso639_1, name] = fields;

    // Only include languages that have an ISO 639-1 code (2-letter code)
    if (!iso639_1 || iso639_1.trim() === '') continue;

    const data = JSON.stringify({
      iso_639_3: iso639_3,
      iso_639_2: iso639_2,
      iso_639_1: iso639_1,
      name,
    });

    values.push(`('places.org.ai', 'Language', '${iso639_1}', 'https://places.org.ai/language/${iso639_1}', '${data.replace(/'/g, "\\'")}', '${batchTimestamp}', '${batchTimestamp}', 1)`);
  }

  if (values.length > 0) {
    const query = `INSERT INTO public.things (ns, type, id, url, data, createdAt, updatedAt, version) VALUES ${values.join(', ')}`;
    await client.exec({ query });
  }

  console.log(`✅ Inserted ${values.length} languages\n`);
}

async function main() {
  console.log('\n📚 Ingesting GeoNames Reference Data\n');
  console.log('   Countries, Timezones, Languages\n');

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

    // Download files
    console.log('📥 Downloading reference files...\n');
    const countryFile = path.join(sourceDir, 'countryInfo.txt');
    const timezoneFile = path.join(sourceDir, 'timeZones.txt');
    const languageFile = path.join(sourceDir, 'iso-languagecodes.txt');

    await downloadFile(`${BASE_URL}/countryInfo.txt`, countryFile);
    await downloadFile(`${BASE_URL}/timeZones.txt`, timezoneFile);
    await downloadFile(`${BASE_URL}/iso-languagecodes.txt`, languageFile);

    // Ingest data
    await ingestCountries(countryFile, batchTimestamp);
    await ingestTimeZones(timezoneFile, batchTimestamp);
    await ingestLanguages(languageFile, batchTimestamp);

    console.log('✅ GeoNames reference data ingestion complete!\n');
    console.log('📝 Summary:');
    console.log('   - Countries → things table (type=Country)');
    console.log('   - Timezones → things table (type=TimeZone)');
    console.log('   - Languages → things table (type=Language)\n');

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

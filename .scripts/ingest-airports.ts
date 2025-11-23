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
  console.log('\n✈️  Starting IATA Airport Ingestion from OurAirports\n');
  console.log(`📡 Server: ${process.env.CLICKHOUSE_URL}\n`);

  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    // Create table
    console.log('📋 Creating table if not exists...');
    await client.exec({
      query: `
        CREATE TABLE IF NOT EXISTS source.airports (
          id UInt32,
          ident String,
          type String,
          name String,
          latitude_deg Float64,
          longitude_deg Float64,
          elevation_ft Int32,
          continent String,
          iso_country String,
          iso_region String,
          municipality String,
          scheduled_service String,
          gps_code String,
          iata_code String,
          local_code String,
          home_link String,
          wikipedia_link String,
          keywords String,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (iso_country, iata_code, id)
      `
    });
    console.log('✅ Table ready\n');

    // Get current timestamp for batch identifier
    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    // Submit the streaming query
    console.log('🚀 Submitting streaming query...');
    console.log(`   Source: OurAirports CSV`);
    console.log(`   Batch: ${batchTimestamp}`);
    console.log('   URL: https://davidmegginson.github.io/ourairports-data/airports.csv');
    console.log('   This will run server-side\n');

    await client.exec({
      query: `
        INSERT INTO source.airports
        SELECT
          id,
          ident,
          type,
          name,
          latitude_deg,
          longitude_deg,
          elevation_ft,
          continent,
          iso_country,
          iso_region,
          municipality,
          scheduled_service,
          gps_code,
          iata_code,
          local_code,
          home_link,
          wikipedia_link,
          keywords,
          parseDateTimeBestEffort('${batchTimestamp}') as ingested_at
        FROM url(
          'https://davidmegginson.github.io/ourairports-data/airports.csv',
          CSV
        )
      `
    });

    console.log('✅ Query submitted successfully!\n');

    // Check counts
    const totalResult = await client.query({
      query: 'SELECT count() as count FROM source.airports',
      format: 'JSONEachRow'
    });
    const totalData = await totalResult.json<{count: string}>();
    console.log(`📊 Total airports: ${totalData[0].count}`);

    const iataResult = await client.query({
      query: "SELECT count() as count FROM source.airports WHERE iata_code != ''",
      format: 'JSONEachRow'
    });
    const iataData = await iataResult.json<{count: string}>();
    console.log(`📊 Airports with IATA codes: ${iataData[0].count}\n`);

    console.log('✅ Airport ingestion complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

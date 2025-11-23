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

// GCP Regions with approximate coordinates
// Source: https://cloud.google.com/compute/docs/regions-zones
const GCP_REGIONS = [
  { region: 'us-central1', location: 'Iowa, USA', latitude: 41.2619, longitude: -93.6005 },
  { region: 'us-east1', location: 'South Carolina, USA', latitude: 33.1960, longitude: -80.0131 },
  { region: 'us-east4', location: 'Northern Virginia, USA', latitude: 39.0473, longitude: -77.4874 },
  { region: 'us-west1', location: 'Oregon, USA', latitude: 45.5951, longitude: -121.1787 },
  { region: 'us-west2', location: 'Los Angeles, USA', latitude: 34.0522, longitude: -118.2437 },
  { region: 'us-west3', location: 'Salt Lake City, USA', latitude: 40.7608, longitude: -111.8910 },
  { region: 'us-west4', location: 'Las Vegas, USA', latitude: 36.1699, longitude: -115.1398 },
  { region: 'europe-west1', location: 'Belgium', latitude: 50.8503, longitude: 4.3517 },
  { region: 'europe-west2', location: 'London, UK', latitude: 51.5074, longitude: -0.1278 },
  { region: 'europe-west3', location: 'Frankfurt, Germany', latitude: 50.1109, longitude: 8.6821 },
  { region: 'europe-west4', location: 'Netherlands', latitude: 52.1326, longitude: 5.2913 },
  { region: 'europe-west6', location: 'Zurich, Switzerland', latitude: 47.3769, longitude: 8.5472 },
  { region: 'europe-north1', location: 'Finland', latitude: 60.1695, longitude: 24.9354 },
  { region: 'asia-east1', location: 'Taiwan', latitude: 25.0330, longitude: 121.5654 },
  { region: 'asia-east2', location: 'Hong Kong', latitude: 22.3193, longitude: 114.1694 },
  { region: 'asia-northeast1', location: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503 },
  { region: 'asia-northeast2', location: 'Osaka, Japan', latitude: 34.6937, longitude: 135.5023 },
  { region: 'asia-northeast3', location: 'Seoul, South Korea', latitude: 37.5665, longitude: 126.9780 },
  { region: 'asia-south1', location: 'Mumbai, India', latitude: 19.0760, longitude: 72.8777 },
  { region: 'asia-south2', location: 'Delhi, India', latitude: 28.6139, longitude: 77.2090 },
  { region: 'asia-southeast1', location: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { region: 'asia-southeast2', location: 'Jakarta, Indonesia', latitude: -6.2088, longitude: 106.8456 },
  { region: 'australia-southeast1', location: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093 },
  { region: 'australia-southeast2', location: 'Melbourne, Australia', latitude: -37.8136, longitude: 144.9631 },
  { region: 'me-west1', location: 'Doha, Qatar', latitude: 25.2854, longitude: 51.5310 },
  { region: 'southamerica-east1', location: 'São Paulo, Brazil', latitude: -23.5505, longitude: -46.6333 },
  { region: 'northamerica-northeast1', location: 'Montreal, Canada', latitude: 45.5017, longitude: -73.5673 },
  { region: 'northamerica-northeast2', location: 'Toronto, Canada', latitude: 43.6532, longitude: -79.3832 },
  { region: 'africa-south1', location: 'Johannesburg, South Africa', latitude: -26.2023, longitude: 28.0436 },
];

async function main() {
  console.log('\n🌎 Starting GCP Regions Ingestion\n');
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
        CREATE TABLE IF NOT EXISTS source.gcp_regions (
          region String,
          location String,
          latitude Float64,
          longitude Float64,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (region)
      `
    });
    console.log('✅ Table ready\n');

    // Prepare data for insertion
    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    console.log(`📥 Preparing GCP regions data...`);
    const rows: Array<[string, string, number, number, string]> = [];

    for (const region of GCP_REGIONS) {
      rows.push([
        region.region,
        region.location,
        region.latitude,
        region.longitude,
        batchTimestamp
      ]);
    }

    // Insert data
    console.log(`🚀 Inserting ${rows.length} GCP regions...`);
    if (rows.length > 0) {
      await client.insert({
        table: 'source.gcp_regions',
        values: rows.map(([region, location, latitude, longitude, ingested_at]) => ({
          region,
          location,
          latitude,
          longitude,
          ingested_at
        })),
        format: 'JSONEachRow'
      });
    }

    console.log('✅ Data inserted successfully!\n');

    // Check counts
    const totalResult = await client.query({
      query: 'SELECT count() as count FROM source.gcp_regions',
      format: 'JSONEachRow'
    });
    const totalData = await totalResult.json<{count: string}>();
    console.log(`📊 Total GCP regions: ${totalData[0].count}`);

    // Show sample data
    const sampleResult = await client.query({
      query: 'SELECT region, location FROM source.gcp_regions LIMIT 5',
      format: 'JSONEachRow'
    });
    const sampleData = await sampleResult.json<{region: string; location: string}>();
    console.log(`📍 Sample regions:`);
    for (const row of sampleData) {
      console.log(`   - ${row.region}: ${row.location}`);
    }
    console.log();

    console.log('✅ GCP regions ingestion complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

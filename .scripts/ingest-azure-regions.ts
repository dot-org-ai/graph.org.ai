#!/usr/bin/env tsx

import { createClient } from '@clickhouse/client';
import { execSync } from 'child_process';
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
  console.log('\n☁️  Starting Azure Regions Ingestion\n');
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
        CREATE TABLE IF NOT EXISTS source.azure_regions (
          name String,
          display_name String,
          latitude Float64,
          longitude Float64,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (name)
      `
    });
    console.log('✅ Table ready\n');

    // Try to execute Azure CLI command
    console.log('🔍 Checking for Azure CLI availability...');
    let locations: Array<{
      name: string;
      displayName: string;
      latitude?: number;
      longitude?: number;
    }> = [];

    try {
      console.log('📥 Executing: az account list-locations --output json');
      const output = execSync('az account list-locations --output json', {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      const data = JSON.parse(output);
      if (Array.isArray(data)) {
        locations = data.map(loc => ({
          name: loc.name || '',
          displayName: loc.displayName || '',
          latitude: loc.metadata?.latitude,
          longitude: loc.metadata?.longitude
        })).filter(loc => loc.name);
      }

      console.log(`✅ Azure CLI available - found ${locations.length} regions\n`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        console.log('⚠️  Azure CLI not installed - skipping\n');
        console.log('   To install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli\n');
        console.log('✅ Graceful skip - Azure CLI not available\n');
        await client.close();
        return;
      }
      throw error;
    }

    // Prepare data for insertion
    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    const rows: Array<[string, string, number, number, string]> = [];

    for (const location of locations) {
      const latitude = location.latitude ?? 0;
      const longitude = location.longitude ?? 0;
      rows.push([
        location.name,
        location.displayName,
        latitude,
        longitude,
        batchTimestamp
      ]);
    }

    // Insert data
    console.log(`🚀 Inserting ${rows.length} Azure regions...`);
    if (rows.length > 0) {
      await client.insert({
        table: 'source.azure_regions',
        values: rows.map(([name, display_name, latitude, longitude, ingested_at]) => ({
          name,
          display_name,
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
      query: 'SELECT count() as count FROM source.azure_regions',
      format: 'JSONEachRow'
    });
    const totalData = await totalResult.json<{count: string}>();
    console.log(`📊 Total Azure regions: ${totalData[0].count}\n`);

    console.log('✅ Azure regions ingestion complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

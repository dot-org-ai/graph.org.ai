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
  console.log('\n🌍 Starting AWS Regions Ingestion\n');
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
        CREATE TABLE IF NOT EXISTS source.aws_regions (
          region String,
          service String,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (region, service)
      `
    });
    console.log('✅ Table ready\n');

    // Fetch AWS IP ranges
    console.log('📥 Fetching AWS IP ranges from https://ip-ranges.amazonaws.com/ip-ranges.json...');
    const response = await fetch('https://ip-ranges.amazonaws.com/ip-ranges.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch AWS IP ranges: ${response.statusText}`);
    }

    const data = await response.json() as {
      prefixes?: Array<{ region: string; service: string }>;
      ipv6_prefixes?: Array<{ region: string; service: string }>;
    };

    // Extract unique regions and services
    const regions = new Map<string, Set<string>>();

    // Process IPv4 prefixes
    if (data.prefixes) {
      for (const prefix of data.prefixes) {
        if (prefix.region) {
          if (!regions.has(prefix.region)) {
            regions.set(prefix.region, new Set());
          }
          if (prefix.service) {
            regions.get(prefix.region)!.add(prefix.service);
          }
        }
      }
    }

    // Process IPv6 prefixes
    if (data.ipv6_prefixes) {
      for (const prefix of data.ipv6_prefixes) {
        if (prefix.region) {
          if (!regions.has(prefix.region)) {
            regions.set(prefix.region, new Set());
          }
          if (prefix.service) {
            regions.get(prefix.region)!.add(prefix.service);
          }
        }
      }
    }

    console.log(`✅ Found ${regions.size} unique AWS regions\n`);

    // Prepare data for insertion
    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    let totalRows = 0;
    const rows: Array<[string, string, string]> = [];

    for (const [region, services] of regions.entries()) {
      for (const service of services) {
        rows.push([region, service, batchTimestamp]);
        totalRows++;
      }
    }

    // Insert data
    console.log(`🚀 Inserting ${totalRows} region-service combinations...`);
    if (rows.length > 0) {
      await client.insert({
        table: 'source.aws_regions',
        values: rows.map(([region, service, ingested_at]) => ({
          region,
          service,
          ingested_at
        })),
        format: 'JSONEachRow'
      });
    }

    console.log('✅ Data inserted successfully!\n');

    // Check counts
    const totalResult = await client.query({
      query: 'SELECT count() as count FROM source.aws_regions',
      format: 'JSONEachRow'
    });
    const totalData = await totalResult.json<{count: string}>();
    console.log(`📊 Total rows: ${totalData[0].count}`);

    const regionResult = await client.query({
      query: 'SELECT COUNT(DISTINCT region) as count FROM source.aws_regions',
      format: 'JSONEachRow'
    });
    const regionData = await regionResult.json<{count: string}>();
    console.log(`📊 Unique regions: ${regionData[0].count}`);

    const serviceResult = await client.query({
      query: 'SELECT COUNT(DISTINCT service) as count FROM source.aws_regions',
      format: 'JSONEachRow'
    });
    const serviceData = await serviceResult.json<{count: string}>();
    console.log(`📊 Unique services: ${serviceData[0].count}\n`);

    console.log('✅ AWS regions ingestion complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

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
  console.log('\n🌐 Starting ASN (Autonomous System Number) Ingestion from RIPE NCC\n');
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
        DROP TABLE IF EXISTS source.asn
      `
    });
    await client.exec({
      query: `
        CREATE TABLE source.asn (
          asn UInt32,
          country_code String,
          organization String,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY asn
      `
    });
    console.log('✅ Table ready\n');

    // Get current timestamp for batch identifier
    const batchTime = new Date();
    const batchTimestamp = batchTime.toISOString().replace('T', ' ').substring(0, 19);

    // Submit the streaming query
    console.log('🚀 Submitting streaming query...');
    console.log(`   Source: RIPE NCC ASN Database`);
    console.log(`   Batch: ${batchTimestamp}`);
    console.log('   URL: https://ftp.ripe.net/ripe/asnames/asn.txt');
    console.log('   Format: Tab-separated (ASN, Country Code, Organization)\n');

    await client.exec({
      query: `
        INSERT INTO source.asn (asn, country_code, organization, ingested_at)
        WITH parsed AS (
          SELECT
            toUInt32(arrayElement(splitByString(' ', line), 1)) as asn_num,
            trim(arrayElement(splitByString(', ', line), 2)) as country,
            trim(substring(line, position(line, ' ') + 1, position(line, ',') - position(line, ' ') - 1)) as org
          FROM url(
            'https://ftp.ripe.net/ripe/asnames/asn.txt',
            LineAsString
          )
          WHERE length(line) > 0
            AND line NOT LIKE '#%'
            AND position(line, ',') > 0
            AND match(line, '^[0-9]')
        )
        SELECT
          asn_num,
          country,
          org,
          parseDateTimeBestEffort('${batchTimestamp}') as ingested_at
        FROM parsed
        WHERE asn_num >= 0
      `
    });

    console.log('✅ Query submitted successfully!\n');

    // Check count
    const result = await client.query({
      query: 'SELECT count() as count FROM source.asn',
      format: 'JSONEachRow'
    });
    const data = await result.json<{count: string}>();
    console.log(`📊 Total ASNs ingested: ${data[0].count}\n`);

    // Show some examples
    const examples = await client.query({
      query: `
        SELECT asn, country_code, organization
        FROM source.asn
        WHERE asn <= 30
        ORDER BY asn
        LIMIT 15
      `,
      format: 'JSONEachRow'
    });
    const exampleData = await examples.json<{asn: number, country_code: string, organization: string}>();
    console.log('📝 Sample ASN records:');
    console.log('   ASN     | Country | Organization');
    console.log('   --------|---------|------------------------------------------');
    exampleData.forEach(row => {
      const asnStr = String(row.asn).padEnd(7);
      const countryStr = row.country_code.padEnd(7);
      console.log(`   ${asnStr} | ${countryStr} | ${row.organization}`);
    });

    // Show statistics
    const stats = await client.query({
      query: `
        SELECT
          uniq(country_code) as unique_countries,
          min(asn) as min_asn,
          max(asn) as max_asn
        FROM source.asn
      `,
      format: 'JSONEachRow'
    });
    const statsData = await stats.json<{unique_countries: number, min_asn: number, max_asn: number}>();
    console.log('\n📊 Statistics:');
    console.log(`   Unique countries: ${statsData[0].unique_countries}`);
    console.log(`   ASN range: ${statsData[0].min_asn} - ${statsData[0].max_asn}`);

    console.log('\n✅ ASN ingestion complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

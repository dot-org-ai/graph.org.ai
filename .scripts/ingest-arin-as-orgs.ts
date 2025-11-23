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
  console.log('\n🌐 Starting ARIN AS Organizations Ingestion\n');
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
        CREATE TABLE IF NOT EXISTS source.arin_as_orgs (
          asn UInt32,
          org_handle String,
          org_name String,
          street_address String,
          city String,
          state_province String,
          postal_code String,
          country_code String,
          registration_date DateTime,
          last_updated DateTime,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (country_code, asn, org_handle)
      `
    });
    console.log('✅ Table ready\n');

    // Note: ARIN bulk WHOIS requires registration and access
    console.log('📝 ARIN Bulk WHOIS Access Information:\n');
    console.log('   ARIN provides bulk WHOIS data for AS organizations through their');
    console.log('   Bulk WHOIS service: https://www.arin.net/reference/research/bulkwhois/\n');

    console.log('   Registration Steps:');
    console.log('   1. Create an ARIN Online account at https://account.arin.net/');
    console.log('   2. Request Bulk WHOIS access (free for non-commercial research)');
    console.log('   3. Download the daily snapshots via FTP or HTTPS\n');

    console.log('   Data Format:');
    console.log('   - ARIN provides data in RPSL format (whoisrr files)');
    console.log('   - Daily snapshots contain ~200MB compressed, ~2GB uncompressed');
    console.log('   - Includes ASN, organization details, contact information, IP blocks\n');

    console.log('   Alternative: Use WHOIS API for real-time lookups');
    console.log('   - RESTful API: https://www.arin.net/resources/registry/whois/rws/api/');
    console.log('   - Rate limits apply for automated queries');
    console.log('   - No API key required for reasonable use\n');

    // For demonstration, we'll show how to query the WHOIS API for a single ASN
    console.log('🔍 Example: Querying WHOIS API for AS7922 (Comcast)...\n');

    try {
      const response = await fetch('https://whois.arin.net/rest/asn/AS7922', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'graph.org.ai nate@nathanclevenger.com'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Sample WHOIS response received:');
        console.log(JSON.stringify(data, null, 2));
        console.log('\n');

        // Insert sample data
        if (data.asn) {
          const sampleRecord = {
            asn: parseInt(data.asn.handle.replace('AS', '')),
            org_handle: data.asn.orgRef?.handle || '',
            org_name: data.asn.orgRef?.name || data.asn.name || '',
            street_address: '',
            city: '',
            state_province: '',
            postal_code: '',
            country_code: '',
            registration_date: data.asn.registrationDate || '1970-01-01 00:00:00',
            last_updated: data.asn.updateDate || new Date().toISOString().replace('T', ' ').substring(0, 19)
          };

          await client.insert({
            table: 'source.arin_as_orgs',
            values: [sampleRecord],
            format: 'JSONEachRow'
          });

          console.log('✅ Inserted sample record for AS7922\n');
        }
      }
    } catch (apiError) {
      console.log('⚠️  API query failed (this is expected in some environments)');
      console.log(`   ${apiError instanceof Error ? apiError.message : apiError}\n`);
    }

    // Check count
    const result = await client.query({
      query: 'SELECT count() as count FROM source.arin_as_orgs',
      format: 'JSONEachRow'
    });
    const countData = await result.json<{count: string}>();
    console.log(`📊 Total AS organizations in database: ${countData[0].count}\n`);

    if (parseInt(countData[0].count) > 0) {
      // Show examples
      const examples = await client.query({
        query: 'SELECT asn, org_name, country_code FROM source.arin_as_orgs LIMIT 10',
        format: 'JSONEachRow'
      });
      const exampleData = await examples.json<{asn: number, org_name: string, country_code: string}>();
      console.log('📝 Example AS organizations:');
      exampleData.forEach(row => {
        console.log(`   AS${row.asn}: ${row.org_name} (${row.country_code})`);
      });
      console.log('');
    }

    console.log('✅ ARIN AS organizations ingestion script ready!\n');
    console.log('💡 Next Steps:');
    console.log('   1. Register for ARIN Bulk WHOIS access');
    console.log('   2. Download daily snapshots');
    console.log('   3. Parse RPSL format and batch insert into ClickHouse');
    console.log('   4. Set up daily updates via cron or GitHub Actions\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

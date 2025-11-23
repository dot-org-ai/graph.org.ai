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
  try {
    console.log('\n=== Cloud Regions Verification ===\n');

    // AWS Regions
    const awsResult = await client.query({
      query: `
        SELECT
          'AWS' as cloud_provider,
          count() as total_rows,
          uniqExact(region) as unique_regions,
          uniqExact(service) as unique_services,
          max(ingested_at) as last_ingested
        FROM source.aws_regions
      `,
      format: 'JSONEachRow'
    });
    const awsData = await awsResult.json() as Array<{cloud_provider: string; total_rows: string; unique_regions: string; unique_services: string; last_ingested: string}>;
    console.log('AWS Regions:');
    console.log(JSON.stringify(awsData[0], null, 2));

    // GCP Regions
    const gcpResult = await client.query({
      query: `
        SELECT
          'GCP' as cloud_provider,
          count() as total_rows,
          uniqExact(region) as unique_regions,
          max(ingested_at) as last_ingested
        FROM source.gcp_regions
      `,
      format: 'JSONEachRow'
    });
    const gcpData = await gcpResult.json() as Array<{cloud_provider: string; total_rows: string; unique_regions: string; last_ingested: string}>;
    console.log('\nGCP Regions:');
    console.log(JSON.stringify(gcpData[0], null, 2));

    // Azure Regions
    const azureResult = await client.query({
      query: `
        SELECT
          'Azure' as cloud_provider,
          count() as total_rows,
          uniqExact(name) as unique_regions,
          max(ingested_at) as last_ingested
        FROM source.azure_regions
      `,
      format: 'JSONEachRow'
    });
    const azureData = await azureResult.json() as Array<{cloud_provider: string; total_rows: string; unique_regions: string; last_ingested: string}>;
    console.log('\nAzure Regions:');
    console.log(JSON.stringify(azureData[0], null, 2));

    // Show sample AWS regions
    const awsSampleResult = await client.query({
      query: `SELECT DISTINCT region FROM source.aws_regions ORDER BY region LIMIT 5`,
      format: 'JSONEachRow'
    });
    const awsSample = await awsSampleResult.json() as Array<{region: string}>;
    console.log('\nSample AWS regions:');
    for (const row of awsSample) {
      console.log(`  - ${row.region}`);
    }

    // Show sample GCP regions
    const gcpSampleResult = await client.query({
      query: `SELECT region, location FROM source.gcp_regions ORDER BY region LIMIT 5`,
      format: 'JSONEachRow'
    });
    const gcpSample = await gcpSampleResult.json() as Array<{region: string; location: string}>;
    console.log('\nSample GCP regions:');
    for (const row of gcpSample) {
      console.log(`  - ${row.region}: ${row.location}`);
    }

    console.log('\n=== Verification Complete ===\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();

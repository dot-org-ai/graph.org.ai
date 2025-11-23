#!/usr/bin/env tsx

/**
 * Universal Data Ingestion to public.sources
 *
 * All data sources use ClickHouse url() function to stream directly into public.sources
 * Schema: (source String, data String, batch DateTime, ingested DateTime DEFAULT now())
 *
 * Then separate transform scripts convert sources → things + relationships
 */

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

// Data source definitions - all use url() for direct streaming
const DATA_SOURCES = [
  {
    name: 'tlds',
    url: 'https://data.iana.org/TLD/tlds-alpha-by-domain.txt',
    format: 'LineAsString',
    query: (batch: string) => `
      INSERT INTO public.sources (source, data, batch)
      SELECT
        'tlds' as source,
        lower(line) as data,
        parseDateTimeBestEffort('${batch}') as batch
      FROM url('https://data.iana.org/TLD/tlds-alpha-by-domain.txt', LineAsString)
      WHERE length(line) > 0 AND line NOT LIKE '#%'
    `
  },
  {
    name: 'currencies',
    url: 'https://raw.githubusercontent.com/datasets/currency-codes/master/data/codes-all.csv',
    format: 'CSV',
    query: (batch: string) => `
      INSERT INTO public.sources (source, data, batch)
      SELECT
        'currencies' as source,
        JSONExtractRaw(toJSONString(map(
          'code', toString(AlphabeticCode),
          'number', toString(NumericCode),
          'decimal', toString(MinorUnit),
          'currency', toString(Currency)
        ))) as data,
        parseDateTimeBestEffort('${batch}') as batch
      FROM url('https://raw.githubusercontent.com/datasets/currency-codes/master/data/codes-all.csv', CSV)
      WHERE length(AlphabeticCode) > 0
    `
  },
  {
    name: 'airports',
    url: 'https://davidmegginson.github.io/ourairports-data/airports.csv',
    format: 'CSVWithNames',
    query: (batch: string) => `
      INSERT INTO public.sources (source, data, batch)
      SELECT
        'airports' as source,
        concat(
          id, '|', ident, '|', type, '|', name, '|', latitude_deg, '|', longitude_deg, '|',
          elevation_ft, '|', continent, '|', iso_country, '|', iso_region, '|', municipality,
          '|', gps_code, '|', iata_code, '|', local_code
        ) as data,
        parseDateTimeBestEffort('${batch}') as batch
      FROM url('https://davidmegginson.github.io/ourairports-data/airports.csv', CSVWithNames)
    `
  },
  {
    name: 'stock_exchanges',
    url: 'https://raw.githubusercontent.com/datasets/exchange-codes/master/data/exchange-codes.csv',
    format: 'CSVWithNames',
    query: (batch: string) => `
      INSERT INTO public.sources (source, data, batch)
      SELECT
        'stock_exchanges' as source,
        concat(MIC, '|', toString(Operating), '|', toString(Name), '|', toString(Acronym), '|', toString(City), '|', toString(Country), '|', toString(Website)) as data,
        parseDateTimeBestEffort('${batch}') as batch
      FROM url('https://raw.githubusercontent.com/datasets/exchange-codes/master/data/exchange-codes.csv', CSVWithNames)
    `
  },
  {
    name: 'asn',
    url: 'https://ftp.ripe.net/ripe/asnames/asn.txt',
    format: 'LineAsString',
    query: (batch: string) => `
      INSERT INTO public.sources (source, data, batch)
      SELECT
        'asn' as source,
        line as data,
        parseDateTimeBestEffort('${batch}') as batch
      FROM url('https://ftp.ripe.net/ripe/asnames/asn.txt', LineAsString)
      WHERE length(line) > 0 AND line NOT LIKE '#%'
    `
  },
  {
    name: 'aws_regions',
    url: 'https://ip-ranges.amazonaws.com/ip-ranges.json',
    format: 'JSONAsString',
    query: (batch: string) => `
      INSERT INTO public.sources (source, data, batch)
      SELECT
        'aws_regions' as source,
        json as data,
        parseDateTimeBestEffort('${batch}') as batch
      FROM url('https://ip-ranges.amazonaws.com/ip-ranges.json', JSONAsString)
    `
  },
  {
    name: 'gcp_regions',
    url: 'https://www.gstatic.com/ipranges/cloud.json',
    format: 'JSONAsString',
    query: (batch: string) => `
      INSERT INTO public.sources (source, data, batch)
      SELECT
        'gcp_regions' as source,
        json as data,
        parseDateTimeBestEffort('${batch}') as batch
      FROM url('https://www.gstatic.com/ipranges/cloud.json', JSONAsString)
    `
  },
  {
    name: 'sec_companies',
    url: 'https://www.sec.gov/files/company_tickers.json',
    format: 'JSONAsString',
    query: (batch: string) => `
      INSERT INTO public.sources (source, data, batch)
      SELECT
        'sec_companies' as source,
        json as data,
        parseDateTimeBestEffort('${batch}') as batch
      FROM url('https://www.sec.gov/files/company_tickers.json', JSONAsString)
    `
  },
  {
    name: 'country_codes',
    url: 'https://raw.githubusercontent.com/datasets/country-codes/master/data/country-codes.csv',
    format: 'CSVWithNames',
    query: (batch: string) => `
      INSERT INTO public.sources (source, data, batch)
      SELECT
        'country_codes' as source,
        concat(
          toString(official_name_en), '|', toString(ISO3166-1-Alpha-2), '|',
          toString(ISO3166-1-Alpha-3), '|', toString(ISO3166-1-numeric)
        ) as data,
        parseDateTimeBestEffort('${batch}') as batch
      FROM url('https://raw.githubusercontent.com/datasets/country-codes/master/data/country-codes.csv', CSVWithNames)
    `
  },
  {
    name: 'language_codes',
    url: 'https://raw.githubusercontent.com/datasets/language-codes/master/data/language-codes.csv',
    format: 'CSVWithNames',
    query: (batch: string) => `
      INSERT INTO public.sources (source, data, batch)
      SELECT
        'language_codes' as source,
        concat(toString(alpha3-b), '|', toString(alpha2), '|', toString(English)) as data,
        parseDateTimeBestEffort('${batch}') as batch
      FROM url('https://raw.githubusercontent.com/datasets/language-codes/master/data/language-codes.csv', CSVWithNames)
      WHERE length(toString(alpha2)) > 0
    `
  }
];

async function ingestSource(source: typeof DATA_SOURCES[0]) {
  const batch = new Date().toISOString().replace('T', ' ').substring(0, 19);

  console.log(`\n📥 Ingesting: ${source.name}`);
  console.log(`   URL: ${source.url}`);
  console.log(`   Format: ${source.format}`);
  console.log(`   Batch: ${batch}\n`);

  try {
    await client.exec({
      query: source.query(batch)
    });
    console.log(`✅ ${source.name} ingested successfully\n`);
  } catch (error) {
    console.error(`❌ Error ingesting ${source.name}:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

async function main() {
  console.log('\n🌍 Universal Data Ingestion to public.sources\n');
  console.log(`📡 Server: ${process.env.CLICKHOUSE_URL}\n`);

  try {
    // Test connection
    console.log('🔍 Testing connection...');
    const ping = await client.ping();
    if (!ping.success) {
      throw new Error('Connection failed');
    }
    console.log('✅ Connected\n');

    // Check if sources table exists
    console.log('📋 Checking schema...');
    const tables = await client.query({
      query: 'SHOW TABLES FROM public',
      format: 'JSONEachRow',
    });
    const tableList = await tables.json<any>();
    const hasSources = tableList.some((t: any) => t.name === 'sources');

    if (!hasSources) {
      console.log('📋 Creating public.sources table...');
      await client.exec({
        query: `
          CREATE TABLE IF NOT EXISTS public.sources (
            source String,
            data String,
            batch DateTime,
            ingested DateTime DEFAULT now()
          ) ENGINE = MergeTree()
          ORDER BY (source, batch, ingested)
        `
      });
      console.log('✅ Table created\n');
    } else {
      console.log('✅ Schema ready\n');
    }

    // Ingest all sources
    const sourceNames = process.argv.slice(2);
    const sourcesToIngest = sourceNames.length > 0
      ? DATA_SOURCES.filter(s => sourceNames.includes(s.name))
      : DATA_SOURCES;

    console.log(`🚀 Ingesting ${sourcesToIngest.length} data sources...\n`);

    for (const source of sourcesToIngest) {
      await ingestSource(source);
    }

    // Show summary
    console.log('\n📊 Ingestion Summary:\n');
    const counts = await client.query({
      query: `
        SELECT
          source,
          count() as count,
          max(batch) as latest_batch
        FROM public.sources
        WHERE source IN (${sourcesToIngest.map(s => `'${s.name}'`).join(',')})
        GROUP BY source
        ORDER BY source
      `,
      format: 'JSONEachRow'
    });

    const countsData = await counts.json<{source: string, count: string, latest_batch: string}>();
    countsData.forEach(row => {
      console.log(`   ${row.source.padEnd(20)} ${String(row.count).padStart(10)} records (${row.latest_batch})`);
    });

    console.log('\n✅ All sources ingested successfully!\n');
    console.log('📝 Next step: Transform sources → things + relationships\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

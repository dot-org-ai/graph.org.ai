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

// Popular World Bank indicators to ingest
const INDICATORS = [
  { code: 'NY.GDP.MKTP.CD', name: 'GDP (current US$)' },
  { code: 'NY.GDP.PCAP.CD', name: 'GDP per capita (current US$)' },
  { code: 'SP.POP.TOTL', name: 'Population, total' },
  { code: 'SP.POP.GROW', name: 'Population growth (annual %)' },
  { code: 'SP.URB.TOTL.IN.ZS', name: 'Urban population (% of total population)' },
  { code: 'SP.DYN.LE00.IN', name: 'Life expectancy at birth, total (years)' },
  { code: 'SE.ADT.LITR.ZS', name: 'Literacy rate, adult total (% of people ages 15 and above)' },
  { code: 'SI.POV.DDAY', name: 'Poverty headcount ratio at $2.15 a day (2017 PPP) (% of population)' },
  { code: 'FP.CPI.TOTL.ZG', name: 'Inflation, consumer prices (annual %)' },
  { code: 'SL.UEM.TOTL.ZS', name: 'Unemployment, total (% of total labor force)' },
  { code: 'EG.ELC.ACCS.ZS', name: 'Access to electricity (% of population)' },
  { code: 'IT.NET.USER.ZS', name: 'Individuals using the Internet (% of population)' },
  { code: 'NE.TRD.GNFS.ZS', name: 'Trade (% of GDP)' },
  { code: 'GC.DOD.TOTL.GD.ZS', name: 'Central government debt, total (% of GDP)' },
  { code: 'EN.ATM.CO2E.PC', name: 'CO2 emissions (metric tons per capita)' }
];

interface WorldBankDataPoint {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
  decimal: number;
}

async function main() {
  console.log('\n🌍 Starting World Bank Indicators Ingestion\n');
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
        CREATE TABLE IF NOT EXISTS source.worldbank_indicators (
          indicator_code String,
          indicator_name String,
          country_code String,
          country_name String,
          year UInt16,
          value Float64,
          ingested_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (indicator_code, country_code, year)
      `
    });
    console.log('✅ Table ready\n');

    console.log(`📥 Ingesting ${INDICATORS.length} indicators across all countries...\n`);

    let totalRecords = 0;
    let totalIndicators = 0;

    for (const indicator of INDICATORS) {
      console.log(`\n📊 Fetching: ${indicator.name}`);
      console.log(`   Code: ${indicator.code}`);

      try {
        // World Bank API: https://api.worldbank.org/v2/country/all/indicator/{INDICATOR}?format=json&per_page=20000
        const url = `https://api.worldbank.org/v2/country/all/indicator/${indicator.code}?format=json&per_page=20000`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'graph.org.ai nate@nathanclevenger.com'
          }
        });

        if (!response.ok) {
          console.log(`   ⚠️  HTTP ${response.status}: ${response.statusText}`);
          continue;
        }

        const data = await response.json();

        // World Bank API returns [metadata, data]
        if (!Array.isArray(data) || data.length < 2) {
          console.log('   ⚠️  Unexpected response format');
          continue;
        }

        const records = data[1] as WorldBankDataPoint[];

        if (!records || records.length === 0) {
          console.log('   ⚠️  No data available');
          continue;
        }

        // Filter out null values and format for ClickHouse
        const validRecords = records
          .filter(r => r.value !== null && r.value !== undefined)
          .map(r => ({
            indicator_code: indicator.code,
            indicator_name: indicator.name,
            country_code: r.countryiso3code || r.country.id,
            country_name: r.country.value,
            year: parseInt(r.date),
            value: r.value as number
          }));

        if (validRecords.length === 0) {
          console.log('   ⚠️  No valid data points');
          continue;
        }

        // Insert in batches of 5000
        const BATCH_SIZE = 5000;
        for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
          const batch = validRecords.slice(i, i + BATCH_SIZE);
          await client.insert({
            table: 'source.worldbank_indicators',
            values: batch,
            format: 'JSONEachRow'
          });
        }

        totalRecords += validRecords.length;
        totalIndicators++;

        console.log(`   ✅ Inserted ${validRecords.length} data points`);

      } catch (error) {
        console.log(`   ❌ Error: ${error instanceof Error ? error.message : error}`);
      }

      // Be nice to the API - add a small delay
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n📊 Ingestion Summary:`);
    console.log(`   Indicators processed: ${totalIndicators}/${INDICATORS.length}`);
    console.log(`   Total data points: ${totalRecords}\n`);

    // Check count
    const result = await client.query({
      query: 'SELECT count() as count FROM source.worldbank_indicators',
      format: 'JSONEachRow'
    });
    const countData = await result.json<{count: string}>();
    console.log(`📊 Total records in database: ${countData[0].count}\n`);

    // Show breakdown by indicator
    const breakdown = await client.query({
      query: `
        SELECT
          indicator_name,
          count() as records,
          min(year) as earliest_year,
          max(year) as latest_year
        FROM source.worldbank_indicators
        GROUP BY indicator_name
        ORDER BY records DESC
        LIMIT 10
      `,
      format: 'JSONEachRow'
    });
    const breakdownData = await breakdown.json<{indicator_name: string, records: string, earliest_year: number, latest_year: number}>();

    console.log('📝 Top indicators by record count:');
    breakdownData.forEach(row => {
      console.log(`   ${row.indicator_name}`);
      console.log(`      Records: ${row.records}, Years: ${row.earliest_year}-${row.latest_year}`);
    });

    // Show some examples
    console.log('\n📝 Sample data:');
    const examples = await client.query({
      query: `
        SELECT
          indicator_name,
          country_name,
          year,
          value
        FROM source.worldbank_indicators
        WHERE country_code = 'USA'
          AND year = 2022
        ORDER BY indicator_name
        LIMIT 10
      `,
      format: 'JSONEachRow'
    });
    const exampleData = await examples.json<{indicator_name: string, country_name: string, year: number, value: number}>();

    exampleData.forEach(row => {
      const formattedValue = row.value >= 1000000000
        ? `${(row.value / 1000000000).toFixed(2)}B`
        : row.value >= 1000000
        ? `${(row.value / 1000000).toFixed(2)}M`
        : row.value.toFixed(2);
      console.log(`   ${row.country_name} (${row.year}): ${row.indicator_name} = ${formattedValue}`);
    });

    console.log('\n✅ World Bank indicators ingestion complete!\n');

    console.log('💡 Additional Indicators Available:');
    console.log('   - Education: SE.PRM.ENRR, SE.SEC.ENRR, SE.XPD.TOTL.GD.ZS');
    console.log('   - Health: SH.XPD.CHEX.GD.ZS, SH.MED.BEDS.ZS, SH.H2O.BASW.ZS');
    console.log('   - Infrastructure: IS.ROD.PAVE.ZS, IS.AIR.PSGR, EG.USE.ELEC.KH.PC');
    console.log('   - Economy: NE.EXP.GNFS.ZS, NE.IMP.GNFS.ZS, BX.KLT.DINV.WD.GD.ZS');
    console.log('   - Environment: AG.LND.FRST.ZS, ER.H2O.FWTL.ZS, AG.LND.AGRI.ZS\n');
    console.log('   Full catalog: https://data.worldbank.org/indicator\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

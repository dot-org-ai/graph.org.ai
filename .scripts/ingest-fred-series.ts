#!/usr/bin/env tsx

/**
 * FRED Economic Indicators Ingestion
 *
 * Fetches popular FRED (Federal Reserve Economic Data) economic indicators
 * and stores them in the source.fred_series table
 *
 * Popular Series:
 * - GDPC1: Real GDP
 * - UNRATE: Unemployment Rate
 * - DFF: Fed Funds Rate
 * - DGS10: 10-Year Treasury
 * - CPIAUCSL: CPI
 * - GOLDAMGBD228NLBM: Gold Price
 * - DCOILWTICO: WTI Oil Price
 * - SP500: S&P 500 Index
 *
 * Requires FRED_API_KEY environment variable
 * Get free key at: https://fred.stlouisfed.org/docs/api/api_key.html
 */

import { createClient } from '@clickhouse/client'
import { config } from 'dotenv'

config()

// Initialize ClickHouse client
const clickhouse = createClient({
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  database: process.env.CLICKHOUSE_DATABASE || 'default',
})

const FRED_API_KEY = process.env.FRED_API_KEY
const FRED_API_URL = 'https://api.stlouisfed.org/fred/series/observations'

interface FREDObservation {
  date: string
  value: string
}

interface FREDResponse {
  observations: FREDObservation[]
}

interface FREDRecord {
  series_id: string
  date: string
  value: number
  ingested_at: string
}

const SERIES_IDS = [
  'GDPC1',                  // Real GDP
  'UNRATE',                 // Unemployment Rate
  'DFF',                    // Fed Funds Rate
  'DGS10',                  // 10-Year Treasury
  'CPIAUCSL',               // CPI
  'GOLDAMGBD228NLBM',       // Gold Price
  'DCOILWTICO',             // WTI Oil Price
  'SP500',                  // S&P 500 Index
]

/**
 * Create the source.fred_series table if it doesn't exist
 */
async function createTable(): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS source.fred_series (
      series_id String,
      date Date,
      value Float64,
      ingested_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    ORDER BY (series_id, date)
  `

  try {
    await clickhouse.command({ query })
    console.log('✅ Table source.fred_series ready')
  } catch (error) {
    // Table might already exist, which is fine
    console.log('📋 Table source.fred_series status checked')
  }
}

/**
 * Fetch observations for a single FRED series
 */
async function fetchSeries(seriesId: string): Promise<FREDObservation[]> {
  const url = new URL(FRED_API_URL)
  url.searchParams.set('series_id', seriesId)
  url.searchParams.set('api_key', FRED_API_KEY!)
  url.searchParams.set('file_type', 'json')

  try {
    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`)
    }

    const data = (await response.json()) as FREDResponse

    if (!data.observations || !Array.isArray(data.observations)) {
      console.warn(`  ⚠️  No observations found for ${seriesId}`)
      return []
    }

    return data.observations
  } catch (error) {
    console.error(`  ❌ Error fetching ${seriesId}:`, error)
    return []
  }
}

/**
 * Insert FRED observations into ClickHouse
 */
async function insertObservations(
  seriesId: string,
  observations: FREDObservation[]
): Promise<number> {
  if (observations.length === 0) {
    return 0
  }

  const now = new Date().toISOString()
  const records: FREDRecord[] = observations
    .filter(obs => obs.value !== '.' && obs.value !== '') // Filter out missing values
    .map(obs => ({
      series_id: seriesId,
      date: obs.date,
      value: parseFloat(obs.value),
      ingested_at: now,
    }))

  if (records.length === 0) {
    return 0
  }

  try {
    await clickhouse.insert({
      table: 'source.fred_series',
      values: records,
      format: 'JSONEachRow',
    })
    return records.length
  } catch (error) {
    console.error(`  ❌ Error inserting ${seriesId}:`, error)
    return 0
  }
}

/**
 * Process a single FRED series
 */
async function processSeries(seriesId: string): Promise<number> {
  console.log(`\n📊 Processing ${seriesId}...`)

  // Fetch observations
  const observations = await fetchSeries(seriesId)

  if (observations.length === 0) {
    console.log(`  ⚠️  No data retrieved for ${seriesId}`)
    return 0
  }

  console.log(`  📥 Retrieved ${observations.length} observations`)

  // Insert into database
  const inserted = await insertObservations(seriesId, observations)
  console.log(`  💾 Inserted ${inserted} records`)

  return inserted
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(80))
  console.log('FRED Economic Indicators Ingestion')
  console.log('='.repeat(80))

  // Check for API key
  if (!FRED_API_KEY) {
    console.error('\n❌ Missing FRED_API_KEY environment variable')
    console.log('\n📝 Instructions to get your API key:')
    console.log('   1. Visit https://fred.stlouisfed.org/docs/api/api_key.html')
    console.log('   2. Sign up for a free account')
    console.log('   3. Create an API key')
    console.log('   4. Set the FRED_API_KEY environment variable:')
    console.log('      export FRED_API_KEY="your-api-key-here"')
    console.log('\n   Then run this script again.')
    process.exit(1)
  }

  console.log('\n✅ FRED_API_KEY found in environment')

  // Create table if needed
  await createTable()

  // Process all series
  let totalInserted = 0
  const results: Map<string, number> = new Map()

  for (const seriesId of SERIES_IDS) {
    const inserted = await processSeries(seriesId)
    results.set(seriesId, inserted)
    totalInserted += inserted
  }

  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('📈 Ingestion Summary')
  console.log('='.repeat(80))

  for (const [seriesId, count] of results) {
    const status = count > 0 ? '✅' : '⚠️'
    console.log(`${status} ${seriesId.padEnd(20)}: ${count.toString().padStart(6)} records`)
  }

  console.log('-'.repeat(80))
  console.log(`📊 Total records ingested: ${totalInserted}`)
  console.log('='.repeat(80))

  await clickhouse.close()
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

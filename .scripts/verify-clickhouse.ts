#!/usr/bin/env tsx

/**
 * Verify ClickHouse data
 */

import { getClickHouseClient, closeClickHouseClient } from '../.mdxdb/clickhouse-client.js'

async function verify() {
  console.log('🔍 Verifying ClickHouse data...\n')

  const client = getClickHouseClient()

  try {
    // Count things
    const thingsResult = await client.query({
      query: 'SELECT count() as count FROM mdxdb.things',
      format: 'JSONEachRow',
    })
    const thingsData = await thingsResult.json()
    console.log(`📊 Total things: ${thingsData[0].count.toLocaleString()}`)

    // Count relationships
    const relsResult = await client.query({
      query: 'SELECT count() as count FROM mdxdb.relationships',
      format: 'JSONEachRow',
    })
    const relsData = await relsResult.json()
    console.log(`🔗 Total relationships: ${relsData[0].count.toLocaleString()}`)

    // Count by namespace
    const nsResult = await client.query({
      query: `
        SELECT
          ns,
          count() as count
        FROM mdxdb.things
        GROUP BY ns
        ORDER BY count DESC
      `,
      format: 'JSONEachRow',
    })
    const nsData = await nsResult.json()
    console.log('\n📦 Things by namespace:')
    for (const row of nsData) {
      console.log(`  ${row.ns}: ${row.count.toLocaleString()}`)
    }

    // Sample a few things
    const sampleResult = await client.query({
      query: `
        SELECT url, ns, type, id
        FROM mdxdb.things
        LIMIT 5
      `,
      format: 'JSONEachRow',
    })
    const sampleData = await sampleResult.json()
    console.log('\n🔎 Sample things:')
    for (const row of sampleData) {
      console.log(`  ${row.url}`)
      console.log(`    ns: ${row.ns}, type: ${row.type}, id: ${row.id}`)
    }

    console.log('\n✅ ClickHouse verification complete!')

  } catch (error) {
    console.error('❌ Error verifying ClickHouse:', error)
    throw error
  } finally {
    await closeClickHouseClient()
  }
}

verify()

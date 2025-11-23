#!/usr/bin/env tsx
/**
 * Test ClickHouse queries directly
 */

import { getClickHouseClient } from '../.mdxdb/clickhouse-client'

async function testQuery() {
  const client = getClickHouseClient()

  console.log('Testing ClickHouse connection...\n')

  // Test 1: Check if things table exists
  try {
    const tablesResult = await client.query({
      query: 'SHOW TABLES',
      format: 'JSONEachRow',
    })
    const tables = await tablesResult.json()
    console.log('✓ Tables in database:', tables)
  } catch (error) {
    console.error('❌ Error querying tables:', error)
  }

  // Test 2: Count all things
  try {
    const countResult = await client.query({
      query: 'SELECT count(*) as cnt FROM things',
      format: 'JSONEachRow',
    })
    const count = await countResult.json()
    console.log('\n✓ Total things count:', count)
  } catch (error) {
    console.error('❌ Error counting things:', error)
  }

  // Test 3: Query by namespace
  try {
    const nsResult = await client.query({
      query: `SELECT ns, type, count(*) as cnt FROM things GROUP BY ns, type ORDER BY ns, type`,
      format: 'JSONEachRow',
    })
    const nsCounts = await nsResult.json()
    console.log('\n✓ Things by namespace and type:', nsCounts)
  } catch (error) {
    console.error('❌ Error querying namespaces:', error)
  }

  // Test 4: Try to find language data specifically
  try {
    const langResult = await client.query({
      query: `SELECT * FROM things WHERE ns = 'language' LIMIT 5`,
      format: 'JSONEachRow',
    })
    const langData = await langResult.json()
    console.log('\n✓ Sample language data:', langData)
  } catch (error) {
    console.error('❌ Error querying language data:', error)
  }
}

testQuery().catch(console.error)

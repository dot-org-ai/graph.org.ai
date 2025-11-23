#!/usr/bin/env tsx
/**
 * Check occupation data structure in ClickHouse
 */

import { getClickHouseClient } from '../.mdxdb/clickhouse-client'

async function checkOccupationData() {
  const client = getClickHouseClient()

  try {
    console.log('Checking occupation data structure...\n')

    const result = await client.query({
      query: `SELECT ns, type, id, data FROM things WHERE ns = 'onet' AND type = 'Occupation' LIMIT 3`,
      format: 'JSONEachRow',
    })

    const data = await result.json() as Array<any>

    if (data.length === 0) {
      console.log('❌ No occupation data found!')
      return
    }

    console.log(`✓ Found ${data.length} occupations\n`)

    for (const row of data) {
      console.log('─'.repeat(80))
      console.log('ns:', row.ns)
      console.log('type:', row.type)
      console.log('id:', row.id)
      console.log('data:', JSON.stringify(row.data, null, 2))
      console.log()
    }
  } catch (error) {
    console.error('Error querying ClickHouse:', error)
  }
}

checkOccupationData()

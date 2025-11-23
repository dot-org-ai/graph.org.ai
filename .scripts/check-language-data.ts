#!/usr/bin/env tsx
/**
 * Check language data in ClickHouse
 */

import { getClickHouseClient } from '../.mdxdb/clickhouse-client'

async function checkLanguageData() {
  const client = getClickHouseClient()

  try {
    console.log('Checking language data in ClickHouse...\n')

    const result = await client.query({
      query: `SELECT ns, type, count(*) as cnt FROM things WHERE ns = 'language' GROUP BY ns, type ORDER BY type`,
      format: 'JSONEachRow',
    })

    const data = await result.json() as Array<{ ns: string; type: string; cnt: string }>

    if (data.length === 0) {
      console.log('❌ No language data found!')
      return
    }

    console.log('✓ Language data in ClickHouse:')
    data.forEach(row => {
      console.log(`  - ${row.type}: ${row.cnt} items`)
    })
    console.log()

    // Get a sample verb
    const verbResult = await client.query({
      query: `SELECT id, name, data FROM things WHERE ns = 'language' AND type = 'Verb' LIMIT 1`,
      format: 'JSONEachRow',
    })

    const verbData = await verbResult.json() as Array<any>
    if (verbData.length > 0) {
      console.log('Sample Verb:')
      console.log('  ID:', verbData[0].id)
      console.log('  Name:', verbData[0].name)
      console.log('  Data:', JSON.stringify(verbData[0].data, null, 2))
    }
  } catch (error) {
    console.error('Error querying ClickHouse:', error)
  }
}

checkLanguageData()

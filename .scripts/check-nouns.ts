#!/usr/bin/env tsx
/**
 * Check for noun data with singular/plural mappings in ClickHouse
 */

import { getClickHouseClient } from '../.mdxdb/clickhouse-client'

async function checkNouns() {
  const client = getClickHouseClient()

  try {
    console.log('Checking for noun/concept data...\n')

    // Check all types in the database
    const typesResult = await client.query({
      query: `SELECT DISTINCT type FROM things ORDER BY type`,
      format: 'JSONEachRow',
    })

    const types = await typesResult.json() as Array<{ type: string }>
    console.log('All types in database:')
    types.forEach(t => console.log(`  - ${t.type}`))
    console.log()

    // Check for any noun-related data
    const nounResult = await client.query({
      query: `SELECT ns, type, id, data FROM things WHERE id LIKE '%Noun%' OR id LIKE '%noun%' OR type = 'Concept' LIMIT 10`,
      format: 'JSONEachRow',
    })

    const nouns = await nounResult.json() as Array<any>

    if (nouns.length > 0) {
      console.log(`Found ${nouns.length} noun/concept entries:`)
      for (const noun of nouns) {
        console.log('─'.repeat(80))
        console.log('ns:', noun.ns)
        console.log('type:', noun.type)
        console.log('id:', noun.id)
        console.log('data:', JSON.stringify(noun.data, null, 2))
        console.log()
      }
    } else {
      console.log('❌ No noun data found in database')
    }
  } catch (error) {
    console.error('Error querying ClickHouse:', error)
  }
}

checkNouns()

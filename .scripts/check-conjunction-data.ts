#!/usr/bin/env tsx
import { getClickHouseClient } from '../.mdxdb/clickhouse-client'

async function checkConjunctions() {
  const client = getClickHouseClient()

  const result = await client.query({
    query: `SELECT id, name, type, data FROM things WHERE type = 'Conjunction' LIMIT 5`,
    format: 'JSONEachRow',
  })

  const data = await result.json()
  console.log('Sample Conjunction data:')
  console.log(JSON.stringify(data, null, 2))
}

checkConjunctions().catch(console.error)

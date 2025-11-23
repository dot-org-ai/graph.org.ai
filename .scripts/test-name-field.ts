#!/usr/bin/env tsx
import { getClickHouseClient } from '../.mdxdb/clickhouse-client'

async function testName() {
  const client = getClickHouseClient()

  const result = await client.query({
    query: `SELECT id, name, type FROM things WHERE type = 'Conjunction' LIMIT 5`,
    format: 'JSONEachRow',
  })

  const data = await result.json()
  console.log('Conjunction data with name field:')
  console.log(JSON.stringify(data, null, 2))

  await client.close()
}

testName().catch(console.error)

#!/usr/bin/env tsx
import { getClickHouseClient } from '../.mdxdb/clickhouse-client'

async function checkSchema() {
  const client = getClickHouseClient()

  const result = await client.query({
    query: 'DESCRIBE TABLE things',
    format: 'JSONEachRow',
  })

  const data = await result.json()
  console.log('ClickHouse things table schema:')
  console.log(JSON.stringify(data, null, 2))
}

checkSchema().catch(console.error)

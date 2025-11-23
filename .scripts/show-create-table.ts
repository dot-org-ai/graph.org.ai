#!/usr/bin/env tsx
import { getClickHouseClient } from '../.mdxdb/clickhouse-client'

async function showCreate() {
  const client = getClickHouseClient()

  const result = await client.query({
    query: 'SHOW CREATE TABLE default.things',
    format: 'JSONEachRow',
  })

  const data = await result.json()
  console.log('CREATE TABLE statement:')
  console.log(data[0].statement)

  await client.close()
}

showCreate().catch(console.error)

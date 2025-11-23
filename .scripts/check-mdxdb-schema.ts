#!/usr/bin/env tsx
import { getClickHouseClient } from '../.mdxdb/clickhouse-client'

async function checkSchema() {
  const client = getClickHouseClient() // Uses mdxdb database

  console.log('Checking mdxdb.things schema...\n')

  const result = await client.query({
    query: 'DESCRIBE TABLE things',
    format: 'JSONEachRow',
  })

  const data = await result.json()
  console.log('mdxdb.things table schema:')
  console.log(JSON.stringify(data, null, 2))

  // Also show CREATE TABLE
  const createResult = await client.query({
    query: 'SHOW CREATE TABLE things',
    format: 'JSONEachRow',
  })

  const createData = await createResult.json()
  console.log('\nCREATE TABLE statement:')
  console.log(createData[0].statement)

  await client.close()
}

checkSchema().catch(console.error)

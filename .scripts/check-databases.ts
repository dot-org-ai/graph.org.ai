#!/usr/bin/env tsx
import { getClickHouseClient } from '../.mdxdb/clickhouse-client'

async function checkDatabases() {
  const client = getClickHouseClient()

  // Show all databases
  const dbResult = await client.query({
    query: 'SHOW DATABASES',
    format: 'JSONEachRow',
  })
  const databases = await dbResult.json()
  console.log('Databases:', databases)

  // Show all tables in all databases
  const tablesResult = await client.query({
    query: 'SELECT database, name FROM system.tables WHERE database != \'system\' ORDER BY database, name',
    format: 'JSONEachRow',
  })
  const tables = await tablesResult.json()
  console.log('\nTables:', tables)

  await client.close()
}

checkDatabases().catch(console.error)

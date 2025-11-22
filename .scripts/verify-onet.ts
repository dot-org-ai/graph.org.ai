#!/usr/bin/env tsx

import { getClickHouseClient } from '../.mdxdb/clickhouse-client.js'

async function main() {
  const clickhouse = getClickHouseClient()
  console.log('🔍 Checking data in ClickHouse...\n')

  // Check all namespaces
  const nsResult = await clickhouse.query({
    query: `
      SELECT ns, type, COUNT(*) as count
      FROM mdxdb.things
      GROUP BY ns, type
      ORDER BY ns, count DESC
      LIMIT 50
    `,
    format: 'JSONEachRow'
  })

  const nsData = await nsResult.json()
  console.log('Data by namespace and type:')
  console.log(JSON.stringify(nsData, null, 2))

  // Total counts
  const totalResult = await clickhouse.query({
    query: `
      SELECT
        COUNT(*) as total_things,
        COUNT(DISTINCT ns) as namespaces,
        COUNT(DISTINCT type) as types
      FROM mdxdb.things
    `,
    format: 'JSONEachRow'
  })

  const totalData = await totalResult.json()
  console.log(`\n📊 Summary:`)
  console.log(`   Total things: ${totalData[0].total_things}`)
  console.log(`   Namespaces: ${totalData[0].namespaces}`)
  console.log(`   Types: ${totalData[0].types}`)

  // Check relationships
  const relResult = await clickhouse.query({
    query: "SELECT COUNT(*) as total FROM mdxdb.relationships",
    format: 'JSONEachRow'
  })

  const relData = await relResult.json()
  console.log(`   Relationships: ${relData[0].total}`)

  await clickhouse.close()
}

main()

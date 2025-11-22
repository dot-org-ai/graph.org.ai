#!/usr/bin/env tsx

import { getClickHouseClient } from '../.mdxdb/clickhouse-client.js'

async function verify() {
  const client = getClickHouseClient()

  try {
    // Count things
    const thingsResult = await client.query({ query: 'SELECT count() as count FROM default.things' })
    const thingsCount = await thingsResult.json()
    console.log('Total things:', thingsCount.data[0].count)

    // Count by namespace
    const nsResult = await client.query({ query: 'SELECT ns, count() as count FROM default.things GROUP BY ns ORDER BY count DESC' })
    const nsCounts = await nsResult.json()
    console.log('\nThings by namespace:')
    nsCounts.data.forEach((row: any) => console.log('  ' + row.ns + ':', row.count))

    // Sample URLs from each namespace
    const urlsResult = await client.query({ query: 'SELECT ns, url, name, id FROM default.things LIMIT 20' })
    const urls = await urlsResult.json()
    console.log('\nSample URLs:')
    urls.data.forEach((row: any) => console.log('  ' + row.url))

    // Show some complete records
    console.log('\nSample records with all fields:')
    urls.data.slice(0, 3).forEach((row: any) => {
      console.log('  URL:', row.url)
      console.log('  NS:', row.ns)
      console.log('  ID:', row.id)
      console.log('  Name:', row.name)
      console.log()
    })

    await client.close()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

verify()

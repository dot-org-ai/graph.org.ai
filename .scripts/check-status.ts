#!/usr/bin/env tsx

import { createClient } from '@clickhouse/client'
import { config } from 'dotenv'

config()

const clickhouse = createClient({
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  database: 'mdxdb',
})

async function checkStatus() {
  try {
    // Total things with content
    const totalResult = await clickhouse.query({
      query: 'SELECT count() as total FROM things WHERE length(content) > 0',
      format: 'JSONEachRow'
    })
    const totalData = await totalResult.json<Array<{ total: string }>>()
    const total = parseInt(totalData[0]?.total || '0')

    // Total embeddings created
    const embeddedResult = await clickhouse.query({
      query: 'SELECT count() as embedded FROM searches',
      format: 'JSONEachRow'
    })
    const embeddedData = await embeddedResult.json<Array<{ embedded: string }>>()
    const embedded = parseInt(embeddedData[0]?.embedded || '0')

    // Things still needing embeddings
    const needResult = await clickhouse.query({
      query: 'SELECT count() as need FROM things WHERE url NOT IN (SELECT url FROM searches) AND length(content) > 0',
      format: 'JSONEachRow'
    })
    const needData = await needResult.json<Array<{ need: string }>>()
    const need = parseInt(needData[0]?.need || '0')

    console.log('================================================================================')
    console.log('Batch Embeddings Status')
    console.log('================================================================================')
    console.log(`Total things with content:    ${total.toLocaleString()}`)
    console.log(`Embeddings created:            ${embedded.toLocaleString()}`)
    console.log(`Things still needing:          ${need.toLocaleString()}`)
    console.log(`Completion percentage:         ${((embedded / total) * 100).toFixed(2)}%`)
    console.log('================================================================================')
    console.log(`\nBatches submitted:             1,084`)
    console.log(`Items per batch:               5,000`)
    console.log(`Total items queued:            5,420,000`)
    console.log(`Batches completed:             ${Math.floor(embedded / 5000).toLocaleString()}`)
    console.log(`Batches remaining:             ${Math.ceil(need / 5000).toLocaleString()}`)
    console.log('================================================================================')

    await clickhouse.close()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkStatus().catch(console.error)

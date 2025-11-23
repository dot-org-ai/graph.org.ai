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

async function count() {
  const totalQuery = 'SELECT count() as total FROM things WHERE length(content) > 0'
  const needEmbeddingsQuery = 'SELECT count() as need FROM things WHERE url NOT IN (SELECT url FROM searches) AND length(content) > 0'

  const total = await clickhouse.query({ query: totalQuery })
  const need = await clickhouse.query({ query: needEmbeddingsQuery })

  const totalData = await total.json<any[]>()
  const needData = await need.json<any[]>()

  console.log(`Total things with content: ${totalData[0].total}`)
  console.log(`Things needing embeddings: ${needData[0].need}`)
  console.log(`Batches needed (500 each): ${Math.ceil(needData[0].need / 500)}`)

  await clickhouse.close()
}

count().catch(console.error)

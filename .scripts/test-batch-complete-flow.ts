#!/usr/bin/env tsx

/**
 * Test complete batch embeddings flow with a small test
 */

import { createClient } from '@clickhouse/client'
import { config } from 'dotenv'

config()

const clickhouse = createClient({
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  database: process.env.CLICKHOUSE_DATABASE || 'mdxdb',
})

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const BATCH_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-m3`
const MODEL = '@cf/baai/bge-m3'

async function test() {
  console.log('Testing complete batch embeddings flow...\n')

  // Get 3 test items from things table
  const query = `
    SELECT url, name, content, type
    FROM things
    WHERE url NOT IN (SELECT url FROM searches)
      AND length(content) > 0
    LIMIT 3
  `

  const result = await clickhouse.query({ query, format: 'JSONEachRow' })
  const things = await result.json<any[]>()

  console.log(`Got ${things.length} test items`)

  // Prepare texts
  const texts = things.map(t => `${t.name}\n\n${t.content}`.trim())
  const urls = things.map(t => t.url)

  // Submit batch
  console.log('\n1. Submitting batch...')
  const submitResponse = await fetch(`${BATCH_API_URL}?queueRequest=true`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: texts }),
  })

  const submitResult = await submitResponse.json()
  console.log('Submit result:', submitResult.success ? 'SUCCESS' : 'FAILED')

  if (!submitResult.success || !submitResult.result?.request_id) {
    throw new Error('Failed to submit batch')
  }

  const requestId = submitResult.result.request_id
  console.log(`Request ID: ${requestId}`)

  // Poll for results
  console.log('\n2. Polling for results...')
  let attempts = 0
  while (attempts < 120) {
    await new Promise(resolve => setTimeout(resolve, 5000))
    attempts++

    const pollResponse = await fetch(BATCH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ request_id: requestId }),
    })

    const pollResult = await pollResponse.json()

    if (pollResult.success && pollResult.result?.data) {
      console.log(`✅ Complete after ${attempts * 5}s`)
      console.log(`Got ${pollResult.result.data.length} embeddings`)
      console.log(`First embedding has ${pollResult.result.data[0].length} dimensions`)

      // Insert into database
      console.log('\n3. Inserting into database...')
      for (let i = 0; i < urls.length; i++) {
        await clickhouse.insert({
          table: 'searches',
          values: [{
            url: urls[i],
            text: texts[i],
            embedding: pollResult.result.data[i],
            meta: { model: MODEL, createdAt: new Date().toISOString() },
          }],
          format: 'JSONEachRow',
        })
        console.log(`  ✅ Inserted ${urls[i]}`)
      }

      console.log('\n✅ Test complete!')
      break
    }

    if (attempts % 6 === 0) {
      console.log(`  Still polling... (${attempts * 5}s elapsed, status: ${pollResult.result?.status})`)
    }

    if (attempts === 119) {
      throw new Error('Timeout')
    }
  }

  await clickhouse.close()
}

test().catch(console.error)

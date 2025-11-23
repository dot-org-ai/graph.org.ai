#!/usr/bin/env tsx

/**
 * Test simple embedding generation (not batch, just sync)
 */

import { config } from 'dotenv'

config()

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-m3`

async function testSimpleEmbedding() {
  console.log('Testing simple synchronous embedding...\n')

  // Test with text array format (standard embeddings)
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: ["First test item", "Second test item"]
    }),
  })

  const result = await response.json()
  console.log('Response:')
  console.log(JSON.stringify(result, null, 2))

  if (result.result?.data) {
    console.log(`\n✅ Got ${result.result.data.length} embeddings`)
    console.log(`First embedding has ${result.result.data[0].length} dimensions`)
  }
}

testSimpleEmbedding().catch(console.error)

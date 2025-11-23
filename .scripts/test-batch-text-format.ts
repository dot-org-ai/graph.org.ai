#!/usr/bin/env tsx

/**
 * Test if Batch API supports standard text array format
 */

import { config } from 'dotenv'

config()

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-m3`

async function testBatchTextFormat() {
  console.log('Testing Batch API with standard text array format...\\n')

  // Try batch API with text array format
  const submitResponse = await fetch(`${API_URL}?queueRequest=true`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: ["First test item", "Second test item", "Third test item"]
    }),
  })

  const submitResult = await submitResponse.json()
  console.log('Submit response:')
  console.log(JSON.stringify(submitResult, null, 2))

  if (!submitResult.success) {
    console.log('\\n❌ Text array format not supported in batch API')
    return
  }

  if (submitResult.result?.request_id) {
    const requestId = submitResult.result.request_id
    console.log(`\\n✅ Batch queued with ID: ${requestId}`)
    console.log('Polling for results...\\n')

    // Poll for results
    for (let i = 0; i < 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000))

      const pollResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_id: requestId }),
      })

      const pollResult = await pollResponse.json()
      console.log(`Attempt ${i + 1}:`, pollResult.result?.status || 'unknown')

      if (pollResult.success && pollResult.result?.data) {
        console.log('\\n✅ COMPLETE! Got embeddings:')
        console.log(`Number of embeddings: ${pollResult.result.data.length}`)
        console.log(`First embedding dimensions: ${pollResult.result.data[0].length}`)
        break
      }

      if (i === 59) {
        console.log('\\n❌ Timeout')
      }
    }
  }
}

testBatchTextFormat().catch(console.error)

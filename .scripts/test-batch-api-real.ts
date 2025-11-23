#!/usr/bin/env tsx

/**
 * Test the actual Batch API with query/contexts format
 */

import { config } from 'dotenv'

config()

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-m3`

async function testBatchAPI() {
  console.log('Testing Batch API with query/contexts format...\n')

  // Submit a small batch
  const submitResponse = await fetch(`${API_URL}?queueRequest=true`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          query: "embedding test",
          contexts: [
            {
              text: "First test item",
              external_reference: "item_0"
            },
            {
              text: "Second test item",
              external_reference: "item_1"
            },
            {
              text: "Third test item",
              external_reference: "item_2"
            }
          ]
        }
      ]
    }),
  })

  const submitResult = await submitResponse.json()
  console.log('Submit response:', JSON.stringify(submitResult, null, 2))

  if (!submitResult.success || !submitResult.result?.request_id) {
    throw new Error('Failed to submit batch')
  }

  const requestId = submitResult.result.request_id
  console.log(`\nRequest ID: ${requestId}`)
  console.log('Polling for results...\n')

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

    console.log(`Attempt ${i + 1}:`, pollResult.result?.status || 'unknown status')

    if (pollResult.success && pollResult.result?.responses) {
      console.log('\n✅ COMPLETE! Full response:')
      console.log(JSON.stringify(pollResult, null, 2))
      break
    }

    if (i === 59) {
      console.log('\n❌ Timeout')
    }
  }
}

testBatchAPI().catch(console.error)

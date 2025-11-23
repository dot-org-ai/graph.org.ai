#!/usr/bin/env tsx

/**
 * Poll a specific batch request and inspect the result format
 */

import { config } from 'dotenv'

config()

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-m3`

// Use the test batch from earlier that's been running longer
const REQUEST_ID = '3f50dcb4-e872-40e5-8549-a7c090334d5c'

async function pollBatch() {
  console.log(`Polling batch ${REQUEST_ID}...\n`)

  const pollResponse = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ request_id: REQUEST_ID }),
  })

  const pollResult = await pollResponse.json()

  console.log('Status:', pollResult.result?.status)
  console.log('\nFull response:')
  console.log(JSON.stringify(pollResult, null, 2))
}

pollBatch().catch(console.error)

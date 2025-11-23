#!/usr/bin/env tsx

/**
 * Test Cloudflare Batch API limits for BGE-M3
 *
 * Tests different numbers of requests in a batch to find the maximum
 */

import { config } from 'dotenv'

config()

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-m3`

// Test different numbers of requests per batch
const BATCH_SIZES = [10, 25, 50, 100, 200, 500, 1000]

async function testBatchSize(numRequests: number): Promise<{ success: boolean; error?: string; duration?: number }> {
  console.log(`\n  Testing ${numRequests} requests per batch...`)

  // Create batch with numRequests, each containing 1 text item
  const requests = Array(numRequests).fill(null).map((_, i) => ({
    text: `Test embedding ${i}`
  }))

  const startTime = Date.now()

  try {
    // Submit batch
    const submitResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    })

    if (!submitResponse.ok) {
      const error = await submitResponse.text()
      return {
        success: false,
        error: `HTTP ${submitResponse.status}: ${error}`,
        duration: Date.now() - startTime,
      }
    }

    const submitResult = await submitResponse.json() as any

    if (!submitResult.success || !submitResult.result?.request_id) {
      return {
        success: false,
        error: `No request_id in response: ${JSON.stringify(submitResult)}`,
        duration: Date.now() - startTime,
      }
    }

    const requestId = submitResult.result.request_id
    console.log(`    📋 Batch queued with ID: ${requestId}`)

    // Poll for completion (max 2 minutes)
    let attempts = 0
    const maxAttempts = 24 // 2 minutes

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000))
      attempts++

      const pollResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_id: requestId }),
      })

      if (!pollResponse.ok) {
        const error = await pollResponse.text()
        return {
          success: false,
          error: `Poll failed: ${error}`,
          duration: Date.now() - startTime,
        }
      }

      const pollResult = await pollResponse.json() as any

      if (pollResult.success && pollResult.result?.responses) {
        const duration = Date.now() - startTime
        console.log(`    ✅ Success - ${pollResult.result.responses.length} responses in ${duration}ms`)
        return { success: true, duration }
      }
    }

    return {
      success: false,
      error: 'Timeout waiting for results',
      duration: Date.now() - startTime,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      duration: Date.now() - startTime,
    }
  }
}

async function main() {
  console.log('='.repeat(80))
  console.log('Cloudflare Batch API Limits Testing - BGE-M3')
  console.log('='.repeat(80))

  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN')
  }

  const results: Array<{ size: number; success: boolean; duration?: number; error?: string }> = []

  for (const size of BATCH_SIZES) {
    const result = await testBatchSize(size)
    results.push({ size, ...result })

    if (!result.success) {
      console.log(`    ❌ Failed: ${result.error}`)
      if (result.error?.includes('429') || result.error?.includes('limit')) {
        console.log(`    ⏸️  Hit limit, stopping tests`)
        break
      }
    }

    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('Summary')
  console.log('='.repeat(80))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  if (successful.length > 0) {
    console.log('\nSuccessful batch sizes:')
    successful.forEach(r => {
      console.log(`  ${String(r.size).padStart(4)} requests - ${r.duration}ms`)
    })
    console.log(`\n  Maximum successful: ${Math.max(...successful.map(r => r.size))} requests per batch`)
  }

  if (failed.length > 0) {
    console.log('\nFailed batch sizes:')
    failed.forEach(r => {
      console.log(`  ${String(r.size).padStart(4)} requests: ${r.error}`)
    })
  }
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})

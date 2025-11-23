#!/usr/bin/env tsx

/**
 * Test Cloudflare BGE-M3 Batch Size Limits
 *
 * Tests different batch sizes to find optimal configuration
 */

import { config } from 'dotenv'

config()

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-m3`

// Test with different batch sizes (focusing on larger batches)
const BATCH_SIZES = [100, 500, 1000, 5000, 10000, 50000]

// Sample text of varying lengths
const SHORT_TEXT = "Test embedding"
const MEDIUM_TEXT = "This is a medium length text for testing embeddings with the Cloudflare BGE-M3 model. It contains multiple sentences to simulate real-world usage patterns."
const LONG_TEXT = `
This is a longer text for testing embeddings with the Cloudflare BGE-M3 model.
It contains multiple paragraphs and sentences to simulate real-world usage patterns
where we might be embedding documentation, process descriptions, or other detailed content.

The goal is to understand how the model handles larger batches of text and what the
practical limits are for batch processing. This will help us optimize our embedding
generation pipeline for maximum throughput while staying within API limits.

We also want to ensure that the quality of embeddings remains consistent across
different batch sizes and that we're not hitting any unexpected rate limits or
payload size restrictions.
`.trim()

interface TestResult {
  batchSize: number
  textLength: 'short' | 'medium' | 'long'
  success: boolean
  duration: number
  error?: string
  embeddingsCount?: number
  embeddingDimension?: number
}

async function testBatchSize(batchSize: number, text: string, textLength: 'short' | 'medium' | 'long'): Promise<TestResult> {
  const items = Array(batchSize).fill(text)
  const startTime = Date.now()

  try {
    // Submit batch request
    const submitResponse = await fetch(`${API_URL}?queueRequest=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: items.map(text => ({ text })),
      }),
    })

    if (!submitResponse.ok) {
      const error = await submitResponse.text()
      return {
        batchSize,
        textLength,
        success: false,
        duration: Date.now() - startTime,
        error: `HTTP ${submitResponse.status}: ${error}`,
      }
    }

    const submitResult = await submitResponse.json() as any

    if (!submitResult.success || !submitResult.result?.request_id) {
      return {
        batchSize,
        textLength,
        success: false,
        duration: Date.now() - startTime,
        error: 'No request_id in response',
      }
    }

    const requestId = submitResult.result.request_id

    // Poll for completion
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
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
          batchSize,
          textLength,
          success: false,
          duration: Date.now() - startTime,
          error: `Poll failed: ${error}`,
        }
      }

      const pollResult = await pollResponse.json() as any

      if (pollResult.success && pollResult.result?.responses) {
        const duration = Date.now() - startTime
        const embeddings = pollResult.result.responses.map((r: any) => r.result?.data)

        return {
          batchSize,
          textLength,
          success: true,
          duration,
          embeddingsCount: embeddings.length,
          embeddingDimension: embeddings[0]?.length || 0,
        }
      }
    }

    return {
      batchSize,
      textLength,
      success: false,
      duration: Date.now() - startTime,
      error: 'Timeout waiting for batch completion',
    }
  } catch (err) {
    const duration = Date.now() - startTime
    return {
      batchSize,
      textLength,
      success: false,
      duration,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

async function main() {
  console.log('='.repeat(80))
  console.log('Cloudflare BGE-M3 Batch Size Testing')
  console.log('='.repeat(80))

  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN')
  }

  const results: TestResult[] = []

  // Test short text with different batch sizes
  console.log('\n📝 Testing SHORT text (15 chars) - Finding Cloudflare limits...\n')
  for (const size of BATCH_SIZES) {
    console.log(`  Testing batch size ${size}...`)
    const result = await testBatchSize(size, SHORT_TEXT, 'short')
    results.push(result)

    if (result.success) {
      console.log(`    ✅ Success - ${result.embeddingsCount} embeddings in ${result.duration}ms (${Math.round(result.duration / size)}ms/item)`)
    } else {
      console.log(`    ❌ Failed - ${result.error}`)
      if (result.error?.includes('429') || result.error?.includes('rate') || result.error?.includes('limit')) {
        console.log(`    ⏸️  Hit limit, stopping tests`)
        break
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('Summary')
  console.log('='.repeat(80))

  console.log('\nSuccessful configurations:')
  const successful = results.filter(r => r.success)
  successful.forEach(r => {
    console.log(`  ${r.textLength.padEnd(7)} text x ${String(r.batchSize).padStart(4)} items = ${r.duration}ms (${Math.round(r.duration / r.batchSize)}ms/item)`)
  })

  console.log('\nFailed configurations:')
  const failed = results.filter(r => !r.success)
  if (failed.length === 0) {
    console.log('  None!')
  } else {
    failed.forEach(r => {
      console.log(`  ${r.textLength.padEnd(7)} text x ${String(r.batchSize).padStart(4)} items: ${r.error}`)
    })
  }

  // Recommendations
  console.log('\n' + '='.repeat(80))
  console.log('Recommendations')
  console.log('='.repeat(80))

  const maxSuccessfulSize = Math.max(...successful.map(r => r.batchSize))
  const avgTimePerItem = successful.reduce((sum, r) => sum + (r.duration / r.batchSize), 0) / successful.length

  console.log(`\n  Maximum successful batch size: ${maxSuccessfulSize}`)
  console.log(`  Average time per item: ${Math.round(avgTimePerItem)}ms`)
  console.log(`\n  Recommended batch size: ${Math.min(maxSuccessfulSize, 100)}`)
  console.log(`  (Balance between throughput and error recovery)`)
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})

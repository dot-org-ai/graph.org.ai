#!/usr/bin/env tsx

/**
 * Cloudflare Workers AI Batch Embeddings
 *
 * Generates embeddings for things using Cloudflare Batch API with bge-m3 model
 *
 * Workflow:
 * 1. Read items from things table that don't exist in searches
 * 2. Submit batch jobs to Cloudflare
 * 3. Poll for completion and insert into searches table
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
const BATCH_SIZE = 5000 // Process 5k items per batch job (estimate ~2MB payload for safety)
const MAX_BATCHES = Infinity // No limit - submit all batches in parallel

interface Thing {
  url: string
  name: string
  content: string
  type: string
}

interface BatchItem {
  url: string
  text: string
}

interface BatchJob {
  jobId: string
  status: string
  result?: Array<{ data: number[][] }>
}

/**
 * Get items from things that need embeddings
 */
async function getItemsToEmbed(limit: number = BATCH_SIZE): Promise<Thing[]> {
  const query = `
    SELECT
      url,
      name,
      content,
      type
    FROM things
    WHERE url NOT IN (SELECT url FROM searches)
      AND length(content) > 0
    LIMIT ${limit}
  `

  const result = await clickhouse.query({ query, format: 'JSONEachRow' })
  const data = await result.json<Thing[]>()
  return data
}

/**
 * Submit batch to Cloudflare Batch API - array of separate embedding requests
 */
async function submitBatch(items: BatchItem[]): Promise<{ requestId: string; urls: string[] }> {
  // Submit batch as array of individual requests (NOT a single request with text array)
  // Each item in the requests array is a separate embedding request
  const requests = items.map(item => ({
    text: [item.text]  // Single text per request
  }))

  const submitResponse = await fetch(`${BATCH_API_URL}?queueRequest=true`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  })

  if (!submitResponse.ok) {
    const error = await submitResponse.text()
    throw new Error(`Batch submission failed: ${submitResponse.status} ${error}`)
  }

  const submitResult = await submitResponse.json() as any

  if (!submitResult.success || !submitResult.result?.request_id) {
    throw new Error(`No request_id in response: ${JSON.stringify(submitResult)}`)
  }

  const requestId = submitResult.result.request_id
  console.log(`  📋 Batch queued with ID: ${requestId}`)

  return { requestId, urls: items.map(item => item.url) }
}

/**
 * Poll for batch completion and return results
 */
async function pollBatchResults(requestId: string, urls: string[]): Promise<Map<string, number[]>> {
  let attempts = 0
  const maxAttempts = 240 // 20 minutes max wait

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
    attempts++

    const pollResponse = await fetch(BATCH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ request_id: requestId }),
    })

    if (!pollResponse.ok) {
      const error = await pollResponse.text()
      throw new Error(`Polling failed: ${pollResponse.status} ${error}`)
    }

    const pollResult = await pollResponse.json() as any

    if (pollResult.success && pollResult.result) {
      // Batch API returns array of results matching the requests array
      const results = pollResult.result

      // Check if we have results (could be array of objects with data property)
      if (Array.isArray(results) && results.length > 0) {
        console.log(`  ⏱️  Completed after ${attempts * 5}s`)

        const embeddings = new Map<string, number[]>()

        // Each result corresponds to one request, extract the embedding
        for (let i = 0; i < urls.length && i < results.length; i++) {
          const embedding = results[i]?.data?.[0] || results[i]?.data || results[i]
          if (embedding && Array.isArray(embedding)) {
            embeddings.set(urls[i], embedding)
          }
        }

        return embeddings
      }
    }

    if (attempts % 12 === 0) { // Every minute
      console.log(`  ⏳ Still processing... (${attempts * 5}s elapsed)`)
    }
  }

  throw new Error(`Batch timeout after ${maxAttempts * 5} seconds`)
}


/**
 * Insert embeddings into searches table
 */
async function insertEmbeddings(url: string, text: string, embedding: number[]): Promise<void> {
  await clickhouse.insert({
    table: 'searches',
    values: [{
      url,
      text,
      embedding,
      meta: { model: MODEL, createdAt: new Date().toISOString() },
    }],
    format: 'JSONEachRow',
  })
}

/**
 * Process a single batch using Batch API
 */
async function processBatch(things: Thing[]): Promise<{ requestId: string; itemCount: number; urls: string[]; texts: string[] }> {
  console.log(`\n📦 Processing batch of ${things.length} items...`)

  // Prepare batch items
  const batchItems: BatchItem[] = things.map(thing => ({
    url: thing.url,
    text: `${thing.name}\n\n${thing.content}`.trim(),
  }))

  // Submit to Cloudflare Batch API
  console.log(`  🚀 Submitting to Cloudflare Batch API...`)
  const { requestId, urls } = await submitBatch(batchItems)

  return {
    requestId,
    itemCount: things.length,
    urls,
    texts: batchItems.map(item => item.text)
  }
}

/**
 * Main execution - submit batches and poll for results
 */
async function main() {
  console.log('='.repeat(80))
  console.log(`Cloudflare Batch Embeddings - bge-m3 (unlimited parallel batches)`)
  console.log('='.repeat(80))

  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN environment variables')
  }

  // Phase 1: Submit all batches
  console.log('\n📤 Phase 1: Submitting batches...')
  const submittedBatches: Array<{ requestId: string; itemCount: number; urls: string[]; texts: string[] }> = []
  let batchNumber = 1

  while (true) {
    const things = await getItemsToEmbed()

    if (things.length === 0) {
      break
    }

    console.log(`\n[Batch #${batchNumber}]`)
    try {
      const batch = await processBatch(things)
      submittedBatches.push(batch)
      console.log(`  ✅ Submitted request ID: ${batch.requestId}`)
    } catch (error) {
      console.error(`  ❌ Error submitting batch:`, error)
    }

    batchNumber++
  }

  console.log(`\n✅ Submitted ${submittedBatches.length} batches`)
  console.log(`⏳ Total items queued: ${submittedBatches.reduce((sum, b) => sum + b.itemCount, 0)}`)

  // Save batch metadata to file for later polling
  const batchMetadataFile = '.scripts/batch-metadata.json'
  const fs = await import('fs/promises')
  await fs.writeFile(batchMetadataFile, JSON.stringify(submittedBatches, null, 2))
  console.log(`\n💾 Saved batch metadata to ${batchMetadataFile}`)

  // Phase 2: Poll for results and insert into database
  console.log(`\n📥 Phase 2: Polling for results and inserting into database...`)
  console.log(`Note: Batch API is 50% cheaper but slower than sync API`)
  console.log(`This will take approximately 24 hours for all batches to complete\n`)

  let completed = 0
  let failed = 0

  for (const batch of submittedBatches) {
    console.log(`\n[Polling batch ${batch.requestId}]`)
    try {
      const embeddings = await pollBatchResults(batch.requestId, batch.urls)

      // Insert embeddings into database
      console.log(`  💾 Inserting ${embeddings.size} embeddings into database...`)
      let inserted = 0
      for (const [url, embedding] of embeddings.entries()) {
        const text = batch.texts[batch.urls.indexOf(url)]
        await insertEmbeddings(url, text, embedding)
        inserted++
        if (inserted % 1000 === 0) {
          console.log(`    ⏳ Inserted ${inserted}/${embeddings.size}...`)
        }
      }

      console.log(`  ✅ Batch complete: ${embeddings.size} embeddings inserted`)
      completed++
    } catch (error) {
      console.error(`  ❌ Error processing batch:`, error)
      failed++
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log(`✅ Processing complete!`)
  console.log(`   Successful batches: ${completed}`)
  console.log(`   Failed batches: ${failed}`)
  console.log(`   Total items processed: ${completed * BATCH_SIZE}`)
  console.log('='.repeat(80))

  await clickhouse.close()
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})

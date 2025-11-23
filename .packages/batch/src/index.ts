/**
 * Cloudflare Worker for Batch Embeddings
 *
 * Handles:
 * 1. HTTP POST requests to generate embeddings
 * 2. Event subscriptions for async batch completion
 * 3. ClickHouse integration for storing results
 */

import { createClient } from '@clickhouse/client-web'

interface Env {
  AI: Ai
  CLICKHOUSE_URL: string
  CLICKHOUSE_USERNAME: string
  CLICKHOUSE_PASSWORD: string
}

interface EmbeddingRequest {
  items: Array<{
    url: string
    text: string
  }>
  batchSize?: number
}

interface EmbeddingResult {
  url: string
  embedding: number[]
  dimension: number
}

const MODEL = '@cf/baai/bge-m3'
const DEFAULT_BATCH_SIZE = 100

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // Handle event subscription webhook
    if (url.pathname === '/events' && request.method === 'POST') {
      return handleEventSubscription(request, env, ctx)
    }

    // Handle direct embedding requests
    if (url.pathname === '/embed' && request.method === 'POST') {
      return handleEmbedRequest(request, env, ctx)
    }

    // Health check
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'batch-embeddings',
        model: MODEL,
      }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response('Not Found', { status: 404 })
  },
}

/**
 * Handle event subscription from Cloudflare AI
 */
async function handleEventSubscription(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  try {
    const event = await request.json() as any

    console.log('Received event:', event.type)

    // Handle batch completion event
    if (event.type === 'ai.completion') {
      const { requestId, result } = event.data

      // Process embeddings and store in ClickHouse
      ctx.waitUntil(
        processCompletedBatch(requestId, result, env)
      )

      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Event subscription error:', error)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/**
 * Handle direct embedding requests (synchronous)
 */
async function handleEmbedRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  try {
    const body = await request.json() as EmbeddingRequest
    const { items, batchSize = DEFAULT_BATCH_SIZE } = body

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Process in batches
    const results: EmbeddingResult[] = []
    const batches = []

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }

    for (const batch of batches) {
      const texts = batch.map(item => item.text)

      // Generate embeddings using Workers AI
      const response = await env.AI.run(MODEL, {
        text: texts,
      }) as any

      // Extract embeddings
      if (response.data) {
        for (let i = 0; i < batch.length; i++) {
          results.push({
            url: batch[i].url,
            embedding: response.data[i],
            dimension: response.data[i].length,
          })
        }
      }
    }

    // Store in ClickHouse (async)
    ctx.waitUntil(
      storeEmbeddings(results, env)
    )

    return new Response(JSON.stringify({
      success: true,
      count: results.length,
      dimension: results[0]?.dimension || 0,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Embed request error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/**
 * Process completed batch from event subscription
 */
async function processCompletedBatch(
  requestId: string,
  result: any,
  env: Env
): Promise<void> {
  try {
    console.log(`Processing batch ${requestId}`)

    // Extract embeddings from result
    const embeddings = result.data || []

    // TODO: Map embeddings back to URLs
    // This requires storing the request metadata somewhere
    // For now, just log
    console.log(`Received ${embeddings.length} embeddings`)
  } catch (error) {
    console.error(`Error processing batch ${requestId}:`, error)
  }
}

/**
 * Store embeddings in ClickHouse
 */
async function storeEmbeddings(
  results: EmbeddingResult[],
  env: Env
): Promise<void> {
  try {
    const client = createClient({
      url: env.CLICKHOUSE_URL,
      username: env.CLICKHOUSE_USERNAME,
      password: env.CLICKHOUSE_PASSWORD,
    })

    // Prepare values for insertion
    const values = results.map(r => ({
      url: r.url,
      text: '', // Text is already in things table
      embedding: r.embedding,
      meta: {
        model: MODEL,
        dimension: r.dimension,
        createdAt: new Date().toISOString(),
      },
    }))

    await client.insert({
      table: 'searches',
      values,
      format: 'JSONEachRow',
    })

    console.log(`Stored ${results.length} embeddings in ClickHouse`)
  } catch (error) {
    console.error('ClickHouse storage error:', error)
    throw error
  }
}

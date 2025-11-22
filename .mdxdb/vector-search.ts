/**
 * Vector search using embeddings
 *
 * Provides semantic search capabilities using cosine similarity
 * between query embeddings and stored thing embeddings.
 */

import 'dotenv/config'
import { google } from '@ai-sdk/google'
import { embed } from 'ai'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'
import type { Thing } from './schema.js'

// Initialize embedding model
const embeddingModel = google.textEmbeddingModel('gemini-embedding-001')

// Open database
const db = new Database('.mdxdb/things.db', { readonly: true })
const things = drizzle(db, { schema })

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Convert Buffer to Float32Array
 */
function bufferToVector(buffer: Buffer): number[] {
  const float32Array = new Float32Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength / 4
  )
  return Array.from(float32Array)
}

export interface SearchResult {
  thing: Thing
  score: number
  text: string
}

/**
 * Perform semantic search
 */
export async function semanticSearch(
  query: string,
  options: {
    limit?: number
    threshold?: number
    namespace?: string
    type?: string
  } = {}
): Promise<SearchResult[]> {
  const {
    limit = 10,
    threshold = 0.5,
    namespace,
    type,
  } = options

  // Generate embedding for the query
  const { embedding: queryEmbedding } = await embed({
    model: embeddingModel,
    value: query,
  })

  // Get all search entries (with optional filtering)
  let searchQuery = 'SELECT * FROM searches'
  const params: any[] = []

  if (namespace || type) {
    searchQuery += ' WHERE '
    const conditions: string[] = []

    if (namespace) {
      conditions.push("json_extract(meta, '$.ns') = ?")
      params.push(namespace)
    }

    if (type) {
      conditions.push("json_extract(meta, '$.type') = ?")
      params.push(type)
    }

    searchQuery += conditions.join(' AND ')
  }

  const searchEntries = db.prepare(searchQuery).all(...params) as Array<{
    url: string
    text: string
    embedding: Buffer
    meta: string
  }>

  // Calculate similarities
  const results: Array<{
    url: string
    text: string
    score: number
  }> = []

  for (const entry of searchEntries) {
    const vector = bufferToVector(entry.embedding)
    const similarity = cosineSimilarity(queryEmbedding, vector)

    if (similarity >= threshold) {
      results.push({
        url: entry.url,
        text: entry.text,
        score: similarity,
      })
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)

  // Limit results
  const topResults = results.slice(0, limit)

  // Fetch full thing data
  const searchResults: SearchResult[] = []

  for (const result of topResults) {
    const thing = things.select()
      .from(schema.things)
      .where((t: any) => t.url === result.url)
      .get()

    if (thing) {
      searchResults.push({
        thing,
        score: result.score,
        text: result.text,
      })
    }
  }

  return searchResults
}

/**
 * Find similar things based on a thing's embedding
 */
export async function findSimilar(
  url: string,
  options: {
    limit?: number
    threshold?: number
  } = {}
): Promise<SearchResult[]> {
  const { limit = 10, threshold = 0.5 } = options

  // Get the thing's search entry
  const entry = db.prepare('SELECT * FROM searches WHERE url = ?').get(url) as {
    url: string
    text: string
    embedding: Buffer
    meta: string
  } | undefined

  if (!entry) {
    return []
  }

  const queryVector = bufferToVector(entry.embedding)

  // Get all other search entries
  const searchEntries = db.prepare('SELECT * FROM searches WHERE url != ?').all(url) as Array<{
    url: string
    text: string
    embedding: Buffer
    meta: string
  }>

  // Calculate similarities
  const results: Array<{
    url: string
    text: string
    score: number
  }> = []

  for (const otherEntry of searchEntries) {
    const vector = bufferToVector(otherEntry.embedding)
    const similarity = cosineSimilarity(queryVector, vector)

    if (similarity >= threshold) {
      results.push({
        url: otherEntry.url,
        text: otherEntry.text,
        score: similarity,
      })
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)

  // Limit results
  const topResults = results.slice(0, limit)

  // Fetch full thing data
  const searchResults: SearchResult[] = []

  for (const result of topResults) {
    const thing = things.select()
      .from(schema.things)
      .where((t: any) => t.url === result.url)
      .get()

    if (thing) {
      searchResults.push({
        thing,
        score: result.score,
        text: result.text,
      })
    }
  }

  return searchResults
}

/**
 * Close the database connection
 */
export function closeVectorSearch() {
  db.close()
}

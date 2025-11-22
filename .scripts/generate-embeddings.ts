#!/usr/bin/env tsx

/**
 * Generate embeddings for all things in the database
 *
 * Uses Google's gemini-embedding-001 model via the Vercel AI SDK
 * to generate embeddings for semantic search.
 */

import 'dotenv/config'
import { google } from '@ai-sdk/google'
import { embedMany } from 'ai'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../.mdxdb/schema.js'
import type { NewSearch } from '../.mdxdb/schema.js'

// Check environment variables
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.error('❌ Error: GOOGLE_GENERATIVE_AI_API_KEY not found in .env')
  console.error('   Please create a .env file with your Google API key')
  console.error('   Get your key from: https://aistudio.google.com/app/apikey')
  process.exit(1)
}

// Initialize embedding model
const embeddingModel = google.textEmbeddingModel('gemini-embedding-001')

// Open database
const db = new Database('.mdxdb/things.db')
const things = drizzle(db, { schema })

/**
 * Create searchable text from a thing
 */
function createSearchText(thing: any): string {
  const parts: string[] = []

  // Add ID (cleaned)
  if (thing.id) {
    parts.push(thing.id.replace(/^schema:/, ''))
  }

  // Add data fields based on type
  if (thing.data) {
    const data = typeof thing.data === 'string' ? JSON.parse(thing.data) : thing.data

    // Common fields across all types
    if (data.title) parts.push(data.title)
    if (data.name) parts.push(data.name)
    if (data.label) parts.push(data.label)

    // Descriptions
    if (data.description) parts.push(data.description)
    if (data.comment) parts.push(data.comment)
    if (data.definition) parts.push(data.definition)
  }

  // Add content if available
  if (thing.content) {
    parts.push(thing.content)
  }

  return parts.join(' ').trim()
}

/**
 * Generate embeddings in batches
 */
async function generateEmbeddings() {
  console.log('🚀 Generating embeddings...\n')

  // Get all things
  const allThings = things.select().from(schema.things).all()
  console.log(`📊 Total things: ${allThings.length.toLocaleString()}\n`)

  // Clear existing search entries
  console.log('🗑️  Clearing existing search entries...')
  db.prepare('DELETE FROM searches').run()

  // Process in batches to avoid memory issues and rate limits
  const BATCH_SIZE = 100
  const batches = Math.ceil(allThings.length / BATCH_SIZE)

  let totalProcessed = 0
  let totalSkipped = 0

  for (let i = 0; i < batches; i++) {
    const start = i * BATCH_SIZE
    const end = Math.min(start + BATCH_SIZE, allThings.length)
    const batch = allThings.slice(start, end)

    console.log(`📦 Processing batch ${i + 1}/${batches} (${start + 1}-${end})...`)

    // Create search texts
    const textsToEmbed: string[] = []
    const validThings: any[] = []

    for (const thing of batch) {
      const searchText = createSearchText(thing)

      if (searchText.length === 0) {
        console.log(`   ⚠️  Skipping ${thing.url} (no searchable text)`)
        totalSkipped++
        continue
      }

      textsToEmbed.push(searchText)
      validThings.push(thing)
    }

    if (textsToEmbed.length === 0) {
      console.log(`   ⚠️  No valid texts in this batch, skipping...`)
      continue
    }

    try {
      // Generate embeddings for the batch
      const { embeddings } = await embedMany({
        model: embeddingModel,
        values: textsToEmbed,
      })

      console.log(`   ✅ Generated ${embeddings.length} embeddings`)

      // Store in database
      const searches: NewSearch[] = validThings.map((thing, idx) => ({
        url: thing.url,
        text: textsToEmbed[idx],
        embedding: Buffer.from(new Float32Array(embeddings[idx]).buffer),
        meta: {
          ns: thing.ns,
          type: thing.type,
          embeddingModel: 'gemini-embedding-001',
          dimensions: embeddings[idx].length,
        },
      }))

      // Insert in chunks to avoid SQLite limits
      const CHUNK_SIZE = 50
      for (let j = 0; j < searches.length; j += CHUNK_SIZE) {
        const chunk = searches.slice(j, j + CHUNK_SIZE)
        await things.insert(schema.searches).values(chunk)
      }

      totalProcessed += validThings.length

      console.log(`   💾 Saved to database\n`)

      // Rate limiting - wait 1 second between batches
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

    } catch (error) {
      console.error(`   ❌ Error processing batch ${i + 1}:`, error)
      console.error(`   Continuing with next batch...\n`)
    }
  }

  console.log('✅ Embedding generation complete!\n')
  console.log(`📊 Summary:`)
  console.log(`   Processed: ${totalProcessed.toLocaleString()}`)
  console.log(`   Skipped: ${totalSkipped.toLocaleString()}`)
  console.log(`   Total: ${allThings.length.toLocaleString()}`)

  // Show statistics
  const searchCount = db.prepare('SELECT COUNT(*) as count FROM searches').get() as { count: number }
  console.log(`\n💾 Search entries in database: ${searchCount.count.toLocaleString()}`)

  db.close()
}

generateEmbeddings()

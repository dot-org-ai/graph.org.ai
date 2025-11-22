#!/usr/bin/env tsx

/**
 * Build things.db - Normalized knowledge graph database
 *
 * Reads from source.db and creates a normalized view where all URLs follow:
 * https://[ontology].org.ai/[Name]
 *
 * For example:
 * - schema:Person -> https://schema.org.ai/Person
 * - onet occupation 11-1011.00 -> https://onet.org.ai/Occupation/11-1011.00
 * - unspsc commodity 10101501 -> https://unspsc.org.ai/Commodity/10101501
 */

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../.mdxdb/schema.js'
import type { NewThing, NewRelationship } from '../.mdxdb/schema.js'

console.log('🚀 Building things.db from source.db...')

// Open source.db for reading
const sourceDb = new Database('.mdxdb/source.db', { readonly: true })
const source = drizzle(sourceDb, { schema })

// Create things.db for writing
const thingsDb = new Database('.mdxdb/things.db')
thingsDb.pragma('journal_mode = WAL')
const things = drizzle(thingsDb, { schema })

// Import migrations
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
migrate(things, { migrationsFolder: '.mdxdb/migrations' })

/**
 * Normalize URL from source.db format to org.ai format
 */
function normalizeURL(sourceURL: string, ns: string, type: string, id: string): string {
  // Map namespace to org.ai domain
  const domainMap: Record<string, string> = {
    'schema.org': 'schema.org.ai',
    'onet': 'onet.org.ai',
    'unspsc': 'unspsc.org.ai',
    'apqc': 'apqc.org.ai',
    'model': 'model.org.ai',
  }

  const domain = domainMap[ns] || `${ns}.org.ai`

  // Remove namespace prefix from ID if present (e.g., schema:Person -> Person)
  let cleanId = id
  if (cleanId.startsWith(`${ns}:`)) {
    cleanId = cleanId.slice(ns.length + 1)
  }
  if (cleanId.startsWith('schema:')) {
    cleanId = cleanId.slice(7)
  }

  // For schema.org, don't include type in URL
  if (ns === 'schema.org') {
    return `https://${domain}/${cleanId}`
  }

  // For other ontologies, include type
  return `https://${domain}/${type}/${cleanId}`
}

/**
 * Build URL mapping from source URLs to normalized URLs
 */
function buildURLMapping(): Map<string, string> {
  const mapping = new Map<string, string>()

  const allThings = source.select().from(schema.things).all()

  for (const thing of allThings) {
    const normalizedURL = normalizeURL(thing.url, thing.ns, thing.type, thing.id)
    mapping.set(thing.url, normalizedURL)
  }

  console.log(`  Built URL mapping for ${mapping.size} things`)
  return mapping
}

/**
 * Migrate things with normalized URLs
 */
async function migrateThings(urlMapping: Map<string, string>) {
  console.log('\n📦 Migrating things...')

  const sourceThings = source.select().from(schema.things).all()
  const normalizedThings: NewThing[] = []

  for (const thing of sourceThings) {
    const normalizedURL = urlMapping.get(thing.url)!

    normalizedThings.push({
      ns: thing.ns,
      type: thing.type,
      id: thing.id,
      url: normalizedURL,
      data: thing.data,
      code: thing.code,
      content: thing.content,
      meta: {
        ...thing.meta as any,
        sourceURL: thing.url, // Keep original URL in metadata
      },
    })
  }

  // Batch insert
  const CHUNK_SIZE = 1000
  for (let i = 0; i < normalizedThings.length; i += CHUNK_SIZE) {
    const chunk = normalizedThings.slice(i, i + CHUNK_SIZE)
    console.log(`  Inserting things ${i + 1}-${Math.min(i + CHUNK_SIZE, normalizedThings.length)}...`)
    await things.insert(schema.things).values(chunk)
  }

  console.log(`  ✅ Migrated ${normalizedThings.length} things`)
}

/**
 * Migrate relationships with normalized URLs
 */
async function migrateRelationships(urlMapping: Map<string, string>) {
  console.log('\n📦 Migrating relationships...')

  const sourceRels = source.select().from(schema.relationships).all()
  const normalizedRels: NewRelationship[] = []

  for (const rel of sourceRels) {
    const fromURL = urlMapping.get(rel.from)
    const toURL = urlMapping.get(rel.to)

    // Skip relationships where source or target doesn't exist
    if (!fromURL || !toURL) {
      console.log(`  ⚠️  Skipping relationship: ${rel.from} -> ${rel.to} (missing URL mapping)`)
      continue
    }

    normalizedRels.push({
      from: fromURL,
      predicate: rel.predicate,
      reverse: rel.reverse,
      to: toURL,
      meta: rel.meta,
    })
  }

  // Batch insert
  const CHUNK_SIZE = 1000
  for (let i = 0; i < normalizedRels.length; i += CHUNK_SIZE) {
    const chunk = normalizedRels.slice(i, i + CHUNK_SIZE)
    console.log(`  Inserting relationships ${i + 1}-${Math.min(i + CHUNK_SIZE, normalizedRels.length)}...`)
    await things.insert(schema.relationships).values(chunk)
  }

  console.log(`  ✅ Migrated ${normalizedRels.length} relationships`)
}

/**
 * Main function
 */
async function main() {
  const startTime = Date.now()

  try {
    // Build URL mapping
    const urlMapping = buildURLMapping()

    // Migrate things
    await migrateThings(urlMapping)

    // Migrate relationships
    await migrateRelationships(urlMapping)

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`\n✅ things.db built successfully in ${duration}s!`)

    // Show statistics
    const thingsCount = things.select().from(schema.things).all().length
    const relationshipsCount = things.select().from(schema.relationships).all().length

    console.log(`\n📊 Statistics:`)
    console.log(`   Things: ${thingsCount.toLocaleString()}`)
    console.log(`   Relationships: ${relationshipsCount.toLocaleString()}`)

    // Show sample URLs
    console.log(`\n🔗 Sample normalized URLs:`)
    const samples = things.select().from(schema.things).limit(10).all()
    samples.forEach(thing => {
      console.log(`   ${thing.ns}/${thing.type}/${thing.id} -> ${thing.url}`)
    })

  } catch (error) {
    console.error('❌ Error building things.db:', error)
    process.exit(1)
  } finally {
    sourceDb.close()
    thingsDb.close()
  }
}

main()

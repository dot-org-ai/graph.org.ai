#!/usr/bin/env tsx
/**
 * Test script to ingest only Language data
 */

import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readdirSync, readFileSync } from 'fs'
import { createStorage, type StorageBackend } from '../.mdxdb/storage.js'
import type { NewThing } from '../.mdxdb/schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')
const SOURCE_DIR = '.source'

const storageBackend = (process.argv[2] || 'clickhouse') as StorageBackend
const storage = createStorage(storageBackend)

/**
 * Ingest Language data (Verbs, Concepts, Pronouns, Prepositions, etc.)
 */
async function ingestLanguage() {
  console.log('\n📚 Processing Language data...')

  const languageDir = join(PROJECT_ROOT, SOURCE_DIR, 'Language')
  const files = readdirSync(languageDir).filter(f => f.endsWith('.tsv'))

  console.log(`  Found ${files.length} language files\n`)

  for (const file of files) {
    const filePath = join(languageDir, file)
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim())

    if (lines.length === 0) continue

    // Extract type from filename (e.g., "Language.Verbs.tsv" -> "Verb")
    const typeMatch = file.match(/Language\.(\w+)\.tsv/)
    if (!typeMatch) {
      console.warn(`  ⚠️  Skipping ${file}: unexpected filename format`)
      continue
    }
    const typePlural = typeMatch[1]
    const type = typePlural.endsWith('s') ? typePlural.slice(0, -1) : typePlural

    // Parse header
    const header = lines[0].split('\t')
    const things: NewThing[] = []

    console.log(`  Processing ${file} (${lines.length - 1} rows)...`)
    console.log(`    Type: ${type}`)
    console.log(`    Columns: ${header.join(', ')}`)

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t')
      if (values.length < header.length) {
        console.warn(`    ⚠️  Row ${i}: Expected ${header.length} columns, got ${values.length}`)
        continue
      }

      const row: any = {}
      header.forEach((key, idx) => {
        row[key] = values[idx] || ''
      })

      // Build data object from all columns except id/name/title/description
      const data: any = {}
      header.forEach((key, idx) => {
        if (key !== 'id' && key !== 'name' && key !== 'title' && key !== 'description') {
          data[key] = values[idx] || ''
        }
      })

      // Determine id and name based on the type
      let id: string
      let name: string

      if (type === 'Verb') {
        // Verbs use canonicalForm as both id and name
        id = `language:verb:${row.canonicalForm}`
        name = row.canonicalForm
        // Include all conjugations in data
        data.canonicalForm = row.canonicalForm
      } else if (type === 'Concept') {
        // Concepts have an explicit id field
        id = `language:concept:${row.id}`
        name = row.id
        data.id = row.id
      } else {
        // Other types (Pronouns, Prepositions, Determiners, Adverbs, Conjunctions)
        // Use the first column as id
        const word = row.id || row.word || values[0]
        id = `language:${type.toLowerCase()}:${word}`
        name = word
      }

      things.push({
        ns: 'language',
        type,
        id,
        name,
        url: id.replace(/:/g, '/'),
        data,
        content: row.description || '',
        meta: { source: file },
      })
    }

    if (things.length > 0) {
      console.log(`    ✓ Parsed ${things.length} ${type}s`)
      console.log(`    Example: ${things[0].id}`)
      console.log(`    Inserting into ${storageBackend}...`)

      try {
        await storage.insertThings(things)
        console.log(`    ✅ Successfully inserted ${things.length} ${type}s\n`)
      } catch (error) {
        console.error(`    ❌ Error inserting ${type}s:`, error)
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting Language data ingestion...\n')
  console.log(`   Storage backend: ${storageBackend}\n`)

  const startTime = Date.now()

  try {
    await ingestLanguage()

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`\n✅ Language data ingestion complete in ${duration}s!`)
  } catch (error) {
    console.error('\n❌ Error during ingestion:', error)
    process.exit(1)
  }
}

main()

#!/usr/bin/env tsx
/**
 * Validate data completeness:
 * 1. Check all entity files have standard headers
 * 2. Check all entity types have corresponding .Relationships.tsv files
 */

import { readdirSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')
const REQUIRED_HEADERS = ['url', 'ns', 'type', 'id', 'code', 'name', 'description']

console.log('🔍 Validating Data Completeness\n')

// Get all entity and relationship files
const allFiles = readdirSync(DATA_DIR).filter(f => f.endsWith('.tsv'))
const entityFiles = allFiles.filter(f => !f.includes('.Relationships.'))
const relationshipFiles = allFiles.filter(f => f.includes('.Relationships.'))

console.log(`📊 Found ${entityFiles.length} entity files and ${relationshipFiles.length} relationship files\n`)

// 1. Check headers
console.log('1️⃣  Checking entity file headers...\n')
let headerIssues = 0

for (const file of entityFiles) {
  const filePath = resolve(DATA_DIR, file)
  const content = readFileSync(filePath, 'utf-8')
  const firstLine = content.split('\n')[0]
  const headers = firstLine.split('\t')

  // Check if all required headers are present
  const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h))

  if (missingHeaders.length > 0) {
    console.log(`❌ ${file}`)
    console.log(`   Missing: ${missingHeaders.join(', ')}`)
    console.log(`   Has: ${headers.join(', ')}`)
    headerIssues++
  }
}

if (headerIssues === 0) {
  console.log(`✅ All ${entityFiles.length} entity files have correct headers\n`)
} else {
  console.log(`\n⚠️  ${headerIssues} files have header issues\n`)
}

// 2. Check for missing relationship files
console.log('2️⃣  Checking for missing relationship files...\n')

// Extract base names from entity files (e.g., "Abilities.tsv" -> "Abilities")
const entityTypes = entityFiles.map(f => f.replace('.tsv', ''))

// Extract base names from relationship files (e.g., "Abilities.Relationships.tsv" -> "Abilities")
const typesWithRelationships = relationshipFiles.map(f => f.replace('.Relationships.tsv', ''))

// Find entity types without relationship files
const missingRelationships = entityTypes.filter(type => !typesWithRelationships.includes(type))

if (missingRelationships.length > 0) {
  console.log(`❌ Found ${missingRelationships.length} entity types WITHOUT relationship files:\n`)
  missingRelationships.forEach(type => console.log(`   - ${type}.tsv (needs ${type}.Relationships.tsv)`))
} else {
  console.log(`✅ All entity types have corresponding relationship files`)
}

// Also check for orphaned relationship files
const orphanedRelationships = typesWithRelationships.filter(type => !entityTypes.includes(type))

if (orphanedRelationships.length > 0) {
  console.log(`\n⚠️  Found ${orphanedRelationships.length} relationship files WITHOUT entity files:\n`)
  orphanedRelationships.forEach(type => console.log(`   - ${type}.Relationships.tsv (missing ${type}.tsv)`))
}

// Summary
console.log('\n' + '='.repeat(50))
console.log('📋 Summary')
console.log('='.repeat(50))
console.log(`Entity files: ${entityFiles.length}`)
console.log(`Relationship files: ${relationshipFiles.length}`)
console.log(`Header issues: ${headerIssues}`)
console.log(`Missing relationships: ${missingRelationships.length}`)
console.log(`Orphaned relationships: ${orphanedRelationships.length}`)

if (headerIssues === 0 && missingRelationships.length === 0) {
  console.log('\n✅ Data is complete and valid!')
} else {
  console.log('\n⚠️  Issues found that need attention')
  process.exit(1)
}

#!/usr/bin/env tsx
/**
 * Validate Apps.tsv structure and field counts
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')

console.log('🔍 Validating Apps.tsv structure\n')

const appsPath = resolve(DATA_DIR, 'Apps.tsv')
const content = readFileSync(appsPath, 'utf-8')
const lines = content.split('\n')

console.log(`📊 File Statistics:`)
console.log(`   Total lines: ${lines.length}`)
console.log(`   Expected: 36,431 (header + 36,430 apps)`)

// Parse header
const header = lines[0]
const headers = header.split('\t')
const expectedFields = headers.length

console.log(`\n📋 Header:`)
console.log(`   Fields: ${expectedFields}`)
console.log(`   Columns: ${headers.join(', ')}`)

// Validate each line
let validRows = 0
let invalidRows = 0
const invalidExamples: Array<{line: number, fields: number}> = []

for (let i = 1; i < lines.length; i++) {
  const line = lines[i]

  // Skip empty lines (like trailing newline)
  if (line.trim() === '') {
    continue
  }

  const fields = line.split('\t')

  if (fields.length === expectedFields) {
    validRows++
  } else {
    invalidRows++
    if (invalidExamples.length < 5) {
      invalidExamples.push({ line: i + 1, fields: fields.length })
    }
  }
}

console.log(`\n✅ Validation Results:`)
console.log(`   Valid rows: ${validRows.toLocaleString()}`)
console.log(`   Invalid rows: ${invalidRows.toLocaleString()}`)

if (invalidRows > 0) {
  console.log(`\n❌ Found ${invalidRows} rows with incorrect field count:`)
  invalidExamples.forEach(({ line, fields }) => {
    console.log(`   Line ${line}: ${fields} fields (expected ${expectedFields})`)
  })
  process.exit(1)
} else {
  console.log(`\n✅ All ${validRows.toLocaleString()} data rows have correct structure!`)

  if (validRows === 36430) {
    console.log('✅ Row count matches expected: 36,430 apps')
  } else {
    console.log(`⚠️  Row count mismatch: ${validRows} (expected 36,430)`)
  }
}

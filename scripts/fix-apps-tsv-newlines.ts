#!/usr/bin/env tsx
/**
 * Fix newline issues in Apps.tsv by properly escaping them
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')

console.log('🔧 Fixing newline issues in Apps.tsv\n')

const appsPath = resolve(DATA_DIR, 'Apps.tsv')
const content = readFileSync(appsPath, 'utf-8')

console.log('📊 Before fix:')
const linesBefore = content.split('\n')
console.log(`   Lines: ${linesBefore.length}`)
console.log(`   Expected: 36,431 (header + 36,430 apps)\n`)

// Split into header and rows
const [header, ...lines] = content.trim().split('\n')
console.log(`   Header: ${header.substring(0, 100)}...`)

// The problem: Some content fields have unescaped newlines
// Solution: Parse each row carefully, escape any unescaped newlines in content field

const headers = header.split('\t')
const contentIndex = headers.indexOf('content')

console.log(`   Content field is at index: ${contentIndex}`)
console.log(`\n🔄 Processing rows...`)

const fixedRows: string[] = []
let currentRow = ''
let inBrokenRow = false

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]

  // If we're continuing a broken row
  if (inBrokenRow) {
    // Append with escaped newline
    currentRow += '\\n' + line

    // Check if this completes the row (has the right number of tabs)
    const tabCount = currentRow.split('\t').length
    if (tabCount === headers.length) {
      fixedRows.push(currentRow)
      currentRow = ''
      inBrokenRow = false
    }
  } else {
    // Start a new row
    const tabCount = line.split('\t').length

    if (tabCount === headers.length) {
      // Complete row
      fixedRows.push(line)
    } else if (tabCount < headers.length) {
      // Broken row - starts here but continues
      currentRow = line
      inBrokenRow = true
    } else {
      // Too many tabs - this shouldn't happen
      console.log(`   ⚠️  Row ${i + 1} has too many tabs (${tabCount})`)
      fixedRows.push(line)
    }
  }

  if ((i + 1) % 5000 === 0) {
    console.log(`   Processed ${i + 1} lines, fixed ${fixedRows.length} rows`)
  }
}

// Handle any remaining broken row
if (inBrokenRow) {
  fixedRows.push(currentRow)
}

console.log(`\n✅ Processing complete:`)
console.log(`   Fixed rows: ${fixedRows.length}`)
console.log(`   Expected: 36,430`)

const fixed = [header, ...fixedRows].join('\n') + '\n'

writeFileSync(appsPath, fixed)

console.log(`\n📊 After fix:`)
const linesAfter = fixed.split('\n')
console.log(`   Lines in array: ${linesAfter.length}`)
console.log(`   Note: Trailing newline creates empty last element`)
console.log(`   Actual rows: ${linesAfter.filter(l => l.trim()).length}`)

// Validate structure
let validRows = 0
for (let i = 1; i < linesAfter.length; i++) {
  const line = linesAfter[i]
  if (line.trim() === '') continue
  const fields = line.split('\t')
  if (fields.length === headers.length) {
    validRows++
  }
}

if (validRows === 36430) {
  console.log('\n✅ Apps.tsv fixed successfully!')
  console.log(`   Header: 1 row`)
  console.log(`   Data: ${validRows.toLocaleString()} rows`)
  console.log(`   All rows have ${headers.length} fields`)
} else {
  console.log(`\n⚠️  Row count incorrect: ${validRows} (expected 36,430)`)
}

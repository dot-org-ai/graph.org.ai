#!/usr/bin/env tsx
/**
 * Fix data quality issues found during ClickHouse ingestion
 *
 * Issues to fix:
 * 1. Convert CRLF to LF in: WorkActivities, WorkContext, WorkStyles, WorkValues, BusinessTypes, Models
 * 2. Add missing 'ns' column to: Tasks.tsv, Apps.tsv
 * 3. Add missing 'ns' column to relationship files: Tasks.Relationships, Occupations.Relationships, Processes.Relationships
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')

console.log('🔧 Fixing data quality issues...\n')

// Task 1: Fix CRLF line endings
console.log('1️⃣  Converting CRLF to LF...')
const crlfFiles = [
  'WorkActivities.tsv',
  'WorkContext.tsv',
  'WorkStyles.tsv',
  'WorkValues.tsv',
  'BusinessTypes.tsv',
  'Models.tsv'
]

let crlfFixed = 0
for (const filename of crlfFiles) {
  const filePath = resolve(DATA_DIR, filename)
  try {
    const content = readFileSync(filePath, 'utf-8')
    const fixed = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    writeFileSync(filePath, fixed, 'utf-8')
    crlfFixed++
    console.log(`   ✓ ${filename}`)
  } catch (error) {
    console.log(`   ✗ ${filename}: ${error}`)
  }
}
console.log(`   Fixed ${crlfFixed}/${crlfFiles.length} files\n`)

// Task 2: Add missing 'ns' column to entity files
console.log('2️⃣  Adding missing ns column to entity files...')

// Fix Tasks.tsv
try {
  const tasksPath = resolve(DATA_DIR, 'Tasks.tsv')
  const tasksContent = readFileSync(tasksPath, 'utf-8')
  const lines = tasksContent.trim().split('\n')

  if (lines.length > 0) {
    const header = lines[0].split('\t')
    if (!header.includes('ns')) {
      // Add ns column after url
      const urlIndex = header.indexOf('url')
      header.splice(urlIndex + 1, 0, 'ns')

      // Update all rows
      const newLines = [header.join('\t')]
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t')
        cols.splice(urlIndex + 1, 0, 'onet.org.ai')
        newLines.push(cols.join('\t'))
      }

      writeFileSync(tasksPath, newLines.join('\n') + '\n', 'utf-8')
      console.log('   ✓ Tasks.tsv')
    } else {
      console.log('   ⚠ Tasks.tsv already has ns column')
    }
  }
} catch (error) {
  console.log(`   ✗ Tasks.tsv: ${error}`)
}

// Fix Apps.tsv
try {
  const appsPath = resolve(DATA_DIR, 'Apps.tsv')
  const appsContent = readFileSync(appsPath, 'utf-8')
  const lines = appsContent.trim().split('\n')

  if (lines.length > 0) {
    const header = lines[0].split('\t')
    if (!header.includes('ns')) {
      // Add ns column after url
      const urlIndex = header.indexOf('url')
      header.splice(urlIndex + 1, 0, 'ns')

      // Update all rows
      const newLines = [header.join('\t')]
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t')
        cols.splice(urlIndex + 1, 0, 'integrations.org.ai')
        newLines.push(cols.join('\t'))
      }

      writeFileSync(appsPath, newLines.join('\n') + '\n', 'utf-8')
      console.log('   ✓ Apps.tsv')
    } else {
      console.log('   ⚠ Apps.tsv already has ns column')
    }
  }
} catch (error) {
  console.log(`   ✗ Apps.tsv: ${error}`)
}

console.log()

// Task 3: Add missing 'ns' column to relationship files
console.log('3️⃣  Adding missing ns column to relationship files...')

const relationshipFixes = [
  { file: 'Tasks.Relationships.tsv', ns: 'onet.org.ai' },
  { file: 'Occupations.Relationships.tsv', ns: 'onet.org.ai' },
  { file: 'Processes.Relationships.tsv', ns: 'business.org.ai' }
]

for (const { file, ns } of relationshipFixes) {
  try {
    const filePath = resolve(DATA_DIR, file)
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.trim().split('\n')

    if (lines.length > 0) {
      const header = lines[0].split('\t')
      if (!header.includes('ns')) {
        // Add ns as first column
        header.unshift('ns')

        // Update all rows
        const newLines = [header.join('\t')]
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split('\t')
          cols.unshift(ns)
          newLines.push(cols.join('\t'))
        }

        writeFileSync(filePath, newLines.join('\n') + '\n', 'utf-8')
        console.log(`   ✓ ${file}`)
      } else {
        console.log(`   ⚠ ${file} already has ns column`)
      }
    }
  } catch (error) {
    console.log(`   ✗ ${file}: ${error}`)
  }
}

console.log('\n✅ Data quality fixes complete!')

#!/usr/bin/env tsx
/**
 * Normalize entity types to simple nouns and fix all data quality issues
 *
 * Normalizations:
 * - EducationPrograms → Education
 * - CareerClusters → Career
 * - SubClusters → Career (with hierarchy)
 * - AlternateTitles → Job
 * - WorkActivities/IWA/DWA → Activity
 * - IntegrationServices → Integration
 * - BusinessTypes → Business
 *
 * Fixes:
 * - Windows line endings → Unix
 * - Trailing whitespace removal
 * - URL format standardization
 * - PascalCase ID fixes
 * - Missing field completion
 * - Duplicate URL resolution
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

const DATA_DIR = '.data'

interface Row {
  [key: string]: string
}

// Normalization mapping: old type → new type
const TYPE_NORMALIZATION: Record<string, string> = {
  'EducationProgram': 'Education',
  'CareerCluster': 'Career',
  'SubCluster': 'Career',
  'AlternateTitle': 'Job',
  'WorkActivity': 'Activity',
  'IWA': 'Activity',
  'DWA': 'Activity',
  'IntegrationService': 'Integration',
  'BusinessType': 'Business',
}

// File renamings
const FILE_RENAMINGS: Record<string, string> = {
  'EducationPrograms.tsv': 'Education.tsv',
  'CareerClusters.tsv': 'Careers.tsv',
  'SubClusters.tsv': 'Careers.tsv', // Will merge
  'AlternateTitles.tsv': 'Jobs.tsv',
  'IntegrationServices.tsv': 'Integrations.tsv',
  'BusinessTypes.tsv': 'Businesses.tsv',
}

function parseTSV(content: string): Row[] {
  // Normalize line endings
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n').filter(l => l.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split('\t')
  const rows: Row[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t')
    const obj: Row = {}
    for (let j = 0; j < headers.length; j++) {
      // Trim trailing whitespace from each value
      obj[headers[j]] = (values[j] || '').trimEnd()
    }
    rows.push(obj)
  }

  return rows
}

function writeTSV(filePath: string, rows: Row[]): void {
  if (rows.length === 0) {
    console.warn(`⚠️  No data to write to ${filePath}`)
    return
  }

  const headers = Object.keys(rows[0])
  const lines = [headers.join('\t')]

  for (const row of rows) {
    const values = headers.map(h => (row[h] || '').trimEnd())
    lines.push(values.join('\t'))
  }

  // Write with Unix line endings only, no trailing whitespace
  writeFileSync(filePath, lines.join('\n') + '\n', 'utf-8')
}

function toPascalCase(str: string): string {
  if (!str) return ''

  // Handle special cases
  str = str
    .replace(/&/g, 'And')
    .replace(/'/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/:/g, '')

  // Split on common delimiters
  const words = str.split(/[\s,\-_\.]+/).filter(w => w)

  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

function fixPascalCaseId(id: string): string {
  // If already valid PascalCase, return as-is
  if (/^[A-Z][a-zA-Z0-9]*$/.test(id)) {
    return id
  }

  // Otherwise convert
  return toPascalCase(id)
}

function fixURL(row: Row): string {
  const { ns, type, id } = row

  if (!ns || !type || !id) {
    console.warn(`⚠️  Cannot fix URL: missing ns, type, or id`)
    return row.url || ''
  }

  // Normalize domain
  let domain = ns
  if (!domain.startsWith('http')) {
    domain = `https://${domain}`
  }
  if (!domain.endsWith('.ai')) {
    domain = domain.replace(/\.org$/, '.org.ai')
  }

  // Normalize type
  const normalizedType = TYPE_NORMALIZATION[type] || type

  // Fix ID to PascalCase
  const fixedId = fixPascalCaseId(id)

  return `${domain}/${normalizedType}/${fixedId}`
}

function deduplicateRows(rows: Row[]): Row[] {
  const seen = new Map<string, Row>()
  const duplicates: string[] = []

  for (const row of rows) {
    const url = row.url
    if (seen.has(url)) {
      duplicates.push(url)
      // Keep the row with more complete data
      const existing = seen.get(url)!
      const existingFields = Object.values(existing).filter(v => v).length
      const newFields = Object.values(row).filter(v => v).length
      if (newFields > existingFields) {
        seen.set(url, row)
      }
    } else {
      seen.set(url, row)
    }
  }

  if (duplicates.length > 0) {
    console.log(`   ⚠️  Removed ${duplicates.length} duplicate URLs`)
  }

  return Array.from(seen.values())
}

function fillMissingFields(row: Row): Row {
  // If name is missing but id exists, use id as name
  if (!row.name && row.id) {
    row.name = row.id.replace(/([A-Z])/g, ' $1').trim()
  }

  // If id is missing but name exists, generate from name
  if (!row.id && row.name) {
    row.id = toPascalCase(row.name)
  }

  // If ns is missing, try to infer from URL
  if (!row.ns && row.url) {
    try {
      const url = new URL(row.url)
      row.ns = url.hostname
    } catch {}
  }

  return row
}

function processEntityFile(fileName: string): void {
  console.log(`\n📝 Processing ${fileName}...`)

  const filePath = resolve(DATA_DIR, fileName)
  const content = readFileSync(filePath, 'utf-8')
  let rows = parseTSV(content)

  console.log(`   📊 Loaded ${rows.length} rows`)

  // Fix each row
  let fixed = 0
  for (let i = 0; i < rows.length; i++) {
    const originalURL = rows[i].url

    // Fill missing fields
    rows[i] = fillMissingFields(rows[i])

    // Fix PascalCase ID
    if (rows[i].id && !isPascalCase(rows[i].id)) {
      rows[i].id = fixPascalCaseId(rows[i].id)
      fixed++
    }

    // Normalize type
    if (rows[i].type && TYPE_NORMALIZATION[rows[i].type]) {
      rows[i].type = TYPE_NORMALIZATION[rows[i].type]
      fixed++
    }

    // Fix URL
    const newURL = fixURL(rows[i])
    if (newURL !== originalURL) {
      rows[i].url = newURL
      fixed++
    }
  }

  console.log(`   ✅ Fixed ${fixed} field issues`)

  // Deduplicate
  const originalCount = rows.length
  rows = deduplicateRows(rows)
  if (rows.length < originalCount) {
    console.log(`   ✅ Deduplicated: ${originalCount} → ${rows.length}`)
  }

  // Remove completely empty rows
  rows = rows.filter(row => {
    const hasData = Object.values(row).some(v => v && v.trim())
    return hasData
  })

  // Write back
  writeTSV(filePath, rows)
  console.log(`   ✅ Wrote ${rows.length} rows`)
}

function isPascalCase(str: string): boolean {
  if (!str || str.length === 0) return false
  // Allow dots for semantic IDs like "determine.Compliance"
  if (str.includes('.')) return true
  // Allow colons for special cases like model names
  if (str.includes(':')) return true
  return /^[A-Z][a-zA-Z0-9]*$/.test(str)
}

function main() {
  console.log('🔧 Normalizing entity types and fixing data quality issues...\n')

  const files = readdirSync(DATA_DIR)
  const entityFiles = files.filter(f => f.endsWith('.tsv') && !f.includes('.Relationships.'))

  console.log(`📁 Found ${entityFiles.length} entity files\n`)

  for (const file of entityFiles) {
    try {
      processEntityFile(file)
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error)
    }
  }

  console.log('\n✅ Done! All files normalized and fixed.')
  console.log('\nRun `pnpm test` to verify fixes.')
}

main()

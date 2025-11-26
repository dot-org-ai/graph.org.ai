#!/usr/bin/env tsx
/**
 * Normalize entity types and fix all data quality issues using domain ontology
 *
 * Features:
 * - Loads domain ontology from .enrichment/domain-ontology.tsv
 * - Updates all URLs to use canonical domains
 * - Preserves semantic dots in IDs (e.g., "create.Contact", "Contact.created")
 * - Fixes Action IDs from Noun.verb to verb.Noun format
 * - Updates namespace fields to canonical domains
 * - Implements proper URL format based on whether type is in hostname
 *
 * Type Normalizations:
 * - EducationPrograms → Education
 * - CareerClusters → Career
 * - SubClusters → Career (with hierarchy)
 * - AlternateTitles → Job
 * - WorkActivities/IWA/DWA → Activity
 * - IntegrationServices → Integration
 * - BusinessTypes → Business
 *
 * Data Quality Fixes:
 * - Windows line endings → Unix
 * - Trailing whitespace removal
 * - PascalCase ID fixes (preserving semantic dots)
 * - Missing field completion
 * - Duplicate URL resolution
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

const DATA_DIR = '.data'
const ONTOLOGY_FILE = '.enrichment/domain-ontology.tsv'

interface Row {
  [key: string]: string
}

interface OntologyRow {
  type: string
  canonicalDomain: string
  aliasDomains: string
  notes: string
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

function loadOntology(): Map<string, OntologyRow> {
  const content = readFileSync(ONTOLOGY_FILE, 'utf-8')
  const rows = parseTSV(content) as any[]

  const ontologyMap = new Map<string, OntologyRow>()
  rows.forEach(row => {
    if (row.type) {
      ontologyMap.set(row.type, {
        type: row.type,
        canonicalDomain: row.canonicalDomain,
        aliasDomains: row.aliasDomains || '',
        notes: row.notes || ''
      })
    }
  })

  return ontologyMap
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
  // Preserve semantic IDs with dots (like "create.Contact" or "Contact.created")
  if (id.includes('.')) {
    return id
  }

  // Preserve IDs with special characters (model names with colons, etc.)
  if (id.includes(':')) {
    return id
  }

  // If already valid PascalCase, return as-is
  if (/^[A-Z][a-zA-Z0-9]*$/.test(id)) {
    return id
  }

  // Otherwise convert
  return toPascalCase(id)
}

function fixURL(row: Row, ontologyMap: Map<string, OntologyRow>): string {
  const { type, id } = row

  if (!type || !id) {
    console.warn(`⚠️  Cannot fix URL: missing type or id`)
    return row.url || ''
  }

  // Normalize type
  const normalizedType = TYPE_NORMALIZATION[type] || type

  // Get ontology info for this type
  const ontology = ontologyMap.get(normalizedType)
  if (!ontology) {
    console.warn(`⚠️  No ontology mapping for type: ${normalizedType}`)
    // Fallback to old behavior
    return row.url || ''
  }

  const canonicalDomain = ontology.canonicalDomain

  // Preserve semantic dots in ID (e.g., "create.Contact", "Contact.created")
  const fixedId = fixPascalCaseId(id)

  // Check if type is in the hostname (singular or plural)
  const subdomain = canonicalDomain.split('.')[0].toLowerCase()
  const typeLower = normalizedType.toLowerCase()
  const typePlural = typeLower + 's'
  const typeSingular = typeLower.replace(/s$/, '')

  const typeInHostname = subdomain === typeLower ||
                         subdomain === typePlural ||
                         subdomain === typeSingular

  if (typeInHostname) {
    // When type IS in hostname: https://[type].org.ai/{Id}
    return `https://${canonicalDomain}/${fixedId}`
  } else {
    // When type is NOT in hostname: https://{domain}/{Type}/{Id}
    return `https://${canonicalDomain}/${normalizedType}/${fixedId}`
  }
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

function processEntityFile(fileName: string, ontologyMap: Map<string, OntologyRow>): void {
  console.log(`\n📝 Processing ${fileName}...`)

  const filePath = resolve(DATA_DIR, fileName)
  const content = readFileSync(filePath, 'utf-8')
  let rows = parseTSV(content)

  console.log(`   📊 Loaded ${rows.length} rows`)

  // Fix each row
  let fixed = 0
  for (let i = 0; i < rows.length; i++) {
    const originalURL = rows[i].url
    const originalNS = rows[i].ns
    const originalID = rows[i].id

    // Fill missing fields
    rows[i] = fillMissingFields(rows[i])

    // Special handling for Actions: swap from Noun.verb to verb.Noun
    if (rows[i].type === 'Action' && rows[i].id && rows[i].id.includes('.')) {
      const parts = rows[i].id.split('.')
      if (parts.length === 2) {
        // Swap: "Contact.create" → "create.Contact"
        rows[i].id = `${parts[1]}.${parts[0]}`
        if (originalID !== rows[i].id) {
          fixed++
        }
      }
    }

    // Fix PascalCase ID (preserves semantic dots)
    if (rows[i].id && !isPascalCase(rows[i].id)) {
      rows[i].id = fixPascalCaseId(rows[i].id)
      fixed++
    }

    // Normalize type
    if (rows[i].type && TYPE_NORMALIZATION[rows[i].type]) {
      rows[i].type = TYPE_NORMALIZATION[rows[i].type]
      fixed++
    }

    // Update namespace to canonical domain
    const normalizedType = TYPE_NORMALIZATION[rows[i].type] || rows[i].type
    const ontology = ontologyMap.get(normalizedType)
    if (ontology && ontology.canonicalDomain) {
      rows[i].ns = ontology.canonicalDomain
      if (originalNS !== ontology.canonicalDomain) {
        fixed++
      }
    }

    // Fix URL using ontology
    const newURL = fixURL(rows[i], ontologyMap)
    if (newURL && newURL !== originalURL) {
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

  // Load domain ontology
  console.log('📚 Loading domain ontology...')
  const ontologyMap = loadOntology()
  console.log(`   ✅ Loaded ${ontologyMap.size} type mappings\n`)

  const files = readdirSync(DATA_DIR)
  const entityFiles = files.filter(f => f.endsWith('.tsv') && !f.includes('.Relationships.'))

  console.log(`📁 Found ${entityFiles.length} entity files\n`)

  for (const file of entityFiles) {
    try {
      processEntityFile(file, ontologyMap)
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error)
    }
  }

  console.log('\n✅ Done! All files normalized and fixed.')
  console.log('\nRun `pnpm test` to verify fixes.')
}

main()

#!/usr/bin/env tsx
/**
 * Generate unified Services.tsv file combining:
 * - UNSPSC services (segments 70000000-95000000)
 * - NAPCS services (all)
 * - Note: GS1 GPC is primarily products, not services
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')
const SOURCE_DIR = resolve(__dirname, '../.source')

interface Service {
  ns: string
  type: string
  id: string
  code: string
  name: string
  description: string
  source: string
  level: string
  segment?: string
  segmentCode?: string
  family?: string
  familyCode?: string
  class?: string
  classCode?: string
  parent?: string
  hierarchy?: string
}

/**
 * Convert text to Wikipedia_Style_Names ID
 * - 1-3 words: PascalCase (e.g., "LiveAnimals", "SoybeanFarming")
 * - 4+ words: Wikipedia_Style (e.g., "Diagnosis_of_Cholera_Due_to_Vibrio_Cholerae")
 */
function toWikipediaStyleId(text: string): string {
  if (!text) return ''

  // Clean and normalize
  const cleaned = text
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, ' ')     // Normalize spaces
    .trim()

  // Split into words
  const words = cleaned.split(/[\s_-]+/).filter(w => w.length > 0)

  if (words.length === 0) return ''

  // Capitalize each word
  const capitalizedWords = words.map(w =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  )

  // PascalCase for 1-3 words, Wikipedia_Style for 4+
  if (words.length <= 3) {
    return capitalizedWords.join('')
  } else {
    return capitalizedWords.join('_')
  }
}

function generateServiceId(name: string, code: string): string {
  const id = toWikipediaStyleId(name)
  // If name is too generic or empty, append code
  if (!id || id.length < 3) {
    return toWikipediaStyleId(name + ' ' + code)
  }
  return id
}

console.log('🔧 Generating unified Services.tsv file\n')

// 1. Extract UNSPSC services (segments 70-95)
console.log('1️⃣  Extracting UNSPSC services (segments 70-95)...')
const unspscPath = resolve(SOURCE_DIR, 'UNSPSC/UNSPSC.Codes.tsv')
const unspscContent = readFileSync(unspscPath, 'utf-8')
const unspscLines = unspscContent.split('\n').filter(l => l.trim())
const unspscHeaders = unspscLines[0].split('\t')

const unspscServices: Service[] = []

for (let i = 1; i < unspscLines.length; i++) {
  const values = unspscLines[i].split('\t')
  const segmentCode = values[0]
  const commodityCode = values[6]

  // Only include segments 70-95 (services)
  if (!segmentCode || !segmentCode.match(/^(7[0-9]|8[0-9]|9[0-5])/)) {
    continue
  }

  // Only include commodities (not segment/family/class headers)
  if (!commodityCode || commodityCode.length < 8) {
    continue
  }

  const name = values[7] || ''
  const description = values[8] || ''

  if (!name) continue

  const id = generateServiceId(name, commodityCode)

  unspscServices.push({
    ns: 'unspsc.org.ai',
    type: 'Service',
    id,
    code: commodityCode,
    name,
    description,
    source: 'UNSPSC',
    level: 'commodity',
    segment: values[1] || '',
    segmentCode: segmentCode,
    family: values[3] || '',
    familyCode: values[2] || '',
    class: values[5] || '',
    classCode: values[4] || '',
  })
}

console.log(`   ✓ Extracted ${unspscServices.length.toLocaleString()} UNSPSC services\n`)

// 2. Read NAPCS services (from main generate-data.ts output)
console.log('2️⃣  Reading NAPCS services...')
const napcsPath = resolve(DATA_DIR, 'Services.tsv')
const napcsContent = readFileSync(napcsPath, 'utf-8')
const napcsLines = napcsContent.split('\n').filter(l => l.trim())
const napcsHeaders = napcsLines[0].split('\t')

const napcsServices: Service[] = []

for (let i = 1; i < napcsLines.length; i++) {
  const values = napcsLines[i].split('\t')
  const obj: any = {}

  for (let j = 0; j < napcsHeaders.length; j++) {
    obj[napcsHeaders[j]] = values[j] || ''
  }

  if (obj.id && obj.id !== 'id') {
    napcsServices.push({
      ns: obj.ns,
      type: obj.type,
      id: obj.id,
      code: obj.code,
      name: obj.name,
      description: obj.description,
      source: 'NAPCS',
      level: obj.level || '',
      parent: obj.parent || '',
      hierarchy: obj.hierarchy || '',
    })
  }
}

console.log(`   ✓ Read ${napcsServices.length.toLocaleString()} NAPCS services\n`)

// 3. Combine all services
console.log('3️⃣  Combining services...')
const allServices: Service[] = [...unspscServices, ...napcsServices]

// Deduplicate by ID (prefer NAPCS for duplicates)
const serviceMap = new Map<string, Service>()

// Add UNSPSC first
for (const service of unspscServices) {
  serviceMap.set(service.id, service)
}

// Add NAPCS (will override UNSPSC if same ID)
for (const service of napcsServices) {
  serviceMap.set(service.id, service)
}

const uniqueServices = Array.from(serviceMap.values())

console.log(`   ✓ Combined ${uniqueServices.length.toLocaleString()} unique services\n`)

// 4. Sort by source, then by code
uniqueServices.sort((a, b) => {
  if (a.source !== b.source) {
    return a.source.localeCompare(b.source)
  }
  return a.code.localeCompare(b.code)
})

// 5. Write to Services.tsv
console.log('4️⃣  Writing Services.tsv...')

// Determine all columns needed
const allColumns = new Set<string>()
uniqueServices.forEach(service => {
  Object.keys(service).forEach(key => allColumns.add(key))
})

// Standard columns first (no url - computed at runtime from ns + id)
const headers = [
  'ns',
  'type',
  'id',
  'code',
  'name',
  'description',
  'source',
  'level',
  'segment',
  'segmentCode',
  'family',
  'familyCode',
  'class',
  'classCode',
  'parent',
  'hierarchy',
]

const output = [headers.join('\t')]

for (const service of uniqueServices) {
  const row = headers.map(header => {
    const value = service[header as keyof Service]
    return value !== undefined ? value : ''
  })
  output.push(row.join('\t'))
}

const outputPath = resolve(DATA_DIR, 'Services.tsv')
writeFileSync(outputPath, output.join('\n') + '\n')

console.log(`   ✓ Wrote ${outputPath}\n`)

// Summary
console.log('=' .repeat(60))
console.log('📊 Summary')
console.log('='.repeat(60))
console.log(`UNSPSC services: ${unspscServices.length.toLocaleString()}`)
console.log(`NAPCS services: ${napcsServices.length.toLocaleString()}`)
console.log(`Total unique services: ${uniqueServices.length.toLocaleString()}`)
console.log('='.repeat(60))
console.log('\n✅ Services.tsv generation complete!')

#!/usr/bin/env tsx
/**
 * Separate UNSPSC/GPC services from Products.tsv
 *
 * UNSPSC and GPC contain both products AND services, but they're currently
 * all in Products.tsv. This script:
 * 1. Reads Products.tsv
 * 2. Classifies entries as products vs services
 * 3. Creates UNSPSC-Services.tsv for services
 * 4. Updates Products.tsv to only contain products
 */

import { readFileSync, writeFileSync } from 'fs'

interface Entry {
  url: string
  ns: string
  type: string
  id: string
  code: string
  unspsc: string
  gpc: string
  napcs: string
  name: string
  description: string
  source: string
  segment: string
  segmentCode: string
  family: string
  familyCode: string
  class: string
  classCode: string
  rawLine: string
}

/**
 * UNSPSC Service Segment Codes
 * Source: https://www.unspsc.org/
 */
const UNSPSC_SERVICE_SEGMENTS = new Set([
  '70', // Farming and Fishing and Forestry and Wildlife Contracting Services
  '71', // Mining and oil and gas services
  '72', // Building and Construction and Maintenance Services
  '73', // Industrial Production and Manufacturing Services
  '76', // Industrial Cleaning Services
  '77', // Environmental Services
  '78', // Transportation and Storage and Mail Services
  '80', // Management and Business Professionals and Administrative Services
  '81', // Engineering and Research and Technology Based Services
  '82', // Editorial and Design and Graphic and Fine Art Services
  '83', // Public Utilities and Public Sector Related Services
  '84', // Financial and Insurance Services
  '85', // Healthcare Services
  '86', // Education and Training Services
  '90', // Travel and Food and Lodging and Entertainment Services
  '91', // Personal and Domestic Services
  '92', // National Defense and Public Order and Security and Safety Services
  '93', // Politics and Civic Affairs Services
  '94', // Organizations and Clubs
])

/**
 * Classify entry as product or service
 */
function classifyEntry(entry: Entry): 'service' | 'product' | 'ambiguous' {
  // Strategy 1: UNSPSC code-based classification
  if (entry.unspsc || entry.code) {
    const code = entry.unspsc || entry.code
    const segmentCode = code.substring(0, 2)

    if (UNSPSC_SERVICE_SEGMENTS.has(segmentCode)) {
      return 'service'
    }

    // Codes 01-69 are generally products
    const segmentNum = parseInt(segmentCode, 10)
    if (segmentNum >= 1 && segmentNum <= 69) {
      return 'product'
    }
  }

  // Strategy 2: Name-based heuristics
  const nameLower = entry.name.toLowerCase()

  // Strong service indicators
  const strongServicePatterns = [
    /\bservices?\b/,
    /\bconsulting\b/,
    /\btraining\b/,
    /\beducation\b/,
    /\bmaintenance\b/,
    /\brepair\b/,
    /\binstallation\b/,
    /\btransportation\b/,
    /\bdelivery\b/,
    /\bwarehousing\b/,
    /\bstorage\b/,
    /\bmanagement\b/,
    /\badministration\b/,
    /\badvisory\b/,
    /\binspection\b/,
    /\btesting\b/,
    /\bprocessing\b/,
    /\bdesign\b/,
    /\bengineering\b/,
    /\blicensing\b/,
    /\bsubscription\b/,
    /\bacquisition\sservices?/,
    /\bdata\sprocessing/,
  ]

  for (const pattern of strongServicePatterns) {
    if (pattern.test(nameLower)) {
      return 'service'
    }
  }

  // Strategy 3: Description-based heuristics
  const descLower = (entry.description || '').toLowerCase()

  const serviceDescPatterns = [
    /services?\sto\s/,
    /provides?\s.*\sservices?/,
    /offers?\s.*\sservices?/,
    /includes?\s.*\sservices?/,
  ]

  for (const pattern of serviceDescPatterns) {
    if (pattern.test(descLower)) {
      return 'service'
    }
  }

  // Default: if it has UNSPSC code < 70, it's likely a product
  if (entry.unspsc || entry.code) {
    const code = entry.unspsc || entry.code
    const segmentNum = parseInt(code.substring(0, 2), 10)
    if (segmentNum < 70) {
      return 'product'
    }
  }

  // If we can't determine, mark as ambiguous
  return 'ambiguous'
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 SEPARATING UNSPSC/GPC SERVICES FROM PRODUCTS\n')
  console.log('='.repeat(100) + '\n')

  // Read Products.tsv
  console.log('📖 Reading Products.tsv...')
  const productsPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Products.tsv'
  const productsContent = readFileSync(productsPath, 'utf-8')
  const productsLines = productsContent.trim().split('\n')
  const headers = productsLines[0]

  const entries: Entry[] = productsLines.slice(1).map(line => {
    const fields = line.split('\t')
    return {
      url: fields[0] || '',
      ns: fields[1] || '',
      type: fields[2] || '',
      id: fields[3] || '',
      code: fields[4] || '',
      unspsc: fields[5] || '',
      gpc: fields[6] || '',
      napcs: fields[7] || '',
      name: fields[8] || '',
      description: fields[9] || '',
      source: fields[10] || '',
      segment: fields[11] || '',
      segmentCode: fields[12] || '',
      family: fields[13] || '',
      familyCode: fields[14] || '',
      class: fields[15] || '',
      classCode: fields[16] || '',
      rawLine: line
    }
  })

  console.log(`  Loaded ${entries.length.toLocaleString()} entries\n`)

  // Classify entries
  console.log('🔍 Classifying entries as products vs services...')
  const services: Entry[] = []
  const products: Entry[] = []
  const ambiguous: Entry[] = []

  for (const entry of entries) {
    const classification = classifyEntry(entry)

    if (classification === 'service') {
      services.push(entry)
    } else if (classification === 'product') {
      products.push(entry)
    } else {
      ambiguous.push(entry)
    }
  }

  console.log(`  Services: ${services.length.toLocaleString()}`)
  console.log(`  Products: ${products.length.toLocaleString()}`)
  console.log(`  Ambiguous: ${ambiguous.length.toLocaleString()}\n`)

  // Show classification breakdown by segment
  console.log('📊 CLASSIFICATION BY UNSPSC SEGMENT\n')

  const bySegment = new Map<string, { services: number; products: number; ambiguous: number }>()

  for (const entry of entries) {
    const code = entry.unspsc || entry.code
    const segmentCode = code ? code.substring(0, 2) : 'unknown'

    if (!bySegment.has(segmentCode)) {
      bySegment.set(segmentCode, { services: 0, products: 0, ambiguous: 0 })
    }

    const classification = classifyEntry(entry)
    const stats = bySegment.get(segmentCode)!

    if (classification === 'service') {
      stats.services++
    } else if (classification === 'product') {
      stats.products++
    } else {
      stats.ambiguous++
    }
  }

  // Show top segments
  const sortedSegments = Array.from(bySegment.entries())
    .sort((a, b) => (b[1].services + b[1].products + b[1].ambiguous) - (a[1].services + a[1].products + a[1].ambiguous))
    .slice(0, 20)

  console.log('Top 20 Segments:')
  console.log('Segment | Services | Products | Ambiguous | Total')
  console.log('-'.repeat(60))

  for (const [segment, stats] of sortedSegments) {
    const total = stats.services + stats.products + stats.ambiguous
    const isServiceSegment = UNSPSC_SERVICE_SEGMENTS.has(segment) ? '*' : ' '
    console.log(`  ${segment}${isServiceSegment}   | ${stats.services.toLocaleString().padStart(8)} | ${stats.products.toLocaleString().padStart(8)} | ${stats.ambiguous.toLocaleString().padStart(9)} | ${total.toLocaleString().padStart(8)}`)
  }
  console.log('\n* = Designated service segment in UNSPSC\n')

  // Show example services
  console.log('📋 EXAMPLE SERVICES FOUND\n')
  const exampleServices = services.slice(0, 20)
  for (const service of exampleServices) {
    console.log(`${service.name}`)
    console.log(`  Code: ${service.code || service.unspsc}`)
    console.log(`  URL: ${service.url}`)
    console.log()
  }

  // Save UNSPSC-Services.tsv
  console.log('💾 Saving UNSPSC-Services.tsv...')
  const servicesPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/UNSPSC-Services.tsv'
  const servicesLines = [headers]

  for (const service of services) {
    servicesLines.push(service.rawLine)
  }

  writeFileSync(servicesPath, servicesLines.join('\n'))
  console.log(`  Saved ${services.length.toLocaleString()} services to: ${servicesPath}\n`)

  // Save updated Products.tsv (products only)
  console.log('💾 Saving updated Products.tsv (products only)...')
  const productsOnlyPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Products.tsv'
  const productsOnlyLines = [headers]

  for (const product of products) {
    productsOnlyLines.push(product.rawLine)
  }

  writeFileSync(productsOnlyPath, productsOnlyLines.join('\n'))
  console.log(`  Saved ${products.length.toLocaleString()} products to: ${productsOnlyPath}\n`)

  // Save ambiguous entries for review
  console.log('💾 Saving UNSPSC-Ambiguous.tsv...')
  const ambiguousPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/UNSPSC-Ambiguous.tsv'
  const ambiguousLines = [headers]

  for (const entry of ambiguous) {
    ambiguousLines.push(entry.rawLine)
  }

  writeFileSync(ambiguousPath, ambiguousLines.join('\n'))
  console.log(`  Saved ${ambiguous.length.toLocaleString()} ambiguous entries to: ${ambiguousPath}\n`)

  // Summary
  console.log('✅ SEPARATION COMPLETE\n')
  console.log('Results:')
  console.log(`  UNSPSC-Services.tsv: ${services.length.toLocaleString()} services`)
  console.log(`  Products.tsv: ${products.length.toLocaleString()} products`)
  console.log(`  UNSPSC-Ambiguous.tsv: ${ambiguous.length.toLocaleString()} ambiguous entries\n`)

  const servicePct = ((services.length / entries.length) * 100).toFixed(1)
  const productPct = ((products.length / entries.length) * 100).toFixed(1)

  console.log(`Service rate: ${servicePct}%`)
  console.log(`Product rate: ${productPct}%\n`)
}

main()

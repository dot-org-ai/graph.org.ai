#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Normalize Products and Services across all standards:
 * - Merge UNSPSC, GS1, and NAPCS into unified Products.tsv and Services.tsv
 * - Use Wikipedia-style names (not codes) in IDs and URLs
 * - Store standard codes separately
 * - Create Products.Standards.tsv and Services.Standards.tsv relationships
 */

function toWikipediaStyle(text: string): string {
  // Clean up the text for Wikipedia-style naming
  let cleaned = text.trim()

  // Normalize European number formatting: 2,5G → 2.5G
  cleaned = cleaned.replace(/(\d),(\d)/g, '$1.$2')

  // Remove list commas and extra punctuation (but keep hyphens and periods in valid contexts)
  cleaned = cleaned.replace(/,\s*/g, ' ')  // Replace commas with spaces

  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  // Replace spaces with underscores
  cleaned = cleaned.replace(/\s+/g, '_')

  // Remove any remaining problematic characters but keep: letters, numbers, underscores, hyphens, periods, parentheses
  cleaned = cleaned.replace(/[^\w\-.()\u00C0-\u024F\u1E00-\u1EFF]/g, '')

  return cleaned
}

// Expand names with "or" and "and" into multiple variants
function expandEntityTypes(text: string): string[] {
  if (!text) return []

  // Check for "X or Y" patterns and expand them
  const orPattern = /^(.+?)\s+or\s+(.+)$/i
  const orMatch = text.match(orPattern)

  if (orMatch) {
    const [, left, right] = orMatch

    // Handle patterns like "via natural or artificial opening"
    // Need to find the common prefix/suffix
    const leftWords = left.trim().split(/\s+/)
    const rightWords = right.trim().split(/\s+/)

    // If left has more words, it likely has the prefix
    // e.g., "via natural" vs "artificial opening"
    const prefix = leftWords.slice(0, -1).join(' ')
    const leftTerm = leftWords[leftWords.length - 1]

    // Check if right has a suffix that should be shared
    const rightTerm = rightWords[0]
    const suffix = rightWords.slice(1).join(' ')

    if (prefix && suffix) {
      // Pattern: "prefix natural or artificial suffix"
      return [
        `${prefix} ${leftTerm} ${suffix}`,
        `${prefix} ${rightTerm} ${suffix}`
      ]
    } else if (prefix) {
      // Pattern: "prefix natural or artificial"
      return [
        `${prefix} ${leftTerm}`,
        `${prefix} ${rightTerm}`
      ]
    } else {
      // Simple "X or Y"
      return [left.trim(), right.trim()]
    }
  }

  // Check for "X and Y" patterns - might want to keep these together or expand
  // For now, keep them as-is (single entity)

  return [text]
}

async function normalizeProducts() {
  console.log('\n📦 Normalizing Products across all standards...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  const productMap = new Map<string, {
    id: string
    name: string
    description: string
    codes: Set<string>
    standards: Set<string>
  }>()

  const relationships: Array<{
    productId: string
    standardCode: string
    standard: string
  }> = []

  // Read UNSPSC Commodities
  const unspscPath = path.join(dataDir, 'UNSPSC.Commodities.tsv')
  if (fs.existsSync(unspscPath)) {
    const content = fs.readFileSync(unspscPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')
    const idIdx = headers.indexOf('id')
    const nameIdx = headers.indexOf('name')
    const descIdx = headers.indexOf('description')
    const codeIdx = headers.indexOf('code')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const cols = line.split('\t')
      const name = cols[nameIdx]
      const description = cols[descIdx] || ''
      const code = cols[codeIdx]

      if (!name) continue

      // Expand product names (e.g., "natural or artificial" → 2 products)
      const expandedNames = expandEntityTypes(name)

      for (const expandedName of expandedNames) {
        const id = toWikipediaStyle(expandedName)

        if (!productMap.has(id)) {
          productMap.set(id, {
            id,
            name: expandedName,
            description,
            codes: new Set(),
            standards: new Set()
          })
        }

        const product = productMap.get(id)!
        product.codes.add(code)
        product.standards.add('UNSPSC')

        relationships.push({
          productId: id,
          standardCode: code,
          standard: 'UNSPSC'
        })
      }
    }
  }

  console.log(`  Loaded ${productMap.size} products from UNSPSC`)

  // Read GS1 Bricks
  const gs1Path = path.join(dataDir, 'GS1.Bricks.tsv')
  if (fs.existsSync(gs1Path)) {
    const content = fs.readFileSync(gs1Path, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')
    const nameIdx = headers.indexOf('name')
    const descIdx = headers.indexOf('description')
    const codeIdx = headers.indexOf('code')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const cols = line.split('\t')
      const name = cols[nameIdx]
      const description = cols[descIdx] || ''
      const code = cols[codeIdx]

      if (!name) continue

      // Expand product names (e.g., "natural or artificial" → 2 products)
      const expandedNames = expandEntityTypes(name)

      for (const expandedName of expandedNames) {
        const id = toWikipediaStyle(expandedName)

        if (!productMap.has(id)) {
          productMap.set(id, {
            id,
            name: expandedName,
            description,
            codes: new Set(),
            standards: new Set()
          })
        }

        const product = productMap.get(id)!
        product.codes.add(code)
        product.standards.add('GS1')
        if (description && !product.description) {
          product.description = description
        }

        relationships.push({
          productId: id,
          standardCode: code,
          standard: 'GS1'
        })
      }
    }
  }

  console.log(`  Total ${productMap.size} unique products after GS1`)

  // Write normalized Products.tsv in full MDX format
  const products = Array.from(productMap.values()).sort((a, b) => a.id.localeCompare(b.id))

  const productsPath = path.join(dataDir, 'Products.tsv')
  const productsHeaders = ['url', 'ns', 'type', 'id', 'name', 'description', 'code', 'sourceUrl']
  const productsRows = products.map(p => {
    const url = `https://products.org.ai/${p.id}`
    const ns = 'products.org.ai'
    const type = 'Product'
    const code = Array.from(p.codes).join(',')
    const sourceUrl = ''
    return `${url}\t${ns}\t${type}\t${p.id}\t${p.name}\t${p.description}\t${code}\t${sourceUrl}`
  })

  fs.writeFileSync(productsPath, productsHeaders.join('\t') + '\n' + productsRows.join('\n'))
  console.log(`  ✓ Products.tsv (${products.length} normalized products)`)

  // Write Products.Standards.tsv
  relationships.sort((a, b) => {
    const cmp = a.productId.localeCompare(b.productId)
    if (cmp !== 0) return cmp
    return a.standardCode.localeCompare(b.standardCode)
  })

  const relPath = path.join(dataDir, 'Products.Standards.tsv')
  const relHeaders = ['productId', 'standardCode', 'standard']
  const relRows = relationships.map(r =>
    `${r.productId}\t${r.standardCode}\t${r.standard}`
  )

  fs.writeFileSync(relPath, relHeaders.join('\t') + '\n' + relRows.join('\n'))
  console.log(`  ✓ Products.Standards.tsv (${relationships.length} relationships)`)
}

async function normalizeServices() {
  console.log('\n🔧 Normalizing Services across all standards...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  const serviceMap = new Map<string, {
    id: string
    name: string
    description: string
    codes: Set<string>
    standards: Set<string>
  }>()

  const relationships: Array<{
    serviceId: string
    standardCode: string
    standard: string
  }> = []

  // Read NAPCS Details (services)
  const napcsPath = path.join(dataDir, 'NAPCS.Details.tsv')
  if (fs.existsSync(napcsPath)) {
    const content = fs.readFileSync(napcsPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')
    const nameIdx = headers.indexOf('name')
    const descIdx = headers.indexOf('description')
    const codeIdx = headers.indexOf('code')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const cols = line.split('\t')
      const name = cols[nameIdx]
      const description = cols[descIdx] || ''
      const code = cols[codeIdx]

      if (!name) continue

      const id = toWikipediaStyle(name)

      if (!serviceMap.has(id)) {
        serviceMap.set(id, {
          id,
          name,
          description,
          codes: new Set(),
          standards: new Set()
        })
      }

      const service = serviceMap.get(id)!
      service.codes.add(code)
      service.standards.add('NAPCS')

      relationships.push({
        serviceId: id,
        standardCode: code,
        standard: 'NAPCS'
      })
    }
  }

  console.log(`  Loaded ${serviceMap.size} services from NAPCS`)

  // Write normalized Services.tsv in full MDX format
  const services = Array.from(serviceMap.values()).sort((a, b) => a.id.localeCompare(b.id))

  const servicesPath = path.join(dataDir, 'Services.tsv')
  const servicesHeaders = ['url', 'ns', 'type', 'id', 'name', 'description', 'code', 'sourceUrl']
  const servicesRows = services.map(s => {
    const url = `https://services.org.ai/${s.id}`
    const ns = 'services.org.ai'
    const type = 'Service'
    const code = Array.from(s.codes).join(',')
    const sourceUrl = ''
    return `${url}\t${ns}\t${type}\t${s.id}\t${s.name}\t${s.description}\t${code}\t${sourceUrl}`
  })

  fs.writeFileSync(servicesPath, servicesHeaders.join('\t') + '\n' + servicesRows.join('\n'))
  console.log(`  ✓ Services.tsv (${services.length} normalized services)`)

  // Write Services.Standards.tsv
  relationships.sort((a, b) => {
    const cmp = a.serviceId.localeCompare(b.serviceId)
    if (cmp !== 0) return cmp
    return a.standardCode.localeCompare(b.standardCode)
  })

  const relPath = path.join(dataDir, 'Services.Standards.tsv')
  const relHeaders = ['serviceId', 'standardCode', 'standard']
  const relRows = relationships.map(r =>
    `${r.serviceId}\t${r.standardCode}\t${r.standard}`
  )

  fs.writeFileSync(relPath, relHeaders.join('\t') + '\n' + relRows.join('\n'))
  console.log(`  ✓ Services.Standards.tsv (${relationships.length} relationships)`)
}

async function main() {
  console.log('='.repeat(100))
  console.log('NORMALIZE PRODUCTS & SERVICES')
  console.log('='.repeat(100))

  await normalizeProducts()
  await normalizeServices()

  console.log('\n' + '='.repeat(100))
  console.log('✅ Products and Services normalized!')
  console.log('='.repeat(100))
}

main().catch(console.error)

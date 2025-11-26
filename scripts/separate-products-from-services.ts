#!/usr/bin/env tsx
/**
 * Separate products from services in Services.tsv
 *
 * Many entries in Services.tsv are actually products (physical goods):
 * - Live animals (cattle, hogs, poultry)
 * - Agricultural products (wheat, corn, fruit)
 * - Raw materials (oil, coal, minerals)
 *
 * This script:
 * 1. Identifies products vs services using multiple heuristics
 * 2. Separates them into distinct files
 * 3. Validates the separation
 */

import { readFileSync, writeFileSync } from 'fs'

interface ServiceRecord {
  url: string
  ns: string
  type: string
  id: string
  code: string
  name: string
  description: string
  rawLine: string
}

// Product indicators - things that are typically physical goods
const PRODUCT_INDICATORS = {
  // Agricultural/livestock
  animals: ['cattle', 'calves', 'hogs', 'pigs', 'poultry', 'chickens', 'turkeys', 'sheep', 'lambs', 'goats', 'livestock', 'pets', 'fish', 'bees'],
  crops: ['wheat', 'corn', 'grain', 'rice', 'barley', 'oats', 'soybeans', 'cotton'],
  produce: ['fruit', 'vegetables', 'nuts', 'berries', 'melons'],

  // Raw materials
  minerals: ['coal', 'oil', 'gas', 'ore', 'minerals', 'metals', 'gold', 'silver', 'copper'],
  materials: ['lumber', 'wood', 'logs', 'timber', 'pulpwood'],

  // Products
  goods: ['products', 'goods', 'merchandise', 'commodities', 'materials', 'supplies'],

  // Manufacturing outputs
  manufactured: ['equipment', 'machinery', 'vehicles', 'appliances', 'furniture', 'clothing', 'textiles']
}

// Service indicators - activities and intangible offerings
const SERVICE_INDICATORS = {
  activities: ['services', 'service', 'maintenance', 'repair', 'installation', 'cleaning', 'washing'],
  transportation: ['transportation', 'shipping', 'delivery', 'freight', 'hauling', 'moving'],
  rental: ['rental', 'leasing', 'licensing', 'hiring'],
  professional: ['consulting', 'advisory', 'management', 'training', 'education'],
  technical: ['design', 'engineering', 'testing', 'inspection'],
  healthcare: ['diagnosis', 'treatment', 'therapy', 'care'],
  hospitality: ['accommodation', 'lodging', 'catering', 'feeding']
}

/**
 * Check if a name contains any words from a word set
 */
function containsAny(name: string, words: string[]): boolean {
  const lower = name.toLowerCase()
  return words.some(word => {
    // Match whole words only (with word boundaries)
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(lower)
  })
}

/**
 * Classify a record as product or service
 */
function classifyRecord(record: ServiceRecord): 'product' | 'service' | 'ambiguous' {
  const name = record.name.toLowerCase()
  const code = record.code

  // PRIORITY 1: Use NAPCS code structure (most reliable)
  // Product-heavy ranges: 1xxxxx (agriculture), 2xxxxx (mining), 3xxxxx (manufacturing)
  if (code && code.length >= 3) {
    const firstDigit = code.charAt(0)

    if (firstDigit === '1' || firstDigit === '2' || firstDigit === '3') {
      // These are product codes - only classify as service if explicitly service-related
      if (name.match(/\b(maintenance|repair|installation|transportation|rental|leasing)\s+(service|of)/i)) {
        return 'service'
      }
      // Otherwise it's a product (even if the name contains words like "equipment" or "products")
      return 'product'
    }

    // Service-heavy ranges: 5xxxxx, 6xxxxx, 7xxxxx, 8xxxxx
    if (firstDigit === '5' || firstDigit === '6' || firstDigit === '7' || firstDigit === '8') {
      // Check if description indicates this is actually a product embedded in service codes
      const desc = (record.description || '').toLowerCase()
      if (desc.match(/comprises.*(products|goods|equipment|machinery|materials)/)) {
        return 'product'
      }
      return 'service'
    }

    // Code 4xxxxx - mixed category (construction services AND manufactured goods)
    if (firstDigit === '4') {
      // Check if it's a construction service (explicit service keywords)
      if (name.match(/\b(construction|installation|repair|building works)\s+(service)/i)) {
        return 'service'
      }

      // Check description for service indicators
      const desc = (record.description || '').toLowerCase()
      if (desc.match(/comprises\s+(construction|installation|repair)\s+service/)) {
        return 'service'
      }

      // Otherwise, 4xxxxx are predominantly products (vehicles, equipment, parts)
      // - Transportation equipment (vehicles, parts)
      // - Industrial machinery
      // - Construction materials
      return 'product'
    }
  }

  // PRIORITY 2: Strong service activity keywords (only if not in product code range)
  const hasServiceActivity = Object.values(SERVICE_INDICATORS).some(words =>
    containsAny(name, words)
  )

  if (hasServiceActivity) return 'service'

  // PRIORITY 3: Strong product indicators
  const hasProductIndicator = Object.values(PRODUCT_INDICATORS).some(words =>
    containsAny(name, words)
  )

  if (hasProductIndicator) return 'product'

  // PRIORITY 4: Very short codes (1-2 digits) are high-level categories
  if (code && code.length <= 2) {
    return 'ambiguous'
  }

  // Default to ambiguous (no code or unable to classify)
  return 'ambiguous'
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 SEPARATING PRODUCTS FROM SERVICES\n')
  console.log('='.repeat(100) + '\n')

  // Read Services.tsv
  const servicesPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services.tsv'
  const content = readFileSync(servicesPath, 'utf-8')
  const lines = content.trim().split('\n')
  const headers = lines[0]

  const records: ServiceRecord[] = lines.slice(1).map(line => {
    const fields = line.split('\t')
    return {
      url: fields[0] || '',
      ns: fields[1] || '',
      type: fields[2] || '',
      id: fields[3] || '',
      code: fields[4] || '',
      name: fields[5] || '',
      description: fields[6] || '',
      rawLine: line
    }
  })

  console.log(`📊 Processing ${records.length.toLocaleString()} records...\n`)

  // Classify each record
  const classified = records.map(record => ({
    ...record,
    classification: classifyRecord(record)
  }))

  // Statistics
  const products = classified.filter(r => r.classification === 'product')
  const services = classified.filter(r => r.classification === 'service')
  const ambiguous = classified.filter(r => r.classification === 'ambiguous')

  console.log('📈 CLASSIFICATION RESULTS\n')
  console.log(`Products: ${products.length.toLocaleString()} (${Math.round(products.length/records.length*100)}%)`)
  console.log(`Services: ${services.length.toLocaleString()} (${Math.round(services.length/records.length*100)}%)`)
  console.log(`Ambiguous: ${ambiguous.length.toLocaleString()} (${Math.round(ambiguous.length/records.length*100)}%)\n`)

  // Show examples
  console.log('📦 PRODUCT EXAMPLES (first 30)\n')
  for (const product of products.slice(0, 30)) {
    console.log(`  ${product.code}\t${product.name}`)
  }

  console.log('\n🔧 SERVICE EXAMPLES (first 30)\n')
  for (const service of services.slice(0, 30)) {
    console.log(`  ${service.code}\t${service.name}`)
  }

  console.log('\n❓ AMBIGUOUS EXAMPLES (first 30)\n')
  for (const amb of ambiguous.slice(0, 30)) {
    console.log(`  ${amb.code}\t${amb.name}`)
  }

  // Write separated files
  const productsLines = [headers, ...products.map(r => r.rawLine)]
  const servicesLines = [headers, ...services.map(r => r.rawLine)]
  const ambiguousLines = [headers, ...ambiguous.map(r => r.rawLine)]

  const productsPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services-Products-Separated.tsv'
  const servicesOnlyPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services-Only.tsv'
  const ambiguousPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services-Ambiguous.tsv'

  writeFileSync(productsPath, productsLines.join('\n'))
  writeFileSync(servicesOnlyPath, servicesLines.join('\n'))
  writeFileSync(ambiguousPath, ambiguousLines.join('\n'))

  console.log(`\n💾 SAVED FILES\n`)
  console.log(`Products: ${productsPath}`)
  console.log(`  ${products.length.toLocaleString()} products identified`)
  console.log(`\nServices: ${servicesOnlyPath}`)
  console.log(`  ${services.length.toLocaleString()} services identified`)
  console.log(`\nAmbiguous: ${ambiguousPath}`)
  console.log(`  ${ambiguous.length.toLocaleString()} need manual review\n`)

  // Validation: check for obvious misclassifications
  console.log('🔍 VALIDATION CHECKS\n')

  const misclassifiedProducts = services.filter(s =>
    s.name.toLowerCase().match(/\b(cattle|hogs|chickens|wheat|corn|fruit|coal|oil)\b/) &&
    !s.name.toLowerCase().includes('service')
  )

  const misclassifiedServices = products.filter(p =>
    p.name.toLowerCase().match(/\b(services|maintenance|repair|transportation|rental)\b/)
  )

  if (misclassifiedProducts.length > 0) {
    console.log(`⚠️  Potential misclassified products (in services): ${misclassifiedProducts.length}`)
    for (const item of misclassifiedProducts.slice(0, 10)) {
      console.log(`    ${item.code}\t${item.name}`)
    }
  }

  if (misclassifiedServices.length > 0) {
    console.log(`⚠️  Potential misclassified services (in products): ${misclassifiedServices.length}`)
    for (const item of misclassifiedServices.slice(0, 10)) {
      console.log(`    ${item.code}\t${item.name}`)
    }
  }

  if (misclassifiedProducts.length === 0 && misclassifiedServices.length === 0) {
    console.log('✅ No obvious misclassifications detected')
  }

  // Create summary report
  const report = {
    total: records.length,
    products: {
      count: products.length,
      percentage: Math.round(products.length/records.length*100),
      examples: products.slice(0, 100).map(p => ({ code: p.code, name: p.name }))
    },
    services: {
      count: services.length,
      percentage: Math.round(services.length/records.length*100),
      examples: services.slice(0, 100).map(s => ({ code: s.code, name: s.name }))
    },
    ambiguous: {
      count: ambiguous.length,
      percentage: Math.round(ambiguous.length/records.length*100),
      examples: ambiguous.slice(0, 100).map(a => ({ code: a.code, name: a.name }))
    },
    validation: {
      potentialMisclassifiedProducts: misclassifiedProducts.length,
      potentialMisclassifiedServices: misclassifiedServices.length
    }
  }

  const reportPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Product-Service-Separation-Report.json'
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n💾 Full report: ${reportPath}`)
}

main()

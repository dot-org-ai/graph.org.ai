#!/usr/bin/env tsx
/**
 * Classify NAPCS entries as Products or Services
 *
 * Based on Iteration #3 & #4 findings:
 * - 798 Services (28%)
 * - 2,091 Products (72%)
 */

import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_DEFAULT_PASSWORD,
  database: process.env.CLICKHOUSE_DATABASE || 'platform',
  request_timeout: 600000,
})

console.log('🔍 CLASSIFYING NAPCS ENTRIES AS PRODUCTS OR SERVICES\n')
console.log('=' .repeat(100) + '\n')

// Strong service indicators (high confidence)
const serviceKeywords = [
  'services', 'service',
  'consulting', 'consultation',
  'advisory',
  'rental', 'leasing',
  'brokerage', 'brokering',
  'insurance',
  'banking',
  'licensing of rights',
  'admissions to',
  'access to',
  'subscription',
  'membership',
  'registration',
  'fees',
  'payments',
  'management services',
  'operation services',
  'administration',
  'monitoring services',
  'advertising air time',
  'advertising space'
]

// Product lifecycle service keywords (medium confidence - these are services)
const lifecycleServiceKeywords = [
  'maintenance',
  'repair',
  'installation',
  'cleaning',
  'inspection',
  'calibration',
  'servicing',
  'manufacturing services',
  'processing services',
  'fabrication services',
  'assembly services',
  'transportation',
  'shipping',
  'freight',
  'delivery',
  'deliveries',
  'warehousing',
  'wholesale',
  'retail sales',
  'training',
  'support services',
  'disposal',
  'recycling',
  'waste management',
  'contract production',
  'drilling',
  'streaming',
  'loans',
  'hosting',
  'engineering projects',
  // Added from Iteration #9
  'slaughtering',
  'tour',
  // Added from Iteration #10 - energy processing services
  'liquefaction',
  'regasification',
  'recovery',
  // Added from Iteration #11 - geographic, data, financial services
  'surveying',
  'geodetic',
  'geophysical',
  'geospatial',
  'acquisition',
  'consolidation',
  'engagements',
  'procedures',
  'catalogue and directory printing',
  'commercial and general job printing',
  // Added from Iteration #12 - exploration, care, breeding services
  'exploration',
  'abatement',
  'trade execution',
  'breeding',
  'overnight stays',
  'short-term stays',
  'child care'
]

// Strong product indicators (physical goods)
const productKeywords = [
  'equipment',
  'machinery',
  'devices',
  'instruments',
  'tools',
  'parts',
  'components',
  'assemblies',
  'products',
  'materials',
  'supplies',
  'goods',
  'chemicals',
  'metals',
  'alloys',
  'plastics',
  'resins',
  'wire',
  'cable',
  'castings',
  'forgings',
  'grain',
  'powder',
  'adhesives',
  'coatings',
  'fasteners',
  'bearings',
  'motors',
  'engines',
  'pumps',
  'valves',
  'switches',
  'sensors',
  'controllers',
  'buildings',
  'structures',
  // Added from ambiguous analysis
  'waste and scrap',
  'propellers',
  'rotors',
  'ingots',
  'billets',
  'pipes',
  'tubes',
  'rods',
  'bars',
  'sheets',
  'strips',
  'plates',
  'waxes',
  'oils',
  'feed',
  'footwear',
  'yarns',
  'fibres',
  'fibers',
  'mixtures',
  'blocks',
  'utensils',
  'kitchenware',
  'paving',
  'sheathing',
  'controls',
  // Added from Iteration #6 ambiguous analysis
  'wood',
  'lumber',
  'logs',
  'bolts',
  'furniture',
  'glass',
  'glassware',
  'ceramic',
  'tile',
  'floor',
  'flooring',
  'frozen',
  'fresh',
  'canned',
  'prepared',
  'automotive',
  'chassis',
  'vehicle',
  'motor',
  'trucks',
  'cars',
  'paperboard',
  'packaging',
  'jewellery',
  'jewelry',
  'hose',
  'mirrors',
  'fabrics',
  'textile',
  'containers',
  'boxes',
  'cosmetics',
  'toiletries',
  'beverages',
  'foods',
  'sofas',
  'beds',
  'tables',
  'chairs',
  'desks',
  // Added from Iteration #7 ambiguous analysis
  'pipe',
  'coats',
  'jackets',
  'tobacco',
  'meat',
  'gum',
  'cameras',
  'chocolate',
  'cocoa',
  'toys',
  'games',
  'elevators',
  'generators',
  'stones',
  'connectors',
  'conveyors',
  'eyewear',
  'frames',
  'lenses',
  'tokens',
  'scissors',
  'cutlery',
  'fencing',
  'gates',
  'tanks',
  'vessels',
  'belts',
  'belting',
  'thread',
  'towels',
  'sacks',
  'gloves',
  'malls',
  'theatres',
  'theaters',
  'restaurants',
  'parkades',
  'garages',
  'clinics',
  'complexes',
  'detention',
  // Added from Iteration #8 - capture remaining likely classified items
  'ores',
  'concentrates',
  'foam',
  'liquid',
  'bullion',
  'construction',
  'laboratories',
  'laboratory',
  'pathology',
  'stores',
  // Added from Iteration #9 - specific product types from ambiguous analysis
  'automobiles',
  'weapons',
  'beer',
  'blades',
  'toner',
  'periodicals',
  'buttons',
  'crude',
  'monitors',
  'corn',
  'minerals',
  'chargers',
  'kegs',
  'barrels',
  'cabs',
  'fixtures',
  'chickens',
  'poultry',
  'housing',
  'barracks',
  'offices',
  'courthouse',
  'bristols',
  'carburetors',
  'silage',
  // Added from Iteration #10 - software, appliances, industrial equipment, materials
  'software',
  'programs',
  'computers',
  'washers',
  'dryers',
  'refrigerators',
  'freezers',
  'stoves',
  'exchangers',
  'condensers',
  'capacitors',
  'fittings',
  'lavatory',
  'sealants',
  'kerosene',
  'refractories',
  'intercom',
  'cartridges',
  'ink',
  'compounds',
  // Added from Iteration #11 - energy, paper, materials, vehicles, nursery products
  'biofuels',
  'biodiesel',
  'tissue',
  'toilet',
  'insulation',
  'roofing',
  'sidings',
  'fibreboard',
  'particle board',
  'mattress',
  'felt',
  'cheque',
  'manifold',
  'pegboard',
  'prime mover',
  'generator sets',
  'pressed',
  'blown',
  'foundations',
  'ensembles',
  'nursery stock',
  'live plants',
  'car seats',
  'truck bodies',
  'aircraft',
  'lottery',
  'amusement machines',
  'dimensional',
  'crushed',
  'hens',
  'pullets',
  // Added from Iteration #12 - facilities, equipment, materials
  'hospitals',
  'nursing homes',
  'senior citizen homes',
  'power plants',
  'treatment plants',
  'production facilities',
  'extraction facilities',
  'engineering works',
  'transformers',
  'cranes',
  'monorail',
  'lamps',
  'lampshades',
  'conditioners',
  'dehumidifiers',
  'alternators',
  'starters',
  'strainers',
  'cylinders',
  'actuators',
  'boots',
  'flour',
  'preparations',
  'vaccines',
  'biologics',
  'cream',
  'fluid milk',
  'skating',
  'travelling',
  'overhead',
  'portable',
  'lampshades',
  'articles',
  'organic alcohols',
  'parasitic',
  'infective',
  'commodity',
  'dehumidifiers',
  'sewage'
]

// Get all NAPCS entries
const result = await client.query({
  query: `
    SELECT
      id,
      JSONExtractString(toString(data), 'originalName') as originalName,
      JSONExtractString(toString(data), 'napcs') as napcs
    FROM Things FINAL
    WHERE ns = 'products.org.ai'
      AND JSONExtractString(toString(data), 'source') = 'NAPCS'
    ORDER BY originalName
  `,
  format: 'JSONEachRow',
})

const entries = await result.json() as Array<{
  id: string
  originalName: string
  napcs: string
}>

console.log(`Found ${entries.length.toLocaleString()} NAPCS entries\n`)

// Classify each entry
type Classification = {
  id: string
  originalName: string
  napcs: string
  type: 'Service' | 'Product' | 'Ambiguous'
  confidence: 'High' | 'Medium' | 'Low'
  reason: string
}

const classifications: Classification[] = []

for (const entry of entries) {
  const name = entry.originalName.toLowerCase()

  let type: 'Service' | 'Product' | 'Ambiguous' = 'Ambiguous'
  let confidence: 'High' | 'Medium' | 'Low' = 'Low'
  let reason = 'No clear indicators'

  // Special case: "X at wholesale/retail" is a product being sold, not a service
  const isProductSoldWholesale = name.match(/(at wholesale|at retail)$/)

  // Check for strong service indicators
  if (!isProductSoldWholesale) {
    for (const keyword of serviceKeywords) {
      if (name.includes(keyword.toLowerCase())) {
        type = 'Service'
        confidence = 'High'
        reason = `Contains service keyword: "${keyword}"`
        break
      }
    }
  }

  // If not already classified as service, check lifecycle service keywords
  if (type === 'Ambiguous' && !isProductSoldWholesale) {
    for (const keyword of lifecycleServiceKeywords) {
      if (name.includes(keyword.toLowerCase())) {
        type = 'Service'
        confidence = 'Medium'
        reason = `Contains lifecycle service keyword: "${keyword}"`
        break
      }
    }
  }

  // If it's a product sold wholesale/retail, classify as product
  if (isProductSoldWholesale) {
    type = 'Product'
    confidence = 'Medium'
    reason = 'Product being sold at wholesale/retail'
  }

  // If still ambiguous, check for product indicators
  if (type === 'Ambiguous') {
    for (const keyword of productKeywords) {
      if (name.includes(keyword.toLowerCase())) {
        type = 'Product'
        confidence = 'Medium'
        reason = `Contains product keyword: "${keyword}"`
        break
      }
    }
  }

  // Special cases - these are services even without keywords
  if (type === 'Ambiguous') {
    // Ends with common service suffixes
    if (name.match(/(fees|charges|rates|premiums|programs|plans)$/)) {
      type = 'Service'
      confidence = 'Medium'
      reason = 'Ends with service suffix'
    }
    // Starts with service action verbs
    else if (name.match(/^(operating|providing|delivering|supplying|offering|performing)/)) {
      type = 'Service'
      confidence = 'Medium'
      reason = 'Starts with service action verb'
    }
  }

  // Still ambiguous - default to Product (physical goods are more common in NAPCS)
  if (type === 'Ambiguous') {
    // If it's a short, concrete noun phrase, likely a product
    if (name.split(' ').length <= 4 && !name.includes('for') && !name.includes('to')) {
      type = 'Product'
      confidence = 'Low'
      reason = 'Short concrete noun phrase (default to product)'
    }
  }

  classifications.push({
    id: entry.id,
    originalName: entry.originalName,
    napcs: entry.napcs,
    type,
    confidence,
    reason,
  })
}

// Calculate statistics
const services = classifications.filter(c => c.type === 'Service')
const products = classifications.filter(c => c.type === 'Product')
const ambiguous = classifications.filter(c => c.type === 'Ambiguous')

const highConfidenceServices = services.filter(c => c.confidence === 'High')
const mediumConfidenceServices = services.filter(c => c.confidence === 'Medium')
const lowConfidenceServices = services.filter(c => c.confidence === 'Low')

const highConfidenceProducts = products.filter(c => c.confidence === 'High')
const mediumConfidenceProducts = products.filter(c => c.confidence === 'Medium')
const lowConfidenceProducts = products.filter(c => c.confidence === 'Low')

// Report
console.log('📊 CLASSIFICATION SUMMARY\n')
console.log('=' .repeat(100) + '\n')

console.log(`Services:     ${services.length.toLocaleString()} (${Math.round(services.length / entries.length * 100)}%)`)
console.log(`  High conf:  ${highConfidenceServices.length.toLocaleString()}`)
console.log(`  Medium conf: ${mediumConfidenceServices.length.toLocaleString()}`)
console.log(`  Low conf:   ${lowConfidenceServices.length.toLocaleString()}`)

console.log(`\nProducts:     ${products.length.toLocaleString()} (${Math.round(products.length / entries.length * 100)}%)`)
console.log(`  High conf:  ${highConfidenceProducts.length.toLocaleString()}`)
console.log(`  Medium conf: ${mediumConfidenceProducts.length.toLocaleString()}`)
console.log(`  Low conf:   ${lowConfidenceProducts.length.toLocaleString()}`)

console.log(`\nAmbiguous:    ${ambiguous.length.toLocaleString()} (${Math.round(ambiguous.length / entries.length * 100)}%)`)

console.log('\n' + '=' .repeat(100) + '\n')

// Show examples of each category
console.log('\n📋 EXAMPLES BY CATEGORY\n')
console.log('=' .repeat(100) + '\n')

console.log('## HIGH CONFIDENCE SERVICES (first 20)\n')
for (const c of highConfidenceServices.slice(0, 20)) {
  console.log(`  - ${c.originalName}`)
  console.log(`    Reason: ${c.reason}\n`)
}

console.log('\n## MEDIUM CONFIDENCE SERVICES (first 20)\n')
for (const c of mediumConfidenceServices.slice(0, 20)) {
  console.log(`  - ${c.originalName}`)
  console.log(`    Reason: ${c.reason}\n`)
}

console.log('\n## MEDIUM CONFIDENCE PRODUCTS (first 20)\n')
for (const c of mediumConfidenceProducts.slice(0, 20)) {
  console.log(`  - ${c.originalName}`)
  console.log(`    Reason: ${c.reason}\n`)
}

console.log('\n## LOW CONFIDENCE PRODUCTS (first 20)\n')
for (const c of lowConfidenceProducts.slice(0, 20)) {
  console.log(`  - ${c.originalName}`)
  console.log(`    Reason: ${c.reason}\n`)
}

if (ambiguous.length > 0) {
  console.log('\n## AMBIGUOUS (first 30)\n')
  for (const c of ambiguous.slice(0, 30)) {
    console.log(`  - ${c.originalName}`)
    console.log(`    Reason: ${c.reason}\n`)
  }
}

// Export classifications for further analysis
console.log('\n📁 SAVING CLASSIFICATIONS TO FILE\n')
const fs = await import('fs')
const classifications_json = JSON.stringify(classifications, null, 2)
fs.writeFileSync('napcs-classifications.json', classifications_json)
console.log(`Saved ${classifications.length.toLocaleString()} classifications to napcs-classifications.json`)

await client.close()

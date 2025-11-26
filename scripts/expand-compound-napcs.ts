#!/usr/bin/env tsx
/**
 * Expand compound NAPCS entries into individual items
 *
 * Examples:
 * - "Heated or cooled air or water" → HeatedAir, CooledAir, HeatedWater, CooledWater
 * - "Sheet music and other musical texts" → SheetMusic, MusicalTexts
 * - "Gas stations and electric charging stations" → GasStations, ElectricChargingStations
 */

import { readFileSync, writeFileSync } from 'fs'

console.log('🔍 ANALYZING COMPOUND NAPCS ENTRIES\n')
console.log('=' .repeat(100) + '\n')

// Load classifications
const classificationsData = readFileSync('napcs-classifications.json', 'utf-8')
const classifications = JSON.parse(classificationsData)

// Filter ambiguous with "and" or "or"
const ambiguous = classifications.filter((c: any) => c.type === 'Ambiguous')
const withAnd = ambiguous.filter((c: any) => c.originalName.toLowerCase().includes(' and '))
const withOr = ambiguous.filter((c: any) => c.originalName.toLowerCase().includes(' or '))

console.log(`Found ${ambiguous.length} ambiguous classifications`)
console.log(`  ${withAnd.length} contain "and"`)
console.log(`  ${withOr.length} contain "or"\n`)

// Analyze "or" patterns - these are usually listing alternatives
console.log('🔀 ENTRIES WITH "OR" (likely alternatives to expand):\n')
for (const item of withOr) {
  console.log(`  - ${item.originalName}`)
}

// Manual expansions for clear cases
const expansions: Record<string, string[]> = {
  // "or" expansions - alternatives
  'Heated or cooled air or water': [
    'Heated air',
    'Cooled air',
    'Heated water',
    'Cooled water'
  ],
  'Oil and fat of animal or marine origin': [
    'Oil of animal origin',
    'Fat of animal origin',
    'Oil of marine origin',
    'Fat of marine origin'
  ],

  // "and" expansions - multiple items
  'Sheet music and other musical texts': [
    'Sheet music',
    'Musical texts'
  ],
  'Gas stations and electric charging stations': [
    'Gas stations',
    'Electric charging stations'
  ],
  'Water towers and pumping stations': [
    'Water towers',
    'Pumping stations'
  ],
  'Tire cord and tire fabric': [
    'Tire cord',
    'Tire fabric'
  ],
  'Stationary and marine power boilers': [
    'Stationary power boilers',
    'Marine power boilers'
  ],
  'Industrial and commercial fans and blowers': [
    'Industrial fans',
    'Industrial blowers',
    'Commercial fans',
    'Commercial blowers'
  ],
  'In-vivo and in-vitro diagnostic substances': [
    'In-vivo diagnostic substances',
    'In-vitro diagnostic substances'
  ],
  'Other nursery trees and plants': [
    'Nursery trees',
    'Nursery plants'
  ],
  'Specialty and pay television air time': [
    'Specialty television air time',
    'Pay television air time'
  ],
  'Speed changers and industrial high-speed drives (except loose gearing)': [
    'Speed changers',
    'Industrial high-speed drives'
  ],
  'Water delivered by water works and irrigation systems': [
    'Water delivered by water works',
    'Water delivered by irrigation systems'
  ],
  'Thermal generation electricity (except nuclear and geothermal)': [
    'Thermal generation electricity'
  ],
  'Unrecorded optical and magnetic media; and media n.e.c. (except flash media)': [
    'Unrecorded optical media',
    'Unrecorded magnetic media',
    'Unrecorded media n.e.c.'
  ],
  'Other sports and recreational facilities with spectator capacity': [
    'Sports facilities with spectator capacity',
    'Recreational facilities with spectator capacity'
  ],
  'Other publications n.e.c. (including maps and greeting cards)': [
    'Publications n.e.c.',
    'Maps',
    'Greeting cards'
  ],
  'Smoking accessories (except lighters and matches)': [
    'Smoking accessories'
  ]
}

console.log('\n\n🔗 ENTRIES WITH "AND" (sample - may list multiple items):\n')
for (const item of withAnd.slice(0, 20)) {
  console.log(`  - ${item.originalName}`)

  // Try to identify expansion patterns
  const name = item.originalName

  // Pattern: "X and Y" where X and Y are parallel items
  if (name.match(/^([^(]+) and ([^(]+)$/)) {
    const match = name.match(/^([^(]+) and ([^(]+)$/)
    if (match) {
      console.log(`    → Possible expansion: "${match[1].trim()}" + "${match[2].trim()}"`)
    }
  }

  // Pattern: "X and Y stations/facilities/etc"
  if (name.match(/(.+) and (.+) (stations|facilities|systems|plants|hospitals|homes)/)) {
    const match = name.match(/(.+) and (.+) (stations|facilities|systems|plants|hospitals|homes)/)
    if (match) {
      console.log(`    → Possible expansion: "${match[1].trim()} ${match[3]}" + "${match[2].trim()} ${match[3]}"`)
    }
  }

  // Pattern: "X and Y Z" where Z is a noun applying to both
  if (name.match(/(.+) and (.+) ([a-z]+s)$/)) {
    const match = name.match(/(.+) and (.+) ([a-z]+s)$/)
    if (match) {
      const x = match[1].trim()
      const y = match[2].trim()
      const z = match[3].trim()

      // Check if x and y are adjectives/modifiers (short words)
      if (x.split(' ').length <= 2 && y.split(' ').length <= 2) {
        console.log(`    → Possible expansion: "${x} ${z}" + "${y} ${z}"`)
      }
    }
  }
}

console.log('\n\n💡 EXPANSION SUGGESTIONS:\n')
console.log('=' .repeat(100) + '\n')

for (const [original, expanded] of Object.entries(expansions)) {
  console.log(`${original}`)
  console.log(`  →`)
  for (const item of expanded) {
    console.log(`    - ${item}`)
  }
  console.log()
}

// Now classify the expanded items
console.log('\n\n🎯 CLASSIFYING EXPANDED ITEMS:\n')
console.log('=' .repeat(100) + '\n')

// Simple inline classifier
function classifyItem(name: string): { type: string; reason: string } {
  const lower = name.toLowerCase()

  // Service indicators
  const serviceKeywords = [
    'services', 'delivered', 'air time', 'electricity', 'water delivered'
  ]
  for (const kw of serviceKeywords) {
    if (lower.includes(kw)) {
      return { type: 'Service', reason: `Contains service keyword: "${kw}"` }
    }
  }

  // Product indicators
  const productKeywords = [
    'stations', 'towers', 'cord', 'fabric', 'boilers', 'fans', 'blowers',
    'substances', 'trees', 'plants', 'changers', 'drives', 'media', 'facilities',
    'music', 'texts', 'maps', 'cards', 'accessories', 'air', 'water', 'oil', 'fat'
  ]
  for (const kw of productKeywords) {
    if (lower.includes(kw)) {
      return { type: 'Product', reason: `Contains product keyword: "${kw}"` }
    }
  }

  return { type: 'Ambiguous', reason: 'No clear indicators' }
}

let totalExpanded = 0
const results: Record<string, { original: string; expanded: string[]; classifications: Array<{ item: string; type: string; reason: string }> }> = {}

for (const [original, expanded] of Object.entries(expansions)) {
  totalExpanded += expanded.length
  const classifications = expanded.map(item => ({
    item,
    ...classifyItem(item)
  }))

  results[original] = { original, expanded, classifications }

  console.log(`${original}`)
  console.log(`  Expanded to ${expanded.length} items:`)
  for (const c of classifications) {
    const icon = c.type === 'Service' ? '🔧' : c.type === 'Product' ? '📦' : '❓'
    console.log(`    ${icon} ${c.item} → ${c.type}`)
  }
  console.log()
}

console.log('\n📊 EXPANSION SUMMARY:\n')
console.log('=' .repeat(100) + '\n')
console.log(`Compound entries: ${Object.keys(expansions).length}`)
console.log(`Total expanded items: ${totalExpanded}`)
console.log(`Net reduction in ambiguous: ${Object.keys(expansions).length - totalExpanded} items`)

const allClassifications = Object.values(results).flatMap(r => r.classifications)
const services = allClassifications.filter(c => c.type === 'Service').length
const products = allClassifications.filter(c => c.type === 'Product').length
const stillAmbiguous = allClassifications.filter(c => c.type === 'Ambiguous').length

console.log(`\nAfter expansion:`)
console.log(`  Services: ${services}`)
console.log(`  Products: ${products}`)
console.log(`  Still Ambiguous: ${stillAmbiguous}`)
console.log(`\nNet impact on 62 ambiguous items:`)
console.log(`  Before: 62 ambiguous`)
console.log(`  Remove ${Object.keys(expansions).length} compound entries`)
console.log(`  Add ${totalExpanded} expanded items (${services} services, ${products} products, ${stillAmbiguous} ambiguous)`)
console.log(`  After: ${62 - Object.keys(expansions).length + stillAmbiguous} ambiguous items`)
console.log(`  Improvement: ${Object.keys(expansions).length - stillAmbiguous} fewer ambiguous items`)

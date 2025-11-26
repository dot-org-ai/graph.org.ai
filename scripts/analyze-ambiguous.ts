#!/usr/bin/env tsx
/**
 * Analyze the 479 ambiguous NAPCS classifications to find patterns
 */

import { readFileSync } from 'fs'

console.log('🔍 ANALYZING AMBIGUOUS NAPCS CLASSIFICATIONS\n')
console.log('=' .repeat(100) + '\n')

// Load classifications
const classificationsData = readFileSync('napcs-classifications.json', 'utf-8')
const classifications = JSON.parse(classificationsData)

// Filter ambiguous
const ambiguous = classifications.filter((c: any) => c.type === 'Ambiguous')

console.log(`Found ${ambiguous.length} ambiguous classifications\n`)

// Pattern analysis
const patterns = {
  // Common product patterns
  hasAnd: [] as string[],
  hasOr: [] as string[],
  hasExcept: [] as string[],
  hasIncluding: [] as string[],
  endsWithS: [] as string[],

  // Building/facility patterns
  buildings: [] as string[],
  facilities: [] as string[],

  // Material patterns
  materials: [] as string[],

  // Common words
  wordFrequency: new Map<string, number>(),
}

for (const item of ambiguous) {
  const name = item.originalName.toLowerCase()

  // Pattern checks
  if (name.includes(' and ')) patterns.hasAnd.push(item.originalName)
  if (name.includes(' or ')) patterns.hasOr.push(item.originalName)
  if (name.match(/\(except /)) patterns.hasExcept.push(item.originalName)
  if (name.match(/\(including /)) patterns.hasIncluding.push(item.originalName)
  if (name.match(/s$/)) patterns.endsWithS.push(item.originalName)

  // Specific categories
  if (name.match(/building|structure|facility|centre|center|store|warehouse/)) {
    patterns.buildings.push(item.originalName)
  }

  if (name.match(/material|substance|compound|mixture/)) {
    patterns.materials.push(item.originalName)
  }

  // Word frequency
  const words = name.split(/\s+/)
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '')
    if (cleanWord.length > 3) { // Only count words longer than 3 chars
      patterns.wordFrequency.set(cleanWord, (patterns.wordFrequency.get(cleanWord) || 0) + 1)
    }
  }
}

// Sort word frequency
const sortedWords = Array.from(patterns.wordFrequency.entries())
  .sort((a, b) => b[1] - a[1])

console.log('📊 PATTERN ANALYSIS\n')
console.log('=' .repeat(100) + '\n')

console.log(`Items with "and": ${patterns.hasAnd.length}`)
console.log(`Items with "or": ${patterns.hasOr.length}`)
console.log(`Items with "(except...)": ${patterns.hasExcept.length}`)
console.log(`Items with "(including...)": ${patterns.hasIncluding.length}`)
console.log(`Items ending with 's': ${patterns.endsWithS.length}`)
console.log(`Buildings/facilities: ${patterns.buildings.length}`)
console.log(`Materials: ${patterns.materials.length}`)

console.log('\n📝 TOP 50 MOST FREQUENT WORDS (>3 chars)\n')
console.log('=' .repeat(100) + '\n')

for (const [word, count] of sortedWords.slice(0, 50)) {
  console.log(`${word.padEnd(30)} ${count.toString().padStart(4)} occurrences`)
}

console.log('\n\n🏢 BUILDINGS/FACILITIES EXAMPLES (first 30)\n')
console.log('=' .repeat(100) + '\n')

for (const item of patterns.buildings.slice(0, 30)) {
  console.log(`  - ${item}`)
}

console.log('\n\n🧪 MATERIALS EXAMPLES (first 30)\n')
console.log('=' .repeat(100) + '\n')

for (const item of patterns.materials.slice(0, 30)) {
  console.log(`  - ${item}`)
}

console.log('\n\n🔗 ITEMS WITH "AND" (first 30)\n')
console.log('=' .repeat(100) + '\n')

for (const item of patterns.hasAnd.slice(0, 30)) {
  console.log(`  - ${item}`)
}

console.log('\n\n🔀 ITEMS WITH "OR" (first 30)\n')
console.log('=' .repeat(100) + '\n')

for (const item of patterns.hasOr.slice(0, 30)) {
  console.log(`  - ${item}`)
}

// Category suggestions based on word frequency
console.log('\n\n💡 CLASSIFICATION SUGGESTIONS\n')
console.log('=' .repeat(100) + '\n')

const productIndicators = ['aluminum', 'steel', 'copper', 'iron', 'metal', 'wood', 'plastic', 'rubber', 'glass', 'ceramic', 'concrete', 'paper', 'textile', 'leather', 'food', 'beverage', 'clothing', 'footwear', 'furniture']
const serviceIndicators = ['centre', 'center', 'facility', 'building', 'structure']
const likelyProducts = [] as string[]
const likelyServices = [] as string[]
const stillAmbiguous = [] as string[]

for (const item of ambiguous) {
  const name = item.originalName.toLowerCase()
  let isProduct = false
  let isService = false

  for (const indicator of productIndicators) {
    if (name.includes(indicator)) {
      isProduct = true
      break
    }
  }

  for (const indicator of serviceIndicators) {
    if (name.includes(indicator)) {
      isService = true
      break
    }
  }

  if (isProduct && !isService) {
    likelyProducts.push(item.originalName)
  } else if (isService && !isProduct) {
    likelyServices.push(item.originalName)
  } else {
    stillAmbiguous.push(item.originalName)
  }
}

console.log(`Likely Products (based on material indicators): ${likelyProducts.length}`)
console.log(`Likely Services/Buildings: ${likelyServices.length}`)
console.log(`Still Ambiguous: ${stillAmbiguous.length}`)

console.log('\n\nLIKELY PRODUCTS (first 30):\n')
for (const item of likelyProducts.slice(0, 30)) {
  console.log(`  - ${item}`)
}

console.log('\n\nLIKELY SERVICES/BUILDINGS (first 30):\n')
for (const item of likelyServices.slice(0, 30)) {
  console.log(`  - ${item}`)
}

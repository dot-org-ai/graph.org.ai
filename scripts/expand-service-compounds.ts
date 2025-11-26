#!/usr/bin/env tsx
/**
 * Advanced compound expansion for services
 * Handles complex patterns like "heated or cooled air or water"
 * which should expand to: [heated air, heated water, cooled air, cooled water]
 */

import { readFileSync, writeFileSync } from 'fs'

interface CompoundPattern {
  type: 'simple' | 'cartesian' | 'sequential'
  modifiers?: string[]  // Adjectives/verbs that apply to nouns
  nouns?: string[]      // The objects being modified
  items?: string[]      // For simple/sequential compounds
}

/**
 * Detect if a phrase contains adjective+noun patterns
 * Examples: "heated air", "fresh fruit", "crude oil"
 */
function hasModifierNounPattern(phrase: string): boolean {
  const words = phrase.toLowerCase().split(/\s+/)
  if (words.length < 2) return false

  // Common adjectives/modifiers in NAPCS
  const modifiers = [
    'heated', 'cooled', 'hot', 'cold', 'warm', 'chilled',
    'fresh', 'frozen', 'dried', 'canned', 'processed',
    'raw', 'refined', 'crude', 'pure',
    'light', 'heavy', 'medium',
    'hard', 'soft',
    'new', 'used', 'recycled',
    'domestic', 'imported', 'foreign',
    'wholesale', 'retail',
    'electric', 'gas', 'diesel', 'hydraulic'
  ]

  return modifiers.some(mod => words.includes(mod))
}

/**
 * Parse a compound phrase to detect cartesian product patterns
 *
 * Examples:
 *   "heated or cooled air or water"
 *   → modifiers: ["heated", "cooled"], nouns: ["air", "water"]
 *   → cartesian: [heated air, heated water, cooled air, cooled water]
 *
 *   "fresh or frozen fruit"
 *   → modifiers: ["fresh", "frozen"], nouns: ["fruit"]
 *   → cartesian: [fresh fruit, frozen fruit]
 */
function parseCartesianCompound(phrase: string): CompoundPattern | null {
  const lower = phrase.toLowerCase().trim()

  // Pattern: "modifier1 or modifier2... noun1 or noun2..."
  // Try to split into modifier section and noun section

  const words = lower.split(/\s+/)

  // Find the transition point where modifiers end and nouns begin
  // This is tricky - we need to detect adjectives vs nouns

  // Simple heuristic: if we have "X or Y Z or W" pattern,
  // try parsing as "(X or Y) (Z or W)"

  const orParts = lower.split(/\s+or\s+/)
  if (orParts.length < 2) return null

  // Check if this could be a modifier×noun cartesian
  // Pattern: at least one part has multiple words, suggesting modifier+noun

  const multiWordParts = orParts.filter(part => part.split(/\s+/).length > 1)

  if (multiWordParts.length > 0) {
    // Example: ["heated", "cooled air", "water"]
    // We need to detect that "cooled" modifies both "air" and potentially future nouns

    // Strategy: Find the first multi-word part, assume its last word is the noun
    // and earlier words are modifiers
    const firstMultiWord = multiWordParts[0]
    const wordsInFirst = firstMultiWord.split(/\s+/)

    if (wordsInFirst.length >= 2) {
      const potentialModifier = wordsInFirst[0]
      const potentialNoun = wordsInFirst.slice(1).join(' ')

      // Collect all modifiers (single words before any multi-word part)
      const modifiers: string[] = []
      const nouns: string[] = []

      for (let i = 0; i < orParts.length; i++) {
        const part = orParts[i].trim()
        const partWords = part.split(/\s+/)

        if (partWords.length === 1) {
          // Could be a modifier or a noun
          // If it comes before any multi-word parts, it's likely a modifier
          // If it comes after, it's likely a noun
          if (multiWordParts.some(mw => orParts.indexOf(mw) > i)) {
            modifiers.push(part)
          } else {
            nouns.push(part)
          }
        } else {
          // Multi-word: split into modifier + noun
          modifiers.push(partWords[0])
          nouns.push(partWords.slice(1).join(' '))
        }
      }

      if (modifiers.length > 0 && nouns.length > 0) {
        return {
          type: 'cartesian',
          modifiers: [...new Set(modifiers)], // dedupe
          nouns: [...new Set(nouns)]
        }
      }
    }
  }

  return null
}

/**
 * Expand a compound phrase into all discrete items
 */
function expandCompound(phrase: string): string[] {
  const lower = phrase.toLowerCase().trim()

  // Try cartesian pattern first
  const cartesian = parseCartesianCompound(phrase)
  if (cartesian && cartesian.modifiers && cartesian.nouns) {
    const expanded: string[] = []
    for (const modifier of cartesian.modifiers) {
      for (const noun of cartesian.nouns) {
        expanded.push(`${modifier} ${noun}`.trim())
      }
    }
    return expanded
  }

  // Fall back to simple split on "and"/"or"
  const parts = lower.split(/\s+(?:and|or)\s+/)
  return parts.map(p => p.trim()).filter(Boolean)
}

/**
 * Expand a full service name that may have multiple compound sections
 *
 * Examples:
 *   "Steam and heated or cooled air or water"
 *   → ["Steam", "heated air", "heated water", "cooled air", "cooled water"]
 *
 *   "Maintenance and repair services for automobiles and light trucks"
 *   → activities: ["Maintenance", "Repair"]
 *   → objects: ["automobiles", "light trucks"]
 *   → cartesian of activities × objects
 */
function expandServiceName(name: string): string[] {
  const lower = name.toLowerCase()

  // Special case: "X and Y or Z or W" where Y,Z,W form a cartesian
  // Example: "Steam and heated or cooled air or water"

  const andParts = name.split(/\s+and\s+/)

  if (andParts.length > 1) {
    // Check if any "and" part contains "or" (suggesting nested structure)
    const partsWithOr = andParts.filter(part => part.includes(' or '))
    const partsWithoutOr = andParts.filter(part => !part.includes(' or '))

    if (partsWithOr.length > 0) {
      // Expand each part separately, then combine
      const allExpanded: string[] = []

      for (const part of partsWithoutOr) {
        allExpanded.push(part.trim())
      }

      for (const part of partsWithOr) {
        const expanded = expandCompound(part)
        allExpanded.push(...expanded)
      }

      return allExpanded
    }
  }

  // No special nested structure, use simple expansion
  return expandCompound(name)
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 EXPANDING SERVICE COMPOUNDS\n')
  console.log('='.repeat(100) + '\n')

  // Test cases
  const testCases = [
    'Steam and heated or cooled air or water',
    'Heated or cooled air or water',
    'Maintenance and repair services for automobiles and light trucks',
    'Fresh or frozen fruit',
    'Cattle and calves',
    'Turkish or steam or ritual baths'
  ]

  console.log('📋 TEST EXPANSIONS\n')

  for (const testCase of testCases) {
    const expanded = expandServiceName(testCase)
    console.log(`🔸 "${testCase}"`)
    console.log(`   Expansions (${expanded.length}):`)
    for (const item of expanded) {
      console.log(`     • ${item}`)
    }
    console.log()
  }

  // Now expand all services
  const servicesPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services.tsv'
  const content = readFileSync(servicesPath, 'utf-8')
  const lines = content.trim().split('\n')
  const headers = lines[0].split('\t')

  const services = lines.slice(1).map(line => {
    const fields = line.split('\t')
    return {
      url: fields[0] || '',
      name: fields[5] || '',
      code: fields[4] || ''
    }
  })

  console.log(`\n📊 Processing ${services.length.toLocaleString()} services...\n`)

  const expansions: Array<{
    original: string
    code: string
    expanded: string[]
    count: number
  }> = []

  let totalExpanded = 0

  for (const service of services) {
    const expanded = expandServiceName(service.name)
    if (expanded.length > 1) {
      expansions.push({
        original: service.name,
        code: service.code,
        expanded,
        count: expanded.length
      })
      totalExpanded += expanded.length
    }
  }

  console.log(`✅ Found ${expansions.length.toLocaleString()} services with compounds`)
  console.log(`📈 Total expanded services: ${totalExpanded.toLocaleString()}\n`)

  // Show top expansions
  const topExpansions = expansions
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  console.log('🔝 TOP 20 MOST COMPLEX EXPANSIONS\n')
  for (const exp of topExpansions) {
    console.log(`${exp.count}× "${exp.original}"`)
    for (const item of exp.expanded) {
      console.log(`     → ${item}`)
    }
    console.log()
  }

  // Save results
  const outputPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Service-Expansions.json'
  writeFileSync(outputPath, JSON.stringify(expansions, null, 2))
  console.log(`\n💾 Saved to: ${outputPath}`)
}

main()

#!/usr/bin/env tsx
/**
 * Validate service expansions by analyzing:
 * 1. Longest service names (often have parsing issues)
 * 2. Biggest delta % from original to expanded character length
 * 3. Over-expansion cases (too many discrete services)
 * 4. Under-expansion cases (should have expanded but didn't)
 */

import { readFileSync } from 'fs'

interface ParsedService {
  url: string
  name: string
  code: string
  description: string
  parsed: {
    activities: string[]
    objects: string[]
    modifiers: string[]
    preposition?: string
    exclusions: string[]
    scope: {
      activityPhrase: string
      objectPhrase: string
      boundary?: string
    }
  }
  expanded: Array<{
    activity?: string
    object?: string
    fullName: string
    id: string
  }>
}

interface ExpansionMetrics {
  originalName: string
  originalLength: number
  expandedCount: number
  totalExpandedLength: number
  avgExpandedLength: number
  deltaPercent: number
  deltaAbsolute: number
  code: string
  expansions: string[]
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 VALIDATING SERVICE EXPANSIONS\n')
  console.log('='.repeat(100) + '\n')

  // Read parsed services
  const parsedPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services-Parsed-Full.json'
  const parsed: ParsedService[] = JSON.parse(readFileSync(parsedPath, 'utf-8'))

  console.log(`📊 Analyzing ${parsed.length.toLocaleString()} services...\n`)

  // Calculate metrics for each service
  const metrics: ExpansionMetrics[] = parsed.map(service => {
    const originalLength = service.name.length
    const expandedNames = service.expanded.map(e => e.fullName)
    const totalExpandedLength = expandedNames.reduce((sum, name) => sum + name.length, 0)
    const avgExpandedLength = totalExpandedLength / expandedNames.length

    // Delta = (total expanded length - original length) / original length
    const deltaAbsolute = totalExpandedLength - originalLength
    const deltaPercent = (deltaAbsolute / originalLength) * 100

    return {
      originalName: service.name,
      originalLength,
      expandedCount: expandedNames.length,
      totalExpandedLength,
      avgExpandedLength,
      deltaPercent,
      deltaAbsolute,
      code: service.code,
      expansions: expandedNames
    }
  })

  // 1. LONGEST ORIGINAL NAMES
  console.log('📏 LONGEST ORIGINAL SERVICE NAMES (Top 30)\n')
  const longest = [...metrics].sort((a, b) => b.originalLength - a.originalLength).slice(0, 30)

  for (const item of longest) {
    console.log(`${item.originalLength} chars: "${item.originalName}"`)
    console.log(`  Code: ${item.code}`)
    console.log(`  Expanded to ${item.expandedCount} services (${item.deltaPercent.toFixed(0)}% delta)`)
    if (item.expandedCount <= 5) {
      for (const exp of item.expansions) {
        console.log(`    → "${exp}"`)
      }
    } else {
      for (const exp of item.expansions.slice(0, 3)) {
        console.log(`    → "${exp}"`)
      }
      console.log(`    ... and ${item.expandedCount - 3} more`)
    }
    console.log()
  }

  // 2. BIGGEST POSITIVE DELTA % (over-expansion)
  console.log('\n📈 BIGGEST POSITIVE EXPANSION DELTA % (Top 30)\n')
  console.log('These may indicate over-expansion or parsing issues\n')

  const biggestGrowth = [...metrics]
    .filter(m => m.expandedCount > 1) // Only expansions
    .sort((a, b) => b.deltaPercent - a.deltaPercent)
    .slice(0, 30)

  for (const item of biggestGrowth) {
    console.log(`+${item.deltaPercent.toFixed(0)}% delta: "${item.originalName}"`)
    console.log(`  Original: ${item.originalLength} chars → Total expanded: ${item.totalExpandedLength} chars`)
    console.log(`  Expanded to ${item.expandedCount} services:`)
    if (item.expandedCount <= 5) {
      for (const exp of item.expansions) {
        console.log(`    → "${exp}"`)
      }
    } else {
      for (const exp of item.expansions.slice(0, 3)) {
        console.log(`    → "${exp}"`)
      }
      console.log(`    ... and ${item.expandedCount - 3} more`)
    }
    console.log()
  }

  // 3. BIGGEST NEGATIVE DELTA % (under-expansion or data loss)
  console.log('\n📉 BIGGEST NEGATIVE EXPANSION DELTA % (Top 30)\n')
  console.log('These may indicate under-expansion or information loss\n')

  const biggestShrink = [...metrics]
    .filter(m => m.deltaPercent < -10) // Significant shrinkage
    .sort((a, b) => a.deltaPercent - b.deltaPercent)
    .slice(0, 30)

  if (biggestShrink.length > 0) {
    for (const item of biggestShrink) {
      console.log(`${item.deltaPercent.toFixed(0)}% delta: "${item.originalName}"`)
      console.log(`  Original: ${item.originalLength} chars → Total expanded: ${item.totalExpandedLength} chars`)
      console.log(`  Expanded to ${item.expandedCount} services:`)
      for (const exp of item.expansions) {
        console.log(`    → "${exp}"`)
      }
      console.log()
    }
  } else {
    console.log('✅ No significant negative deltas found\n')
  }

  // 4. MOST EXPANSIONS
  console.log('\n🔢 SERVICES WITH MOST EXPANSIONS (Top 30)\n')

  const mostExpansions = [...metrics]
    .filter(m => m.expandedCount > 1)
    .sort((a, b) => b.expandedCount - a.expandedCount)
    .slice(0, 30)

  for (const item of mostExpansions) {
    console.log(`${item.expandedCount}× "${item.originalName}"`)
    console.log(`  Original length: ${item.originalLength} chars, Delta: ${item.deltaPercent.toFixed(0)}%`)
    for (const exp of item.expansions.slice(0, 5)) {
      console.log(`    → "${exp}"`)
    }
    if (item.expandedCount > 5) {
      console.log(`    ... and ${item.expandedCount - 5} more`)
    }
    console.log()
  }

  // 5. SUSPECTED PARSING ERRORS
  console.log('\n⚠️  SUSPECTED PARSING ERRORS\n')

  const suspectedErrors: Array<{ reason: string; item: ExpansionMetrics }> = []

  for (const item of metrics) {
    // Error pattern 1: Expanded names are much shorter than original (information loss)
    if (item.expandedCount > 1 && item.avgExpandedLength < item.originalLength * 0.3) {
      suspectedErrors.push({
        reason: 'Expanded names much shorter than original (possible information loss)',
        item
      })
    }

    // Error pattern 2: Very high expansion count (>15) might indicate over-splitting
    if (item.expandedCount > 15) {
      suspectedErrors.push({
        reason: `Very high expansion count (${item.expandedCount}× might be over-split)`,
        item
      })
    }

    // Error pattern 3: Expansion but no delta (same total length - might be duplicates)
    if (item.expandedCount > 1 && Math.abs(item.deltaPercent) < 5) {
      suspectedErrors.push({
        reason: 'Multiple expansions but minimal length change (possible duplicates)',
        item
      })
    }

    // Error pattern 4: Contains "and" or "or" but not expanded
    if (item.expandedCount === 1 && (item.originalName.includes(' and ') || item.originalName.includes(' or '))) {
      if (item.originalLength > 50) { // Only flag longer ones to avoid false positives
        suspectedErrors.push({
          reason: 'Contains "and/or" but not expanded (possible missed compound)',
          item
        })
      }
    }
  }

  console.log(`Found ${suspectedErrors.length} potential issues:\n`)

  // Group by reason
  const errorsByReason = new Map<string, ExpansionMetrics[]>()
  for (const { reason, item } of suspectedErrors) {
    if (!errorsByReason.has(reason)) {
      errorsByReason.set(reason, [])
    }
    errorsByReason.get(reason)!.push(item)
  }

  for (const [reason, items] of errorsByReason) {
    console.log(`\n## ${reason} (${items.length} cases)\n`)
    for (const item of items.slice(0, 10)) {
      console.log(`  "${item.originalName}"`)
      console.log(`    ${item.expandedCount}× expansions, ${item.deltaPercent.toFixed(0)}% delta`)
      for (const exp of item.expansions.slice(0, 3)) {
        console.log(`      → "${exp}"`)
      }
      if (item.expansions.length > 3) {
        console.log(`      ... and ${item.expansions.length - 3} more`)
      }
      console.log()
    }
    if (items.length > 10) {
      console.log(`  ... and ${items.length - 10} more cases\n`)
    }
  }

  // 6. SUMMARY STATISTICS
  console.log('\n📊 SUMMARY STATISTICS\n')

  const totalOriginalLength = metrics.reduce((sum, m) => sum + m.originalLength, 0)
  const totalExpandedLength = metrics.reduce((sum, m) => sum + m.totalExpandedLength, 0)
  const totalExpansions = metrics.reduce((sum, m) => sum + m.expandedCount, 0)
  const servicesWithExpansions = metrics.filter(m => m.expandedCount > 1).length
  const avgExpansionRatio = servicesWithExpansions > 0
    ? metrics.filter(m => m.expandedCount > 1).reduce((sum, m) => sum + m.expandedCount, 0) / servicesWithExpansions
    : 0

  console.log(`Total services: ${metrics.length.toLocaleString()}`)
  console.log(`Services with expansions: ${servicesWithExpansions.toLocaleString()} (${Math.round(servicesWithExpansions/metrics.length*100)}%)`)
  console.log(`Total discrete services: ${totalExpansions.toLocaleString()}`)
  console.log(`Average expansion ratio: ${avgExpansionRatio.toFixed(2)}×`)
  console.log()
  console.log(`Total original character length: ${totalOriginalLength.toLocaleString()}`)
  console.log(`Total expanded character length: ${totalExpandedLength.toLocaleString()}`)
  console.log(`Overall delta: ${((totalExpandedLength - totalOriginalLength) / totalOriginalLength * 100).toFixed(1)}%`)
  console.log()
  console.log(`Longest original name: ${longest[0].originalLength} chars`)
  console.log(`Shortest original name: ${[...metrics].sort((a, b) => a.originalLength - b.originalLength)[0].originalLength} chars`)
  console.log()
  console.log(`Highest expansion count: ${mostExpansions[0].expandedCount}×`)
  console.log(`Highest positive delta: +${biggestGrowth[0].deltaPercent.toFixed(0)}%`)
  if (biggestShrink.length > 0) {
    console.log(`Highest negative delta: ${biggestShrink[0].deltaPercent.toFixed(0)}%`)
  }
  console.log()
  console.log(`Suspected parsing errors: ${suspectedErrors.length} (${Math.round(suspectedErrors.length/metrics.length*100)}%)`)
}

main()

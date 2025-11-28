#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

/**
 * Add wildcard patterns for UNSPSC segments to enable matching
 *
 * DigitalScores.tsv has segment codes like "10000000"
 * Products.tsv has specific codes like "10000591"
 *
 * This script adds "10*" patterns so segment scores apply to all products in that segment
 */

function addUNSPSCWildcards(): void {
  const digitalScoresPath = join(projectRoot, '.enrichment/DigitalScores.tsv')
  const content = readFileSync(digitalScoresPath, 'utf-8')
  const lines = content.split('\n')

  // Find all segment-level product/service scores
  const segmentScores = new Map<string, {
    entity: string
    entityType: string
    segment: string
    actionScore: string
    eventScore: string
    activityScore: string
    resultScore: string
    notes: string
  }>()

  for (const line of lines) {
    if (line.startsWith('#') || line.startsWith('entity\t') || !line.trim()) {
      continue
    }

    const parts = line.split('\t')
    if (parts.length < 8) continue

    const entityType = parts[1]
    const code = parts[2]

    // Look for 8-digit segment codes (e.g., "10000000")
    if ((entityType === 'product' || entityType === 'service') && /^\d{8}$/.test(code) && code.endsWith('000000')) {
      const segment = code.substring(0, 2)

      segmentScores.set(`${entityType}-${segment}`, {
        entity: parts[0],
        entityType: parts[1],
        segment: segment,
        actionScore: parts[3],
        eventScore: parts[4],
        activityScore: parts[5],
        resultScore: parts[6],
        notes: parts[7] || ''
      })
    }
  }

  console.log(`Found ${segmentScores.size} segment-level scores`)

  // Check if wildcards already exist
  const hasWildcards = lines.some(line => /^\S+\t(product|service)\t\d{2}\*\t/.test(line))

  if (hasWildcards) {
    console.log('⚠️  Wildcards already exist in DigitalScores.tsv')
    return
  }

  // Create wildcard entries
  const wildcardLines: string[] = []

  for (const [key, score] of Array.from(segmentScores.entries()).sort()) {
    const wildcard = `${score.segment}*`
    wildcardLines.push(
      `${score.entity}\t${score.entityType}\t${wildcard}\t${score.actionScore}\t${score.eventScore}\t${score.activityScore}\t${score.resultScore}\t${score.notes} [Wildcard for segment ${score.segment}]`
    )
  }

  console.log(`Generated ${wildcardLines.length} wildcard patterns`)

  // Find insertion point (after UNSPSC section)
  let insertIndex = lines.length
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('# NAICS') || lines[i].includes('# SOC') || lines[i].includes('# Integration')) {
      insertIndex = i
      break
    }
  }

  // Insert wildcard patterns
  const updatedLines = [
    ...lines.slice(0, insertIndex),
    '',
    '# UNSPSC Wildcard Patterns - Match all products/services in segment',
    ...wildcardLines,
    ...lines.slice(insertIndex)
  ]

  // Write back
  writeFileSync(digitalScoresPath, updatedLines.join('\n'))
  console.log(`✅ Added ${wildcardLines.length} wildcard patterns to DigitalScores.tsv`)
}

async function main() {
  console.log('='.repeat(80))
  console.log('Add UNSPSC Wildcard Patterns')
  console.log('='.repeat(80))
  console.log()

  addUNSPSCWildcards()

  console.log()
  console.log('✅ Wildcard patterns added!')
  console.log()
  console.log('Next step: Run tsx .scripts/enrich-all-digital-scores.ts')
}

main().catch(console.error)

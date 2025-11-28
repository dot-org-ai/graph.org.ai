#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

/**
 * Generate digital scores for all Actions
 *
 * Actions in Actions.tsv represent API operations used across apps
 * These are inherently digital (API calls, integrations, etc.)
 * Therefore all should have actionScore = 1.0
 */

interface ActionRow {
  id: string
  verb: string
  noun: string
  appCount: string
  usageCount: string
}

function generateActionScores(): void {
  // Read Actions.tsv
  const actionsPath = join(projectRoot, '.data/Actions.tsv')
  const content = readFileSync(actionsPath, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim())

  console.log(`Reading ${actionsPath}...`)

  const headers = lines[0].split('\t')
  const idIndex = headers.indexOf('id')
  const verbIndex = headers.indexOf('verb')
  const nounIndex = headers.indexOf('noun')

  if (idIndex === -1) {
    console.error('❌ Could not find "id" column in Actions.tsv')
    return
  }

  const scores: Array<{
    entity: string
    entityType: string
    codes: string
    actionScore: string
    eventScore: string
    activityScore: string
    resultScore: string
    notes: string
  }> = []

  // Process each action
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t')
    const id = parts[idIndex]
    const verb = parts[verbIndex] || 'unknown'
    const noun = parts[nounIndex] || 'unknown'

    if (!id) continue

    scores.push({
      entity: id,
      entityType: 'action',
      codes: id,
      actionScore: '1.0',
      eventScore: '1.0',
      activityScore: '1.0',
      resultScore: '1.0',
      notes: `API action ${verb}.${noun} - digital integration/API call`
    })
  }

  console.log(`✅ Generated ${scores.length.toLocaleString()} action scores`)

  // Load existing DigitalScores.tsv
  const digitalScoresPath = join(projectRoot, '.enrichment/DigitalScores.tsv')
  const existingContent = readFileSync(digitalScoresPath, 'utf-8')
  const existingLines = existingContent.split('\n')

  // Find where to insert (after comment headers, before first data)
  let insertIndex = 0
  for (let i = 0; i < existingLines.length; i++) {
    if (existingLines[i].trim() && !existingLines[i].startsWith('#')) {
      insertIndex = i
      break
    }
  }

  // Create new lines to insert
  const newLines = [
    '',
    '# API Actions from Actions.tsv - All 100% Digital',
    '# These represent API integrations and digital operations across apps',
    ...scores.map(s =>
      `${s.entity}\t${s.entityType}\t${s.codes}\t${s.actionScore}\t${s.eventScore}\t${s.activityScore}\t${s.resultScore}\t${s.notes}`
    )
  ]

  // Insert new scores
  const updatedLines = [
    ...existingLines.slice(0, insertIndex),
    ...newLines,
    ...existingLines.slice(insertIndex)
  ]

  // Write updated file
  writeFileSync(digitalScoresPath, updatedLines.join('\n'))
  console.log(`✅ Updated ${digitalScoresPath}`)
  console.log(`   Added ${scores.length.toLocaleString()} action scores`)
}

async function main() {
  console.log('='.repeat(80))
  console.log('Generate Digital Scores for Actions')
  console.log('='.repeat(80))
  console.log()

  generateActionScores()

  console.log()
  console.log('✅ Action score generation complete!')
  console.log()
  console.log('Next steps:')
  console.log('1. Run: tsx .scripts/enrich-all-digital-scores.ts')
  console.log('2. Verify improved match rate for Actions.tsv')
}

main().catch(console.error)

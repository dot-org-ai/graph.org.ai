#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

/**
 * Digital Score enrichment script
 *
 * Adds digital scores to Tasks.tsv and Processes.tsv files
 * by looking up scores from DigitalScores.tsv
 */

interface DigitalScoreEntry {
  entity: string
  entityType: string
  codes: string
  actionScore: string | null
  eventScore: string | null
  activityScore: string | null
  resultScore: string | null
  notes: string
}

interface ScoreLookup {
  exact: Map<string, number | null>  // Exact code matches
  wildcards: Array<{ pattern: string, score: number | null }>  // Wildcard patterns
  ranges: Array<{ start: string, end: string, score: number | null }>  // Code ranges
}

/**
 * Load digital scores from enrichment file
 */
function loadDigitalScores(filepath: string): ScoreLookup {
  const content = readFileSync(filepath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))

  const lookup: ScoreLookup = {
    exact: new Map(),
    wildcards: [],
    ranges: []
  }

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t')
    if (parts.length < 4) continue

    const codes = parts[2]
    const actionScore = parts[3]

    // Parse action score as float or null
    const score = actionScore === 'null' || actionScore === '' ? null : parseFloat(actionScore)

    // Handle different code patterns
    if (codes.includes('*')) {
      // Wildcard pattern
      lookup.wildcards.push({ pattern: codes, score })
    } else if (codes.includes('-') && !codes.match(/^\d{2}-\d{4}\.\d{2}$/)) {
      // Range pattern (but not SOC code like 11-1011.00)
      const [start, end] = codes.split('-')
      lookup.ranges.push({ start: start.trim(), end: end.trim(), score })
    } else if (codes.startsWith('[')) {
      // Array of codes
      try {
        const codeArray = JSON.parse(codes)
        for (const code of codeArray) {
          lookup.exact.set(code, score)
        }
      } catch (e) {
        console.warn(`Failed to parse code array: ${codes}`)
      }
    } else {
      // Exact match
      lookup.exact.set(codes, score)
    }
  }

  return lookup
}

/**
 * Check if a code matches a wildcard pattern
 */
function matchesWildcard(code: string, pattern: string): boolean {
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
  return regex.test(code)
}

/**
 * Check if a code is within a range
 */
function inRange(code: string, start: string, end: string): boolean {
  // Simple string comparison - works for hierarchical codes
  return code >= start && code <= end
}

/**
 * Lookup digital score for a code
 */
function lookupDigitalScore(code: string, lookup: ScoreLookup): number | null {
  // 1. Try exact match first
  if (lookup.exact.has(code)) {
    return lookup.exact.get(code)!
  }

  // 2. Try wildcard patterns (more specific patterns should be listed first in the file)
  for (const { pattern, score } of lookup.wildcards) {
    if (matchesWildcard(code, pattern)) {
      return score
    }
  }

  // 3. Try ranges
  for (const { start, end, score } of lookup.ranges) {
    if (inRange(code, start, end)) {
      return score
    }
  }

  // No match found
  return null
}

/**
 * Enrich Tasks.tsv with digital scores
 */
function enrichTasks(lookup: ScoreLookup): void {
  const tasksPath = join(projectRoot, '.data/Tasks.tsv')
  const content = readFileSync(tasksPath, 'utf-8')
  const lines = content.split('\n')

  if (lines.length === 0) {
    console.log('❌ Tasks.tsv is empty')
    return
  }

  // Parse header
  const headers = lines[0].split('\t')
  const taskIdIndex = headers.indexOf('taskId')

  if (taskIdIndex === -1) {
    console.log('❌ taskId column not found in Tasks.tsv')
    return
  }

  // Check if digital column already exists
  const digitalIndex = headers.indexOf('digital')
  if (digitalIndex !== -1) {
    console.log('⚠️  digital column already exists in Tasks.tsv, updating values')
  }

  // Process rows
  const enrichedLines: string[] = []
  let matched = 0
  let unmatched = 0

  // Add digital column to header if it doesn't exist
  if (digitalIndex === -1) {
    enrichedLines.push(lines[0] + '\tdigital')
  } else {
    enrichedLines.push(lines[0])
  }

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const parts = lines[i].split('\t')
    const taskId = parts[taskIdIndex]

    if (!taskId) {
      // Keep line as-is if no taskId
      enrichedLines.push(lines[i] + (digitalIndex === -1 ? '\tnull' : ''))
      continue
    }

    const digitalScore = lookupDigitalScore(taskId, lookup)

    if (digitalScore !== null) {
      matched++
    } else {
      unmatched++
    }

    // Format score
    const scoreStr = digitalScore === null ? 'null' : digitalScore.toFixed(2)

    if (digitalIndex === -1) {
      // Append new column
      enrichedLines.push(lines[i] + '\t' + scoreStr)
    } else {
      // Replace existing column
      parts[digitalIndex] = scoreStr
      enrichedLines.push(parts.join('\t'))
    }
  }

  // Write enriched file
  writeFileSync(tasksPath, enrichedLines.join('\n'))

  console.log(`✅ Enriched Tasks.tsv:`)
  console.log(`   Matched: ${matched.toLocaleString()}`)
  console.log(`   Unmatched: ${unmatched.toLocaleString()}`)
  console.log(`   Match rate: ${((matched / (matched + unmatched)) * 100).toFixed(1)}%`)
}

/**
 * Enrich Processes.tsv with digital scores
 */
function enrichProcesses(lookup: ScoreLookup): void {
  const processesPath = join(projectRoot, '.data/Processes.tsv')
  const content = readFileSync(processesPath, 'utf-8')
  const lines = content.split('\n')

  if (lines.length === 0) {
    console.log('❌ Processes.tsv is empty')
    return
  }

  // Parse header
  const headers = lines[0].split('\t')
  const pcfIdIndex = headers.indexOf('pcfId')

  if (pcfIdIndex === -1) {
    console.log('❌ pcfId column not found in Processes.tsv')
    return
  }

  // Check if digital column already exists
  const digitalIndex = headers.indexOf('digital')
  if (digitalIndex !== -1) {
    console.log('⚠️  digital column already exists in Processes.tsv, updating values')
  }

  // Process rows
  const enrichedLines: string[] = []
  let matched = 0
  let unmatched = 0

  // Add digital column to header if it doesn't exist
  if (digitalIndex === -1) {
    enrichedLines.push(lines[0] + '\tdigital')
  } else {
    enrichedLines.push(lines[0])
  }

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const parts = lines[i].split('\t')
    const pcfId = parts[pcfIdIndex]

    if (!pcfId) {
      // Keep line as-is if no pcfId
      enrichedLines.push(lines[i] + (digitalIndex === -1 ? '\tnull' : ''))
      continue
    }

    const digitalScore = lookupDigitalScore(pcfId, lookup)

    if (digitalScore !== null) {
      matched++
    } else {
      unmatched++
    }

    // Format score
    const scoreStr = digitalScore === null ? 'null' : digitalScore.toFixed(2)

    if (digitalIndex === -1) {
      // Append new column
      enrichedLines.push(lines[i] + '\t' + scoreStr)
    } else {
      // Replace existing column
      parts[digitalIndex] = scoreStr
      enrichedLines.push(parts.join('\t'))
    }
  }

  // Write enriched file
  writeFileSync(processesPath, enrichedLines.join('\n'))

  console.log(`✅ Enriched Processes.tsv:`)
  console.log(`   Matched: ${matched.toLocaleString()}`)
  console.log(`   Unmatched: ${unmatched.toLocaleString()}`)
  console.log(`   Match rate: ${((matched / (matched + unmatched)) * 100).toFixed(1)}%`)
}

async function main() {
  console.log('='.repeat(80))
  console.log('Digital Score Enrichment')
  console.log('='.repeat(80))
  console.log()

  // Load digital scores
  const digitalScoresPath = join(projectRoot, '.enrichment/DigitalScores.tsv')
  console.log(`Loading digital scores from ${digitalScoresPath}...`)
  const lookup = loadDigitalScores(digitalScoresPath)
  console.log(`✅ Loaded ${lookup.exact.size} exact matches, ${lookup.wildcards.length} wildcards, ${lookup.ranges.length} ranges`)
  console.log()

  // Enrich Tasks.tsv
  console.log('Enriching Tasks.tsv...')
  enrichTasks(lookup)
  console.log()

  // Enrich Processes.tsv
  console.log('Enriching Processes.tsv...')
  enrichProcesses(lookup)
  console.log()

  console.log('✅ Digital score enrichment complete!')
}

main().catch(console.error)

#!/usr/bin/env tsx

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

/**
 * Comprehensive Digital Score enrichment script
 *
 * Adds digital scores to ALL entity files in .data/*.tsv
 * by looking up scores from DigitalScores.tsv based on entity type
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

interface ScoreLookupByType {
  [entityType: string]: ScoreLookup
}

interface ScoreLookup {
  exact: Map<string, number | null>  // Exact code matches
  wildcards: Array<{ pattern: string, score: number | null }>  // Wildcard patterns
  ranges: Array<{ start: string, end: string, score: number | null }>  // Code ranges
}

/**
 * Entity type to lookup field mapping
 * Defines which field to use for looking up digital scores for each entity type
 */
const ENTITY_LOOKUP_CONFIG: Record<string, {
  lookupField: string | string[],  // Field(s) to use for code lookup
  entityType: string | string[],   // Entity type(s) in DigitalScores.tsv
  fallbackScore?: number | null    // Default score if no match found
}> = {
  'Tasks.tsv': { lookupField: 'taskId', entityType: 'task' },
  'Processes.tsv': { lookupField: 'pcfId', entityType: 'process' },
  'Occupations.tsv': { lookupField: 'code', entityType: 'occupation' },
  'ONET.Occupations.tsv': { lookupField: 'code', entityType: 'occupation' },
  'Industries.tsv': { lookupField: 'code', entityType: 'industry' },
  'Actions.tsv': { lookupField: 'id', entityType: 'action' },
  'Events.tsv': { lookupField: 'id', entityType: 'action', fallbackScore: null },
  'Products.tsv': { lookupField: ['unspsc', 'code'], entityType: 'product' },
  'Services.tsv': { lookupField: ['unspsc', 'code'], entityType: 'service' },
  'Abilities.tsv': { lookupField: 'code', entityType: 'onetSkill', fallbackScore: 1.0 },
  'Skills.tsv': { lookupField: 'code', entityType: 'onetSkill', fallbackScore: 1.0 },
  'Knowledge.tsv': { lookupField: 'code', entityType: 'onetSkill', fallbackScore: 1.0 },
  'Technologies.tsv': { lookupField: 'code', entityType: 'onetSkill', fallbackScore: 1.0 },
  'Tech.tsv': { lookupField: 'code', entityType: 'onetSkill', fallbackScore: 1.0 },
  'Tools.tsv': { lookupField: 'id', entityType: 'onetSkill', fallbackScore: 1.0 },
  'Types.tsv': { lookupField: 'id', entityType: 'schemaType', fallbackScore: 1.0 },
  'Properties.tsv': { lookupField: 'id', entityType: 'schemaProperty', fallbackScore: 1.0 },
  'IntegrationServices.tsv': { lookupField: 'id', entityType: 'integration', fallbackScore: 1.0 },
  'Nouns.tsv': { lookupField: 'id', entityType: 'noun', fallbackScore: null },
  'Verbs.tsv': { lookupField: 'id', entityType: 'verb', fallbackScore: null },
  'Activities.tsv': { lookupField: 'id', entityType: 'activity', fallbackScore: null },
  'Concepts.tsv': { lookupField: 'id', entityType: 'concept', fallbackScore: null },
  'Searches.tsv': { lookupField: 'id', entityType: 'search', fallbackScore: 1.0 },
  'App.Actions.tsv': { lookupField: 'id', entityType: 'action', fallbackScore: 1.0 },
  'App.Events.tsv': { lookupField: 'id', entityType: 'event', fallbackScore: 1.0 },
  'App.Nouns.tsv': { lookupField: 'id', entityType: 'noun', fallbackScore: 1.0 },
  'App.Searches.tsv': { lookupField: 'id', entityType: 'search', fallbackScore: 1.0 },
  'Apps.tsv': { lookupField: 'id', entityType: 'app', fallbackScore: 1.0 },
  'Models.tsv': { lookupField: 'id', entityType: 'model', fallbackScore: 1.0 },

  // Geography and organizational entities - context dependent
  'Countries.tsv': { lookupField: 'id', entityType: 'country', fallbackScore: null },
  'States.tsv': { lookupField: 'id', entityType: 'state', fallbackScore: null },
  'BusinessTypes.tsv': { lookupField: 'id', entityType: 'businessType', fallbackScore: null },
  'Departments.tsv': { lookupField: 'id', entityType: 'department', fallbackScore: null },

  // Education and career data - context dependent
  'Education.tsv': { lookupField: 'id', entityType: 'education', fallbackScore: null },
  'CareerClusters.tsv': { lookupField: 'id', entityType: 'careerCluster', fallbackScore: null },
  'Careers.tsv': { lookupField: 'id', entityType: 'career', fallbackScore: null },
  'Jobs.tsv': { lookupField: 'id', entityType: 'job', fallbackScore: null },

  // Employment and wage data - digital records but about physical/hybrid work
  'Employment.tsv': { lookupField: 'id', entityType: 'employment', fallbackScore: null },
  'Wages.tsv': { lookupField: 'id', entityType: 'wage', fallbackScore: null },

  // Standards are reference data - highly digital
  'Standards.tsv': { lookupField: 'id', entityType: 'standard', fallbackScore: 1.0 },

  // Language components - used in digital systems but represent abstract concepts
  'Language.Nouns.tsv': { lookupField: 'id', entityType: 'noun', fallbackScore: null },
  'Language.Verbs.tsv': { lookupField: 'id', entityType: 'verb', fallbackScore: null },
  'Language.Adverbs.tsv': { lookupField: 'id', entityType: 'adverb', fallbackScore: null },
  'Language.Adjectives.tsv': { lookupField: 'id', entityType: 'adjective', fallbackScore: null },
  'Language.Conjunctions.tsv': { lookupField: 'id', entityType: 'conjunction', fallbackScore: null },
  'Language.Determiners.tsv': { lookupField: 'id', entityType: 'determiner', fallbackScore: null },
  'Language.Prepositions.tsv': { lookupField: 'id', entityType: 'preposition', fallbackScore: null },
  'Language.Pronouns.tsv': { lookupField: 'id', entityType: 'pronoun', fallbackScore: null },
}

/**
 * Load digital scores from enrichment file, organized by entity type
 */
function loadDigitalScores(filepath: string): ScoreLookupByType {
  const content = readFileSync(filepath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))

  const lookupByType: ScoreLookupByType = {}

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t')
    if (parts.length < 4) continue

    const entityType = parts[1]
    const codes = parts[2]
    const actionScore = parts[3]

    // Initialize lookup for this entity type if needed
    if (!lookupByType[entityType]) {
      lookupByType[entityType] = {
        exact: new Map(),
        wildcards: [],
        ranges: []
      }
    }

    const lookup = lookupByType[entityType]

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

  return lookupByType
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
 * Enrich a single TSV file with digital scores
 */
function enrichFile(
  filename: string,
  lookupByType: ScoreLookupByType
): { matched: number, unmatched: number, skipped: number } {
  const config = ENTITY_LOOKUP_CONFIG[filename]
  if (!config) {
    console.log(`⚠️  No config found for ${filename}, skipping`)
    return { matched: 0, unmatched: 0, skipped: 0 }
  }

  const filepath = join(projectRoot, '.data', filename)
  const content = readFileSync(filepath, 'utf-8')
  const lines = content.split('\n')

  if (lines.length === 0) {
    console.log(`❌ ${filename} is empty`)
    return { matched: 0, unmatched: 0, skipped: 0 }
  }

  // Parse header
  const headers = lines[0].split('\t')

  // Find lookup field(s)
  const lookupFields = Array.isArray(config.lookupField) ? config.lookupField : [config.lookupField]
  const lookupIndices = lookupFields.map(field => headers.indexOf(field)).filter(idx => idx !== -1)

  if (lookupIndices.length === 0) {
    console.log(`❌ No lookup fields found in ${filename}`)
    return { matched: 0, unmatched: 0, skipped: 0 }
  }

  // Get lookups for all entity types configured
  const entityTypes = Array.isArray(config.entityType) ? config.entityType : [config.entityType]
  const lookups = entityTypes.map(type => lookupByType[type]).filter(Boolean)

  // Check if digital column already exists
  const digitalIndex = headers.indexOf('digital')
  if (digitalIndex !== -1) {
    console.log(`⚠️  digital column already exists in ${filename}, updating values`)
  }

  // Process rows
  const enrichedLines: string[] = []
  let matched = 0
  let unmatched = 0
  let skipped = 0

  // Add digital column to header if it doesn't exist
  if (digitalIndex === -1) {
    enrichedLines.push(lines[0] + '\tdigital')
  } else {
    enrichedLines.push(lines[0])
  }

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const parts = lines[i].split('\t')

    // Pad parts to match header length (minus digital column if it doesn't exist yet)
    const targetLength = digitalIndex === -1 ? headers.length : headers.length
    while (parts.length < targetLength) {
      parts.push('')
    }

    // Try to find a score using any of the lookup fields and entity types
    let digitalScore: number | null = null

    for (const lookupIndex of lookupIndices) {
      const code = parts[lookupIndex]
      if (!code) continue

      for (const lookup of lookups) {
        digitalScore = lookupDigitalScore(code, lookup)
        if (digitalScore !== null) break
      }
      if (digitalScore !== null) break
    }

    // Use fallback score if no match found
    if (digitalScore === null && config.fallbackScore !== undefined) {
      digitalScore = config.fallbackScore
      skipped++
    } else if (digitalScore !== null) {
      matched++
    } else {
      unmatched++
    }

    // Format score
    const scoreStr = digitalScore === null ? '' : digitalScore.toFixed(2)

    if (digitalIndex === -1) {
      // Append new column
      parts.push(scoreStr)
      enrichedLines.push(parts.join('\t'))
    } else {
      // Replace existing column
      parts[digitalIndex] = scoreStr
      enrichedLines.push(parts.join('\t'))
    }
  }

  // Write enriched file
  writeFileSync(filepath, enrichedLines.join('\n'))

  return { matched, unmatched, skipped }
}

async function main() {
  console.log('='.repeat(80))
  console.log('Comprehensive Digital Score Enrichment')
  console.log('='.repeat(80))
  console.log()

  // Load digital scores
  const digitalScoresPath = join(projectRoot, '.enrichment/DigitalScores.tsv')
  console.log(`Loading digital scores from ${digitalScoresPath}...`)
  const lookupByType = loadDigitalScores(digitalScoresPath)

  const typeCount = Object.keys(lookupByType).length
  const totalEntries = Object.values(lookupByType).reduce(
    (sum, lookup) => sum + lookup.exact.size + lookup.wildcards.length + lookup.ranges.length,
    0
  )
  console.log(`✅ Loaded ${totalEntries.toLocaleString()} scores across ${typeCount} entity types`)
  console.log()

  // Get all entity files (not relationships)
  const dataDir = join(projectRoot, '.data')
  const allFiles = readdirSync(dataDir).filter(f =>
    f.endsWith('.tsv') && !f.includes('.Relationships.')
  ).sort()

  console.log(`Found ${allFiles.length} entity files to enrich`)
  console.log()

  let totalMatched = 0
  let totalUnmatched = 0
  let totalSkipped = 0
  let processedCount = 0

  // Process each file
  for (const filename of allFiles) {
    try {
      process.stdout.write(`Enriching ${filename}... `)
      const stats = enrichFile(filename, lookupByType)

      totalMatched += stats.matched
      totalUnmatched += stats.unmatched
      totalSkipped += stats.skipped
      processedCount++

      if (stats.matched + stats.unmatched + stats.skipped > 0) {
        const matchRate = ((stats.matched / (stats.matched + stats.unmatched + stats.skipped)) * 100).toFixed(1)
        console.log(`✅ ${stats.matched.toLocaleString()} matched, ${stats.unmatched.toLocaleString()} unmatched, ${stats.skipped.toLocaleString()} fallback (${matchRate}%)`)
      } else {
        console.log(`⚠️  No data processed`)
      }
    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  console.log()
  console.log('='.repeat(80))
  console.log(`✅ Enrichment complete!`)
  console.log(`   Files processed: ${processedCount}`)
  console.log(`   Total matched: ${totalMatched.toLocaleString()}`)
  console.log(`   Total unmatched: ${totalUnmatched.toLocaleString()}`)
  console.log(`   Total with fallback: ${totalSkipped.toLocaleString()}`)
  if (totalMatched + totalUnmatched + totalSkipped > 0) {
    const overallRate = ((totalMatched / (totalMatched + totalUnmatched + totalSkipped)) * 100).toFixed(1)
    console.log(`   Overall match rate: ${overallRate}%`)
  }
  console.log('='.repeat(80))
}

main().catch(console.error)

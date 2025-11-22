#!/usr/bin/env tsx

/**
 * Generate Digital Scores for entities
 *
 * This tool helps generate digital scores for tasks, processes, occupations,
 * industries, products, and services using the multi-dimensional framework.
 */

import { readFileSync, writeFileSync, appendFileSync } from 'fs'
import { join } from 'path'

interface DigitalScore {
  entity: string
  entityType: 'process' | 'occupation' | 'industry' | 'product' | 'service' | 'task' | 'action' | 'schemaType' | 'schemaProperty' | 'bizStep' | 'integration' | 'onetSkill'
  codes: string
  actionScore: number | null
  eventScore: number | null
  activityScore: number | null
  resultScore: number | null
  notes: string
}

interface EntityToScore {
  code: string
  name: string
  description?: string
  type: string
}

/**
 * Score a single entity using LLM reasoning
 */
async function scoreEntity(entity: EntityToScore): Promise<DigitalScore> {
  // This is a placeholder - in real implementation, this would call an LLM
  // to reason about the digital scores based on the framework

  const prompt = `
Using the Digital Score Framework, score this entity:

Entity: ${entity.name}
Type: ${entity.type}
Code: ${entity.code}
Description: ${entity.description || 'N/A'}

Framework:
1. Action Score (0.0-1.0 or null): Can an AI make an API call to initiate/execute this?
   - 1.0: AI can execute via tool call
   - 0.5: AI can initiate, requires physical execution
   - 0.0: Requires physical presence
   - null: Modality unspecified

2. Event Score (0.0-1.0 or null): Can this state change be represented digitally?
   - 1.0: ALWAYS - All events can be digitally represented
   - null: Only if event concept doesn't exist

3. Activity Score (0.0-1.0 or null): What's the digital/physical mix of execution?
   - 1.0: Pure digital activity
   - 0.5: Hybrid
   - 0.0: Pure physical
   - null: Context-dependent

4. Result Score (0.0-1.0 or null): Is the outcome digitally accessible?
   - 1.0: Digital output
   - 0.5: Physical with digital representation
   - 0.0: Pure physical
   - null: Context-dependent

Return JSON with: actionScore, eventScore, activityScore, resultScore, notes
`

  // Placeholder return - replace with actual LLM call
  return {
    entity: toCamelCase(entity.name),
    entityType: entity.type as any,
    codes: entity.code,
    actionScore: null,
    eventScore: 1.0,
    activityScore: null,
    resultScore: null,
    notes: `TODO: Score ${entity.name}`,
  }
}

/**
 * Convert string to camelCase
 */
function toCamelCase(str: string): string {
  return str
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .map((word, i) => {
      if (i === 0) return word.toLowerCase()
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join('')
}

/**
 * Format score as TSV line
 */
function formatScoreLine(score: DigitalScore): string {
  const formatScore = (s: number | null) => s === null ? 'null' : s.toFixed(2)

  return [
    score.entity,
    score.entityType,
    score.codes,
    formatScore(score.actionScore),
    formatScore(score.eventScore),
    formatScore(score.activityScore),
    formatScore(score.resultScore),
    score.notes,
  ].join('\t')
}

/**
 * Batch score entities and append to file
 */
async function batchScore(
  entities: EntityToScore[],
  outputFile: string,
  batchSize: number = 10
): Promise<void> {
  console.log(`Scoring ${entities.length} entities in batches of ${batchSize}...`)

  for (let i = 0; i < entities.length; i += batchSize) {
    const batch = entities.slice(i, i + batchSize)
    console.log(`\nBatch ${Math.floor(i / batchSize) + 1}/${Math.ceil(entities.length / batchSize)}`)

    const scores = await Promise.all(batch.map(scoreEntity))

    // Append to file
    const lines = scores.map(formatScoreLine).join('\n') + '\n'
    appendFileSync(outputFile, lines, 'utf-8')

    console.log(`  Scored ${batch.length} entities`)
  }
}

/**
 * Load entities from parsed data files
 */
function loadEntities(filePath: string, type: string, codeField: string, nameField: string): EntityToScore[] {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'))

  if (lines.length === 0) return []

  const header = lines[0].split('\t')
  const codeIdx = header.indexOf(codeField)
  const nameIdx = header.indexOf(nameField)
  const descIdx = header.indexOf('Description') >= 0 ? header.indexOf('Description') : -1

  if (codeIdx === -1 || nameIdx === -1) {
    console.error(`Could not find code field '${codeField}' or name field '${nameField}' in ${filePath}`)
    return []
  }

  return lines.slice(1).map(line => {
    const fields = line.split('\t')
    return {
      code: fields[codeIdx] || '',
      name: fields[nameIdx] || '',
      description: descIdx >= 0 ? fields[descIdx] : undefined,
      type,
    }
  }).filter(e => e.code && e.name)
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  const projectRoot = join(__dirname, '..')
  const enrichmentFile = join(projectRoot, '.enrichment', 'DigitalScores.tsv')
  const dataDir = join(projectRoot, '.data', 'parsed')

  switch (command) {
    case 'score-apqc': {
      const entities = loadEntities(
        join(dataDir, 'APQC.Processes.Expanded.tsv'),
        'process',
        'ElementID',
        'ProcessName'
      )
      console.log(`Loaded ${entities.length} APQC processes`)
      // await batchScore(entities, enrichmentFile)
      console.log('TODO: Implement LLM scoring')
      break
    }

    case 'score-onet-tasks': {
      const entities = loadEntities(
        join(dataDir, 'ONET.Tasks.Expanded.tsv'),
        'task',
        'Task ID',
        'Task'
      )
      console.log(`Loaded ${entities.length} O*NET tasks`)
      // await batchScore(entities, enrichmentFile)
      console.log('TODO: Implement LLM scoring')
      break
    }

    case 'score-soc': {
      const entities = loadEntities(
        join(dataDir, 'ONET.OccupationData.Expanded.tsv'),
        'occupation',
        'O*NET-SOC Code',
        'Title'
      )
      console.log(`Loaded ${entities.length} SOC occupations`)
      // await batchScore(entities, enrichmentFile)
      console.log('TODO: Implement LLM scoring')
      break
    }

    case 'generate-prompt': {
      const entityType = args[1]
      const sampleSize = parseInt(args[2] || '10')

      console.log(`\nGenerating scoring prompt for ${entityType} (${sampleSize} samples)...\n`)

      let entities: EntityToScore[] = []

      switch (entityType) {
        case 'apqc':
          entities = loadEntities(
            join(dataDir, 'APQC.Processes.Expanded.tsv'),
            'process',
            'ElementID',
            'ProcessName'
          )
          break
        case 'onet-tasks':
          entities = loadEntities(
            join(dataDir, 'ONET.Tasks.Expanded.tsv'),
            'task',
            'Task ID',
            'Task'
          )
          break
        case 'soc':
          entities = loadEntities(
            join(dataDir, 'ONET.OccupationData.Expanded.tsv'),
            'occupation',
            'O*NET-SOC Code',
            'Title'
          )
          break
        default:
          console.error(`Unknown entity type: ${entityType}`)
          console.log('Available types: apqc, onet-tasks, soc')
          process.exit(1)
      }

      const samples = entities.slice(0, sampleSize)

      console.log('='.repeat(80))
      console.log('DIGITAL SCORING PROMPT')
      console.log('='.repeat(80))
      console.log()
      console.log('Score these entities using the Digital Score Framework:')
      console.log()
      console.log('Framework:')
      console.log('1. Action Score: Can AI make an API call to initiate/execute this?')
      console.log('2. Event Score: Can this state change be represented digitally? (usually 1.0)')
      console.log('3. Activity Score: Digital/physical mix of execution')
      console.log('4. Result Score: Is the outcome digitally accessible?')
      console.log()
      console.log('Entities to score:')
      console.log('-'.repeat(80))
      samples.forEach((e, i) => {
        console.log(`\n${i + 1}. ${e.name}`)
        console.log(`   Code: ${e.code}`)
        if (e.description) console.log(`   Description: ${e.description}`)
      })
      console.log()
      console.log('='.repeat(80))
      console.log('Generate TSV format:')
      console.log('entity\tentityType\tcodes\tactionScore\teventScore\tactivityScore\tresultScore\tnotes')
      console.log('='.repeat(80))
      break
    }

    default:
      console.log('Digital Score Generator')
      console.log()
      console.log('Usage:')
      console.log('  tsx .scripts/generate-digital-scores.ts <command> [options]')
      console.log()
      console.log('Commands:')
      console.log('  score-apqc           Score APQC processes')
      console.log('  score-onet-tasks     Score O*NET tasks')
      console.log('  score-soc            Score SOC occupations')
      console.log('  generate-prompt <type> [size]  Generate prompt for manual scoring')
      console.log()
      console.log('Examples:')
      console.log('  tsx .scripts/generate-digital-scores.ts generate-prompt apqc 20')
      console.log('  tsx .scripts/generate-digital-scores.ts generate-prompt onet-tasks 50')
      console.log('  tsx .scripts/generate-digital-scores.ts generate-prompt soc 30')
  }
}

main().catch(console.error)

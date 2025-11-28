#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

/**
 * Generate digital scores for O*NET Tasks using keyword-based heuristics
 *
 * Based on the DigitalScore methodology: "Can an AI make an API call to execute this?"
 * - 1.0: Pure digital (data analysis, software, systems, digital communication)
 * - 0.8-0.9: Mostly digital (planning, budgeting, reporting with digital tools)
 * - 0.5-0.7: Hybrid (meetings, communication - could be digital or in-person)
 * - 0.2-0.4: Mostly physical (hands-on work, physical presence required)
 * - 0.0: Pure physical (manual labor, physical installation, etc.)
 */

interface TaskRow {
  onetCode: string
  taskId: string
  task: string
  taskType: string
}

// Keyword patterns for scoring (ordered by priority - most specific first)
// Methodology: "Can an AI agent make an API/tool call to execute this remotely?"
const SCORE_PATTERNS = [
  // 1.0 - Fully digital operations (can be done remotely via computer/API)
  {
    score: 1.0,
    patterns: [
      // Software, systems, data
      /\b(software|database|system|website|app|application|digital|electronic|online|computer|data|email|spreadsheet|internet|api|code|program)\b/i,
      /\b(analyze.*data|create.*report|generate.*report|maintain.*record|update.*system|enter.*data|process.*data|review.*data)\b/i,
      /\b(input|output|upload|download|post|publish online|manage.*website)\b/i,
      // Research and analysis - can be done via search APIs, data analysis tools
      /\b(research|analyze|evaluate|assess|review|study|investigate|examine|monitor)\b/i,
      /\b(calculate|compute|tabulate|statistical|forecast|project|model)\b/i,
      // Planning and documentation - can be done via document APIs, planning tools
      /\b(prepare|develop|create|write|draft|document|plan|design|formulate).*\b(budget|report|plan|policy|procedure|document|proposal|specification|strategy)\b/i,
      /\b(maintain.*record|update.*record|file.*report|submit.*report|prepare.*report)\b/i,
      // Coordination and management - can be done via calendar, email, project management APIs
      /\b(coordinate|organize|schedule|arrange|manage|oversee|direct|supervise|administer|allocate)\b/i,
      /\b(implement.*system|establish.*procedure|develop.*process|track|monitor)\b/i,
      // Communication - can be done via email, messaging, video APIs
      /\b(communicate|discuss|present|explain|inform|notify|advise|consult|recommend|provide.*information)\b/i,
      /\b(confer|collaborate|liaise|interface|interact|correspond|send|receive|respond)\b/i,
      /\b(email|message|call|text|chat|video.*call|teleconference)\b/i,
      // Digital meetings and collaboration
      /\b(attend|participate in|conduct|lead|facilitate|host).*\b(meeting|conference|call|session|webinar)\b/i,
      /\b(review|approve|authorize|sign.*electronic|submit.*online)\b/i
    ],
    note: 'Pure digital - can be executed remotely via computer/API/MCP tools'
  },

  // 0.50 - Hybrid - depends on whether physical presence is required
  {
    score: 0.50,
    patterns: [
      /\b(visit|tour|walk.*through|inspect.*site|inspect.*facility|inspect.*location)\b/i,
      /\b(meet.*in.*person|greet.*customer|greet.*client|welcome.*visitor)\b/i,
      /\b(observe.*site|examine.*equipment|examine.*machinery|examine.*physical)\b/i,
      /\b(demonstrate.*equipment|demonstrate.*product.*to|show.*customer)\b/i
    ],
    note: 'Hybrid - may require physical presence (site visits, in-person demos)'
  },

  // 0.30 - Physical customer/client service
  {
    score: 0.30,
    patterns: [
      /\b(serve|assist|help|greet|wait on|attend to).*\b(customer|client|patient|guest|visitor)\b/i,
      /\b(handle.*transaction|process.*payment|cash register)\b/i
    ],
    note: 'Customer service - often requires physical presence'
  },

  // 0.20 - Hands-on physical work
  {
    score: 0.20,
    patterns: [
      /\b(operate|drive|pilot|steer|control).*\b(vehicle|equipment|machine|tool)\b/i,
      /\b(assemble|build|construct|install|repair|maintain|fix|clean).*\b(equipment|machine|structure)\b/i,
      /\b(lift|carry|move|transport|load|unload)\b/i,
      /\b(cut|drill|weld|solder|paint|sand)\b/i
    ],
    note: 'Hands-on physical work - requires physical presence'
  },

  // 0.10 - Manual labor and physical tasks
  {
    score: 0.10,
    patterns: [
      /\b(dig|excavate|pour|mix|haul|shovel|rake|sweep)\b/i,
      /\b(plant|harvest|pick|prune|trim)\b/i,
      /\b(perform.*manual|perform.*physical)\b/i
    ],
    note: 'Manual labor - purely physical'
  }
]

function scoreTask(taskDescription: string): { score: number, note: string } {
  const task = taskDescription.toLowerCase()

  // Try to match patterns in priority order
  for (const pattern of SCORE_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (regex.test(task)) {
        return { score: pattern.score, note: pattern.note }
      }
    }
  }

  // Default: Most knowledge work is digital, so default high unless proven otherwise
  return { score: 0.90, note: 'No clear pattern - defaulting to digital knowledge work' }
}

function generateTaskScores(): void {
  // Read O*NET Task Statements
  const taskStatementsPath = join(projectRoot, '.source/ONET/ONET.TaskStatements.tsv')
  const content = readFileSync(taskStatementsPath, 'utf-8')
  const lines = content.split('\n').filter(l => l.trim())

  console.log(`Reading ${taskStatementsPath}...`)

  const headers = lines[0].split('\t')
  const onetCodeIndex = headers.indexOf('oNETSOCCode')
  const taskIdIndex = headers.indexOf('taskID')
  const taskIndex = headers.indexOf('task')

  if (taskIdIndex === -1 || taskIndex === -1) {
    console.error('❌ Could not find required columns in O*NET TaskStatements')
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

  // Track score distribution
  const scoreDistribution = new Map<number, number>()

  // Process each task
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t')
    const taskId = parts[taskIdIndex]
    const taskDescription = parts[taskIndex]

    if (!taskId || !taskDescription) continue

    const { score, note } = scoreTask(taskDescription)

    // Track distribution
    scoreDistribution.set(score, (scoreDistribution.get(score) || 0) + 1)

    scores.push({
      entity: taskId,
      entityType: 'task',
      codes: taskId,
      actionScore: score.toFixed(2),
      eventScore: '1.0', // Events are always digital (state changes recorded digitally)
      activityScore: score.toFixed(2), // Activity score matches action score
      resultScore: score >= 0.7 ? '1.0' : score.toFixed(2), // High-digital tasks produce digital results
      notes: `${note} | ${taskDescription.substring(0, 100)}${taskDescription.length > 100 ? '...' : ''}`
    })
  }

  console.log(`✅ Generated ${scores.length.toLocaleString()} task scores`)
  console.log()
  console.log('Score distribution:')
  Array.from(scoreDistribution.entries())
    .sort((a, b) => b[0] - a[0])
    .forEach(([score, count]) => {
      const pct = ((count / scores.length) * 100).toFixed(1)
      console.log(`  ${score.toFixed(2)}: ${count.toLocaleString()} tasks (${pct}%)`)
    })

  // Load existing DigitalScores.tsv
  const digitalScoresPath = join(projectRoot, '.enrichment/DigitalScores.tsv')
  const existingContent = readFileSync(digitalScoresPath, 'utf-8')
  const existingLines = existingContent.split('\n')

  // Find where to insert (after API Actions section)
  let insertIndex = existingLines.length
  for (let i = 0; i < existingLines.length; i++) {
    if (existingLines[i].includes('# O*NET') || existingLines[i].includes('# SOC')) {
      insertIndex = i
      break
    }
  }

  // Create new lines to insert
  const newLines = [
    '',
    '# O*NET Task Statements - Digital Scores Based on Task Nature',
    '# Scored using keyword heuristics and digital capability analysis',
    '# Pattern: High scores (0.8-1.0) = digital tools/systems, Low scores (0.0-0.3) = physical work',
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
  console.log()
  console.log(`✅ Updated ${digitalScoresPath}`)
  console.log(`   Added ${scores.length.toLocaleString()} task scores`)
}

async function main() {
  console.log('='.repeat(80))
  console.log('Generate Digital Scores for O*NET Tasks')
  console.log('='.repeat(80))
  console.log()

  generateTaskScores()

  console.log()
  console.log('✅ Task score generation complete!')
  console.log()
  console.log('Next steps:')
  console.log('1. Review score distribution to validate heuristics')
  console.log('2. Run: tsx .scripts/enrich-all-digital-scores.ts')
  console.log('3. Verify improved match rate for Tasks.tsv')
  console.log()
  console.log('Note: Tasks in Tasks.tsv need taskId field populated to match these scores')
}

main().catch(console.error)

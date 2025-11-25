#!/usr/bin/env tsx
/**
 * Parse GraphDL semantic statements from Tasks and Processes
 *
 * Takes GraphDL statements like:
 * - ChiefExecutives.direct.Organization'sFinancialBudgetActivities.to.FundOperationsMaximizeInvestmentsIncreaseEfficiency
 *
 * And creates parsed statement entities:
 * - url: https://tasks.org.ai/ChiefExecutives.direct.Organization'sFinancialBudgetActivities.to.FundOperationsMaximizeInvestmentsIncreaseEfficiency
 * - ns: tasks.org.ai
 * - type: Statement
 * - id: ChiefExecutives.direct.Organization'sFinancialBudgetActivities.to.FundOperationsMaximizeInvestmentsIncreaseEfficiency
 * - subject: ChiefExecutives
 * - predicate: direct
 * - object: Organization'sFinancialBudgetActivities
 * - preposition: to
 * - complement: FundOperationsMaximizeInvestmentsIncreaseEfficiency
 *
 * Also creates relationships:
 * - Statement → hasSubject → Noun
 * - Statement → hasPredicate → Verb
 * - Statement → hasObject → Noun
 * - Statement → hasComplement → Noun (if present)
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const DATA_DIR = '.data'

interface ParsedStatement {
  url: string
  ns: string
  type: string
  id: string
  code: string
  name: string
  description: string
  subject?: string
  predicate?: string
  object?: string
  preposition?: string
  complement?: string
  sourceUrl: string
  sourceNs: string
}

interface Relationship {
  ns: string
  from: string
  to: string
  predicate: string
  reverse: string
}

function parseTSV(content: string): any[] {
  const lines = content.split('\n').filter(l => l.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split('\t')
  const rows: any[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t')
    const obj: any = {}
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] || ''
    }
    rows.push(obj)
  }

  return rows
}

function writeTSV(filePath: string, rows: any[]): void {
  if (rows.length === 0) {
    console.warn(`No data to write`)
    return
  }

  const headers = Object.keys(rows[0])
  const lines = [headers.join('\t')]

  for (const row of rows) {
    const values = headers.map(h => row[h] || '')
    lines.push(values.join('\t'))
  }

  writeFileSync(filePath, lines.join('\n') + '\n', 'utf-8')
}

const PREPOSITIONS = new Set([
  'to', 'for', 'with', 'in', 'on', 'at', 'by', 'from', 'of',
  'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'among', 'against', 'within'
])

function parseGraphDLStatement(graphdlId: string): {
  subject?: string
  predicate?: string
  object?: string
  preposition?: string
  complement?: string
} {
  const parts = graphdlId.split('.')

  if (parts.length < 2) {
    return {}
  }

  const result: any = {}

  // First part is always the subject
  result.subject = parts[0]

  // Second part is always the predicate (verb)
  result.predicate = parts[1]

  // Find preposition if it exists
  let prepIndex = -1
  for (let i = 2; i < parts.length; i++) {
    if (PREPOSITIONS.has(parts[i].toLowerCase())) {
      prepIndex = i
      break
    }
  }

  if (prepIndex > -1) {
    // Has preposition
    // Everything between predicate and preposition is the object
    if (prepIndex > 2) {
      result.object = parts.slice(2, prepIndex).join('.')
    }
    result.preposition = parts[prepIndex]
    // Everything after preposition is the complement
    if (prepIndex < parts.length - 1) {
      result.complement = parts.slice(prepIndex + 1).join('.')
    }
  } else {
    // No preposition - everything after predicate is the object
    if (parts.length > 2) {
      result.object = parts.slice(2).join('.')
    }
  }

  return result
}

function camelCaseToTitle(str: string): string {
  // Convert PascalCase to Title Case with spaces
  return str.replace(/([A-Z])/g, ' $1').trim()
}

function main() {
  console.log('🔍 Parsing GraphDL semantic statements from Tasks and Processes...\n')

  // Load Tasks
  const tasksPath = resolve(DATA_DIR, 'Tasks.tsv')
  const tasksContent = readFileSync(tasksPath, 'utf-8')
  const tasks = parseTSV(tasksContent)

  // Load Processes
  const processesPath = resolve(DATA_DIR, 'Processes.tsv')
  const processesContent = readFileSync(processesPath, 'utf-8')
  const processes = parseTSV(processesContent)

  console.log(`📊 Analyzing ${tasks.length} tasks and ${processes.length} processes...\n`)

  const taskStatements: ParsedStatement[] = []
  const taskRelationships: Relationship[] = []

  const processStatements: ParsedStatement[] = []
  const processRelationships: Relationship[] = []

  // Parse tasks
  for (const task of tasks) {
    if (!task.id || !task.id.includes('.')) continue

    const parsed = parseGraphDLStatement(task.id)
    const statementUrl = `https://tasks.org.ai/${task.id}`

    taskStatements.push({
      url: statementUrl,
      ns: 'tasks.org.ai',
      type: 'Statement',
      id: task.id,
      code: '',
      name: task.name || task.description || camelCaseToTitle(task.id),
      description: task.description || task.name || '',
      ...parsed,
      sourceUrl: task.url,
      sourceNs: task.ns
    })

    // Create relationship back to source Task
    taskRelationships.push({
      ns: 'tasks.org.ai',
      from: statementUrl,
      to: task.url,
      predicate: 'parsedFrom',
      reverse: 'parsedAs'
    })

    // Create relationships to semantic components
    if (parsed.subject) {
      taskRelationships.push({
        ns: 'tasks.org.ai',
        from: statementUrl,
        to: `https://business.org.ai/Noun/${parsed.subject}`,
        predicate: 'hasSubject',
        reverse: 'subjectOf'
      })
    }

    if (parsed.predicate) {
      taskRelationships.push({
        ns: 'tasks.org.ai',
        from: statementUrl,
        to: `https://verbs.org.ai/${parsed.predicate}`,
        predicate: 'hasPredicate',
        reverse: 'predicateOf'
      })
    }

    if (parsed.object) {
      taskRelationships.push({
        ns: 'tasks.org.ai',
        from: statementUrl,
        to: `https://business.org.ai/Noun/${parsed.object}`,
        predicate: 'hasObject',
        reverse: 'objectOf'
      })
    }

    if (parsed.complement) {
      taskRelationships.push({
        ns: 'tasks.org.ai',
        from: statementUrl,
        to: `https://business.org.ai/Noun/${parsed.complement}`,
        predicate: 'hasComplement',
        reverse: 'complementOf'
      })
    }
  }

  // Parse processes
  for (const process of processes) {
    if (!process.id || !process.id.includes('.')) continue

    const parsed = parseGraphDLStatement(process.id)
    const statementUrl = `https://processes.org.ai/${process.id}`

    processStatements.push({
      url: statementUrl,
      ns: 'processes.org.ai',
      type: 'Statement',
      id: process.id,
      code: '',
      name: process.name || process.description || camelCaseToTitle(process.id),
      description: process.description || process.name || '',
      ...parsed,
      sourceUrl: process.url,
      sourceNs: process.ns
    })

    // Create relationship back to source Process
    processRelationships.push({
      ns: 'processes.org.ai',
      from: statementUrl,
      to: process.url,
      predicate: 'parsedFrom',
      reverse: 'parsedAs'
    })

    // Create relationships to semantic components
    if (parsed.subject) {
      processRelationships.push({
        ns: 'processes.org.ai',
        from: statementUrl,
        to: `https://business.org.ai/Noun/${parsed.subject}`,
        predicate: 'hasSubject',
        reverse: 'subjectOf'
      })
    }

    if (parsed.predicate) {
      processRelationships.push({
        ns: 'processes.org.ai',
        from: statementUrl,
        to: `https://verbs.org.ai/${parsed.predicate}`,
        predicate: 'hasPredicate',
        reverse: 'predicateOf'
      })
    }

    if (parsed.object) {
      processRelationships.push({
        ns: 'processes.org.ai',
        from: statementUrl,
        to: `https://business.org.ai/Noun/${parsed.object}`,
        predicate: 'hasObject',
        reverse: 'objectOf'
      })
    }

    if (parsed.complement) {
      processRelationships.push({
        ns: 'processes.org.ai',
        from: statementUrl,
        to: `https://business.org.ai/Noun/${parsed.complement}`,
        predicate: 'hasComplement',
        reverse: 'complementOf'
      })
    }
  }

  console.log(`✅ Parsed ${taskStatements.length} task statements`)
  console.log(`✅ Parsed ${processStatements.length} process statements`)
  console.log(`✅ Created ${taskRelationships.length} task statement relationships`)
  console.log(`✅ Created ${processRelationships.length} process statement relationships\n`)

  // Write parsed task statements
  const parsedTasksPath = resolve(DATA_DIR, 'ParsedTasks.tsv')
  writeTSV(parsedTasksPath, taskStatements)
  console.log(`📝 Wrote ${parsedTasksPath}`)

  // Write parsed process statements
  const parsedProcessesPath = resolve(DATA_DIR, 'ParsedProcesses.tsv')
  writeTSV(parsedProcessesPath, processStatements)
  console.log(`📝 Wrote ${parsedProcessesPath}`)

  // Write task statement relationships
  const taskRelsPath = resolve(DATA_DIR, 'ParsedTasks.Relationships.tsv')
  writeTSV(taskRelsPath, taskRelationships)
  console.log(`📝 Wrote ${taskRelsPath}`)

  // Write process statement relationships
  const processRelsPath = resolve(DATA_DIR, 'ParsedProcesses.Relationships.tsv')
  writeTSV(processRelsPath, processRelationships)
  console.log(`📝 Wrote ${processRelsPath}`)

  console.log('\n✅ Done!')
  console.log(`   Total parsed statements: ${taskStatements.length + processStatements.length}`)
  console.log(`   Total relationships: ${taskRelationships.length + processRelationships.length}`)
}

main()

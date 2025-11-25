#!/usr/bin/env tsx
/**
 * Add semantic parsing fields to Tasks.tsv and Processes.tsv
 * Append semantic relationships to existing relationship files
 *
 * Adds fields: subject, predicate, object, preposition, complement
 * Appends relationships: hasSubject, hasPredicate, hasObject, hasComplement
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const DATA_DIR = '.data'

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

function main() {
  console.log('🔍 Adding semantic parsing to Tasks and Processes...\n')

  // Load Tasks
  const tasksPath = resolve(DATA_DIR, 'Tasks.tsv')
  const tasksContent = readFileSync(tasksPath, 'utf-8')
  const tasks = parseTSV(tasksContent)

  // Load Processes
  const processesPath = resolve(DATA_DIR, 'Processes.tsv')
  const processesContent = readFileSync(processesPath, 'utf-8')
  const processes = parseTSV(processesContent)

  console.log(`📊 Processing ${tasks.length} tasks and ${processes.length} processes...\n`)

  const taskRelationships: Relationship[] = []
  const processRelationships: Relationship[] = []

  // Add semantic fields to tasks
  for (const task of tasks) {
    if (!task.id || !task.id.includes('.')) continue

    const parsed = parseGraphDLStatement(task.id)

    task.subject = parsed.subject || ''
    task.predicate = parsed.predicate || ''
    task.object = parsed.object || ''
    task.preposition = parsed.preposition || ''
    task.complement = parsed.complement || ''

    // Create relationships to semantic components
    if (parsed.subject) {
      taskRelationships.push({
        ns: 'onet.org.ai',
        from: task.url,
        to: `https://business.org.ai/Noun/${parsed.subject}`,
        predicate: 'hasSubject',
        reverse: 'subjectOf'
      })
    }

    if (parsed.predicate) {
      taskRelationships.push({
        ns: 'onet.org.ai',
        from: task.url,
        to: `https://verbs.org.ai/${parsed.predicate}`,
        predicate: 'hasPredicate',
        reverse: 'predicateOf'
      })
    }

    if (parsed.object) {
      taskRelationships.push({
        ns: 'onet.org.ai',
        from: task.url,
        to: `https://business.org.ai/Noun/${parsed.object}`,
        predicate: 'hasObject',
        reverse: 'objectOf'
      })
    }

    if (parsed.complement) {
      taskRelationships.push({
        ns: 'onet.org.ai',
        from: task.url,
        to: `https://business.org.ai/Noun/${parsed.complement}`,
        predicate: 'hasComplement',
        reverse: 'complementOf'
      })
    }
  }

  // Add semantic fields to processes
  for (const process of processes) {
    if (!process.id || !process.id.includes('.')) continue

    const parsed = parseGraphDLStatement(process.id)

    process.subject = parsed.subject || ''
    process.predicate = parsed.predicate || ''
    process.object = parsed.object || ''
    process.preposition = parsed.preposition || ''
    process.complement = parsed.complement || ''

    // Create relationships to semantic components
    if (parsed.subject) {
      processRelationships.push({
        ns: 'apqc.org.ai',
        from: process.url,
        to: `https://business.org.ai/Noun/${parsed.subject}`,
        predicate: 'hasSubject',
        reverse: 'subjectOf'
      })
    }

    if (parsed.predicate) {
      processRelationships.push({
        ns: 'apqc.org.ai',
        from: process.url,
        to: `https://verbs.org.ai/${parsed.predicate}`,
        predicate: 'hasPredicate',
        reverse: 'predicateOf'
      })
    }

    if (parsed.object) {
      processRelationships.push({
        ns: 'apqc.org.ai',
        from: process.url,
        to: `https://business.org.ai/Noun/${parsed.object}`,
        predicate: 'hasObject',
        reverse: 'objectOf'
      })
    }

    if (parsed.complement) {
      processRelationships.push({
        ns: 'apqc.org.ai',
        from: process.url,
        to: `https://business.org.ai/Noun/${parsed.complement}`,
        predicate: 'hasComplement',
        reverse: 'complementOf'
      })
    }
  }

  console.log(`✅ Parsed ${tasks.length} task statements`)
  console.log(`✅ Parsed ${processes.length} process statements`)
  console.log(`✅ Created ${taskRelationships.length} task semantic relationships`)
  console.log(`✅ Created ${processRelationships.length} process semantic relationships\n`)

  // Write updated Tasks.tsv
  writeTSV(tasksPath, tasks)
  console.log(`📝 Updated ${tasksPath}`)

  // Write updated Processes.tsv
  writeTSV(processesPath, processes)
  console.log(`📝 Updated ${processesPath}`)

  // Load existing task relationships and append
  const taskRelsPath = resolve(DATA_DIR, 'Tasks.Relationships.tsv')
  let existingTaskRels: any[] = []
  try {
    const relsContent = readFileSync(taskRelsPath, 'utf-8')
    existingTaskRels = parseTSV(relsContent)
  } catch (error) {
    console.log('⚠️  Tasks.Relationships.tsv not found, will create new file')
  }

  const allTaskRels = [...existingTaskRels, ...taskRelationships]
  writeTSV(taskRelsPath, allTaskRels)
  console.log(`📝 Updated ${taskRelsPath} (${existingTaskRels.length} → ${allTaskRels.length})`)

  // Load existing process relationships and append
  const processRelsPath = resolve(DATA_DIR, 'Processes.Relationships.tsv')
  let existingProcessRels: any[] = []
  try {
    const relsContent = readFileSync(processRelsPath, 'utf-8')
    existingProcessRels = parseTSV(relsContent)
  } catch (error) {
    console.log('⚠️  Processes.Relationships.tsv not found, will create new file')
  }

  const allProcessRels = [...existingProcessRels, ...processRelationships]
  writeTSV(processRelsPath, allProcessRels)
  console.log(`📝 Updated ${processRelsPath} (${existingProcessRels.length} → ${allProcessRels.length})`)

  console.log('\n✅ Done!')
}

main()

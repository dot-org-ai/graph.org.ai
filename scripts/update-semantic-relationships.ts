#!/usr/bin/env tsx
/**
 * Update semantic relationships with better predicates
 *
 * Old predicates (too generic):
 * - hasSubject/subjectOf
 * - hasPredicate/predicateOf
 * - hasObject/objectOf
 * - hasComplement/complementOf
 *
 * New predicates (semantically meaningful):
 * - performedBy/performs (who does the task)
 * - requiresAction/actionRequiredFor (what action is taken)
 * - affects/affectedBy (what is affected/targeted)
 * - achieves/achievedBy (what is the goal/purpose)
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const DATA_DIR = '.data'

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

function updateRelationships(filePath: string, mapping: Record<string, { predicate: string, reverse: string }>) {
  console.log(`\n📝 Updating ${filePath}...`)

  const content = readFileSync(filePath, 'utf-8')
  const rows = parseTSV(content)

  let updated = 0
  for (const row of rows) {
    const oldPredicate = row.predicate
    if (mapping[oldPredicate]) {
      row.predicate = mapping[oldPredicate].predicate
      row.reverse = mapping[oldPredicate].reverse
      updated++
    }
  }

  writeTSV(filePath, rows)
  console.log(`✅ Updated ${updated} relationships`)

  return updated
}

function main() {
  console.log('🔄 Updating semantic relationship predicates...\n')

  const predicateMapping = {
    'hasSubject': { predicate: 'performedBy', reverse: 'performs' },
    'hasPredicate': { predicate: 'requiresAction', reverse: 'actionRequiredFor' },
    'hasObject': { predicate: 'affects', reverse: 'affectedBy' },
    'hasComplement': { predicate: 'achieves', reverse: 'achievedBy' }
  }

  const tasksRelsPath = resolve(DATA_DIR, 'Tasks.Relationships.tsv')
  const processesRelsPath = resolve(DATA_DIR, 'Processes.Relationships.tsv')

  const tasksUpdated = updateRelationships(tasksRelsPath, predicateMapping)
  const processesUpdated = updateRelationships(processesRelsPath, predicateMapping)

  console.log(`\n✅ Done!`)
  console.log(`   Tasks relationships updated: ${tasksUpdated}`)
  console.log(`   Processes relationships updated: ${processesUpdated}`)
  console.log(`   Total relationships updated: ${tasksUpdated + processesUpdated}`)
}

main()

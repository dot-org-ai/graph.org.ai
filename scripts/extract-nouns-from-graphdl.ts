#!/usr/bin/env tsx
/**
 * Extract compound nouns/objects/concepts from GraphDL statements in Tasks and Processes
 *
 * Extracts objects like:
 * - "FinancialBudgetActivities" from "ChiefExecutives.direct.FinancialBudgetActivities"
 * - "BoardMembersOrganizationOfficialsMembers" from "ChiefExecutives.confer.with.BoardMembers..."
 *
 * Adds them to Nouns.tsv with namespace business.org.ai
 * Creates relationships in Nouns.Relationships.tsv
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

function splitCamelCase(str: string): string[] {
  // Split PascalCase/camelCase into words
  return str.replace(/([A-Z])/g, ' $1').trim().split(/\s+/)
}

function camelCaseToTitle(str: string): string {
  // Convert PascalCase to Title Case with spaces
  return str.replace(/([A-Z])/g, ' $1').trim()
}

function extractNounsFromGraphDL(graphdlId: string): Set<string> {
  const nouns = new Set<string>()

  // Split by dots to get components
  const parts = graphdlId.split('.')

  for (const part of parts) {
    // Skip prepositions, determiners, and small words
    const lower = part.toLowerCase()
    if (['with', 'to', 'for', 'in', 'on', 'at', 'by', 'from', 'of', 'and', 'or', 'the', 'a', 'an'].includes(lower)) {
      continue
    }

    // If it starts with uppercase, it's likely a noun/object
    if (part.match(/^[A-Z]/)) {
      // Check if it's a compound noun (multiple words stuck together)
      const words = splitCamelCase(part)
      if (words.length > 1) {
        // It's a compound noun
        nouns.add(part)
      }
    }
  }

  return nouns
}

function main() {
  console.log('🔍 Extracting nouns from GraphDL statements...\n')

  // Load existing Nouns.tsv
  const nounsPath = resolve(DATA_DIR, 'Nouns.tsv')
  let existingNouns: any[] = []
  try {
    const nounsContent = readFileSync(nounsPath, 'utf-8')
    existingNouns = parseTSV(nounsContent)
  } catch (error) {
    console.log('⚠️  Nouns.tsv not found, will create new file')
  }

  // Create a map of existing nouns by ID
  const existingNounIds = new Set(existingNouns.map(n => n.id))

  // Load Tasks
  const tasksPath = resolve(DATA_DIR, 'Tasks.tsv')
  const tasksContent = readFileSync(tasksPath, 'utf-8')
  const tasks = parseTSV(tasksContent)

  // Load Processes
  const processesPath = resolve(DATA_DIR, 'Processes.tsv')
  const processesContent = readFileSync(processesPath, 'utf-8')
  const processes = parseTSV(processesContent)

  console.log(`📊 Analyzing ${tasks.length} tasks and ${processes.length} processes...\n`)

  // Extract unique nouns
  const nounMap = new Map<string, { name: string, sources: Set<string> }>()

  // Process tasks
  for (const task of tasks) {
    if (!task.id || !task.id.includes('.')) continue

    const nouns = extractNounsFromGraphDL(task.id)
    for (const noun of nouns) {
      if (!nounMap.has(noun)) {
        nounMap.set(noun, {
          name: camelCaseToTitle(noun),
          sources: new Set()
        })
      }
      nounMap.get(noun)!.sources.add(task.url)
    }
  }

  // Process processes
  for (const process of processes) {
    if (!process.id || !process.id.includes('.')) continue

    const nouns = extractNounsFromGraphDL(process.id)
    for (const noun of nouns) {
      if (!nounMap.has(noun)) {
        nounMap.set(noun, {
          name: camelCaseToTitle(noun),
          sources: new Set()
        })
      }
      nounMap.get(noun)!.sources.add(process.url)
    }
  }

  console.log(`✅ Found ${nounMap.size} unique compound nouns/objects\n`)

  // Create new noun entities
  const newNouns: any[] = []
  const relationships: any[] = []

  for (const [id, data] of nounMap.entries()) {
    // Skip if already exists
    if (existingNounIds.has(id)) {
      continue
    }

    const nounUrl = `https://business.org.ai/Noun/${id}`

    newNouns.push({
      url: nounUrl,
      ns: 'business.org.ai',
      type: 'Noun',
      id: id,
      code: '',
      name: data.name,
      description: data.name,
    })

    // Create relationships to the tasks/processes that use this noun
    for (const sourceUrl of data.sources) {
      relationships.push({
        ns: 'business.org.ai',
        from: sourceUrl,
        to: nounUrl,
        predicate: 'involves',
        reverse: 'involvedIn',
      })
    }
  }

  console.log(`📝 Adding ${newNouns.length} new nouns to Nouns.tsv`)
  console.log(`🔗 Creating ${relationships.length} relationships\n`)

  // Append new nouns to existing
  const allNouns = [...existingNouns, ...newNouns]
  writeTSV(nounsPath, allNouns)

  // Load or create Nouns.Relationships.tsv
  const relsPath = resolve(DATA_DIR, 'Nouns.Relationships.tsv')
  let existingRels: any[] = []
  try {
    const relsContent = readFileSync(relsPath, 'utf-8')
    existingRels = parseTSV(relsContent)
  } catch (error) {
    console.log('⚠️  Nouns.Relationships.tsv not found, will create new file')
  }

  // Append new relationships
  const allRels = [...existingRels, ...relationships]
  writeTSV(relsPath, allRels)

  console.log('✅ Done!')
  console.log(`   Total nouns: ${allNouns.length}`)
  console.log(`   Total relationships: ${allRels.length}`)
}

main()

#!/usr/bin/env tsx
/**
 * Extract nouns from APQC Processes and ONET Tasks
 * and merge them into the Nouns taxonomy
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')

function parseTsv(content: string): any[] {
  const lines = content.trim().split('\n')
  const headers = lines[0].split('\t')
  const rows: any[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = lines[i].split('\t')
    const obj: any = {}
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] || ''
    }
    rows.push(obj)
  }

  return rows
}

function writeTsv(path: string, rows: any[], headers: string[]) {
  const lines = [
    headers.join('\t'),
    ...rows.map(row => headers.map(h => row[h] || '').join('\t'))
  ]
  writeFileSync(path, lines.join('\n') + '\n')
}

console.log('🚀 Extracting and merging nouns from Processes and Tasks\n')

// Load existing Nouns
console.log('1️⃣  Loading existing Nouns.tsv...')
const existingNouns = parseTsv(readFileSync(resolve(DATA_DIR, 'Nouns.tsv'), 'utf-8'))
const nounsMap = new Map(existingNouns.map(n => [n.id, n]))
console.log(`   Loaded ${existingNouns.length.toLocaleString()} existing nouns`)

// Load Processes and extract object nouns from code field
console.log('\n2️⃣  Extracting nouns from Processes.tsv...')
const processes = parseTsv(readFileSync(resolve(DATA_DIR, 'Processes.tsv'), 'utf-8'))
const processNouns = new Map<string, {count: number, sources: Set<string>}>()

processes.forEach(process => {
  // Code format: Subject.verb.Object
  // e.g., "Companies.develop.Vision" or "Companies.develop.Strategy"
  if (!process.code) return

  const parts = process.code.split('.')
  if (parts.length >= 3) {
    // Extract the object (everything after the verb)
    const object = parts.slice(2).join('.')

    if (!processNouns.has(object)) {
      processNouns.set(object, { count: 0, sources: new Set() })
    }
    const entry = processNouns.get(object)!
    entry.count++
    entry.sources.add('APQC')
  }
})

console.log(`   Found ${processNouns.size.toLocaleString()} unique nouns in processes`)

// Load Tasks and extract object nouns from code field
console.log('\n3️⃣  Extracting nouns from Tasks.tsv...')
const tasks = parseTsv(readFileSync(resolve(DATA_DIR, 'Tasks.tsv'), 'utf-8'))
const taskNouns = new Map<string, {count: number, sources: Set<string>}>()

tasks.forEach(task => {
  // Code format: Subject.verb.Object.to.Purpose or Subject.verb.with.Object.to.Purpose
  // e.g., "ChiefExecutives.direct.Organization'sFinancialBudgetActivities.to.FundOperations..."
  if (!task.code) return

  const parts = task.code.split('.')
  if (parts.length >= 3) {
    // Extract the direct object (index 2)
    const object = parts[2]

    // Skip prepositions and very short words
    if (object.length < 3 || ['to', 'with', 'from', 'for', 'by', 'in', 'on', 'at'].includes(object.toLowerCase())) {
      return
    }

    if (!taskNouns.has(object)) {
      taskNouns.set(object, { count: 0, sources: new Set() })
    }
    const entry = taskNouns.get(object)!
    entry.count++
    entry.sources.add('ONET')
  }
})

console.log(`   Found ${taskNouns.size.toLocaleString()} unique nouns in tasks`)

// Merge all nouns
console.log('\n4️⃣  Merging nouns...')
let addedCount = 0

// Add process nouns
processNouns.forEach((data, nounId) => {
  if (!nounsMap.has(nounId)) {
    nounsMap.set(nounId, {
      url: `https://language.org.ai/Noun/${nounId}`,
      ns: 'language.org.ai',
      type: 'Noun',
      id: nounId,
      code: '',
      name: nounId.replace(/([A-Z])/g, ' $1').trim(),
      description: `Noun from APQC processes (${data.count} occurrences)`,
      appCount: '0',
      usageCount: data.count.toString()
    })
    addedCount++
  }
})

// Add task nouns
taskNouns.forEach((data, nounId) => {
  if (!nounsMap.has(nounId)) {
    nounsMap.set(nounId, {
      url: `https://language.org.ai/Noun/${nounId}`,
      ns: 'language.org.ai',
      type: 'Noun',
      id: nounId,
      code: '',
      name: nounId.replace(/([A-Z])/g, ' $1').trim(),
      description: `Noun from ONET tasks (${data.count} occurrences)`,
      appCount: '0',
      usageCount: data.count.toString()
    })
    addedCount++
  }
})

console.log(`   Added ${addedCount.toLocaleString()} new nouns`)
console.log(`   Total nouns: ${nounsMap.size.toLocaleString()}`)

// Write merged Nouns.tsv
const mergedNouns = Array.from(nounsMap.values())
const nounsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'appCount', 'usageCount']
writeTsv(resolve(DATA_DIR, 'Nouns.tsv'), mergedNouns, nounsHeaders)

console.log('\n✅ Nouns extracted and merged!')
console.log(`   Final count: ${mergedNouns.length.toLocaleString()} nouns`)

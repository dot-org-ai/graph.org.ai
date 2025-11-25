#!/usr/bin/env tsx
/**
 * Merge App taxonomies into root files and generate relationships
 *
 * 1. Fix Apps.tsv newline issues
 * 2. Create/merge Actions.tsv from App.Actions.tsv
 * 3. Create/merge Events.tsv from App.Events.tsv
 * 4. Create/merge Searches.tsv from App.Searches.tsv
 * 5. Merge App.Nouns into existing Nouns.tsv
 * 6. Generate relationship files showing App → Noun/Event/Action/Search usage
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')

console.log('🔄 Merging App taxonomies into root files\n')

// 1. First, let's regenerate Apps.tsv without the newline issue
console.log('1️⃣  Checking Apps.tsv for newline issues...')
const appsPath = resolve(DATA_DIR, 'Apps.tsv')
const appsContent = readFileSync(appsPath, 'utf-8')
const appsLines = appsContent.split('\n')
console.log(`   Current line count: ${appsLines.length}`)
console.log(`   Expected: 36,430 (36,429 apps + 1 header)`)

if (appsLines.length !== 36430) {
  console.log('   ⚠️  Line count mismatch - Apps.tsv needs regeneration')
  console.log('   Run: tsx scripts/generate-apps-only.ts')
  console.log('   Continuing with taxonomy merge...\n')
} else {
  console.log('   ✓ Apps.tsv line count is correct\n')
}

// Helper to parse TSV into objects
function parseTsv(content: string): any[] {
  const lines = content.trim().split('\n')
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

// Helper to write TSV from objects
function writeTsv(path: string, rows: any[], headers: string[]) {
  const lines = [
    headers.join('\t'),
    ...rows.map(row => headers.map(h => row[h] || '').join('\t'))
  ]
  writeFileSync(path, lines.join('\n') + '\n')
}

// 2. Merge App.Nouns into Nouns.tsv
console.log('2️⃣  Merging App.Nouns into Nouns.tsv...')
const appNounsPath = resolve(DATA_DIR, 'App.Nouns.tsv')
const nounsPath = resolve(DATA_DIR, 'Nouns.tsv')

const appNouns = parseTsv(readFileSync(appNounsPath, 'utf-8'))
console.log(`   Loaded ${appNouns.length.toLocaleString()} app nouns`)

let existingNouns: any[] = []
if (existsSync(nounsPath)) {
  existingNouns = parseTsv(readFileSync(nounsPath, 'utf-8'))
  console.log(`   Loaded ${existingNouns.length.toLocaleString()} existing nouns`)
}

// Merge by ID (app nouns take precedence)
const nounsMap = new Map()
existingNouns.forEach(n => nounsMap.set(n.id, n))
appNouns.forEach(n => nounsMap.set(n.id, n))

const mergedNouns = Array.from(nounsMap.values())
console.log(`   Merged total: ${mergedNouns.length.toLocaleString()} nouns`)

const nounsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'appCount', 'usageCount']
writeTsv(nounsPath, mergedNouns, nounsHeaders)
console.log(`   ✓ Wrote Nouns.tsv\n`)

// 3. Create Actions.tsv from App.Actions.tsv
console.log('3️⃣  Creating Actions.tsv from App.Actions.tsv...')
const appActionsPath = resolve(DATA_DIR, 'App.Actions.tsv')
const actionsPath = resolve(DATA_DIR, 'Actions.tsv')

const appActions = parseTsv(readFileSync(appActionsPath, 'utf-8'))
console.log(`   Loaded ${appActions.length.toLocaleString()} app actions`)

const actionsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'noun', 'verb', 'appCount', 'usageCount']
writeTsv(actionsPath, appActions, actionsHeaders)
console.log(`   ✓ Wrote Actions.tsv\n`)

// 4. Create Events.tsv from App.Events.tsv
console.log('4️⃣  Creating Events.tsv from App.Events.tsv...')
const appEventsPath = resolve(DATA_DIR, 'App.Events.tsv')
const eventsPath = resolve(DATA_DIR, 'Events.tsv')

const appEvents = parseTsv(readFileSync(appEventsPath, 'utf-8'))
console.log(`   Loaded ${appEvents.length.toLocaleString()} app events`)

const eventsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'noun', 'verb', 'appCount', 'usageCount']
writeTsv(eventsPath, appEvents, eventsHeaders)
console.log(`   ✓ Wrote Events.tsv\n`)

// 5. Create Searches.tsv from App.Searches.tsv
console.log('5️⃣  Creating Searches.tsv from App.Searches.tsv...')
const appSearchesPath = resolve(DATA_DIR, 'App.Searches.tsv')
const searchesPath = resolve(DATA_DIR, 'Searches.tsv')

const appSearches = parseTsv(readFileSync(appSearchesPath, 'utf-8'))
console.log(`   Loaded ${appSearches.length.toLocaleString()} app searches`)

const searchesHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'appCount']
writeTsv(searchesPath, appSearches, searchesHeaders)
console.log(`   ✓ Wrote Searches.tsv\n`)

// 6. Generate relationship files - TODO in next iteration
console.log('6️⃣  Generating relationship files...')
console.log('   ℹ️  Relationship generation needs access to raw Zapier API data')
console.log('   This will be implemented in generate-apps.ts to track which apps use which taxonomies\n')

// Summary
console.log('='.repeat(60))
console.log('📊 Summary')
console.log('='.repeat(60))
console.log(`Nouns.tsv: ${mergedNouns.length.toLocaleString()} nouns`)
console.log(`Actions.tsv: ${appActions.length.toLocaleString()} actions`)
console.log(`Events.tsv: ${appEvents.length.toLocaleString()} events`)
console.log(`Searches.tsv: ${appSearches.length.toLocaleString()} searches`)
console.log('='.repeat(60))
console.log('\n✅ Taxonomy merge complete!')

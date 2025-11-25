#!/usr/bin/env tsx
/**
 * Generate Apps/Integrations TSV files from pre-processed Zapier data
 * Uses existing cleaned data from platform repository (no API calls needed)
 *
 * Output files use App.X.tsv naming convention (not AppX.tsv)
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')
const ZAPIER_DIR = '/Users/nathanclevenger/platform/packages/integrations/data/zapier'

function toPascalCase(str: string): string {
  if (!str) return ''
  const cleaned = str
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

function generateId(name: string, fallback?: string): string {
  const pascalName = toPascalCase(name)
  if (!pascalName || pascalName.length < 2) {
    return toPascalCase(name + (fallback || ''))
  }
  return pascalName
}

console.log('🚀 Generating Apps/Integrations TSV files\n')

// 1. Load cleaned taxonomy data
console.log('1️⃣  Loading cleaned taxonomy data...')
const nounsPath = resolve(ZAPIER_DIR, 'nouns-cleaned.json')
const eventsPath = resolve(ZAPIER_DIR, 'events-cleaned.json')
const actionsPath = resolve(ZAPIER_DIR, 'actions-cleaned.json')

const cleanedNouns = JSON.parse(readFileSync(nounsPath, 'utf-8'))
const cleanedEvents = JSON.parse(readFileSync(eventsPath, 'utf-8'))
const cleanedActions = JSON.parse(readFileSync(actionsPath, 'utf-8'))

console.log(`   ✓ Loaded ${cleanedNouns.length.toLocaleString()} nouns`)
console.log(`   ✓ Loaded ${cleanedEvents.length.toLocaleString()} events`)
console.log(`   ✓ Loaded ${cleanedActions.length.toLocaleString()} actions\n`)

// 2. Generate App.Nouns.tsv
console.log('2️⃣  Generating App.Nouns.tsv...')
const appNouns = cleanedNouns.map((noun: any) => {
  const id = generateId(noun.noun)

  return {
    url: `https://zapier.com/Noun/${id}`,
    ns: 'zapier.com.ai',
    type: 'Noun',
    id,
    code: noun.noun.toLowerCase().replace(/\s+/g, '_'),
    name: noun.noun,
    description: `Noun representing ${noun.noun} used in ${noun.count} operations across ${noun.serviceCount} apps`,
    appCount: noun.serviceCount.toString(),
    usageCount: noun.count.toString(),
  }
})

const nounsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'appCount', 'usageCount']
const nounsOutput = [
  nounsHeaders.join('\t'),
  ...appNouns.map((noun: any) => nounsHeaders.map(h => noun[h] || '').join('\t'))
]

writeFileSync(resolve(DATA_DIR, 'App.Nouns.tsv'), nounsOutput.join('\n') + '\n')
console.log(`   ✓ Generated App.Nouns.tsv with ${appNouns.length.toLocaleString()} nouns\n`)

// 3. Generate App.Events.tsv
console.log('3️⃣  Generating App.Events.tsv...')
const appEvents = cleanedEvents.map((event: any) => {
  const id = generateId(event.event.replace('.', ''))

  return {
    url: `https://zapier.com/Event/${id}`,
    ns: 'zapier.com.ai',
    type: 'Event',
    id,
    code: event.event.toLowerCase().replace(/\./g, '_'),
    name: event.event,
    description: `Event/Trigger "${event.event}" used in ${event.count} operations across ${event.serviceCount} apps`,
    noun: event.noun,
    verb: event.verb,
    appCount: event.serviceCount.toString(),
    usageCount: event.count.toString(),
  }
})

const eventsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'noun', 'verb', 'appCount', 'usageCount']
const eventsOutput = [
  eventsHeaders.join('\t'),
  ...appEvents.map((event: any) => eventsHeaders.map(h => event[h] || '').join('\t'))
]

writeFileSync(resolve(DATA_DIR, 'App.Events.tsv'), eventsOutput.join('\n') + '\n')
console.log(`   ✓ Generated App.Events.tsv with ${appEvents.length.toLocaleString()} events\n`)

// 4. Generate App.Actions.tsv
console.log('4️⃣  Generating App.Actions.tsv...')
const appActions = cleanedActions.map((action: any) => {
  const id = generateId(action.action.replace('.', ''))

  return {
    url: `https://zapier.com/Action/${id}`,
    ns: 'zapier.com.ai',
    type: 'Action',
    id,
    code: action.action.toLowerCase().replace(/\./g, '_'),
    name: action.action,
    description: `Action "${action.action}" used in ${action.count} operations across ${action.serviceCount} apps`,
    noun: action.noun,
    verb: action.verb,
    appCount: action.serviceCount.toString(),
    usageCount: action.count.toString(),
  }
})

const actionsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'noun', 'verb', 'appCount', 'usageCount']
const actionsOutput = [
  actionsHeaders.join('\t'),
  ...appActions.map((action: any) => actionsHeaders.map(h => action[h] || '').join('\t'))
]

writeFileSync(resolve(DATA_DIR, 'App.Actions.tsv'), actionsOutput.join('\n') + '\n')
console.log(`   ✓ Generated App.Actions.tsv with ${appActions.length.toLocaleString()} actions\n`)

// Summary
console.log('='.repeat(60))
console.log('📊 Summary')
console.log('='.repeat(60))
console.log(`App.Nouns.tsv: ${appNouns.length.toLocaleString()} nouns`)
console.log(`App.Events.tsv: ${appEvents.length.toLocaleString()} events`)
console.log(`App.Actions.tsv: ${appActions.length.toLocaleString()} actions`)
console.log('='.repeat(60))
console.log('\n✅ Apps/Integrations taxonomy generation complete!')

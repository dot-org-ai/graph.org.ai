#!/usr/bin/env tsx
/**
 * Generate root taxonomy files (Actions.tsv, Events.tsv, Searches.tsv)
 * with relationships to Apps and Categories
 *
 * Note: App.Nouns are already merged into Nouns.tsv
 * Events and Actions are composite types (Noun.Event, Noun.Action) so they get their own root files
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
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

console.log('🚀 Generating root taxonomy files with relationships\n')

// Load Apps.tsv for category mapping
console.log('1️⃣  Loading Apps.tsv for category mapping...')
const apps = parseTsv(readFileSync(resolve(DATA_DIR, 'Apps.tsv'), 'utf-8'))
const appIdToCategory = new Map<string, string>()
const appSlugToId = new Map<string, string>()
const appSlugToCategory = new Map<string, string>()
apps.forEach(app => {
  appIdToCategory.set(app.id, app.category)
  appSlugToId.set(app.code, app.id)
  appSlugToCategory.set(app.code, app.category)
})
console.log(`   Loaded ${apps.length.toLocaleString()} apps`)

// Load App.Nouns and merge into Nouns.tsv
console.log(`\n2️⃣  Merging App.Nouns into Nouns.tsv...`)
const appNouns = parseTsv(readFileSync(resolve(DATA_DIR, 'App.Nouns.tsv'), 'utf-8'))
const nounsPath = resolve(DATA_DIR, 'Nouns.tsv')

let existingNouns: any[] = []
if (existsSync(nounsPath)) {
  existingNouns = parseTsv(readFileSync(nounsPath, 'utf-8'))
  console.log(`   Loaded ${existingNouns.length.toLocaleString()} existing nouns`)
}

const nounsMap = new Map()
existingNouns.forEach(n => nounsMap.set(n.id, n))
appNouns.forEach(n => nounsMap.set(n.id, n))

const mergedNouns = Array.from(nounsMap.values())
console.log(`   Merged total: ${mergedNouns.length.toLocaleString()} nouns`)

const nounsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'appCount', 'usageCount']
writeTsv(nounsPath, mergedNouns, nounsHeaders)
console.log(`   ✓ Wrote Nouns.tsv`)

// Copy App.Events → Events.tsv (they're the same, Events are composite Noun.Event types)
console.log(`\n3️⃣  Creating Events.tsv from App.Events.tsv...`)
const appEvents = parseTsv(readFileSync(resolve(DATA_DIR, 'App.Events.tsv'), 'utf-8'))
const eventsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'noun', 'nounId', 'verb', 'verbId', 'appCount', 'usageCount']
writeTsv(resolve(DATA_DIR, 'Events.tsv'), appEvents, eventsHeaders)
console.log(`   ✓ Wrote Events.tsv with ${appEvents.length.toLocaleString()} events`)

// Copy App.Actions → Actions.tsv (they're the same, Actions are composite Noun.Action types)
console.log(`\n4️⃣  Creating Actions.tsv from App.Actions.tsv...`)
const appActions = parseTsv(readFileSync(resolve(DATA_DIR, 'App.Actions.tsv'), 'utf-8'))
const actionsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'noun', 'nounId', 'verb', 'verbId', 'appCount', 'usageCount']
writeTsv(resolve(DATA_DIR, 'Actions.tsv'), appActions, actionsHeaders)
console.log(`   ✓ Wrote Actions.tsv with ${appActions.length.toLocaleString()} actions`)

// Copy App.Searches → Searches.tsv
console.log(`\n5️⃣  Creating Searches.tsv from App.Searches.tsv...`)
const appSearches = parseTsv(readFileSync(resolve(DATA_DIR, 'App.Searches.tsv'), 'utf-8'))
const searchesHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'appCount']
writeTsv(resolve(DATA_DIR, 'Searches.tsv'), appSearches, searchesHeaders)
console.log(`   ✓ Wrote Searches.tsv with ${appSearches.length.toLocaleString()} searches`)

// Generate Nouns.Relationships.tsv (copy from App.Nouns.Relationships + add category relationships)
console.log(`\n6️⃣  Generating Nouns.Relationships.tsv...`)
const nounAppRels = parseTsv(readFileSync(resolve(DATA_DIR, 'App.Nouns.Relationships.tsv'), 'utf-8'))
const nounRelationships: any[] = [...nounAppRels]

// Add noun → category relationships
nounAppRels.forEach(rel => {
  // rel.to is the app URL, extract the app ID
  const appId = rel.to.split('/').pop()
  const category = appIdToCategory.get(appId || '')

  if (category) {
    const categoryId = category.replace(/\s+/g, '')
    nounRelationships.push({
      ns: 'integrations.org.ai',
      from: rel.from,
      to: `https://integrations.org.ai/Category/${categoryId}`,
      predicate: 'inCategory',
      reverse: 'hasNoun'
    })
  }
})

writeTsv(
  resolve(DATA_DIR, 'Nouns.Relationships.tsv'),
  nounRelationships,
  ['ns', 'from', 'to', 'predicate', 'reverse']
)
console.log(`   Generated ${nounRelationships.length.toLocaleString()} noun relationships`)

// Generate Events.Relationships.tsv (copy from App.Events.Relationships + add category relationships)
console.log(`\n7️⃣  Generating Events.Relationships.tsv...`)
const eventAppRels = parseTsv(readFileSync(resolve(DATA_DIR, 'App.Events.Relationships.tsv'), 'utf-8'))
const eventRelationships: any[] = [...eventAppRels]

// Add event → category relationships
eventAppRels
  .filter(rel => rel.predicate === 'triggeredBy')
  .forEach(rel => {
    const appId = rel.to.split('/').pop()
    const category = appIdToCategory.get(appId || '')

    if (category) {
      const categoryId = category.replace(/\s+/g, '')
      eventRelationships.push({
        ns: 'integrations.org.ai',
        from: rel.from,
        to: `https://integrations.org.ai/Category/${categoryId}`,
        predicate: 'inCategory',
        reverse: 'hasEvent'
      })
    }
  })

writeTsv(
  resolve(DATA_DIR, 'Events.Relationships.tsv'),
  eventRelationships,
  ['ns', 'from', 'to', 'predicate', 'reverse']
)
console.log(`   Generated ${eventRelationships.length.toLocaleString()} event relationships`)

// Generate Actions.Relationships.tsv (copy from App.Actions.Relationships + add category relationships)
console.log(`\n8️⃣  Generating Actions.Relationships.tsv...`)
const actionAppRels = parseTsv(readFileSync(resolve(DATA_DIR, 'App.Actions.Relationships.tsv'), 'utf-8'))
const actionRelationships: any[] = [...actionAppRels]

// Add action → category relationships
actionAppRels
  .filter(rel => rel.predicate === 'performedBy')
  .forEach(rel => {
    const appId = rel.to.split('/').pop()
    const category = appIdToCategory.get(appId || '')

    if (category) {
      const categoryId = category.replace(/\s+/g, '')
      actionRelationships.push({
        ns: 'integrations.org.ai',
        from: rel.from,
        to: `https://integrations.org.ai/Category/${categoryId}`,
        predicate: 'inCategory',
        reverse: 'hasAction'
      })
    }
  })

writeTsv(
  resolve(DATA_DIR, 'Actions.Relationships.tsv'),
  actionRelationships,
  ['ns', 'from', 'to', 'predicate', 'reverse']
)
console.log(`   Generated ${actionRelationships.length.toLocaleString()} action relationships`)

// Generate Searches.Relationships.tsv from services.json
console.log(`\n9️⃣  Generating Searches.Relationships.tsv...`)
const servicesPath = resolve(__dirname, '../Integrations.org.ai/services.json')
const services = JSON.parse(readFileSync(servicesPath, 'utf-8'))

function toPascalCase(str: string): string {
  if (!str) return ''
  const acronyms = new Set(['API', 'SMS', 'URL', 'ID', 'CRM', 'ERP'])
  const cleaned = str.replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim()
  return cleaned.split(/[\s_-]+/).map(word => {
    const upper = word.toUpperCase()
    if (acronyms.has(upper)) return upper
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }).join('')
}

const searchRelationships: any[] = []
const searchIds = new Set<string>()

// Generate relationships for all searches in all apps
services.forEach((service: any) => {
  if (!service.searches || service.searches.length === 0) return

  const appSlug = service.slug
  const appId = appSlugToId.get(appSlug)
  if (!appId) return

  const category = appSlugToCategory.get(appSlug)

  service.searches.forEach((search: any) => {
    const searchName = search.display_label || search.key
    const searchId = toPascalCase(searchName)

    searchIds.add(searchId)

    // Search → App relationship
    searchRelationships.push({
      ns: 'integrations.org.ai',
      from: `https://integrations.org.ai/Search/${searchId}`,
      to: `https://integrations.org.ai/${appId}`,
      predicate: 'availableIn',
      reverse: 'provides'
    })

    // Search → Category relationship
    if (category) {
      const categoryId = category.replace(/\s+/g, '')
      searchRelationships.push({
        ns: 'integrations.org.ai',
        from: `https://integrations.org.ai/Search/${searchId}`,
        to: `https://integrations.org.ai/Category/${categoryId}`,
        predicate: 'inCategory',
        reverse: 'hasSearch'
      })
    }
  })
})

writeTsv(
  resolve(DATA_DIR, 'Searches.Relationships.tsv'),
  searchRelationships,
  ['ns', 'from', 'to', 'predicate', 'reverse']
)
console.log(`   Generated ${searchRelationships.length.toLocaleString()} search relationships`)
console.log(`   Unique searches: ${searchIds.size.toLocaleString()}`)

// Summary
console.log('\n' + '='.repeat(60))
console.log('📊 Summary')
console.log('='.repeat(60))
console.log(`\nRoot Taxonomies:`)
console.log(`  Nouns.tsv: ${mergedNouns.length.toLocaleString()} nouns`)
console.log(`  Events.tsv: ${appEvents.length.toLocaleString()} events`)
console.log(`  Actions.tsv: ${appActions.length.toLocaleString()} actions`)
console.log(`  Searches.tsv: ${appSearches.length.toLocaleString()} searches`)
console.log(`\nRelationships:`)
console.log(`  Nouns.Relationships.tsv: ${nounRelationships.length.toLocaleString()} relationships`)
console.log(`  Events.Relationships.tsv: ${eventRelationships.length.toLocaleString()} relationships`)
console.log(`  Actions.Relationships.tsv: ${actionRelationships.length.toLocaleString()} relationships`)
console.log(`  Searches.Relationships.tsv: ${searchRelationships.length.toLocaleString()} relationships`)
console.log('='.repeat(60))
console.log('\n✅ Root taxonomies generated with relationships!')

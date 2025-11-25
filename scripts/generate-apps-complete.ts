#!/usr/bin/env tsx
/**
 * Generate complete Apps/Integrations data from Zapier dataset:
 * 1. Apps.tsv - All ~36k apps
 * 2. AppNouns.tsv - Central nouns taxonomy
 * 3. AppEvents.tsv - Central events/triggers taxonomy
 * 4. AppSearches.tsv - Central searches taxonomy
 * 5. AppActions.tsv - Central actions taxonomy
 * 6. Apps.Relationships.tsv - App relationships
 * 7. AppNouns.Relationships.tsv - App-specific to central noun mappings
 * 8. AppEvents.Relationships.tsv - App-specific to central event mappings
 * 9. AppActions.Relationships.tsv - App-specific to central action mappings
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')
const ZAPIER_DIR = '/Users/nathanclevenger/platform/packages/integrations/data/zapier'

interface ZapierApp {
  key: string
  title: string
  description?: string
  url?: string
  image?: string
  hex_color?: string
  category?: string
  categories?: string[]
  app_category?: { slug: string; title: string }
  nouns?: { key: string; label: string }[]
  triggers?: { key: string; noun: string; display_label: string; description?: string }[]
  searches?: { key: string; noun: string; display_label: string; description?: string }[]
  actions?: { key: string; noun: string; display_label: string; description?: string }[]
}

interface CleanedNoun {
  original: string
  cleaned: string
  singular: string
  apps: string[]
}

interface CleanedEvent {
  original: string
  cleaned: string
  apps: string[]
}

interface CleanedAction {
  original: string
  cleaned: string
  apps: string[]
}

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

console.log('🚀 Generating complete Apps/Integrations data from Zapier\n')

// 1. Fetch Zapier apps from API and load cleaned data
console.log('1️⃣  Fetching Zapier apps from API...')

const zapierApps: ZapierApp[] = []
let offset = 0
let hasMore = true

while (hasMore) {
  const response = await fetch(`https://zapier.com/api/v4/services/?limit=250&offset=${offset}`)
  const data = await response.json()

  if (data.objects && data.objects.length > 0) {
    zapierApps.push(...data.objects)
    console.log(`   Fetched offset ${offset}: ${zapierApps.length.toLocaleString()} apps total`)
    offset += 250
    hasMore = data.objects.length === 250
  } else {
    hasMore = false
  }
}

console.log(`   ✓ Fetched ${zapierApps.length.toLocaleString()} apps\n`)

console.log('2️⃣  Loading cleaned taxonomy data...')
const nounsPath = resolve(ZAPIER_DIR, 'nouns-cleaned.json')
const eventsPath = resolve(ZAPIER_DIR, 'events-cleaned.json')
const actionsPath = resolve(ZAPIER_DIR, 'actions-cleaned.json')

const cleanedNouns: CleanedNoun[] = JSON.parse(readFileSync(nounsPath, 'utf-8'))
const cleanedEvents: CleanedEvent[] = JSON.parse(readFileSync(eventsPath, 'utf-8'))
const cleanedActions: CleanedAction[] = JSON.parse(readFileSync(actionsPath, 'utf-8'))

console.log(`   ✓ Loaded ${cleanedNouns.length.toLocaleString()} nouns`)
console.log(`   ✓ Loaded ${cleanedEvents.length.toLocaleString()} events`)
console.log(`   ✓ Loaded ${cleanedActions.length.toLocaleString()} actions\n`)

// 3. Generate Apps.tsv
console.log('3️⃣  Generating Apps.tsv...')
const apps = zapierApps.map(app => {
  const id = generateId(app.title, app.key)
  const category = app.app_category?.title || app.category || ''
  const categories = app.categories?.join(', ') || category

  return {
    url: `https://zapier.com/App/${id}`,
    ns: 'zapier.com.ai',
    type: 'App',
    id,
    code: app.key,
    name: app.title,
    description: app.description || '',
    category,
    categories,
    imageUrl: app.image || '',
    hexColor: app.hex_color || '',
    appUrl: app.url || '',
  }
})

const appsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'category', 'categories', 'imageUrl', 'hexColor', 'appUrl']
const appsOutput = [
  appsHeaders.join('\t'),
  ...apps.map(app => appsHeaders.map(h => app[h as keyof typeof app] || '').join('\t'))
]

writeFileSync(resolve(DATA_DIR, 'Apps.tsv'), appsOutput.join('\n') + '\n')
console.log(`   ✓ Generated Apps.tsv with ${apps.length.toLocaleString()} apps\n`)

// 4. Generate AppNouns.tsv (central taxonomy)
console.log('5️⃣  Generating AppNouns.tsv...')
const appNouns = cleanedNouns.map(noun => {
  const id = generateId(noun.singular || noun.cleaned, noun.original)

  return {
    url: `https://zapier.com/Noun/${id}`,
    ns: 'zapier.com.ai',
    type: 'Noun',
    id,
    code: noun.cleaned.toLowerCase().replace(/\s+/g, '_'),
    name: noun.singular || noun.cleaned,
    description: `Noun representing ${noun.singular || noun.cleaned} across ${noun.apps.length} apps`,
    singular: noun.singular || noun.cleaned,
    original: noun.original,
    appCount: noun.apps.length.toString(),
  }
})

const nounsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'singular', 'original', 'appCount']
const nounsOutput = [
  nounsHeaders.join('\t'),
  ...appNouns.map(noun => nounsHeaders.map(h => noun[h as keyof typeof noun] || '').join('\t'))
]

writeFileSync(resolve(DATA_DIR, 'AppNouns.tsv'), nounsOutput.join('\n') + '\n')
console.log(`   ✓ Generated AppNouns.tsv with ${appNouns.length.toLocaleString()} nouns\n`)

// 5. Generate AppEvents.tsv (central taxonomy)
console.log('5️⃣  Generating AppEvents.tsv...')
const appEvents = cleanedEvents.map(event => {
  const id = generateId(event.cleaned, event.original)

  return {
    url: `https://zapier.com/Event/${id}`,
    ns: 'zapier.com.ai',
    type: 'Event',
    id,
    code: event.cleaned.toLowerCase().replace(/\s+/g, '_'),
    name: event.cleaned,
    description: `Event/Trigger representing ${event.cleaned} across ${event.apps.length} apps`,
    original: event.original,
    appCount: event.apps.length.toString(),
  }
})

const eventsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'original', 'appCount']
const eventsOutput = [
  eventsHeaders.join('\t'),
  ...appEvents.map(event => eventsHeaders.map(h => event[h as keyof typeof event] || '').join('\t'))
]

writeFileSync(resolve(DATA_DIR, 'AppEvents.tsv'), eventsOutput.join('\n') + '\n')
console.log(`   ✓ Generated AppEvents.tsv with ${appEvents.length.toLocaleString()} events\n`)

// 6. Generate AppActions.tsv (central taxonomy)
console.log('5️⃣  Generating AppActions.tsv...')
const appActions = cleanedActions.map(action => {
  const id = generateId(action.cleaned, action.original)

  return {
    url: `https://zapier.com/Action/${id}`,
    ns: 'zapier.com.ai',
    type: 'Action',
    id,
    code: action.cleaned.toLowerCase().replace(/\s+/g, '_'),
    name: action.cleaned,
    description: `Action representing ${action.cleaned} across ${action.apps.length} apps`,
    original: action.original,
    appCount: action.apps.length.toString(),
  }
})

const actionsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'original', 'appCount']
const actionsOutput = [
  actionsHeaders.join('\t'),
  ...appActions.map(action => actionsHeaders.map(h => action[h as keyof typeof action] || '').join('\t'))
]

writeFileSync(resolve(DATA_DIR, 'AppActions.tsv'), actionsOutput.join('\n') + '\n')
console.log(`   ✓ Generated AppActions.tsv with ${appActions.length.toLocaleString()} actions\n`)

// 7. Generate AppSearches.tsv (extracted from apps)
console.log('1️⃣1️⃣  Generating AppSearches.tsv...')
const searchMap = new Map<string, { name: string; apps: Set<string>; descriptions: Set<string> }>()

for (const app of zapierApps) {
  if (!app.searches || app.searches.length === 0) continue

  for (const search of app.searches) {
    const searchName = search.display_label || search.key
    const key = searchName.toLowerCase()

    if (!searchMap.has(key)) {
      searchMap.set(key, {
        name: searchName,
        apps: new Set(),
        descriptions: new Set(),
      })
    }

    const entry = searchMap.get(key)!
    entry.apps.add(app.key)
    if (search.description) entry.descriptions.add(search.description)
  }
}

const appSearches = Array.from(searchMap.entries()).map(([key, data]) => {
  const id = generateId(data.name, key)

  return {
    url: `https://zapier.com/Search/${id}`,
    ns: 'zapier.com.ai',
    type: 'Search',
    id,
    code: key.replace(/\s+/g, '_'),
    name: data.name,
    description: Array.from(data.descriptions)[0] || `Search operation for ${data.name}`,
    appCount: data.apps.size.toString(),
  }
})

const searchesHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'appCount']
const searchesOutput = [
  searchesHeaders.join('\t'),
  ...appSearches.map(search => searchesHeaders.map(h => search[h as keyof typeof search] || '').join('\t'))
]

writeFileSync(resolve(DATA_DIR, 'AppSearches.tsv'), searchesOutput.join('\n') + '\n')
console.log(`   ✓ Generated AppSearches.tsv with ${appSearches.length.toLocaleString()} searches\n`)

// 8. Generate Apps.Relationships.tsv
console.log('1️⃣1️⃣  Generating Apps.Relationships.tsv...')
const appRelationships: string[] = []

for (const app of zapierApps) {
  const appUrl = `https://zapier.com/App/${generateId(app.title, app.key)}`

  // Category relationships
  if (app.app_category?.slug) {
    const categoryId = generateId(app.app_category.title)
    appRelationships.push([
      'zapier.com.ai',
      appUrl,
      `https://zapier.com/Category/${categoryId}`,
      'category',
      'apps'
    ].join('\t'))
  }
}

const relHeaders = ['ns', 'from', 'to', 'predicate', 'reverse']
const appRelsOutput = [
  relHeaders.join('\t'),
  ...appRelationships
]

writeFileSync(resolve(DATA_DIR, 'Apps.Relationships.tsv'), appRelsOutput.join('\n') + '\n')
console.log(`   ✓ Generated Apps.Relationships.tsv with ${appRelationships.length.toLocaleString()} relationships\n`)

// 9. Generate AppNouns.Relationships.tsv (app-specific to central)
console.log('1️⃣1️⃣  Generating AppNouns.Relationships.tsv...')
const nounRelationships: string[] = []

for (const app of zapierApps) {
  if (!app.nouns || app.nouns.length === 0) continue

  const appUrl = `https://zapier.com/App/${generateId(app.title, app.key)}`

  for (const noun of app.nouns) {
    // Find the central noun
    const centralNoun = cleanedNouns.find(cn =>
      cn.apps.includes(app.key) &&
      (cn.original.toLowerCase() === noun.label.toLowerCase() ||
       cn.cleaned.toLowerCase() === noun.label.toLowerCase())
    )

    if (centralNoun) {
      const nounId = generateId(centralNoun.singular || centralNoun.cleaned, centralNoun.original)
      const nounUrl = `https://zapier.com/Noun/${nounId}`

      nounRelationships.push([
        'zapier.com.ai',
        appUrl,
        nounUrl,
        'hasNoun',
        'usedByApp'
      ].join('\t'))
    }
  }
}

const nounRelsOutput = [
  relHeaders.join('\t'),
  ...nounRelationships
]

writeFileSync(resolve(DATA_DIR, 'AppNouns.Relationships.tsv'), nounRelsOutput.join('\n') + '\n')
console.log(`   ✓ Generated AppNouns.Relationships.tsv with ${nounRelationships.length.toLocaleString()} relationships\n`)

// 10. Generate AppEvents.Relationships.tsv (app-specific triggers to central events)
console.log('1️⃣1️⃣  Generating AppEvents.Relationships.tsv...')
const eventRelationships: string[] = []

for (const app of zapierApps) {
  if (!app.triggers || app.triggers.length === 0) continue

  const appUrl = `https://zapier.com/App/${generateId(app.title, app.key)}`

  for (const trigger of app.triggers) {
    const triggerLabel = trigger.display_label || trigger.key

    // Find the central event
    const centralEvent = cleanedEvents.find(ce =>
      ce.apps.includes(app.key) &&
      (ce.original.toLowerCase() === triggerLabel.toLowerCase() ||
       ce.cleaned.toLowerCase() === triggerLabel.toLowerCase())
    )

    if (centralEvent) {
      const eventId = generateId(centralEvent.cleaned, centralEvent.original)
      const eventUrl = `https://zapier.com/Event/${eventId}`

      eventRelationships.push([
        'zapier.com.ai',
        appUrl,
        eventUrl,
        'hasTrigger',
        'triggeredByApp'
      ].join('\t'))
    }
  }
}

const eventRelsOutput = [
  relHeaders.join('\t'),
  ...eventRelationships
]

writeFileSync(resolve(DATA_DIR, 'AppEvents.Relationships.tsv'), eventRelsOutput.join('\n') + '\n')
console.log(`   ✓ Generated AppEvents.Relationships.tsv with ${eventRelationships.length.toLocaleString()} relationships\n`)

// 11. Generate AppActions.Relationships.tsv (app-specific actions to central)
console.log('1️⃣1️⃣ Generating AppActions.Relationships.tsv...')
const actionRelationships: string[] = []

for (const app of zapierApps) {
  if (!app.actions || app.actions.length === 0) continue

  const appUrl = `https://zapier.com/App/${generateId(app.title, app.key)}`

  for (const action of app.actions) {
    const actionLabel = action.display_label || action.key

    // Find the central action
    const centralAction = cleanedActions.find(ca =>
      ca.apps.includes(app.key) &&
      (ca.original.toLowerCase() === actionLabel.toLowerCase() ||
       ca.cleaned.toLowerCase() === actionLabel.toLowerCase())
    )

    if (centralAction) {
      const actionId = generateId(centralAction.cleaned, centralAction.original)
      const actionUrl = `https://zapier.com/Action/${actionId}`

      actionRelationships.push([
        'zapier.com.ai',
        appUrl,
        actionUrl,
        'hasAction',
        'performedByApp'
      ].join('\t'))
    }
  }
}

const actionRelsOutput = [
  relHeaders.join('\t'),
  ...actionRelationships
]

writeFileSync(resolve(DATA_DIR, 'AppActions.Relationships.tsv'), actionRelsOutput.join('\n') + '\n')
console.log(`   ✓ Generated AppActions.Relationships.tsv with ${actionRelationships.length.toLocaleString()} relationships\n`)

// Summary
console.log('='.repeat(60))
console.log('📊 Summary')
console.log('='.repeat(60))
console.log(`Apps: ${apps.length.toLocaleString()}`)
console.log(`Central Nouns: ${appNouns.length.toLocaleString()}`)
console.log(`Central Events: ${appEvents.length.toLocaleString()}`)
console.log(`Central Actions: ${appActions.length.toLocaleString()}`)
console.log(`Central Searches: ${appSearches.length.toLocaleString()}`)
console.log(`App Relationships: ${appRelationships.length.toLocaleString()}`)
console.log(`Noun Relationships: ${nounRelationships.length.toLocaleString()}`)
console.log(`Event Relationships: ${eventRelationships.length.toLocaleString()}`)
console.log(`Action Relationships: ${actionRelationships.length.toLocaleString()}`)
console.log('='.repeat(60))
console.log('\n✅ Complete Apps/Integrations data generation finished!')

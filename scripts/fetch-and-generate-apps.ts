#!/usr/bin/env tsx
/**
 * Fetch Zapier apps from API and generate complete Apps/Integrations TSV files
 * Based on cleaned data from platform repository
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')
const ZAPIER_DIR = '/Users/nathanclevenger/platform/packages/integrations/data/zapier'

const PAGE_SIZE = 10000 // Zapier API page size
const BASE_URL = 'https://zapier.com/api/v4/services'

interface CleanedNoun {
  original: string
  cleaned: string
  singular: string
  apps: string[]
  count: number
  serviceCount: number
}

interface CleanedEvent {
  original: string
  cleaned: string
  noun: string
  verb: string
  apps: string[]
  count: number
  serviceCount: number
}

interface CleanedAction {
  original: string
  cleaned: string
  noun: string
  verb: string
  apps: string[]
  count: number
  serviceCount: number
}

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

async function fetchAllApps(): Promise<ZapierApp[]> {
  console.log('📥 Fetching Zapier apps from API...')
  const allApps: ZapierApp[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const url = `${BASE_URL}?limit=${PAGE_SIZE}&page=${page}`
    console.log(`   Page ${page}...`)

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const apps = data.results || []

      if (apps.length === 0) {
        hasMore = false
      } else {
        allApps.push(...apps)
        page++

        // Check if there are more pages
        if (!data.next || apps.length < PAGE_SIZE) {
          hasMore = false
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error(`   ✗ Error fetching page ${page}:`, error)
      hasMore = false
    }
  }

  console.log(`   ✓ Fetched ${allApps.length.toLocaleString()} apps\n`)
  return allApps
}

async function main() {
  console.log('🚀 Generating complete Apps/Integrations data\n')

  // 1. Load cleaned taxonomy data
  console.log('1️⃣  Loading cleaned taxonomy data...')
  const nounsPath = resolve(ZAPIER_DIR, 'nouns-cleaned.json')
  const eventsPath = resolve(ZAPIER_DIR, 'events-cleaned.json')
  const actionsPath = resolve(ZAPIER_DIR, 'actions-cleaned.json')

  const cleanedNouns: CleanedNoun[] = JSON.parse(readFileSync(nounsPath, 'utf-8'))
  const cleanedEvents: CleanedEvent[] = JSON.parse(readFileSync(eventsPath, 'utf-8'))
  const cleanedActions: CleanedAction[] = JSON.parse(readFileSync(actionsPath, 'utf-8'))

  console.log(`   ✓ Loaded ${cleanedNouns.length.toLocaleString()} nouns`)
  console.log(`   ✓ Loaded ${cleanedEvents.length.toLocaleString()} events`)
  console.log(`   ✓ Loaded ${cleanedActions.length.toLocaleString()} actions\n`)

  // 2. Fetch all apps from Zapier API
  const zapierApps = await fetchAllApps()

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
  console.log('4️⃣  Generating AppNouns.tsv...')
  const appNouns = cleanedNouns.map(noun => {
    const id = generateId(noun.singular || noun.cleaned, noun.original)

    return {
      url: `https://zapier.com/Noun/${id}`,
      ns: 'zapier.com.ai',
      type: 'Noun',
      id,
      code: noun.cleaned.toLowerCase().replace(/\s+/g, '_'),
      name: noun.singular || noun.cleaned,
      description: `Noun representing ${noun.singular || noun.cleaned} across ${noun.serviceCount} apps`,
      singular: noun.singular || noun.cleaned,
      original: noun.original,
      appCount: noun.serviceCount.toString(),
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
      description: `Event/Trigger representing ${event.cleaned} across ${event.serviceCount} apps`,
      noun: event.noun,
      verb: event.verb,
      original: event.original,
      appCount: event.serviceCount.toString(),
    }
  })

  const eventsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'noun', 'verb', 'original', 'appCount']
  const eventsOutput = [
    eventsHeaders.join('\t'),
    ...appEvents.map(event => eventsHeaders.map(h => event[h as keyof typeof event] || '').join('\t'))
  ]

  writeFileSync(resolve(DATA_DIR, 'AppEvents.tsv'), eventsOutput.join('\n') + '\n')
  console.log(`   ✓ Generated AppEvents.tsv with ${appEvents.length.toLocaleString()} events\n`)

  // 6. Generate AppActions.tsv (central taxonomy)
  console.log('6️⃣  Generating AppActions.tsv...')
  const appActions = cleanedActions.map(action => {
    const id = generateId(action.cleaned, action.original)

    return {
      url: `https://zapier.com/Action/${id}`,
      ns: 'zapier.com.ai',
      type: 'Action',
      id,
      code: action.cleaned.toLowerCase().replace(/\s+/g, '_'),
      name: action.cleaned,
      description: `Action representing ${action.cleaned} across ${action.serviceCount} apps`,
      noun: action.noun,
      verb: action.verb,
      original: action.original,
      appCount: action.serviceCount.toString(),
    }
  })

  const actionsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'noun', 'verb', 'original', 'appCount']
  const actionsOutput = [
    actionsHeaders.join('\t'),
    ...appActions.map(action => actionsHeaders.map(h => action[h as keyof typeof action] || '').join('\t'))
  ]

  writeFileSync(resolve(DATA_DIR, 'AppActions.tsv'), actionsOutput.join('\n') + '\n')
  console.log(`   ✓ Generated AppActions.tsv with ${appActions.length.toLocaleString()} actions\n`)

  // 7. Generate AppSearches.tsv (extracted from apps)
  console.log('7️⃣  Generating AppSearches.tsv...')
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

  // 8. Generate relationship files
  console.log('8️⃣  Generating relationship files...')

  // Apps.Relationships.tsv
  const appRelationships: string[] = []
  for (const app of zapierApps) {
    const appUrl = `https://zapier.com/App/${generateId(app.title, app.key)}`

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
  writeFileSync(resolve(DATA_DIR, 'Apps.Relationships.tsv'), [relHeaders.join('\t'), ...appRelationships].join('\n') + '\n')
  console.log(`   ✓ Apps.Relationships.tsv: ${appRelationships.length.toLocaleString()} relationships`)

  // AppNouns.Relationships.tsv
  const nounRelationships: string[] = []
  for (const app of zapierApps) {
    if (!app.nouns || app.nouns.length === 0) continue
    const appUrl = `https://zapier.com/App/${generateId(app.title, app.key)}`

    for (const noun of app.nouns) {
      const centralNoun = cleanedNouns.find(cn =>
        cn.apps.includes(app.key) &&
        (cn.original.toLowerCase() === noun.label.toLowerCase() ||
         cn.cleaned.toLowerCase() === noun.label.toLowerCase())
      )

      if (centralNoun) {
        const nounId = generateId(centralNoun.singular || centralNoun.cleaned, centralNoun.original)
        nounRelationships.push([
          'zapier.com.ai',
          appUrl,
          `https://zapier.com/Noun/${nounId}`,
          'hasNoun',
          'usedByApp'
        ].join('\t'))
      }
    }
  }

  writeFileSync(resolve(DATA_DIR, 'AppNouns.Relationships.tsv'), [relHeaders.join('\t'), ...nounRelationships].join('\n') + '\n')
  console.log(`   ✓ AppNouns.Relationships.tsv: ${nounRelationships.length.toLocaleString()} relationships`)

  // AppEvents.Relationships.tsv
  const eventRelationships: string[] = []
  for (const app of zapierApps) {
    if (!app.triggers || app.triggers.length === 0) continue
    const appUrl = `https://zapier.com/App/${generateId(app.title, app.key)}`

    for (const trigger of app.triggers) {
      const triggerLabel = trigger.display_label || trigger.key
      const centralEvent = cleanedEvents.find(ce =>
        ce.apps.includes(app.key) &&
        (ce.original.toLowerCase() === triggerLabel.toLowerCase() ||
         ce.cleaned.toLowerCase() === triggerLabel.toLowerCase())
      )

      if (centralEvent) {
        const eventId = generateId(centralEvent.cleaned, centralEvent.original)
        eventRelationships.push([
          'zapier.com.ai',
          appUrl,
          `https://zapier.com/Event/${eventId}`,
          'hasTrigger',
          'triggeredByApp'
        ].join('\t'))
      }
    }
  }

  writeFileSync(resolve(DATA_DIR, 'AppEvents.Relationships.tsv'), [relHeaders.join('\t'), ...eventRelationships].join('\n') + '\n')
  console.log(`   ✓ AppEvents.Relationships.tsv: ${eventRelationships.length.toLocaleString()} relationships`)

  // AppActions.Relationships.tsv
  const actionRelationships: string[] = []
  for (const app of zapierApps) {
    if (!app.actions || app.actions.length === 0) continue
    const appUrl = `https://zapier.com/App/${generateId(app.title, app.key)}`

    for (const action of app.actions) {
      const actionLabel = action.display_label || action.key
      const centralAction = cleanedActions.find(ca =>
        ca.apps.includes(app.key) &&
        (ca.original.toLowerCase() === actionLabel.toLowerCase() ||
         ca.cleaned.toLowerCase() === actionLabel.toLowerCase())
      )

      if (centralAction) {
        const actionId = generateId(centralAction.cleaned, centralAction.original)
        actionRelationships.push([
          'zapier.com.ai',
          appUrl,
          `https://zapier.com/Action/${actionId}`,
          'hasAction',
          'performedByApp'
        ].join('\t'))
      }
    }
  }

  writeFileSync(resolve(DATA_DIR, 'AppActions.Relationships.tsv'), [relHeaders.join('\t'), ...actionRelationships].join('\n') + '\n')
  console.log(`   ✓ AppActions.Relationships.tsv: ${actionRelationships.length.toLocaleString()} relationships\n`)

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
}

main()

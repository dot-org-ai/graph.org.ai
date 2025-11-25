#!/usr/bin/env tsx
/**
 * Generate root taxonomy files with proper namespaces and relationships
 *
 * Root Taxonomies (canonical across all apps):
 * - Actions.tsv with URLs like https://actions.org.ai/Contact.create
 * - Events.tsv with URLs like https://events.org.ai/Contact.created
 * - Nouns.tsv with URLs like https://business.org.ai/Contact
 * - Searches.tsv with URLs like https://searches.org.ai/FindContacts
 *
 * Plus relationship files connecting:
 * - Root → App-specific instances
 * - Root → Nouns/Verbs (for Events/Actions)
 * - Root → Categories
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')
const ZAPIER_DIR = '/Users/nathanclevenger/platform/packages/integrations/data/zapier'

function toPascalCase(str: string): string {
  if (!str) return ''

  const acronyms = new Set([
    'API', 'SMS', 'MMS', 'URL', 'URI', 'HTTP', 'HTTPS', 'FTP', 'SFTP',
    'PDF', 'CSV', 'TSV', 'XML', 'JSON', 'HTML', 'CSS', 'SQL', 'NoSQL',
    'REST', 'SOAP', 'GraphQL', 'OAuth', 'JWT', 'SSO', 'SAML',
    'CRM', 'ERP', 'HRM', 'POS', 'CMS', 'LMS', 'ATS', 'HRIS',
    'RSS', 'ATOM', 'AJAX', 'CDN', 'DNS', 'VPN', 'IP', 'TCP', 'UDP',
    'UI', 'UX', 'CLI', 'GUI', 'IDE', 'SDK', 'APK', 'IPA',
    'ID', 'UUID', 'GUID', 'MD5', 'SHA', 'AES', 'RSA', 'SSL', 'TLS',
    'US', 'UK', 'EU', 'USA', 'ISO', 'ANSI', 'IEEE', 'IETF',
    'ASCII', 'UTF', 'MIME', 'JPEG', 'JPG', 'PNG', 'GIF', 'SVG',
    'AI', 'ML', 'NLP', 'OCR', 'QR', 'NFC', 'RFID', 'GPS', 'GIS',
    'SLA', 'KPI', 'ROI', 'B2B', 'B2C', 'SaaS', 'PaaS', 'IaaS',
    'AWS', 'GCP', 'IBM', 'VMware', 'VM', 'VPS', 'IoT', 'AR', 'VR',
    'BigQuery', 'GitHub', 'LinkedIn', 'YouTube', 'WordPress', 'JavaScript',
    'TypeScript', 'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'MariaDB',
    'iOS', 'macOS', 'watchOS', 'tvOS', 'iPadOS', 'iPhone', 'iPad',
    'PowerPoint', 'SharePoint', 'OneDrive', 'OneNote', 'ActiveDirectory'
  ])

  const cleaned = str
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned
    .split(/[\s_-]+/)
    .map(word => {
      const upper = word.toUpperCase()
      if (acronyms.has(upper)) return upper
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join('')
}

function generateId(name: string, fallback?: string): string {
  const pascalName = toPascalCase(name)
  if (!pascalName || pascalName.length < 2) {
    return toPascalCase(name + (fallback || ''))
  }
  return pascalName
}

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

console.log('🚀 Generating root taxonomy files with proper namespaces\n')

// Load Apps.tsv for category mapping
console.log('1️⃣  Loading Apps.tsv...')
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

console.log(`\n2️⃣  Loading cleaned taxonomy data...`)
const cleanedNouns = JSON.parse(readFileSync(resolve(ZAPIER_DIR, 'nouns-cleaned.json'), 'utf-8'))
const cleanedEvents = JSON.parse(readFileSync(resolve(ZAPIER_DIR, 'events-cleaned.json'), 'utf-8'))
const cleanedActions = JSON.parse(readFileSync(resolve(ZAPIER_DIR, 'actions-cleaned.json'), 'utf-8'))

console.log(`   Loaded ${cleanedNouns.length.toLocaleString()} nouns`)
console.log(`   Loaded ${cleanedEvents.length.toLocaleString()} events`)
console.log(`   Loaded ${cleanedActions.length.toLocaleString()} actions`)

// Generate root Nouns (business.org.ai)
console.log(`\n3️⃣  Generating Nouns.tsv (business.org.ai)...`)
const rootNouns = cleanedNouns.map((noun: any) => {
  const id = generateId(noun.noun)

  return {
    url: `https://business.org.ai/${id}`,
    ns: 'business.org.ai',
    type: 'Noun',
    id,
    code: noun.noun.toLowerCase().replace(/\s+/g, '_'),
    name: noun.noun,
    description: `Business concept ${noun.noun} used in ${noun.count} operations across ${noun.serviceCount} apps`,
    appCount: noun.serviceCount.toString(),
    usageCount: noun.count.toString()
  }
})

// Merge with existing nouns from APQC and ONET
const nounsPath = resolve(DATA_DIR, 'Nouns.tsv')
let existingNouns: any[] = []
if (existsSync(nounsPath)) {
  existingNouns = parseTsv(readFileSync(nounsPath, 'utf-8'))
  console.log(`   Loaded ${existingNouns.length.toLocaleString()} existing nouns`)
}

const nounsMap = new Map()
existingNouns.forEach(n => nounsMap.set(n.id, n))
rootNouns.forEach(n => nounsMap.set(n.id, n))

const mergedNouns = Array.from(nounsMap.values())
const nounsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'appCount', 'usageCount']
writeTsv(nounsPath, mergedNouns, nounsHeaders)
console.log(`   Generated ${mergedNouns.length.toLocaleString()} nouns`)

// Generate root Events (events.org.ai)
console.log(`\n4️⃣  Generating Events.tsv (events.org.ai)...`)
const rootEvents = cleanedEvents.map((event: any) => {
  const nounId = generateId(event.noun)
  const verbId = generateId(event.verb)
  const id = `${nounId}.${event.verb.toLowerCase()}`

  return {
    url: `https://events.org.ai/${id}`,
    ns: 'events.org.ai',
    type: 'Event',
    id,
    code: event.event.toLowerCase().replace(/\./g, '_'),
    name: event.event,
    description: `Event/Trigger "${event.event}" used in ${event.count} operations across ${event.serviceCount} apps`,
    noun: event.noun,
    nounId,
    verb: event.verb,
    verbId,
    appCount: event.serviceCount.toString(),
    usageCount: event.count.toString(),
    services: event.services
  }
})

const eventsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'noun', 'nounId', 'verb', 'verbId', 'appCount', 'usageCount']
writeTsv(resolve(DATA_DIR, 'Events.tsv'), rootEvents.map(e => ({...e, services: undefined})), eventsHeaders)
console.log(`   Generated ${rootEvents.length.toLocaleString()} events`)

// Generate root Actions (actions.org.ai)
console.log(`\n5️⃣  Generating Actions.tsv (actions.org.ai)...`)
const rootActions = cleanedActions.map((action: any) => {
  const nounId = generateId(action.noun)
  const verbId = generateId(action.verb)
  const id = `${nounId}.${action.verb.toLowerCase()}`

  return {
    url: `https://actions.org.ai/${id}`,
    ns: 'actions.org.ai',
    type: 'Action',
    id,
    code: action.action.toLowerCase().replace(/\./g, '_'),
    name: action.action,
    description: `Action "${action.action}" used in ${action.count} operations across ${action.serviceCount} apps`,
    noun: action.noun,
    nounId,
    verb: action.verb,
    verbId,
    appCount: action.serviceCount.toString(),
    usageCount: action.count.toString(),
    services: action.services
  }
})

const actionsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'noun', 'nounId', 'verb', 'verbId', 'appCount', 'usageCount']
writeTsv(resolve(DATA_DIR, 'Actions.tsv'), rootActions.map(a => ({...a, services: undefined})), actionsHeaders)
console.log(`   Generated ${rootActions.length.toLocaleString()} actions`)

// Generate root Searches (searches.org.ai)
console.log(`\n6️⃣  Generating Searches.tsv (searches.org.ai)...`)
const servicesPath = resolve(__dirname, '../Integrations.org.ai/services.json')
const services = JSON.parse(readFileSync(servicesPath, 'utf-8'))

const searchesMap = new Map<string, any>()
services.forEach((service: any) => {
  if (!service.searches || service.searches.length === 0) return

  service.searches.forEach((search: any) => {
    const searchName = search.display_label || search.key
    const searchId = toPascalCase(searchName)

    if (!searchesMap.has(searchId)) {
      searchesMap.set(searchId, {
        url: `https://searches.org.ai/${searchId}`,
        ns: 'searches.org.ai',
        type: 'Search',
        id: searchId,
        code: (search.key || searchName).toLowerCase().replace(/\s+/g, '_'),
        name: searchName,
        description: `Search for ${searchName}`,
        appCount: 0
      })
    }

    const searchEntry = searchesMap.get(searchId)!
    searchEntry.appCount++
  })
})

const rootSearches = Array.from(searchesMap.values())
const searchesHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'appCount']
writeTsv(resolve(DATA_DIR, 'Searches.tsv'), rootSearches, searchesHeaders)
console.log(`   Generated ${rootSearches.length.toLocaleString()} searches`)

// Generate Nouns.Relationships.tsv
console.log(`\n7️⃣  Generating Nouns.Relationships.tsv...`)
const nounRelationships: any[] = []

// Root Noun → App-specific Noun instances (from App.Nouns.Relationships.tsv)
const appNounRels = parseTsv(readFileSync(resolve(DATA_DIR, 'App.Nouns.Relationships.tsv'), 'utf-8'))
nounRelationships.push(...appNounRels)

writeTsv(
  resolve(DATA_DIR, 'Nouns.Relationships.tsv'),
  nounRelationships,
  ['ns', 'from', 'to', 'predicate', 'reverse']
)
console.log(`   Generated ${nounRelationships.length.toLocaleString()} noun relationships`)

// Generate Events.Relationships.tsv
console.log(`\n8️⃣  Generating Events.Relationships.tsv...`)
const eventRelationships: any[] = []

// Root Event → App-specific Event instances
const appEventRels = parseTsv(readFileSync(resolve(DATA_DIR, 'App.Events.Relationships.tsv'), 'utf-8'))
eventRelationships.push(...appEventRels)

// Root Event → Noun
rootEvents.forEach((event: any) => {
  eventRelationships.push({
    ns: 'events.org.ai',
    from: `https://events.org.ai/${event.id}`,
    to: `https://business.org.ai/${event.nounId}`,
    predicate: 'hasNoun',
    reverse: 'nounOf'
  })
})

// Root Event → Verb
rootEvents.forEach((event: any) => {
  eventRelationships.push({
    ns: 'events.org.ai',
    from: `https://events.org.ai/${event.id}`,
    to: `https://business.org.ai/Verb/${event.verbId}`,
    predicate: 'hasVerb',
    reverse: 'verbOf'
  })
})

writeTsv(
  resolve(DATA_DIR, 'Events.Relationships.tsv'),
  eventRelationships,
  ['ns', 'from', 'to', 'predicate', 'reverse']
)
console.log(`   Generated ${eventRelationships.length.toLocaleString()} event relationships`)

// Generate Actions.Relationships.tsv
console.log(`\n9️⃣  Generating Actions.Relationships.tsv...`)
const actionRelationships: any[] = []

// Root Action → App-specific Action instances
const appActionRels = parseTsv(readFileSync(resolve(DATA_DIR, 'App.Actions.Relationships.tsv'), 'utf-8'))
actionRelationships.push(...appActionRels)

// Root Action → Noun
rootActions.forEach((action: any) => {
  actionRelationships.push({
    ns: 'actions.org.ai',
    from: `https://actions.org.ai/${action.id}`,
    to: `https://business.org.ai/${action.nounId}`,
    predicate: 'hasNoun',
    reverse: 'nounOf'
  })
})

// Root Action → Verb
rootActions.forEach((action: any) => {
  actionRelationships.push({
    ns: 'actions.org.ai',
    from: `https://actions.org.ai/${action.id}`,
    to: `https://business.org.ai/Verb/${action.verbId}`,
    predicate: 'hasVerb',
    reverse: 'verbOf'
  })
})

writeTsv(
  resolve(DATA_DIR, 'Actions.Relationships.tsv'),
  actionRelationships,
  ['ns', 'from', 'to', 'predicate', 'reverse']
)
console.log(`   Generated ${actionRelationships.length.toLocaleString()} action relationships`)

// Generate Searches.Relationships.tsv
console.log(`\n🔟 Generating Searches.Relationships.tsv...`)
const searchRelationships: any[] = []

services.forEach((service: any) => {
  if (!service.searches || service.searches.length === 0) return

  const appSlug = service.slug
  const appId = appSlugToId.get(appSlug)
  if (!appId) return

  const category = appSlugToCategory.get(appSlug)

  service.searches.forEach((search: any) => {
    const searchName = search.display_label || search.key
    const searchId = toPascalCase(searchName)

    // Root Search → App-specific Search (via instanceOf)
    searchRelationships.push({
      ns: 'searches.org.ai',
      from: `https://integrations.org.ai/${appId}/${searchId}`,
      to: `https://searches.org.ai/${searchId}`,
      predicate: 'instanceOf',
      reverse: 'hasInstance'
    })
  })
})

writeTsv(
  resolve(DATA_DIR, 'Searches.Relationships.tsv'),
  searchRelationships,
  ['ns', 'from', 'to', 'predicate', 'reverse']
)
console.log(`   Generated ${searchRelationships.length.toLocaleString()} search relationships`)

// Summary
console.log('\n' + '='.repeat(60))
console.log('📊 Summary')
console.log('='.repeat(60))
console.log(`\nRoot Taxonomies:`)
console.log(`  Nouns.tsv: ${mergedNouns.length.toLocaleString()} nouns (business.org.ai)`)
console.log(`  Events.tsv: ${rootEvents.length.toLocaleString()} events (events.org.ai)`)
console.log(`  Actions.tsv: ${rootActions.length.toLocaleString()} actions (actions.org.ai)`)
console.log(`  Searches.tsv: ${rootSearches.length.toLocaleString()} searches (searches.org.ai)`)
console.log(`\nRelationships:`)
console.log(`  Nouns.Relationships.tsv: ${nounRelationships.length.toLocaleString()} relationships`)
console.log(`  Events.Relationships.tsv: ${eventRelationships.length.toLocaleString()} relationships`)
console.log(`  Actions.Relationships.tsv: ${actionRelationships.length.toLocaleString()} relationships`)
console.log(`  Searches.Relationships.tsv: ${searchRelationships.length.toLocaleString()} relationships`)
console.log('='.repeat(60))
console.log('\n✅ Root taxonomies generated with proper namespaces!')

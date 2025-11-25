#!/usr/bin/env tsx
/**
 * Regenerate App taxonomies with semantic IDs and composite types,
 * plus generate all relationship files
 *
 * Changes:
 * 1. IDs: Contactcreated → Contact.Created
 * 2. Types: Event → Noun.Event, Action → Noun.Action
 * 3. Generate App.X.Relationships.tsv files
 * 4. Generate X.Relationships.tsv files with App and Category connections
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

function writeTsv(path: string, rows: any[], headers: string[]) {
  const lines = [
    headers.join('\t'),
    ...rows.map(row => headers.map(h => row[h] || '').join('\t'))
  ]
  writeFileSync(path, lines.join('\n') + '\n')
}

console.log('🚀 Regenerating App taxonomies with semantic IDs and relationships\n')

// Load Apps.tsv to get app slugs for relationship generation
console.log('1️⃣  Loading Apps.tsv...')
const appsContent = readFileSync(resolve(DATA_DIR, 'Apps.tsv'), 'utf-8')
const appsLines = appsContent.trim().split('\n')
const appsHeader = appsLines[0].split('\t')
const apps: any[] = []

for (let i = 1; i < appsLines.length; i++) {
  if (!appsLines[i].trim()) continue
  const values = appsLines[i].split('\t')
  const app: any = {}
  appsHeader.forEach((h, idx) => {
    app[h] = values[idx] || ''
  })
  apps.push(app)
}

console.log(`   Loaded ${apps.length.toLocaleString()} apps`)

// Create app slug to ID map
const appSlugToId = new Map<string, string>()
const appSlugToCategory = new Map<string, string>()
apps.forEach(app => {
  appSlugToId.set(app.code, app.id)
  appSlugToCategory.set(app.code, app.category)
})

console.log(`\n2️⃣  Loading cleaned taxonomy data...`)
const cleanedNouns = JSON.parse(readFileSync(resolve(ZAPIER_DIR, 'nouns-cleaned.json'), 'utf-8'))
const cleanedEvents = JSON.parse(readFileSync(resolve(ZAPIER_DIR, 'events-cleaned.json'), 'utf-8'))
const cleanedActions = JSON.parse(readFileSync(resolve(ZAPIER_DIR, 'actions-cleaned.json'), 'utf-8'))

console.log(`   Loaded ${cleanedNouns.length.toLocaleString()} nouns`)
console.log(`   Loaded ${cleanedEvents.length.toLocaleString()} events`)
console.log(`   Loaded ${cleanedActions.length.toLocaleString()} actions`)

// Generate App.Nouns.tsv
console.log(`\n3️⃣  Generating App.Nouns.tsv with semantic IDs...`)
const appNouns = cleanedNouns.map((noun: any) => {
  const id = generateId(noun.noun)

  return {
    url: `https://integrations.org.ai/Noun/${id}`,
    ns: 'integrations.org.ai',
    type: 'Noun',
    id,
    code: noun.noun.toLowerCase().replace(/\s+/g, '_'),
    name: noun.noun,
    description: `Noun representing ${noun.noun} used in ${noun.count} operations across ${noun.serviceCount} apps`,
    appCount: noun.serviceCount.toString(),
    usageCount: noun.count.toString(),
    services: noun.services
  }
})

const nounsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'appCount', 'usageCount']
writeTsv(resolve(DATA_DIR, 'App.Nouns.tsv'), appNouns.map(n => ({...n, services: undefined})), nounsHeaders)
console.log(`   Generated ${appNouns.length.toLocaleString()} nouns`)

// Generate App.Nouns.Relationships.tsv
console.log(`\n4️⃣  Generating App.Nouns.Relationships.tsv...`)
const nounRelationships: any[] = []

appNouns.forEach((noun: any) => {
  noun.services.forEach((slug: string) => {
    const appId = appSlugToId.get(slug)
    if (!appId) return

    nounRelationships.push({
      ns: 'integrations.org.ai',
      from: `https://integrations.org.ai/Noun/${noun.id}`,
      to: `https://integrations.org.ai/${appId}`,
      predicate: 'usedBy',
      reverse: 'uses'
    })
  })
})

writeTsv(
  resolve(DATA_DIR, 'App.Nouns.Relationships.tsv'),
  nounRelationships,
  ['ns', 'from', 'to', 'predicate', 'reverse']
)
console.log(`   Generated ${nounRelationships.length.toLocaleString()} noun→app relationships`)

// Generate App.Events.tsv
console.log(`\n5️⃣  Generating App.Events.tsv with semantic IDs...`)
const appEvents = cleanedEvents.map((event: any) => {
  const nounId = generateId(event.noun)
  const verbId = generateId(event.verb)
  // ID format: Noun.verb (PascalCase noun, lowercase verb)
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
writeTsv(resolve(DATA_DIR, 'App.Events.tsv'), appEvents.map(e => ({...e, services: undefined})), eventsHeaders)
console.log(`   Generated ${appEvents.length.toLocaleString()} events`)

// Generate App.Events.Relationships.tsv
console.log(`\n6️⃣  Generating App.Events.Relationships.tsv...`)
const eventRelationships: any[] = []

appEvents.forEach((event: any) => {
  // Event → App relationships
  event.services.forEach((slug: string) => {
    const appId = appSlugToId.get(slug)
    if (!appId) return

    eventRelationships.push({
      ns: 'events.org.ai',
      from: `https://events.org.ai/${event.id}`,
      to: `https://integrations.org.ai/${appId}`,
      predicate: 'triggeredBy',
      reverse: 'triggers'
    })
  })

  // Event → Noun relationships
  eventRelationships.push({
    ns: 'events.org.ai',
    from: `https://events.org.ai/${event.id}`,
    to: `https://language.org.ai/Noun/${event.nounId}`,
    predicate: 'hasNoun',
    reverse: 'nounOf'
  })

  // Event → Verb relationships
  eventRelationships.push({
    ns: 'events.org.ai',
    from: `https://events.org.ai/${event.id}`,
    to: `https://language.org.ai/Verb/${event.verbId}`,
    predicate: 'hasVerb',
    reverse: 'verbOf'
  })
})

writeTsv(
  resolve(DATA_DIR, 'App.Events.Relationships.tsv'),
  eventRelationships,
  ['ns', 'from', 'to', 'predicate', 'reverse']
)
console.log(`   Generated ${eventRelationships.length.toLocaleString()} event relationships`)

// Generate App.Actions.tsv
console.log(`\n7️⃣  Generating App.Actions.tsv with semantic IDs...`)
const appActions = cleanedActions.map((action: any) => {
  const nounId = generateId(action.noun)
  const verbId = generateId(action.verb)
  // ID format: Noun.verb (PascalCase noun, lowercase verb)
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
writeTsv(resolve(DATA_DIR, 'App.Actions.tsv'), appActions.map(a => ({...a, services: undefined})), actionsHeaders)
console.log(`   Generated ${appActions.length.toLocaleString()} actions`)

// Generate App.Actions.Relationships.tsv
console.log(`\n8️⃣  Generating App.Actions.Relationships.tsv...`)
const actionRelationships: any[] = []

appActions.forEach((action: any) => {
  // Action → App relationships
  action.services.forEach((slug: string) => {
    const appId = appSlugToId.get(slug)
    if (!appId) return

    actionRelationships.push({
      ns: 'actions.org.ai',
      from: `https://actions.org.ai/${action.id}`,
      to: `https://integrations.org.ai/${appId}`,
      predicate: 'performedBy',
      reverse: 'performs'
    })
  })

  // Action → Noun relationships
  actionRelationships.push({
    ns: 'actions.org.ai',
    from: `https://actions.org.ai/${action.id}`,
    to: `https://language.org.ai/Noun/${action.nounId}`,
    predicate: 'hasNoun',
    reverse: 'nounOf'
  })

  // Action → Verb relationships
  actionRelationships.push({
    ns: 'actions.org.ai',
    from: `https://actions.org.ai/${action.id}`,
    to: `https://language.org.ai/Verb/${action.verbId}`,
    predicate: 'hasVerb',
    reverse: 'verbOf'
  })
})

writeTsv(
  resolve(DATA_DIR, 'App.Actions.Relationships.tsv'),
  actionRelationships,
  ['ns', 'from', 'to', 'predicate', 'reverse']
)
console.log(`   Generated ${actionRelationships.length.toLocaleString()} action relationships`)

// Summary
console.log('\n' + '='.repeat(60))
console.log('📊 Summary')
console.log('='.repeat(60))
console.log(`\nApp Taxonomies:`)
console.log(`  App.Nouns.tsv: ${appNouns.length.toLocaleString()} nouns`)
console.log(`  App.Events.tsv: ${appEvents.length.toLocaleString()} events`)
console.log(`  App.Actions.tsv: ${appActions.length.toLocaleString()} actions`)
console.log(`\nRelationships:`)
console.log(`  App.Nouns.Relationships.tsv: ${nounRelationships.length.toLocaleString()} relationships`)
console.log(`  App.Events.Relationships.tsv: ${eventRelationships.length.toLocaleString()} relationships`)
console.log(`  App.Actions.Relationships.tsv: ${actionRelationships.length.toLocaleString()} relationships`)
console.log('='.repeat(60))
console.log('\n✅ App taxonomies regenerated with semantic IDs and relationships!')

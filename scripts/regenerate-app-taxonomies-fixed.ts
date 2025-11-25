#!/usr/bin/env tsx
/**
 * Generate App taxonomy files with proper structure
 *
 * Structure:
 * - App.Nouns.tsv: ALL app-specific nouns with URLs like https://integrations.org.ai/{AppName}/Contact
 * - App.Events.tsv: ALL app-specific events with URLs like https://integrations.org.ai/{AppName}/Contact.created
 * - App.Actions.tsv: ALL app-specific actions with URLs like https://integrations.org.ai/{AppName}/Contact.create
 * - App.Searches.tsv: ALL app-specific searches with URLs like https://integrations.org.ai/{AppName}/FindContacts
 *
 * Plus relationship files connecting app-specific to root taxonomies
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

console.log('🚀 Generating App taxonomies with correct structure\n')

// Load Apps.tsv to get app info
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

// Create app slug to ID/name map
const appSlugToId = new Map<string, string>()
const appSlugToName = new Map<string, string>()
apps.forEach(app => {
  appSlugToId.set(app.code, app.id)
  appSlugToName.set(app.code, app.name)
})

console.log(`\n2️⃣  Loading cleaned taxonomy data...`)
const cleanedNouns = JSON.parse(readFileSync(resolve(ZAPIER_DIR, 'nouns-cleaned.json'), 'utf-8'))
const cleanedEvents = JSON.parse(readFileSync(resolve(ZAPIER_DIR, 'events-cleaned.json'), 'utf-8'))
const cleanedActions = JSON.parse(readFileSync(resolve(ZAPIER_DIR, 'actions-cleaned.json'), 'utf-8'))

console.log(`   Loaded ${cleanedNouns.length.toLocaleString()} nouns`)
console.log(`   Loaded ${cleanedEvents.length.toLocaleString()} events`)
console.log(`   Loaded ${cleanedActions.length.toLocaleString()} actions`)

// Collect all app-specific entities and relationships
const appNouns: any[] = []
const appEvents: any[] = []
const appActions: any[] = []
const nounToRootRelationships: any[] = []
const eventToRootRelationships: any[] = []
const actionToRootRelationships: any[] = []

// Process Nouns
console.log(`\n3️⃣  Processing Nouns for all apps...`)
cleanedNouns.forEach((noun: any) => {
  const rootNounId = generateId(noun.noun)

  noun.services.forEach((slug: string) => {
    const appId = appSlugToId.get(slug)
    if (!appId) return

    appNouns.push({
      url: `https://integrations.org.ai/${appId}/${rootNounId}`,
      ns: 'integrations.org.ai',
      type: 'Noun',
      id: rootNounId,
      code: noun.noun.toLowerCase().replace(/\s+/g, '_'),
      name: noun.noun,
      description: `${noun.noun} in ${appSlugToName.get(slug)}`,
      app: appId,
      rootNoun: rootNounId
    })

    // Create relationship to root noun
    nounToRootRelationships.push({
      ns: 'integrations.org.ai',
      from: `https://integrations.org.ai/${appId}/${rootNounId}`,
      to: `https://business.org.ai/${rootNounId}`,
      predicate: 'instanceOf',
      reverse: 'hasInstance'
    })
  })
})

console.log(`   Generated ${appNouns.length.toLocaleString()} app-specific nouns`)

// Process Events
console.log(`\n4️⃣  Processing Events for all apps...`)
cleanedEvents.forEach((event: any) => {
  const nounId = generateId(event.noun)
  const rootEventId = `${nounId}.${event.verb.toLowerCase()}`

  event.services.forEach((slug: string) => {
    const appId = appSlugToId.get(slug)
    if (!appId) return

    appEvents.push({
      url: `https://integrations.org.ai/${appId}/${rootEventId}`,
      ns: 'integrations.org.ai',
      type: 'Event',
      id: rootEventId,
      code: event.event.toLowerCase().replace(/\./g, '_'),
      name: event.event,
      description: `${event.event} event in ${appSlugToName.get(slug)}`,
      noun: event.noun,
      nounId,
      verb: event.verb,
      verbId: generateId(event.verb),
      app: appId,
      rootEvent: rootEventId
    })

    // Create relationship to root event
    eventToRootRelationships.push({
      ns: 'integrations.org.ai',
      from: `https://integrations.org.ai/${appId}/${rootEventId}`,
      to: `https://events.org.ai/${rootEventId}`,
      predicate: 'instanceOf',
      reverse: 'hasInstance'
    })
  })
})

console.log(`   Generated ${appEvents.length.toLocaleString()} app-specific events`)

// Process Actions
console.log(`\n5️⃣  Processing Actions for all apps...`)
cleanedActions.forEach((action: any) => {
  const nounId = generateId(action.noun)
  const rootActionId = `${nounId}.${action.verb.toLowerCase()}`

  action.services.forEach((slug: string) => {
    const appId = appSlugToId.get(slug)
    if (!appId) return

    appActions.push({
      url: `https://integrations.org.ai/${appId}/${rootActionId}`,
      ns: 'integrations.org.ai',
      type: 'Action',
      id: rootActionId,
      code: action.action.toLowerCase().replace(/\./g, '_'),
      name: action.action,
      description: `${action.action} action in ${appSlugToName.get(slug)}`,
      noun: action.noun,
      nounId,
      verb: action.verb,
      verbId: generateId(action.verb),
      app: appId,
      rootAction: rootActionId
    })

    // Create relationship to root action
    actionToRootRelationships.push({
      ns: 'integrations.org.ai',
      from: `https://integrations.org.ai/${appId}/${rootActionId}`,
      to: `https://actions.org.ai/${rootActionId}`,
      predicate: 'instanceOf',
      reverse: 'hasInstance'
    })
  })
})

console.log(`   Generated ${appActions.length.toLocaleString()} app-specific actions`)

// Write App taxonomy files
console.log(`\n6️⃣  Writing App.{Type}.tsv files...`)

const nounHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'app', 'rootNoun']
writeTsv(resolve(DATA_DIR, 'App.Nouns.tsv'), appNouns, nounHeaders)

const eventHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'noun', 'nounId', 'verb', 'verbId', 'app', 'rootEvent']
writeTsv(resolve(DATA_DIR, 'App.Events.tsv'), appEvents, eventHeaders)

const actionHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'noun', 'nounId', 'verb', 'verbId', 'app', 'rootAction']
writeTsv(resolve(DATA_DIR, 'App.Actions.tsv'), appActions, actionHeaders)

console.log(`   Generated App.Nouns.tsv with ${appNouns.length.toLocaleString()} entries`)
console.log(`   Generated App.Events.tsv with ${appEvents.length.toLocaleString()} entries`)
console.log(`   Generated App.Actions.tsv with ${appActions.length.toLocaleString()} entries`)

// Write relationship files
console.log(`\n7️⃣  Writing relationship files...`)
const relHeaders = ['ns', 'from', 'to', 'predicate', 'reverse']

writeTsv(
  resolve(DATA_DIR, 'App.Nouns.Relationships.tsv'),
  nounToRootRelationships,
  relHeaders
)

writeTsv(
  resolve(DATA_DIR, 'App.Events.Relationships.tsv'),
  eventToRootRelationships,
  relHeaders
)

writeTsv(
  resolve(DATA_DIR, 'App.Actions.Relationships.tsv'),
  actionToRootRelationships,
  relHeaders
)

console.log(`   App.Nouns.Relationships.tsv: ${nounToRootRelationships.length.toLocaleString()} relationships`)
console.log(`   App.Events.Relationships.tsv: ${eventToRootRelationships.length.toLocaleString()} relationships`)
console.log(`   App.Actions.Relationships.tsv: ${actionToRootRelationships.length.toLocaleString()} relationships`)

// Summary
console.log('\n' + '='.repeat(60))
console.log('📊 Summary')
console.log('='.repeat(60))
console.log(`\nApp Taxonomy Files:`)
console.log(`  App.Nouns.tsv: ${appNouns.length.toLocaleString()} entries`)
console.log(`  App.Events.tsv: ${appEvents.length.toLocaleString()} entries`)
console.log(`  App.Actions.tsv: ${appActions.length.toLocaleString()} entries`)
console.log(`\nRelationships (App → Root):`)
console.log(`  App.Nouns.Relationships.tsv: ${nounToRootRelationships.length.toLocaleString()}`)
console.log(`  App.Events.Relationships.tsv: ${eventToRootRelationships.length.toLocaleString()}`)
console.log(`  App.Actions.Relationships.tsv: ${actionToRootRelationships.length.toLocaleString()}`)
console.log('='.repeat(60))
console.log('\n✅ App taxonomies generated correctly!')

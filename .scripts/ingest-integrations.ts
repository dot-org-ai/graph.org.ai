#!/usr/bin/env tsx
/**
 * Ingest Integration Data
 *
 * This script transforms integration platform data into TSV format for business.org.ai
 * Uses the GraphDL semantic parser to properly parse compound action/event names.
 *
 * Sources (from platform repo):
 * - nouns-cleaned.json: Nouns with services they appear in
 * - actions-cleaned.json: Actions (Noun.verb patterns)
 * - events-cleaned.json: Events (Noun.verb patterns for triggers)
 * - ontology/nouns.json: Enriched nouns with descriptions and schema mappings
 * - ontology/actions.json: Enriched actions with descriptions
 * - ontology/events.json: Enriched events with descriptions
 *
 * Outputs to .org.ai/business.org.ai/.standards/Integrations/:
 * - Integrations.tsv: All integration services
 * - Nouns.tsv: Business nouns from integrations
 * - Actions.tsv: Integration actions
 * - Events.tsv: Integration events (triggers)
 * - Concepts.tsv: Business concepts for merging with main
 */

import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { GraphDLParser } from '../.packages/@graphdl/semantics/src/parser'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUTPUT_DIR = join(ROOT, '.org.ai/business.org.ai/.standards/Integrations')
const SOURCE_DIR = '/Users/nathanclevenger/projects/.org.ai/platform/packages/integrations/data/zapier'

// Common verbs that appear as prefixes in compound names
const VERB_PREFIXES = new Set([
  'add', 'create', 'update', 'delete', 'remove', 'get', 'set', 'find', 'search',
  'send', 'receive', 'upload', 'download', 'import', 'export', 'sync', 'fetch',
  'new', 'edit', 'save', 'load', 'submit', 'cancel', 'complete', 'start', 'stop',
  'enable', 'disable', 'activate', 'deactivate', 'archive', 'restore', 'copy',
  'move', 'rename', 'convert', 'generate', 'validate', 'verify', 'approve', 'reject',
  'assign', 'unassign', 'subscribe', 'unsubscribe', 'enroll', 'unenroll', 'register',
  'login', 'logout', 'invite', 'revoke', 'grant', 'deny', 'mark', 'tag', 'untag',
  'list', 'count', 'check', 'test', 'run', 'execute', 'trigger', 'schedule',
  'publish', 'unpublish', 'draft', 'review', 'watch', 'track', 'log', 'record'
])

// Parse a compound name like "Add/UpdateSubscriber" or "NewContact" into noun and verbs
function parseCompoundName(name: string): { noun: string, verbs: string[] } {
  // Handle slash-separated verbs: "Add/UpdateSubscriber" → { noun: "Subscriber", verbs: ["add", "update"] }
  const slashMatch = name.match(/^([A-Za-z]+)\/([A-Za-z]+)([A-Z][a-zA-Z]*)$/)
  if (slashMatch) {
    const [, verb1, verb2, noun] = slashMatch
    if (VERB_PREFIXES.has(verb1.toLowerCase()) && VERB_PREFIXES.has(verb2.toLowerCase())) {
      return { noun, verbs: [verb1.toLowerCase(), verb2.toLowerCase()] }
    }
  }

  // Handle camelCase verb prefix: "NewContact" → { noun: "Contact", verbs: ["new"] }
  // "CreateUser" → { noun: "User", verbs: ["create"] }
  for (const verb of VERB_PREFIXES) {
    const verbCapitalized = verb.charAt(0).toUpperCase() + verb.slice(1)
    if (name.startsWith(verbCapitalized) && name.length > verb.length) {
      const rest = name.slice(verb.length)
      // Check if the rest starts with uppercase (is a noun)
      if (rest[0] === rest[0].toUpperCase()) {
        return { noun: rest, verbs: [verb] }
      }
    }
  }

  // Handle patterns like "ContactCreated" → { noun: "Contact", verbs: ["created"] }
  const eventSuffixes = ['Created', 'Updated', 'Deleted', 'Added', 'Removed', 'Changed', 'Completed']
  for (const suffix of eventSuffixes) {
    if (name.endsWith(suffix) && name.length > suffix.length) {
      const noun = name.slice(0, -suffix.length)
      if (noun[0] === noun[0].toUpperCase()) {
        return { noun, verbs: [suffix.toLowerCase()] }
      }
    }
  }

  // No compound pattern found, return as-is
  return { noun: name, verbs: [] }
}

interface NounEntry {
  noun: string
  count: number
  services: string[]
}

interface ActionEntry {
  action: string
  noun: string
  verb: string
  count: number
  services: string[]
}

interface EventEntry {
  event: string
  noun: string
  verb: string
  count: number
  services: string[]
}

interface OntologyNoun {
  name: string
  description: string
  count: number
  sameAs?: string[]
}

interface OntologyAction {
  name: string
  description: string
  count: number
  sameAs?: string[]
}

// Convert slug to display name
function slugToName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Convert slug to PascalCase ID
function slugToId(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

// Escape TSV value
function escapeValue(value: string | undefined): string {
  if (!value) return ''
  // Escape tabs and newlines
  return value.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '')
}

async function main() {
  console.log('🔄 Loading integration data...')

  // Load source data
  const nouns: NounEntry[] = JSON.parse(await readFile(join(SOURCE_DIR, 'nouns-cleaned.json'), 'utf-8'))
  const actions: ActionEntry[] = JSON.parse(await readFile(join(SOURCE_DIR, 'actions-cleaned.json'), 'utf-8'))
  const events: EventEntry[] = JSON.parse(await readFile(join(SOURCE_DIR, 'events-cleaned.json'), 'utf-8'))

  // Load ontology data (enriched)
  const ontologyNouns: OntologyNoun[] = JSON.parse(await readFile(join(SOURCE_DIR, 'ontology/nouns.json'), 'utf-8'))
  const ontologyActions: OntologyAction[] = JSON.parse(await readFile(join(SOURCE_DIR, 'ontology/actions.json'), 'utf-8'))
  const ontologyEvents: OntologyAction[] = JSON.parse(await readFile(join(SOURCE_DIR, 'ontology/events.json'), 'utf-8'))

  // Create lookup maps for ontology data
  const nounDescriptions = new Map<string, OntologyNoun>()
  ontologyNouns.forEach(n => nounDescriptions.set(n.name, n))

  const actionDescriptions = new Map<string, OntologyAction>()
  ontologyActions.forEach(a => actionDescriptions.set(a.name, a))

  const eventDescriptions = new Map<string, OntologyAction>()
  ontologyEvents.forEach(e => eventDescriptions.set(e.name, e))

  // Extract all unique integrations (services)
  const allServices = new Set<string>()
  nouns.forEach(n => {
    if (n.services) n.services.forEach(s => allServices.add(s))
  })

  console.log(`📊 Found ${allServices.size} unique integrations`)
  console.log(`📊 Found ${nouns.length} nouns`)
  console.log(`📊 Found ${actions.length} actions`)
  console.log(`📊 Found ${events.length} events`)

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true })

  // Generate Integrations.tsv
  console.log('📝 Generating Integrations.tsv...')
  const integrationsHeader = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'category', 'digital'].join('\t')
  const integrationsRows = Array.from(allServices).sort().map(slug => {
    const id = slugToId(slug)
    const name = slugToName(slug)
    return [
      `https://integrations.org.ai/${id}`,
      'integrations.org.ai',
      'Integration',
      id,
      slug,
      name,
      `${name} integration`,
      '',
      '1.00'
    ].map(escapeValue).join('\t')
  })

  await writeFile(
    join(OUTPUT_DIR, 'Integrations.tsv'),
    [integrationsHeader, ...integrationsRows].join('\n')
  )
  console.log(`✅ Written ${integrationsRows.length} integrations`)

  // Generate Nouns.tsv (business nouns from integrations)
  // Parse compound names and aggregate by normalized noun
  console.log('📝 Generating Nouns.tsv...')

  const normalizedNouns = new Map<string, { count: number, services: Set<string>, originalNames: Set<string> }>()
  const skippedCompounds: string[] = []

  for (const n of nouns) {
    if (!n.noun || n.noun.length < 2) continue
    if (['or', 'New', 'Updated', 'a', 'an', 'to', 'the', 'and'].includes(n.noun)) continue

    // Parse the noun name to extract the actual noun
    const parsed = parseCompoundName(n.noun)
    const normalizedNoun = parsed.noun

    // Skip if the parsed noun is too short or still looks like an action
    if (normalizedNoun.length < 2) continue
    if (normalizedNoun.includes('/') || normalizedNoun.includes('-')) {
      skippedCompounds.push(n.noun)
      continue
    }

    // Aggregate
    if (!normalizedNouns.has(normalizedNoun)) {
      normalizedNouns.set(normalizedNoun, { count: 0, services: new Set(), originalNames: new Set() })
    }
    const entry = normalizedNouns.get(normalizedNoun)!
    entry.count += n.count
    entry.originalNames.add(n.noun)
    if (n.services) {
      n.services.forEach(s => entry.services.add(s))
    }
  }

  console.log(`   📊 Normalized ${nouns.length} raw nouns to ${normalizedNouns.size} unique nouns`)
  if (skippedCompounds.length > 0) {
    console.log(`   ⚠️  Skipped ${skippedCompounds.length} unparseable compounds (e.g., ${skippedCompounds.slice(0, 3).join(', ')})`)
  }

  const nounsHeader = ['url', 'ns', 'type', 'id', 'name', 'description', 'count', 'sameAs', 'digital'].join('\t')
  const nounsRows = Array.from(normalizedNouns.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([noun, data]) => {
      const ontology = nounDescriptions.get(noun)
      return [
        `https://nouns.org.ai/${noun}`,
        'nouns.org.ai',
        'Noun',
        noun,
        noun,
        ontology?.description || `Business noun used in ${data.services.size} integrations`,
        data.count.toString(),
        ontology?.sameAs?.join(', ') || '',
        '1.00'
      ].map(escapeValue).join('\t')
    })

  await writeFile(
    join(OUTPUT_DIR, 'Nouns.tsv'),
    [nounsHeader, ...nounsRows].join('\n')
  )
  console.log(`✅ Written ${nounsRows.length} nouns`)

  // Generate Actions.tsv
  // Normalize noun names and aggregate by normalized action
  console.log('📝 Generating Actions.tsv...')

  const normalizedActions = new Map<string, { count: number, verb: string, noun: string, originalAction: string }>()

  for (const a of actions) {
    if (!a.action || !a.noun || !a.verb) continue
    if (['or', 'New', 'Updated', 'a', 'an', 'to', 'the', 'and'].includes(a.noun)) continue

    // Parse and normalize the noun
    const parsed = parseCompoundName(a.noun)
    const normalizedNoun = parsed.noun

    // Skip invalid nouns
    if (normalizedNoun.length < 2) continue
    if (normalizedNoun.includes('/') || normalizedNoun.includes('-')) continue

    // Combine parsed verbs with the action verb
    const allVerbs = parsed.verbs.length > 0 ? parsed.verbs : [a.verb]

    for (const verb of allVerbs) {
      const id = `${normalizedNoun}.${verb}`
      if (!normalizedActions.has(id)) {
        normalizedActions.set(id, { count: 0, verb, noun: normalizedNoun, originalAction: a.action })
      }
      normalizedActions.get(id)!.count += a.count
    }
  }

  const actionsHeader = ['url', 'ns', 'type', 'id', 'name', 'noun', 'verb', 'description', 'count', 'sameAs', 'digital'].join('\t')
  const actionsRows = Array.from(normalizedActions.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([id, data]) => {
      const ontology = actionDescriptions.get(data.originalAction)
      return [
        `https://actions.org.ai/${id}`,
        'actions.org.ai',
        'Action',
        id,
        id,
        data.noun,
        data.verb,
        ontology?.description || `Action: ${id}`,
        data.count.toString(),
        ontology?.sameAs?.join(', ') || '',
        '1.00'
      ].map(escapeValue).join('\t')
    })

  await writeFile(
    join(OUTPUT_DIR, 'Actions.tsv'),
    [actionsHeader, ...actionsRows].join('\n')
  )
  console.log(`✅ Written ${actionsRows.length} actions`)

  // Generate Events.tsv (triggers)
  // Normalize noun names and aggregate by normalized event
  console.log('📝 Generating Events.tsv...')

  const normalizedEvents = new Map<string, { count: number, verb: string, noun: string, originalEvent: string }>()

  for (const e of events) {
    if (!e.event || !e.noun || !e.verb) continue
    if (['or', 'New', 'Updated', 'a', 'an', 'to', 'the', 'and'].includes(e.noun)) continue

    // Parse and normalize the noun
    const parsed = parseCompoundName(e.noun)
    const normalizedNoun = parsed.noun

    // Skip invalid nouns
    if (normalizedNoun.length < 2) continue
    if (normalizedNoun.includes('/') || normalizedNoun.includes('-')) continue

    // Combine parsed verbs with the event verb
    const allVerbs = parsed.verbs.length > 0 ? parsed.verbs : [e.verb]

    for (const verb of allVerbs) {
      const id = `${normalizedNoun}.${verb}`
      if (!normalizedEvents.has(id)) {
        normalizedEvents.set(id, { count: 0, verb, noun: normalizedNoun, originalEvent: e.event })
      }
      normalizedEvents.get(id)!.count += e.count
    }
  }

  const eventsHeader = ['url', 'ns', 'type', 'id', 'name', 'noun', 'verb', 'description', 'count', 'sameAs', 'digital'].join('\t')
  const eventsRows = Array.from(normalizedEvents.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([id, data]) => {
      const ontology = eventDescriptions.get(data.originalEvent)
      return [
        `https://events.org.ai/${id}`,
        'events.org.ai',
        'Event',
        id,
        id,
        data.noun,
        data.verb,
        ontology?.description || `Event: ${id}`,
        data.count.toString(),
        ontology?.sameAs?.join(', ') || '',
        '1.00'
      ].map(escapeValue).join('\t')
    })

  await writeFile(
    join(OUTPUT_DIR, 'Events.tsv'),
    [eventsHeader, ...eventsRows].join('\n')
  )
  console.log(`✅ Written ${eventsRows.length} events`)

  // Generate Concepts.tsv (nouns that should be added to main Concepts)
  // Use the normalized nouns we already computed
  console.log('📝 Generating Concepts.tsv (for merging with main Concepts)...')
  const conceptsHeader = ['id', 'description', 'baseNoun', 'modifiers', 'category', 'source'].join('\t')
  const conceptsRows = Array.from(normalizedNouns.entries())
    .filter(([noun, data]) => data.count >= 10) // Only include nouns with significant usage
    .sort((a, b) => b[1].count - a[1].count)
    .map(([noun, data]) => {
      const ontology = nounDescriptions.get(noun)
      return [
        noun,
        ontology?.description || `Business entity used in ${data.services.size} integrations`,
        noun,
        '',
        'Business Integration',
        'Integrations'
      ].map(escapeValue).join('\t')
    })

  await writeFile(
    join(OUTPUT_DIR, 'Concepts.tsv'),
    [conceptsHeader, ...conceptsRows].join('\n')
  )
  console.log(`✅ Written ${conceptsRows.length} concepts`)

  console.log('\n✨ Done!')
  console.log(`\nOutput files in ${OUTPUT_DIR}:`)
  console.log('  - Integrations.tsv')
  console.log('  - Nouns.tsv')
  console.log('  - Actions.tsv')
  console.log('  - Events.tsv')
  console.log('  - Concepts.tsv (for merging with main)')
}

main().catch(console.error)

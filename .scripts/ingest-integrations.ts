#!/usr/bin/env tsx
/**
 * Ingest Integration Data
 *
 * This script transforms integration platform data into TSV format for business.org.ai
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

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUTPUT_DIR = join(ROOT, '.org.ai/business.org.ai/.standards/Integrations')
const SOURCE_DIR = '/Users/nathanclevenger/projects/.org.ai/platform/packages/integrations/data/zapier'

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
      `https://integrations.org.ai/Integration/${id}`,
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
  console.log('📝 Generating Nouns.tsv...')
  const nounsHeader = ['url', 'ns', 'type', 'id', 'name', 'description', 'count', 'sameAs', 'digital'].join('\t')
  const nounsRows = nouns
    .filter(n => n.noun && n.noun.length > 1 && !['or', 'New', 'Updated', 'a', 'an', 'to'].includes(n.noun))
    .sort((a, b) => b.count - a.count)
    .map(n => {
      const ontology = nounDescriptions.get(n.noun)
      return [
        `https://nouns.org.ai/Noun/${n.noun}`,
        'nouns.org.ai',
        'Noun',
        n.noun,
        n.noun,
        ontology?.description || `Business noun used in ${n.services?.length || 0} integrations`,
        n.count.toString(),
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
  console.log('📝 Generating Actions.tsv...')
  const actionsHeader = ['url', 'ns', 'type', 'id', 'name', 'noun', 'verb', 'description', 'count', 'sameAs', 'digital'].join('\t')
  const actionsRows = actions
    .filter(a => a.action && a.noun && a.verb && !['or', 'New', 'Updated', 'a', 'an'].includes(a.noun))
    .sort((a, b) => b.count - a.count)
    .map(a => {
      const ontology = actionDescriptions.get(a.action)
      const id = `${a.noun}.${a.verb}`
      return [
        `https://actions.org.ai/Action/${id}`,
        'actions.org.ai',
        'Action',
        id,
        id,
        a.noun,
        a.verb,
        ontology?.description || `Action pattern: ${a.action}`,
        a.count.toString(),
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
  console.log('📝 Generating Events.tsv...')
  const eventsHeader = ['url', 'ns', 'type', 'id', 'name', 'noun', 'verb', 'description', 'count', 'sameAs', 'digital'].join('\t')
  const eventsRows = events
    .filter(e => e.event && e.noun && e.verb && !['or', 'New', 'Updated', 'a', 'an'].includes(e.noun))
    .sort((a, b) => b.count - a.count)
    .map(e => {
      const ontology = eventDescriptions.get(e.event)
      const id = `${e.noun}.${e.verb}`
      return [
        `https://events.org.ai/Event/${id}`,
        'events.org.ai',
        'Event',
        id,
        id,
        e.noun,
        e.verb,
        ontology?.description || `Event trigger: ${e.event}`,
        e.count.toString(),
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
  console.log('📝 Generating Concepts.tsv (for merging with main Concepts)...')
  const conceptsHeader = ['id', 'description', 'baseNoun', 'modifiers', 'category', 'source'].join('\t')
  const conceptsRows = nouns
    .filter(n => n.noun && n.noun.length > 1 && !['or', 'New', 'Updated', 'a', 'an', 'to'].includes(n.noun))
    .filter(n => n.count >= 10) // Only include nouns with significant usage
    .sort((a, b) => b.count - a.count)
    .map(n => {
      const ontology = nounDescriptions.get(n.noun)
      return [
        n.noun,
        ontology?.description || `Business entity used in ${n.services?.length || 0} integrations`,
        n.noun,
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

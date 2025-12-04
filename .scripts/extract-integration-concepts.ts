#!/usr/bin/env tsx
/**
 * Extract Integration Concepts
 *
 * Extracts all entities/objects (nouns) from Actions and Events TSVs
 * and adds them to the main Concepts.tsv with their associated tasks/processes
 */

import { readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const INTEGRATIONS_DIR = join(ROOT, '.org.ai/business.org.ai/.standards/Integrations')
const CONCEPTS_PATH = join(ROOT, '.data/Concepts.tsv')

interface ConceptData {
  url: string
  ns: string
  type: string
  id: string
  code: string
  name: string
  description: string
  baseNoun: string
  modifiers: string
  category: string
  source: string
  occupations: string
  industries: string
  processes: string
  tasks: string
  digital: string
}

interface NounStats {
  noun: string
  actionCount: number
  eventCount: number
  actions: Set<string>  // verbs used in actions (create, update, delete, send)
  events: Set<string>   // verbs used in events (created, updated, deleted)
  sameAs?: string
}

// Parse TSV line into array
function parseTsvLine(line: string): string[] {
  return line.split('\t')
}

// Escape TSV value
function escapeValue(value: string | undefined): string {
  if (!value) return ''
  return value.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '')
}

async function main() {
  console.log('🔄 Loading Actions and Events...')

  // Read Actions.tsv
  const actionsContent = await readFile(join(INTEGRATIONS_DIR, 'Actions.tsv'), 'utf-8')
  const actionsLines = actionsContent.trim().split('\n')
  const actionsHeader = parseTsvLine(actionsLines[0])
  const nounIdx = actionsHeader.indexOf('noun')
  const verbIdx = actionsHeader.indexOf('verb')
  const countIdx = actionsHeader.indexOf('count')
  const sameAsIdx = actionsHeader.indexOf('sameAs')

  // Read Events.tsv
  const eventsContent = await readFile(join(INTEGRATIONS_DIR, 'Events.tsv'), 'utf-8')
  const eventsLines = eventsContent.trim().split('\n')
  const eventsHeader = parseTsvLine(eventsLines[0])
  const eventNounIdx = eventsHeader.indexOf('noun')
  const eventVerbIdx = eventsHeader.indexOf('verb')
  const eventCountIdx = eventsHeader.indexOf('count')
  const eventSameAsIdx = eventsHeader.indexOf('sameAs')

  // Aggregate noun stats from both actions and events
  const nounStats = new Map<string, NounStats>()

  // Helper to detect action-like compound names (e.g., InviteUser, VerifyEmail, CompleteTask)
  function isActionLikeName(name: string): boolean {
    // Check for camelCase compound that looks like Verb+Noun
    const actionPrefixes = [
      'Create', 'Update', 'Delete', 'Add', 'Remove', 'Send', 'Get', 'Set', 'Make',
      'Generate', 'Convert', 'Validate', 'Verify', 'Complete', 'Start', 'Stop',
      'Run', 'Execute', 'Trigger', 'Cancel', 'Save', 'Load', 'Upload', 'Download',
      'Invite', 'Assign', 'Enroll', 'Register', 'Extract', 'Look', 'Mark', 'Change',
      'Restore', 'Archive', 'Approve', 'Reject', 'Summarize', 'Resize', 'Initiate'
    ]
    for (const prefix of actionPrefixes) {
      if (name.startsWith(prefix) && name.length > prefix.length && name[prefix.length] === name[prefix.length].toUpperCase()) {
        return true
      }
    }
    // Also check for all-caps or special patterns
    if (name.includes('/') || name.includes('_')) return true
    return false
  }

  // Process actions
  for (let i = 1; i < actionsLines.length; i++) {
    const parts = parseTsvLine(actionsLines[i])
    const noun = parts[nounIdx]
    const verb = parts[verbIdx]
    const count = parseInt(parts[countIdx]) || 0
    const sameAs = parts[sameAsIdx]

    if (!noun || noun.length < 2) continue
    // Skip noise words and action-like names
    if (['or', 'New', 'Updated', 'a', 'an', 'to', 'the', 'API', 'Custom', 'Generate', 'CustomActions', 'Math', 'Text'].includes(noun)) continue
    if (isActionLikeName(noun)) continue

    let stats = nounStats.get(noun)
    if (!stats) {
      stats = { noun, actionCount: 0, eventCount: 0, actions: new Set(), events: new Set() }
      nounStats.set(noun, stats)
    }
    stats.actionCount += count
    if (verb && verb !== 'unknown') stats.actions.add(verb)
  }

  // Process events
  for (let i = 1; i < eventsLines.length; i++) {
    const parts = parseTsvLine(eventsLines[i])
    const noun = parts[eventNounIdx]
    const verb = parts[eventVerbIdx]
    const count = parseInt(parts[eventCountIdx]) || 0

    if (!noun || noun.length < 2) continue
    if (['or', 'New', 'Updated', 'a', 'an', 'to', 'the', 'API', 'Custom', 'Generate', 'CustomActions', 'Math', 'Text'].includes(noun)) continue
    if (isActionLikeName(noun)) continue

    let stats = nounStats.get(noun)
    if (!stats) {
      stats = { noun, actionCount: 0, eventCount: 0, actions: new Set(), events: new Set() }
      nounStats.set(noun, stats)
    }
    stats.eventCount += count
    if (verb && verb !== 'unknown') stats.events.add(verb)
  }

  console.log(`📊 Found ${nounStats.size} unique nouns from Actions/Events`)

  // Read existing concepts
  const conceptsContent = await readFile(CONCEPTS_PATH, 'utf-8')
  const conceptsLines = conceptsContent.trim().split('\n')
  const header = conceptsLines[0]
  const existingConcepts = new Map<string, string>()

  for (let i = 1; i < conceptsLines.length; i++) {
    const parts = parseTsvLine(conceptsLines[i])
    existingConcepts.set(parts[0], conceptsLines[i])
  }

  console.log(`📊 Existing concepts: ${existingConcepts.size}`)

  // Schema.org noun mappings
  const schemaMappings: Record<string, string> = {
    'Contact': 'schema:Person',
    'Lead': 'schema:Person',
    'Customer': 'schema:Customer',
    'User': 'schema:Person',
    'Person': 'schema:Person',
    'Company': 'schema:Organization',
    'Organization': 'schema:Organization',
    'Order': 'schema:Order',
    'Invoice': 'schema:Invoice',
    'Product': 'schema:Product',
    'Event': 'schema:Event',
    'Message': 'schema:Message',
    'Email': 'schema:EmailMessage',
    'Document': 'schema:DigitalDocument',
    'File': 'schema:MediaObject',
    'Project': 'schema:Project',
    'Task': 'schema:Action',
    'Ticket': 'schema:Ticket',
    'Booking': 'schema:Reservation',
    'Appointment': 'schema:Reservation',
    'Payment': 'schema:PaymentChargeSpecification',
    'Subscription': 'schema:Subscription',
    'Member': 'schema:OrganizationRole',
    'Comment': 'schema:Comment',
    'Review': 'schema:Review',
    'Rating': 'schema:Rating',
  }

  // Create new concepts from noun stats
  const newConcepts: ConceptData[] = []

  for (const [noun, stats] of nounStats) {
    // Skip nouns that only have "unknown" verbs - these are likely action names, not entities
    const hasRealVerbs = stats.actions.size > 0 || stats.events.size > 0
    if (!hasRealVerbs) continue

    // Skip if already exists (but we'll update existing ones with tasks)
    if (existingConcepts.has(noun)) {
      // Update existing concept with tasks if it doesn't have them
      const existing = parseTsvLine(existingConcepts.get(noun)!)
      const existingTasks = existing[9] || ''

      if (!existingTasks) {
        // Build tasks string from actions
        const tasks = Array.from(stats.actions)
          .filter(v => v !== 'unknown')
          .map(v => `${noun}.${v}`)
          .join(', ')

        if (tasks) {
          existing[9] = tasks
          existingConcepts.set(noun, existing.join('\t'))
        }
      }
      continue
    }

    // Build description
    const totalUsage = stats.actionCount + stats.eventCount
    const actionVerbs = Array.from(stats.actions).filter(v => v !== 'unknown')
    const eventVerbs = Array.from(stats.events).filter(v => v !== 'unknown')

    let description = `Business entity`
    if (actionVerbs.length > 0 || eventVerbs.length > 0) {
      const allVerbs = [...new Set([...actionVerbs, ...eventVerbs])]
      description = `Business entity that can be ${allVerbs.slice(0, 3).join(', ')}`
      if (allVerbs.length > 3) description += `, etc.`
    }

    // Build tasks string (actions associated with this noun)
    const tasks = actionVerbs.map(v => `${noun}.${v}`).join(', ')

    // Build processes string (events/triggers associated with this noun)
    const processes = eventVerbs.map(v => `${noun}.${v}`).join(', ')

    // Convert noun to display name (add spaces before capitals)
    const displayName = noun.replace(/([A-Z])/g, ' $1').trim()

    newConcepts.push({
      url: `https://concepts.org.ai/Concept/${noun}`,
      ns: 'concepts.org.ai',
      type: 'Concept',
      id: noun,
      code: noun.toLowerCase(),
      name: displayName,
      description,
      baseNoun: noun,
      modifiers: '',
      category: 'Business Entity',
      source: 'Integrations',
      occupations: '',
      industries: '',
      processes,
      tasks,
      digital: '1.00'
    })
  }

  // Sort by total usage (action + event count)
  newConcepts.sort((a, b) => {
    const statsA = nounStats.get(a.id)!
    const statsB = nounStats.get(b.id)!
    return (statsB.actionCount + statsB.eventCount) - (statsA.actionCount + statsA.eventCount)
  })

  console.log(`📊 New concepts to add: ${newConcepts.length}`)

  // Build output
  const outputLines = [header]

  // Add existing concepts (potentially updated)
  for (const line of existingConcepts.values()) {
    outputLines.push(line)
  }

  // Add new concepts
  for (const concept of newConcepts) {
    outputLines.push([
      concept.url,
      concept.ns,
      concept.type,
      concept.id,
      concept.code,
      concept.name,
      concept.description,
      concept.baseNoun,
      concept.modifiers,
      concept.category,
      concept.source,
      concept.occupations,
      concept.industries,
      concept.processes,
      concept.tasks,
      concept.digital
    ].map(escapeValue).join('\t'))
  }

  await writeFile(CONCEPTS_PATH, outputLines.join('\n'))

  console.log(`\n✅ Written ${outputLines.length - 1} concepts to ${CONCEPTS_PATH}`)
  console.log(`   - Updated existing: ${existingConcepts.size}`)
  console.log(`   - Added new: ${newConcepts.length}`)

  // Show sample of new concepts
  console.log('\n📝 Sample new concepts:')
  newConcepts.slice(0, 10).forEach(c => {
    console.log(`   ${c.id}: tasks=[${c.tasks.slice(0, 50)}${c.tasks.length > 50 ? '...' : ''}]`)
  })
}

main().catch(console.error)

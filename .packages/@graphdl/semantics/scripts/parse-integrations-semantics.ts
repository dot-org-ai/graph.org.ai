#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Semantically parse integration entities to extract:
 * - Concept names from entity names
 * - Associated verbs from descriptions and action names
 *
 * This creates semantic GraphDL statements like:
 * - GoogleSheets.create.Spreadsheet
 * - Gmail.send.Email
 * - Slack.post.Message
 */

interface ParsedStatement {
  statement: string
  subject: string
  verb: string
  object: string
  source: string
  sourceId: string
  description: string
}

function parseVerbObject(text: string): { verb: string; object: string } | null {
  // Common patterns in integration names:
  // "New X", "Updated Y", "Create X", "Delete Y", "Send X", etc.

  if (!text) return null

  // Remove brackets and special chars
  let cleaned = text.replace(/\[.*?\]/g, '').trim()

  // Pattern: Verb + Object (e.g., "Create Spreadsheet", "Send Email")
  const verbObjectPattern = /^(new|create|update|delete|send|get|find|lookup|list|add|remove|post|fetch|search|trigger)\s+(.+)$/i
  const match = cleaned.match(verbObjectPattern)

  if (match) {
    let verb = match[1].toLowerCase()
    let object = match[2].trim()

    // Normalize verbs
    if (verb === 'new') verb = 'create'

    // Clean up object - take first significant noun phrase
    object = object.split(/\s+(in|from|to|for|with)\s+/i)[0].trim()

    // Convert to PascalCase
    object = object.split(/[\s\-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('')

    return { verb, object }
  }

  return null
}

async function main() {
  console.log('='.repeat(100))
  console.log('INTEGRATIONS SEMANTIC PARSING')
  console.log('='.repeat(100))

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  const statements: ParsedStatement[] = []
  const concepts = new Set<string>()
  const verbs = new Set<string>()

  // Parse Triggers (Events/Reads)
  console.log('\n⚡ Parsing Triggers...')
  const triggersPath = path.join(dataDir, 'Triggers.tsv')
  const triggersContent = fs.readFileSync(triggersPath, 'utf-8')
  const triggersLines = triggersContent.split('\n')
  const triggersHeaders = triggersLines[0].split('\t')
  const triggerIdIdx = triggersHeaders.indexOf('id')
  const triggerNameIdx = triggersHeaders.indexOf('name')
  const triggerDescIdx = triggersHeaders.indexOf('description')
  const triggerAppNameIdx = triggersHeaders.indexOf('appName')

  for (let i = 1; i < triggersLines.length; i++) {
    const line = triggersLines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const id = cols[triggerIdIdx]
    const name = cols[triggerNameIdx]
    const description = cols[triggerDescIdx]
    const appName = cols[triggerAppNameIdx]

    // Parse the trigger name to extract verb and object
    const parsed = parseVerbObject(name)

    if (parsed && appName) {
      const subject = appName.replace(/\s+/g, '')
      const { verb, object } = parsed

      statements.push({
        statement: `${subject}.${verb}.${object}`,
        subject,
        verb,
        object,
        source: 'Triggers',
        sourceId: id,
        description
      })

      concepts.add(object)
      verbs.add(verb)
    }
  }

  console.log(`  ✓ Parsed ${statements.length} trigger statements`)

  // Parse Actions (Writes)
  console.log('\n🎬 Parsing Actions...')
  const actionsPath = path.join(dataDir, 'Actions.tsv')
  const actionsContent = fs.readFileSync(actionsPath, 'utf-8')
  const actionsLines = actionsContent.split('\n')
  const actionsHeaders = actionsLines[0].split('\t')
  const actionIdIdx = actionsHeaders.indexOf('id')
  const actionNameIdx = actionsHeaders.indexOf('name')
  const actionDescIdx = actionsHeaders.indexOf('description')
  const actionAppNameIdx = actionsHeaders.indexOf('appName')

  const actionStatementsStart = statements.length

  for (let i = 1; i < actionsLines.length; i++) {
    const line = actionsLines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const id = cols[actionIdIdx]
    const name = cols[actionNameIdx]
    const description = cols[actionDescIdx]
    const appName = cols[actionAppNameIdx]

    // Parse the action name
    const parsed = parseVerbObject(name)

    if (parsed && appName) {
      const subject = appName.replace(/\s+/g, '')
      const { verb, object } = parsed

      statements.push({
        statement: `${subject}.${verb}.${object}`,
        subject,
        verb,
        object,
        source: 'Actions',
        sourceId: id,
        description
      })

      concepts.add(object)
      verbs.add(verb)
    }
  }

  console.log(`  ✓ Parsed ${statements.length - actionStatementsStart} action statements`)

  // Parse Searches
  console.log('\n🔍 Parsing Searches...')
  const searchesPath = path.join(dataDir, 'Searches.tsv')
  const searchesContent = fs.readFileSync(searchesPath, 'utf-8')
  const searchesLines = searchesContent.split('\n')
  const searchesHeaders = searchesLines[0].split('\t')
  const searchIdIdx = searchesHeaders.indexOf('id')
  const searchNameIdx = searchesHeaders.indexOf('name')
  const searchDescIdx = searchesHeaders.indexOf('description')
  const searchAppNameIdx = searchesHeaders.indexOf('appName')

  const searchStatementsStart = statements.length

  for (let i = 1; i < searchesLines.length; i++) {
    const line = searchesLines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const id = cols[searchIdIdx]
    const name = cols[searchNameIdx]
    const description = cols[searchDescIdx]
    const appName = cols[searchAppNameIdx]

    // Parse the search name
    const parsed = parseVerbObject(name)

    if (parsed && appName) {
      const subject = appName.replace(/\s+/g, '')
      const { verb, object } = parsed

      statements.push({
        statement: `${subject}.${verb}.${object}`,
        subject,
        verb,
        object,
        source: 'Searches',
        sourceId: id,
        description
      })

      concepts.add(object)
      verbs.add(verb)
    }
  }

  console.log(`  ✓ Parsed ${statements.length - searchStatementsStart} search statements`)

  // Write Integration Statements
  console.log('\n📝 Writing Integration Statements...')
  const statementsPath = path.join(dataDir, 'Integrations.Statements.tsv')
  const statementsHeaders = ['statement', 'subject', 'verb', 'object', 'source', 'sourceId', 'description']
  const statementsRows = statements.map(s =>
    `${s.statement}\t${s.subject}\t${s.verb}\t${s.object}\t${s.source}\t${s.sourceId}\t${s.description}`
  )

  fs.writeFileSync(statementsPath, statementsHeaders.join('\t') + '\n' + statementsRows.join('\n'))
  console.log(`  ✓ Integrations.Statements.tsv (${statements.length} statements)`)

  // Write Integration Concepts
  console.log('\n📦 Writing Integration Concepts...')
  const conceptsArray = Array.from(concepts).sort()
  const conceptsPath = path.join(dataDir, 'Integrations.Concepts.tsv')
  const conceptsHeaders = ['id', 'type']
  const conceptsRows = conceptsArray.map(c => `${c}\tConcept`)

  fs.writeFileSync(conceptsPath, conceptsHeaders.join('\t') + '\n' + conceptsRows.join('\n'))
  console.log(`  ✓ Integrations.Concepts.tsv (${conceptsArray.length} concepts)`)

  // Write Integration Verbs
  console.log('\n🔄 Writing Integration Verbs...')
  const verbsArray = Array.from(verbs).sort()
  const verbsPath = path.join(dataDir, 'Integrations.Verbs.tsv')
  const verbsHeaders = ['id', 'type']
  const verbsRows = verbsArray.map(v => `${v}\tVerb`)

  fs.writeFileSync(verbsPath, verbsHeaders.join('\t') + '\n' + verbsRows.join('\n'))
  console.log(`  ✓ Integrations.Verbs.tsv (${verbsArray.length} verbs)`)

  console.log('\n' + '='.repeat(100))
  console.log('✅ Integration semantics parsed!')
  console.log('='.repeat(100))
  console.log(`\n📊 Summary:`)
  console.log(`  - ${statements.length} semantic statements`)
  console.log(`  - ${conceptsArray.length} unique concepts`)
  console.log(`  - ${verbsArray.length} unique verbs`)
  console.log('='.repeat(100))
}

main().catch(console.error)

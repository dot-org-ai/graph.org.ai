#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Add missing verbs to Language.Verbs.tsv with proper conjugations
 *
 * Simple English verb conjugation rules:
 * - Most verbs: add -s for 3rd person, -ed for past, -ing for present participle
 * - Verbs ending in 'e': drop e, add -ed, -ing
 * - Verbs ending in consonant+y: change y to i, add -es, -ed
 * - Verbs ending in consonant+vowel+consonant: double last consonant for -ed, -ing
 */

function conjugateVerb(base: string): {
  predicate: string  // 3rd person singular (creates)
  event: string     // past tense (created)
  activity: string  // present participle (creating)
  actor: string     // agent noun (creator)
  object: string    // result noun (creation)
} {
  base = base.toLowerCase().trim()

  let predicate: string
  let event: string
  let activity: string
  let actor: string
  let object: string

  // Handle irregular endings
  const endsWithE = base.endsWith('e') && !base.endsWith('ee')
  const endsWithConsonantY = /[^aeiou]y$/.test(base)
  const endsWithCVC = /[^aeiouwxy][aeiou][^aeiouwxy]$/.test(base) && base.length > 2

  // 3rd person singular (predicate)
  if (base.endsWith('s') || base.endsWith('ss') || base.endsWith('sh') || base.endsWith('ch') || base.endsWith('x') || base.endsWith('z')) {
    predicate = base + 'es'
  } else if (endsWithConsonantY) {
    predicate = base.slice(0, -1) + 'ies'
  } else if (base.endsWith('o')) {
    predicate = base + 'es'
  } else {
    predicate = base + 's'
  }

  // Past tense (event)
  if (endsWithE) {
    event = base + 'd'
  } else if (endsWithConsonantY) {
    event = base.slice(0, -1) + 'ied'
  } else if (endsWithCVC && !base.endsWith('w')) {
    event = base + base.slice(-1) + 'ed'
  } else {
    event = base + 'ed'
  }

  // Present participle (activity)
  if (endsWithE && !base.endsWith('ie')) {
    activity = base.slice(0, -1) + 'ing'
  } else if (base.endsWith('ie')) {
    activity = base.slice(0, -2) + 'ying'
  } else if (endsWithCVC && !base.endsWith('w')) {
    activity = base + base.slice(-1) + 'ing'
  } else {
    activity = base + 'ing'
  }

  // Agent noun (actor) - person who performs the action
  if (endsWithE) {
    actor = base + 'r'
  } else {
    actor = base + 'er'
  }

  // Result noun (object) - thing that results from the action
  if (base.endsWith('e')) {
    object = base.slice(0, -1) + 'ation'
  } else if (base.endsWith('t')) {
    object = base + 'ion'
  } else {
    object = base + 'ation'
  }

  return { predicate, event, activity, actor, object }
}

async function main() {
  console.log('Adding Missing Verbs with Conjugations')
  console.log('='.repeat(100))

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const unknownVerbsPath = path.join(repoRoot, '.packages/@graphdl/semantics/.analysis/unknown-verbs.tsv')
  const verbsPath = path.join(repoRoot, '.enrichment/Language/Language.Verbs.tsv')

  // Load unknown verbs
  const unknownContent = fs.readFileSync(unknownVerbsPath, 'utf-8')
  const unknownLines = unknownContent.split('\n').slice(1) // Skip header

  // Load existing verbs
  const verbsContent = fs.readFileSync(verbsPath, 'utf-8')
  const verbsLines = verbsContent.split('\n')
  const header = verbsLines[0]
  const existingVerbs = new Set<string>()

  for (const line of verbsLines.slice(1)) {
    if (!line.trim()) continue
    const canonical = line.split('\t')[0]
    if (canonical) existingVerbs.add(canonical.toLowerCase())
  }

  console.log(`Loaded ${existingVerbs.size} existing verbs`)
  console.log(`Found ${unknownLines.length} unknown verbs`)

  const newVerbs: string[] = []
  let added = 0
  let skipped = 0

  for (const line of unknownLines) {
    if (!line.trim()) continue
    const [verb, freq] = line.split('\t')
    if (!verb) continue

    // Skip compound words (they should be split in the source data)
    if (verb.length > 20 || /[A-Z]/.test(verb)) {
      skipped++
      continue
    }

    // Skip if already exists
    if (existingVerbs.has(verb.toLowerCase())) {
      skipped++
      continue
    }

    // Generate conjugations
    const conj = conjugateVerb(verb)

    // Format: canonicalForm description predicate event activity actor object inverse source vocabulary
    const newLine = [
      verb,                              // canonicalForm
      `To ${verb}`,                      // description
      conj.predicate,                    // predicate (3rd person)
      conj.event,                        // event (past tense)
      conj.activity,                     // activity (present participle)
      conj.actor,                        // actor (agent noun)
      conj.object,                       // object (result noun)
      '',                                // inverse (leave empty for now)
      'generated',                       // source
      'general'                          // vocabulary
    ].join('\t')

    newVerbs.push(newLine)
    added++
  }

  // Append new verbs to file
  if (newVerbs.length > 0) {
    const updatedContent = verbsContent.trim() + '\n' + newVerbs.join('\n') + '\n'
    fs.writeFileSync(verbsPath, updatedContent)
    console.log(`\n✅ Added ${added} new verbs to ${verbsPath}`)
    console.log(`⏭️  Skipped ${skipped} verbs (already exist or invalid)`)
  } else {
    console.log('\n⚠️  No new verbs to add')
  }
}

main().catch(console.error)

import fs from 'fs'
import path from 'path'

/**
 * Helper script to generate verb conjugation templates
 * Takes a list of base verbs and creates a TSV template for manual conjugation
 */

interface VerbTemplate {
  canonicalForm: string
  description: string
  predicate: string // present tense: define → defines
  event: string // past tense: define → defined
  activity: string // gerund: define → defining
  actor: string // agent noun: define → Definer
  object: string // result noun: define → Definition
  inverse: string // passive: define → definedBy
  source: string
  vocabulary: string
}

// Common irregular verbs
const IRREGULAR_VERBS: Record<string, Partial<VerbTemplate>> = {
  write: { event: 'wrote', activity: 'writing', object: 'Writing' },
  build: { event: 'built', activity: 'building', object: 'Build' },
  make: { event: 'made', activity: 'making', object: 'Make' },
  set: { event: 'set', activity: 'setting', object: 'Setting' },
  cut: { event: 'cut', activity: 'cutting', object: 'Cut' },
  understand: { event: 'understood', activity: 'understanding', object: 'Understanding' },
  teach: { event: 'taught', activity: 'teaching', object: 'Teaching' },
}

function generateVerbTemplate(canonicalForm: string): VerbTemplate {
  const base = canonicalForm.toLowerCase()
  const irregular = IRREGULAR_VERBS[base]

  // Generate regular conjugations
  let predicate: string
  let event: string
  let activity: string
  let actor: string
  let object: string
  let inverse: string

  const titleCase = canonicalForm.charAt(0).toUpperCase() + canonicalForm.slice(1)

  // Predicate (present tense 3rd person)
  if (base.match(/[sxz]$/) || base.match(/(ch|sh)$/)) {
    predicate = base + 'es' // pass → passes, teach → teaches
  } else if (base.endsWith('y') && !base.match(/[aeiou]y$/)) {
    predicate = base.slice(0, -1) + 'ies' // study → studies
  } else {
    predicate = base + 's'
  }

  // Event (past tense)
  if (base.endsWith('e')) {
    event = base + 'd' // define → defined
  } else if (base.endsWith('y') && !base.match(/[aeiou]y$/)) {
    event = base.slice(0, -1) + 'ied' // study → studied
  } else if (base.match(/[aeiou][bcdfghjklmnpqrstvwxyz]$/) && !base.match(/[aeiou][aeiouwxy]$/)) {
    // CVC pattern - double final consonant
    const lastChar = base.slice(-1)
    event = base + lastChar + 'ed' // submit → submitted
  } else {
    event = base + 'ed'
  }

  // Activity (gerund/present participle)
  if (base.endsWith('e') && !base.endsWith('ee')) {
    activity = base.slice(0, -1) + 'ing' // define → defining
  } else if (base.match(/[aeiou][bcdfghjklmnpqrstvwxyz]$/) && !base.match(/[aeiou][aeiouwxy]$/)) {
    // CVC pattern - double final consonant
    const lastChar = base.slice(-1)
    activity = base + lastChar + 'ing' // submit → submitting
  } else {
    activity = base + 'ing'
  }

  // Actor (agent noun)
  if (base.endsWith('e')) {
    actor = titleCase + 'r' // define → Definer
  } else if (base.match(/[aeiou][bcdfghjklmnpqrstvwxyz]$/) && !base.match(/[aeiou][aeiouwxy]$/)) {
    const lastChar = base.slice(-1)
    actor = titleCase + lastChar + 'er' // submit → Submitter
  } else {
    actor = titleCase + 'er'
  }

  // Object (result noun) - most complex, many special cases
  if (base.endsWith('e')) {
    object = titleCase.slice(0, -1) + 'ation' // define → Definition
  } else if (base.endsWith('ate')) {
    object = titleCase.slice(0, -1) + 'ion' // validate → Validation
  } else if (base.endsWith('ify') || base.endsWith('fy')) {
    object = titleCase.slice(0, -1) + 'ication' // verify → Verification
  } else {
    object = titleCase + 'ation' // align → Alignment (will need manual fix)
  }

  // Inverse (passive form)
  inverse = event + 'By'

  // Apply irregular overrides
  if (irregular) {
    if (irregular.event) event = irregular.event
    if (irregular.activity) activity = irregular.activity
    if (irregular.object) object = irregular.object
  }

  return {
    canonicalForm,
    description: `TODO: Add description for ${canonicalForm}`,
    predicate,
    event,
    activity,
    actor,
    object,
    inverse,
    source: 'APQC/ONET',
    vocabulary: 'Discovered',
  }
}

function main() {
  // Read missing verbs from discovery output
  const missingVerbsFile = '.output/MissingVerbs.tsv'
  const content = fs.readFileSync(missingVerbsFile, 'utf-8')
  const lines = content.split('\n').slice(1) // Skip header

  const topVerbs: Array<{ verb: string; freq: number }> = []

  for (const line of lines) {
    if (!line.trim()) continue
    const [verb, freqStr] = line.split('\t')
    const freq = parseInt(freqStr)

    // Only process verbs that appear at least twice
    if (freq >= 2) {
      topVerbs.push({ verb, freq })
    }
  }

  console.log(`Generating templates for ${topVerbs.length} verbs (frequency ≥ 2)`)
  console.log()

  // Generate templates
  const templates: VerbTemplate[] = topVerbs.map(({ verb }) => generateVerbTemplate(verb))

  // Create TSV output
  const headers = [
    'canonicalForm',
    'description',
    'predicate',
    'event',
    'activity',
    'actor',
    'object',
    'inverse',
    'source',
    'vocabulary',
  ]

  const rows = templates.map(t => [
    t.canonicalForm,
    t.description,
    t.predicate,
    t.event,
    t.activity,
    t.actor,
    t.object,
    t.inverse,
    t.source,
    t.vocabulary,
  ])

  const tsv = [
    headers.join('\t'),
    ...rows.map(row => row.join('\t'))
  ].join('\n')

  // Write to output
  const outputFile = '.output/NewVerbs.Template.tsv'
  fs.writeFileSync(outputFile, tsv)

  console.log(`✓ Generated template: ${outputFile}`)
  console.log()
  console.log('Sample verbs:')
  console.log('-'.repeat(80))

  for (const template of templates.slice(0, 10)) {
    console.log(`${template.canonicalForm}:`)
    console.log(`  Predicate: ${template.predicate}`)
    console.log(`  Event: ${template.event}`)
    console.log(`  Activity: ${template.activity}`)
    console.log(`  Actor: ${template.actor}`)
    console.log(`  Object: ${template.object}`)
    console.log(`  Inverse: ${template.inverse}`)
    console.log()
  }

  console.log(`\nNext steps:`)
  console.log(`1. Review ${outputFile}`)
  console.log(`2. Fill in descriptions (replace TODO)`)
  console.log(`3. Fix any incorrect conjugations`)
  console.log(`4. Append to .enrichment/Language/Language.Verbs.tsv`)
}

main()

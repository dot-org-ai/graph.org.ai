#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Converts TSV lexicon files to TypeScript modules
 * This runs at build time so the package works in any environment (browser, edge, etc)
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const REPO_ROOT = path.resolve(__dirname, '../../../..')
const ENRICHMENT_DIR = path.join(REPO_ROOT, '.enrichment/Language')
const OUTPUT_DIR = path.join(__dirname, '../src/generated')

interface VerbEntry {
  canonicalForm: string
  description: string
  predicate: string
  event: string
  activity: string
  actor: string
  object: string
  inverse: string
  source?: string
  vocabulary?: string
}

interface ConceptEntry {
  id: string
  description: string
  baseNoun: string
  modifiers: string
  category: string
  source?: string
  example?: string
}

function loadVerbsTSV(): VerbEntry[] {
  const verbFile = path.join(ENRICHMENT_DIR, 'Language.Verbs.tsv')
  const content = fs.readFileSync(verbFile, 'utf-8')
  const lines = content.split('\n').slice(1) // Skip header

  const verbs: VerbEntry[] = []

  for (const line of lines) {
    if (!line.trim()) continue
    const [canonicalForm, description, predicate, event, activity, actor, object, inverse, source, vocabulary] =
      line.split('\t')

    if (!canonicalForm) continue

    verbs.push({
      canonicalForm,
      description,
      predicate,
      event,
      activity,
      actor,
      object,
      inverse,
      source,
      vocabulary,
    })
  }

  return verbs
}

function loadConceptsTSV(): ConceptEntry[] {
  const conceptFile = path.join(ENRICHMENT_DIR, 'Language.Concepts.tsv')

  if (!fs.existsSync(conceptFile)) {
    console.log('No concepts file found, skipping...')
    return []
  }

  const content = fs.readFileSync(conceptFile, 'utf-8')
  const lines = content.split('\n').slice(1) // Skip header

  const concepts: ConceptEntry[] = []

  for (const line of lines) {
    if (!line.trim()) continue
    const [id, description, baseNoun, modifiers, category, source, example] = line.split('\t')

    if (!id) continue

    concepts.push({
      id,
      description,
      baseNoun,
      modifiers,
      category,
      source,
      example,
    })
  }

  return concepts
}

function loadPrepositionsTSV(): string[] {
  const prepFile = path.join(ENRICHMENT_DIR, 'Language.Prepositions.tsv')

  if (!fs.existsSync(prepFile)) {
    // Use common English prepositions as default
    return [
      'to',
      'from',
      'with',
      'without',
      'for',
      'against',
      'about',
      'above',
      'across',
      'after',
      'along',
      'among',
      'around',
      'at',
      'before',
      'behind',
      'below',
      'beneath',
      'beside',
      'between',
      'beyond',
      'by',
      'down',
      'during',
      'except',
      'in',
      'inside',
      'into',
      'near',
      'of',
      'off',
      'on',
      'onto',
      'out',
      'outside',
      'over',
      'through',
      'throughout',
      'till',
      'toward',
      'under',
      'until',
      'up',
      'upon',
      'within',
    ]
  }

  const content = fs.readFileSync(prepFile, 'utf-8')
  const lines = content.split('\n').slice(1)

  const prepositions: string[] = []
  for (const line of lines) {
    if (!line.trim()) continue
    const [prep] = line.split('\t')
    if (prep) prepositions.push(prep.toLowerCase())
  }

  return prepositions
}

function loadConjunctionsTSV(): Array<{ word: string; type: string; expansion: string }> {
  const conjFile = path.join(ENRICHMENT_DIR, 'Language.Conjunctions.tsv')

  if (!fs.existsSync(conjFile)) {
    // Default conjunctions
    return [
      { word: 'and', type: 'coordinating', expansion: 'cartesian' },
      { word: 'or', type: 'coordinating', expansion: 'cartesian' },
      { word: 'but', type: 'coordinating', expansion: 'compound' },
      { word: 'nor', type: 'coordinating', expansion: 'compound' },
      { word: 'yet', type: 'coordinating', expansion: 'compound' },
      { word: 'so', type: 'coordinating', expansion: 'compound' },
    ]
  }

  const content = fs.readFileSync(conjFile, 'utf-8')
  const lines = content.split('\n').slice(1)

  const conjunctions: Array<{ word: string; type: string; expansion: string }> = []
  for (const line of lines) {
    if (!line.trim()) continue
    const [word, type, expansion] = line.split('\t')
    if (word) conjunctions.push({ word, type, expansion })
  }

  return conjunctions
}

function generateVerbsModule(verbs: VerbEntry[]): string {
  return `// AUTO-GENERATED - DO NOT EDIT
// Generated from .enrichment/Language/Language.Verbs.tsv

export interface VerbEntry {
  canonicalForm: string
  description: string
  predicate: string
  event: string
  activity: string
  actor: string
  object: string
  inverse: string
  source?: string
  vocabulary?: string
}

export const VERBS: VerbEntry[] = ${JSON.stringify(verbs, null, 2)}

// Build index maps for fast lookup
export const VERB_INDEX = new Map<string, VerbEntry>()

for (const verb of VERBS) {
  // Index by all forms
  VERB_INDEX.set(verb.canonicalForm.toLowerCase(), verb)
  if (verb.predicate) VERB_INDEX.set(verb.predicate.toLowerCase(), verb)
  if (verb.event) VERB_INDEX.set(verb.event.toLowerCase(), verb)
  if (verb.activity) VERB_INDEX.set(verb.activity.toLowerCase(), verb)
}
`
}

function generateConceptsModule(concepts: ConceptEntry[]): string {
  return `// AUTO-GENERATED - DO NOT EDIT
// Generated from .enrichment/Language/Language.Concepts.tsv

export interface ConceptEntry {
  id: string
  description: string
  baseNoun: string
  modifiers: string
  category: string
  source?: string
  example?: string
}

export const CONCEPTS: ConceptEntry[] = ${JSON.stringify(concepts, null, 2)}

// Build index map with multiple lookup keys
export const CONCEPT_INDEX = new Map<string, ConceptEntry>()

for (const concept of CONCEPTS) {
  // Index by ID (lowercase)
  CONCEPT_INDEX.set(concept.id.toLowerCase(), concept)

  // Index by spaced phrase: "PerformanceManagement" -> "performance management"
  const spacedPhrase = concept.id
    .replace(/([A-Z])/g, ' $1')  // Add space before capitals
    .trim()
    .toLowerCase()
  if (spacedPhrase !== concept.id.toLowerCase()) {
    CONCEPT_INDEX.set(spacedPhrase, concept)
  }

  // Index by modifiers + baseNoun: "performance" + "management"
  const modifiersAndNoun = (concept.modifiers + ' ' + concept.baseNoun).toLowerCase().trim()
  if (modifiersAndNoun) {
    CONCEPT_INDEX.set(modifiersAndNoun, concept)
  }
}
`
}

function generatePrepositionsModule(prepositions: string[]): string {
  return `// AUTO-GENERATED - DO NOT EDIT
// Generated from .enrichment/Language/Language.Prepositions.tsv

export const PREPOSITIONS: ReadonlySet<string> = new Set(${JSON.stringify(prepositions)})
`
}

function generateConjunctionsModule(conjunctions: Array<{ word: string; type: string; expansion: string }>): string {
  return `// AUTO-GENERATED - DO NOT EDIT
// Generated from .enrichment/Language/Language.Conjunctions.tsv

export interface ConjunctionEntry {
  type: 'coordinating' | 'subordinating' | 'correlative'
  expansion: 'cartesian' | 'compound' | 'conditional'
}

const CONJUNCTION_DATA = ${JSON.stringify(conjunctions, null, 2)}

export const CONJUNCTIONS = new Map<string, ConjunctionEntry>()

for (const conj of CONJUNCTION_DATA) {
  CONJUNCTIONS.set(conj.word.toLowerCase(), {
    type: conj.type as 'coordinating' | 'subordinating' | 'correlative',
    expansion: conj.expansion as 'cartesian' | 'compound' | 'conditional',
  })
}
`
}

function main() {
  console.log('Generating lexicon modules from TSV files...\n')

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Load data
  console.log('Loading verbs...')
  const verbs = loadVerbsTSV()
  console.log(`  Loaded ${verbs.length} verbs`)

  console.log('Loading concepts...')
  const concepts = loadConceptsTSV()
  console.log(`  Loaded ${concepts.length} concepts`)

  console.log('Loading prepositions...')
  const prepositions = loadPrepositionsTSV()
  console.log(`  Loaded ${prepositions.length} prepositions`)

  console.log('Loading conjunctions...')
  const conjunctions = loadConjunctionsTSV()
  console.log(`  Loaded ${conjunctions.length} conjunctions`)

  // Generate modules
  console.log('\nGenerating TypeScript modules...')

  fs.writeFileSync(path.join(OUTPUT_DIR, 'verbs.ts'), generateVerbsModule(verbs))
  console.log('  ✓ generated/verbs.ts')

  fs.writeFileSync(path.join(OUTPUT_DIR, 'concepts.ts'), generateConceptsModule(concepts))
  console.log('  ✓ generated/concepts.ts')

  fs.writeFileSync(path.join(OUTPUT_DIR, 'prepositions.ts'), generatePrepositionsModule(prepositions))
  console.log('  ✓ generated/prepositions.ts')

  fs.writeFileSync(path.join(OUTPUT_DIR, 'conjunctions.ts'), generateConjunctionsModule(conjunctions))
  console.log('  ✓ generated/conjunctions.ts')

  // Generate index
  const indexContent = `// AUTO-GENERATED - DO NOT EDIT
export * from './verbs'
export * from './concepts'
export * from './prepositions'
export * from './conjunctions'
`
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), indexContent)
  console.log('  ✓ generated/index.ts')

  console.log('\n✅ Lexicon generation complete!')
  console.log(`   ${verbs.length} verbs, ${concepts.length} concepts, ${prepositions.length} prepositions, ${conjunctions.length} conjunctions`)
}

main()

import fs from 'fs'
import path from 'path'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Lexicon {
  verbs: Map<string, VerbEntry>
  nouns: Map<string, NounEntry>
  concepts: Map<string, ConceptEntry>
  prepositions: Set<string>
  conjunctions: Map<string, ConjunctionEntry>
  determiners: Set<string>
  pronouns: Map<string, PronounEntry>
  adverbs: Map<string, AdverbEntry>
  adjectives: Set<string>
}

export interface VerbEntry {
  canonicalForm: string
  predicate: string
  event: string
  activity: string
  actor: string
  object: string
  inverse: string
}

export interface NounEntry {
  canonicalForm: string
  category?: string
}

export interface ConceptEntry {
  id: string
  description: string
  baseNoun: string
  modifiers: string
  category: string
}

export interface ConjunctionEntry {
  type: 'coordinating' | 'subordinating' | 'correlative'
  expansion: 'cartesian' | 'compound' | 'conditional'
}

export interface PronounEntry {
  type: string
  category: string
}

export interface AdverbEntry {
  category: string
}

export interface Token {
  text: string
  pos: string // part of speech
  index: number
  normalized: string
}

export interface ParsedStatement {
  original: string
  subject?: string
  predicate?: string
  object?: string
  preposition?: string
  complement?: string
  modifiers: string[]
  confidence: number
  unknownWords: string[]
  expansions?: ParsedStatement[]
  hasConjunction?: boolean
}

// ============================================================================
// LEXICON LOADER
// ============================================================================

export class LexiconLoader {
  private sourceDir: string

  constructor(sourceDir: string = '.enrichment/Language') {
    this.sourceDir = sourceDir
  }

  async load(): Promise<Lexicon> {
    const lexicon: Lexicon = {
      verbs: new Map(),
      nouns: new Map(),
      concepts: new Map(),
      prepositions: new Set(),
      conjunctions: new Map(),
      determiners: new Set(),
      pronouns: new Map(),
      adverbs: new Map(),
      adjectives: new Set(),
    }

    // Load verbs
    await this.loadVerbs(lexicon)

    // Load concepts
    await this.loadConcepts(lexicon)

    // Load prepositions
    await this.loadPrepositions(lexicon)

    // Load conjunctions
    await this.loadConjunctions(lexicon)

    // Load determiners
    await this.loadDeterminers(lexicon)

    // Load pronouns
    await this.loadPronouns(lexicon)

    // Load adverbs
    await this.loadAdverbs(lexicon)

    return lexicon
  }

  private async loadVerbs(lexicon: Lexicon): Promise<void> {
    const verbFile = path.join(this.sourceDir, 'Language.Verbs.tsv')
    const content = fs.readFileSync(verbFile, 'utf-8')
    const lines = content.split('\n').slice(1) // Skip header

    for (const line of lines) {
      if (!line.trim()) continue
      const [canonicalForm, description, predicate, event, activity, actor, object, inverse] = line.split('\t')

      if (!canonicalForm) continue

      const entry: VerbEntry = {
        canonicalForm,
        predicate,
        event,
        activity,
        actor,
        object,
        inverse,
      }

      // Index by all forms
      lexicon.verbs.set(canonicalForm.toLowerCase(), entry)
      if (predicate) lexicon.verbs.set(predicate.toLowerCase(), entry)
      if (event) lexicon.verbs.set(event.toLowerCase(), entry)
      if (activity) lexicon.verbs.set(activity.toLowerCase(), entry)
    }
  }

  private async loadConcepts(lexicon: Lexicon): Promise<void> {
    const conceptFile = path.join(this.sourceDir, 'Language.Concepts.tsv')

    if (!fs.existsSync(conceptFile)) {
      return // Concepts file is optional
    }

    const content = fs.readFileSync(conceptFile, 'utf-8')
    const lines = content.split('\n').slice(1) // Skip header

    for (const line of lines) {
      if (!line.trim()) continue
      const [id, description, baseNoun, modifiers, category] = line.split('\t')

      if (!id) continue

      const entry: ConceptEntry = {
        id,
        description,
        baseNoun,
        modifiers,
        category,
      }

      // Index by ID and by the phrase pattern
      lexicon.concepts.set(id.toLowerCase(), entry)

      // Also index by the multi-word phrase (e.g., "long-term vision", "business concept")
      const phrase = id.replace(/([A-Z])/g, ' $1').trim().toLowerCase()
      lexicon.concepts.set(phrase, entry)

      // Handle hyphenated versions
      const hyphenated = modifiers.toLowerCase() + ' ' + baseNoun.toLowerCase()
      lexicon.concepts.set(hyphenated, entry)
    }
  }

  private async loadPrepositions(lexicon: Lexicon): Promise<void> {
    const prepFile = path.join(this.sourceDir, 'Language.Prepositions.tsv')
    const content = fs.readFileSync(prepFile, 'utf-8')
    const lines = content.split('\n').slice(1)

    for (const line of lines) {
      if (!line.trim()) continue
      const [id] = line.split('\t')
      if (id) {
        lexicon.prepositions.add(id.toLowerCase())
      }
    }
  }

  private async loadConjunctions(lexicon: Lexicon): Promise<void> {
    const conjFile = path.join(this.sourceDir, 'Language.Conjunctions.tsv')
    const content = fs.readFileSync(conjFile, 'utf-8')
    const lines = content.split('\n').slice(1)

    for (const line of lines) {
      if (!line.trim()) continue
      const [id, description, type] = line.split('\t')
      if (id && type) {
        const expansion = type === 'Coordinating' ? 'cartesian' :
                         type === 'Subordinating' ? 'conditional' : 'compound'
        lexicon.conjunctions.set(id.toLowerCase(), {
          type: type.toLowerCase() as any,
          expansion,
        })
      }
    }
  }

  private async loadDeterminers(lexicon: Lexicon): Promise<void> {
    const detFile = path.join(this.sourceDir, 'Language.Determiners.tsv')
    const content = fs.readFileSync(detFile, 'utf-8')
    const lines = content.split('\n').slice(1)

    for (const line of lines) {
      if (!line.trim()) continue
      const [id] = line.split('\t')
      if (id) {
        lexicon.determiners.add(id.toLowerCase())
      }
    }
  }

  private async loadPronouns(lexicon: Lexicon): Promise<void> {
    const pronFile = path.join(this.sourceDir, 'Language.Pronouns.tsv')
    const content = fs.readFileSync(pronFile, 'utf-8')
    const lines = content.split('\n').slice(1)

    for (const line of lines) {
      if (!line.trim()) continue
      const [id, description, type, category] = line.split('\t')
      if (id) {
        lexicon.pronouns.set(id.toLowerCase(), { type, category })
      }
    }
  }

  private async loadAdverbs(lexicon: Lexicon): Promise<void> {
    const advFile = path.join(this.sourceDir, 'Language.Adverbs.tsv')
    const content = fs.readFileSync(advFile, 'utf-8')
    const lines = content.split('\n').slice(1)

    for (const line of lines) {
      if (!line.trim()) continue
      const [id, description, category] = line.split('\t')
      if (id) {
        lexicon.adverbs.set(id.toLowerCase(), { category })
      }
    }
  }
}

// ============================================================================
// TOKENIZER
// ============================================================================

export class Tokenizer {
  tokenize(text: string): Token[] {
    // Split on whitespace and punctuation, but keep punctuation
    const regex = /([a-zA-Z]+(?:'[a-z]+)?|[.,;:\-\/()])/g
    const matches = text.matchAll(regex)

    const tokens: Token[] = []
    let index = 0

    for (const match of matches) {
      const text = match[0]
      tokens.push({
        text,
        normalized: text.toLowerCase(),
        pos: '', // Will be filled by POS tagger
        index: index++,
      })
    }

    return tokens
  }
}

// ============================================================================
// POS TAGGER
// ============================================================================

export class POSTagger {
  constructor(private lexicon: Lexicon) {}

  tag(tokens: Token[]): Token[] {
    return tokens.map(token => {
      const norm = token.normalized

      // Check each part of speech
      if (this.lexicon.determiners.has(norm)) {
        token.pos = 'DET'
      } else if (this.lexicon.pronouns.has(norm)) {
        token.pos = 'PRON'
      } else if (this.lexicon.verbs.has(norm)) {
        token.pos = 'VERB'
      } else if (this.lexicon.prepositions.has(norm)) {
        token.pos = 'PREP'
      } else if (this.lexicon.conjunctions.has(norm)) {
        token.pos = 'CONJ'
      } else if (this.lexicon.adverbs.has(norm)) {
        token.pos = 'ADV'
      } else if (this.lexicon.adjectives.has(norm)) {
        token.pos = 'ADJ'
      } else if (token.text.match(/^[A-Z]/)) {
        // TitleCase = Noun (GraphDL convention)
        token.pos = 'NOUN'
      } else if (token.text.match(/^[a-z]/)) {
        // camelCase or lowercase = likely verb or adjective
        token.pos = 'UNK-VERB'
      } else if (token.text.match(/[.,;:\-\/()]/)) {
        token.pos = 'PUNCT'
      } else {
        token.pos = 'UNK'
      }

      return token
    })
  }
}

// ============================================================================
// CONJUNCTION EXPANDER
// ============================================================================

export class ConjunctionExpander {
  constructor(private lexicon: Lexicon) {}

  /**
   * Expands conjunctions like "and/or" to create subtasks
   * Example: "Develop Vision and Strategy" -> ["Develop Vision", "Develop Strategy"]
   */
  expand(text: string): string[] {
    // Check if there's an "and" or "or" in the text
    const hasConjunction = /\b(and|or)\b/i.test(text)

    if (!hasConjunction) {
      return [text]
    }

    // Pattern: "Verb Object1 and Object2" or "Verb1 and Verb2 Object"
    // Split into parts but preserve the verb
    const words = text.split(/\s+/)

    // Find the first verb (usually first word in imperative)
    let verb = words[0]

    // Find conjunction indices
    const conjunctionIndices: number[] = []
    words.forEach((word, idx) => {
      if (word.toLowerCase() === 'and' || word.toLowerCase() === 'or') {
        conjunctionIndices.push(idx)
      }
    })

    if (conjunctionIndices.length === 0) {
      return [text]
    }

    // Simple case: "Verb Noun1 and Noun2"
    // Split on conjunction and create subtasks
    const results: string[] = []

    // For now, return original - we'll handle in parser
    return [text]
  }

  private splitOnCoordinating(text: string): string[][] {
    // Find all coordinating conjunctions (and, or)
    const tokens = text.split(/\s+/)
    const groups: string[][] = [[]]
    let currentGroup = 0

    for (const token of tokens) {
      const norm = token.toLowerCase().replace(/[,;]/g, '')

      if (norm === 'and' || norm === 'or') {
        currentGroup++
        groups[currentGroup] = []
      } else {
        if (!groups[currentGroup]) groups[currentGroup] = []
        groups[currentGroup].push(token)
      }
    }

    return groups.filter(g => g.length > 0)
  }

  private cartesianProduct(groups: string[][]): string[] {
    if (groups.length === 0) return []
    if (groups.length === 1) return [groups[0].join(' ')]

    const result: string[] = []
    const [first, ...rest] = groups
    const restProduct = this.cartesianProduct(rest)

    for (const item of first) {
      for (const restItem of restProduct) {
        result.push(`${item} ${restItem}`)
      }
    }

    return result
  }
}

// ============================================================================
// STATEMENT PARSER
// ============================================================================

export class StatementParser {
  private tokenizer: Tokenizer
  private tagger: POSTagger
  private expander: ConjunctionExpander

  constructor(private lexicon: Lexicon) {
    this.tokenizer = new Tokenizer()
    this.tagger = new POSTagger(lexicon)
    this.expander = new ConjunctionExpander(lexicon)
  }

  /**
   * Parse a natural language statement into GraphDL structure
   * Target: Subject.predicate.Object.preposition.Complement
   */
  parse(text: string): ParsedStatement {
    // Check for slash-separated verbs: "Research/Resolve order exceptions"
    const slashVerbMatch = text.match(/^(\w+)\/(\w+)\s+(.+)$/i)
    if (slashVerbMatch) {
      const [, verb1, verb2, rest] = slashVerbMatch
      if (this.lexicon.verbs.has(verb1.toLowerCase()) && this.lexicon.verbs.has(verb2.toLowerCase())) {
        return {
          original: text,
          predicate: verb1,
          object: `and ${verb2} ${rest}`,
          modifiers: [],
          confidence: 1,
          unknownWords: [],
          hasConjunction: true,
          expansions: [
            this.parseSingle(`${verb1} ${rest}`),
            this.parseSingle(`${verb2} ${rest}`),
          ],
        }
      }
    }

    // Check for Oxford comma verb lists: "Verb1, Verb2, and Verb3 Object"
    const oxfordCommaMatch = text.match(/^(\w+(?:,\s*\w+)*),?\s+and\s+(\w+)\s+(.+)$/i)
    if (oxfordCommaMatch) {
      const [, verbList, lastVerb, rest] = oxfordCommaMatch
      const verbs = verbList.split(/,\s*/).concat([lastVerb])

      // Check if all are verbs
      const allVerbs = verbs.every(v => this.lexicon.verbs.has(v.toLowerCase()))

      if (allVerbs && verbs.length >= 2) {
        return {
          original: text,
          predicate: verbs[0],
          object: verbs.slice(1).join(' and ') + ' ' + rest,
          modifiers: [],
          confidence: 1,
          unknownWords: [],
          hasConjunction: true,
          expansions: verbs.map(verb => this.parseSingle(`${verb} ${rest}`)),
        }
      }
    }

    // Check for simple verb lists: "Verb1 and Verb2 Object"
    const verbListMatch = text.match(/^(\w+)\s+and\s+(\w+)\s+(.+)$/i)
    if (verbListMatch) {
      const [, verb1, verb2, object] = verbListMatch
      // Check if both are verbs
      if (this.lexicon.verbs.has(verb1.toLowerCase()) && this.lexicon.verbs.has(verb2.toLowerCase())) {
        return {
          original: text,
          predicate: verb1,
          object: `and ${verb2} ${object}`,
          modifiers: [],
          confidence: 1,
          unknownWords: [],
          hasConjunction: true,
          expansions: [
            this.parseSingle(`${verb1} ${object}`),
            this.parseSingle(`${verb2} ${object}`),
          ],
        }
      }
    }

    const parsed = this.parseSingle(text)

    // Check if object contains "and" or "or" - if so, create expansions for noun lists
    if (parsed.object && /\b(and|or)\b/i.test(parsed.object)) {
      parsed.hasConjunction = true
      parsed.expansions = this.expandConjunctions(parsed)
    }

    return parsed
  }

  private expandConjunctions(parsed: ParsedStatement): ParsedStatement[] {
    if (!parsed.object) return []

    // Split object on "and" or "or"
    const parts = parsed.object.split(/\s+(and|or)\s+/i).filter(p => p.trim() && !/^(and|or)$/i.test(p))

    // Create subtasks: one for each object part
    const expansions: ParsedStatement[] = []

    for (const part of parts) {
      expansions.push({
        original: `${parsed.predicate || ''} ${part}`.trim(),
        predicate: parsed.predicate,
        object: part,
        preposition: parsed.preposition,
        complement: parsed.complement,
        modifiers: parsed.modifiers,
        confidence: parsed.confidence,
        unknownWords: [],
      })
    }

    return expansions
  }

  private normalizeConceptsInText(text: string): string {
    let normalized = text

    // Sort concepts by length (longest first) to avoid partial matches
    const conceptPhrases = Array.from(this.lexicon.concepts.entries())
      .map(([phrase, entry]) => ({ phrase, entry }))
      .sort((a, b) => b.phrase.length - a.phrase.length)

    for (const { phrase, entry } of conceptPhrases) {
      // Only match complete concept phrases
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi')
      normalized = normalized.replace(regex, entry.id)
    }

    return normalized
  }

  private parseSingle(text: string): ParsedStatement {
    // First, detect and replace multi-word concepts with their IDs
    const normalizedText = this.normalizeConceptsInText(text)

    const tokens = this.tokenizer.tokenize(normalizedText)
    const tagged = this.tagger.tag(tokens)

    const result: ParsedStatement = {
      original: text,
      modifiers: [],
      confidence: 1.0,
      unknownWords: [],
    }

    // Extract unknown words (excluding punctuation and determiners)
    result.unknownWords = tagged
      .filter(t => t.pos.startsWith('UNK') && t.pos !== 'UNK-VERB')
      .map(t => t.text)

    // For APQC/ONET style imperatives, the pattern is:
    // VERB [DET] [ADJ]* NOUN [PREP [DET] [ADJ]* NOUN]
    // No explicit subject (imperative form)

    let i = 0
    const modifiers: string[] = []

    // Find predicate (first VERB) - imperatives start with verb
    while (i < tagged.length && tagged[i].pos !== 'VERB' && !tagged[i].pos.includes('VERB')) {
      if (tagged[i].pos === 'ADV' || tagged[i].pos === 'ADJ') {
        modifiers.push(tagged[i].text)
      }
      i++
    }
    if (i < tagged.length) {
      // Keep original verb form, don't conjugate
      result.predicate = tagged[i].text
      i++
    }

    // Find object - collect all tokens until PREP or end
    // Keep conjunctions, adjectives, nouns, everything
    const objectTokens: string[] = []
    while (i < tagged.length && tagged[i].pos !== 'PREP' && tagged[i].pos !== 'PUNCT') {
      // Skip determiners but keep everything else
      if (tagged[i].pos !== 'DET') {
        objectTokens.push(tagged[i].text)
      }
      i++
    }
    if (objectTokens.length > 0) {
      result.object = objectTokens.join(' ')
    }

    // Find preposition
    if (i < tagged.length && tagged[i].pos === 'PREP') {
      result.preposition = tagged[i].normalized
      i++
    }

    // Skip determiners before complement
    while (i < tagged.length && (tagged[i].pos === 'DET' || tagged[i].pos === 'ADV' || tagged[i].pos === 'ADJ')) {
      if (tagged[i].pos === 'ADV' || tagged[i].pos === 'ADJ') {
        modifiers.push(tagged[i].text)
      }
      i++
    }

    // Find complement (final NOUN phrase)
    const complementTokens: string[] = []
    while (i < tagged.length && tagged[i].pos !== 'PUNCT') {
      if (tagged[i].pos === 'NOUN' || tagged[i].pos.startsWith('UNK')) {
        complementTokens.push(tagged[i].text)
      }
      i++
    }
    if (complementTokens.length > 0) {
      result.complement = complementTokens.join(' ')
    }

    result.modifiers = modifiers

    // Adjust confidence based on unknowns
    if (result.unknownWords.length > 0) {
      result.confidence -= (result.unknownWords.length * 0.1)
    }

    return result
  }
}

// ============================================================================
// UNKNOWN WORD ANALYZER
// ============================================================================

export class UnknownWordAnalyzer {
  private unknownWords: Map<string, number> = new Map()

  addParse(parse: ParsedStatement): void {
    for (const word of parse.unknownWords) {
      this.unknownWords.set(word, (this.unknownWords.get(word) || 0) + 1)
    }

    // Recursively add from expansions
    if (parse.expansions) {
      for (const expansion of parse.expansions) {
        this.addParse(expansion)
      }
    }
  }

  getTopUnknown(limit: number = 100): Array<[string, number]> {
    return Array.from(this.unknownWords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
  }

  exportTSV(outputPath: string): void {
    const entries = this.getTopUnknown(1000)
    const lines = ['word\tfrequency\tsuggested_pos']

    for (const [word, freq] of entries) {
      // Heuristic: TitleCase = noun, camelCase/lowercase = verb
      const suggestedPOS = word.match(/^[A-Z]/) ? 'NOUN' : 'VERB'
      lines.push(`${word}\t${freq}\t${suggestedPOS}`)
    }

    fs.writeFileSync(outputPath, lines.join('\n'))
  }
}

// ============================================================================
// MAIN PARSER FACADE
// ============================================================================

export class GraphDLParser {
  private lexicon?: Lexicon
  private parser?: StatementParser
  private analyzer: UnknownWordAnalyzer

  constructor() {
    this.analyzer = new UnknownWordAnalyzer()
  }

  async initialize(): Promise<void> {
    const loader = new LexiconLoader()
    this.lexicon = await loader.load()
    this.parser = new StatementParser(this.lexicon)
  }

  parse(text: string): ParsedStatement {
    if (!this.parser) {
      throw new Error('Parser not initialized. Call initialize() first.')
    }

    const result = this.parser.parse(text)
    this.analyzer.addParse(result)
    return result
  }

  getUnknownWords(limit?: number): Array<[string, number]> {
    return this.analyzer.getTopUnknown(limit)
  }

  exportUnknownWords(outputPath: string): void {
    this.analyzer.exportTSV(outputPath)
  }

  toGraphDL(parse: ParsedStatement): string {
    const parts: string[] = []

    if (parse.subject) parts.push(parse.subject)
    if (parse.predicate) parts.push(parse.predicate)
    if (parse.object) {
      // Convert object to dot notation: "Vision and Strategy" → "Vision.and.Strategy"
      const objectParts = parse.object.split(' ').filter(p => p.trim())
      parts.push(...objectParts)
    }
    if (parse.preposition) parts.push(parse.preposition)
    if (parse.complement) {
      const complementParts = parse.complement.split(' ').filter(p => p.trim())
      parts.push(...complementParts)
    }

    const main = parts.join('.')

    // If there are expansions, return both: original [expansions]
    if (parse.expansions) {
      const expanded = parse.expansions.map(e => this.toGraphDL(e)).join(',')
      return `${main} [${expanded}]`
    }

    return main
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main() {
  const parser = new GraphDLParser()
  await parser.initialize()

  // Test with some APQC examples
  const testCases = [
    "Research/Resolve order exceptions",
    "Acquire, Construct, and Manage Assets",
    "Develop Vision and Strategy",
    "Define the business concept and long-term vision",
    "Analyze and evaluate competition",
  ]

  console.log('GraphDL Parser - Test Cases\n')
  console.log('='.repeat(80))

  for (const test of testCases) {
    console.log(`\nInput: "${test}"`)
    const result = parser.parse(test)
    console.log('Parsed:', JSON.stringify(result, null, 2))
    console.log('GraphDL:', parser.toGraphDL(result))
    console.log('-'.repeat(80))
  }

  console.log('\nTop Unknown Words:')
  const unknowns = parser.getUnknownWords(20)
  for (const [word, freq] of unknowns) {
    console.log(`  ${word}: ${freq}`)
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

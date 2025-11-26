#!/usr/bin/env tsx
/**
 * Semantic parser for service names
 * Extracts: activity.Object.preposition.CompoundNoun patterns
 * Similar to ONET Tasks and APQC Processes parsing
 */

import { readFileSync, writeFileSync } from 'fs'

interface ServiceRecord {
  url: string
  ns: string
  type: string
  id: string
  code: string
  name: string
  description: string
}

interface SemanticComponents {
  activity?: string        // The verb/action (e.g., "Maintenance", "Transportation")
  activityModifiers?: string[]  // Additional verbs in compound (e.g., ["Repair"] in "Maintenance and repair")
  object?: string          // The thing being acted upon
  objectModifiers?: string[]    // Compound objects
  preposition?: string     // Connector (for, by, of, to, with, in)
  complement?: string      // What comes after the preposition
  complementModifiers?: string[] // Compound complements
  compounds: {
    activity: string[]     // All activity variations
    object: string[]       // All object variations
    complement: string[]   // All complement variations
  }
  expansionCount: number   // How many discrete services this represents
}

interface ParsedService extends ServiceRecord {
  semantics: SemanticComponents
}

// Common service verbs/activities
const SERVICE_ACTIVITIES = [
  'maintenance', 'repair', 'installation', 'removal', 'cleaning',
  'transportation', 'distribution', 'delivery', 'shipping',
  'rental', 'leasing', 'licensing',
  'consulting', 'advisory', 'management',
  'design', 'engineering', 'architecture',
  'testing', 'inspection', 'certification',
  'training', 'education', 'instruction',
  'hosting', 'storage', 'processing',
  'publishing', 'broadcasting', 'production'
]

// Prepositions that connect activity to complement
const PREPOSITIONS = ['for', 'by', 'of', 'to', 'with', 'in', 'on', 'at', 'from']

/**
 * Parse "and"/"or" compounds into all variations
 * Examples:
 *   "A and B" -> ["A", "B"]
 *   "A or B" -> ["A", "B"]
 *   "A, B, and C" -> ["A", "B", "C"]
 */
function parseCompound(text: string): string[] {
  if (!text) return []

  // Handle "A, B, and C" or "A, B, or C"
  const commaSeparated = text.split(/,\s*(?:and|or)\s+/)
  if (commaSeparated.length > 1) {
    return commaSeparated.flatMap(part =>
      part.split(',').map(s => s.trim()).filter(Boolean)
    )
  }

  // Handle "A and B" or "A or B"
  const simple = text.split(/\s+(?:and|or)\s+/)
  if (simple.length > 1) {
    return simple.map(s => s.trim()).filter(Boolean)
  }

  return [text.trim()]
}

/**
 * Extract semantic components from a service name
 */
function parseServiceSemantics(name: string): SemanticComponents {
  const lower = name.toLowerCase()

  const components: SemanticComponents = {
    compounds: {
      activity: [],
      object: [],
      complement: []
    },
    expansionCount: 1
  }

  // Pattern 1: "Activity services for Object"
  // Example: "Maintenance and repair services for automobiles and light trucks"
  const servicesForMatch = lower.match(/^(.+?)\s+services\s+for\s+(.+)$/)
  if (servicesForMatch) {
    const [, activities, complement] = servicesForMatch

    components.activity = activities.split(/\s+services/)[0].trim()
    components.activityModifiers = parseCompound(activities).slice(1)
    components.compounds.activity = parseCompound(activities)

    components.preposition = 'for'
    components.complement = complement.trim()
    components.compounds.complement = parseCompound(complement)

    components.expansionCount =
      components.compounds.activity.length *
      components.compounds.complement.length

    return components
  }

  // Pattern 2: "Object services by Method"
  // Example: "Road transportation services by freight type"
  const servicesByMatch = lower.match(/^(.+?)\s+services\s+by\s+(.+)$/)
  if (servicesByMatch) {
    const [, object, complement] = servicesByMatch

    components.object = object.trim()
    components.compounds.object = parseCompound(object)

    components.preposition = 'by'
    components.complement = complement.trim()
    components.compounds.complement = parseCompound(complement)

    components.expansionCount =
      components.compounds.object.length *
      components.compounds.complement.length

    return components
  }

  // Pattern 3: "Activity of Object"
  // Example: "Rental or leasing of automobiles and light trucks"
  const activityOfMatch = lower.match(/^(.+?)\s+of\s+(.+)$/)
  if (activityOfMatch) {
    const [, activities, complement] = activityOfMatch

    // Check if first part contains service verbs
    const hasServiceVerb = SERVICE_ACTIVITIES.some(verb =>
      activities.includes(verb)
    )

    if (hasServiceVerb) {
      components.activity = activities.split(/\s+(?:and|or)\s+/)[0].trim()
      components.compounds.activity = parseCompound(activities)

      components.preposition = 'of'
      components.complement = complement.trim()
      components.compounds.complement = parseCompound(complement)

      components.expansionCount =
        components.compounds.activity.length *
        components.compounds.complement.length

      return components
    }
  }

  // Pattern 4: "Object by Method"
  // Example: "Freight transportation by road or rail"
  for (const prep of PREPOSITIONS) {
    const prepMatch = lower.match(new RegExp(`^(.+?)\\s+${prep}\\s+(.+)$`))
    if (prepMatch) {
      const [, object, complement] = prepMatch

      components.object = object.trim()
      components.compounds.object = parseCompound(object)

      components.preposition = prep
      components.complement = complement.trim()
      components.compounds.complement = parseCompound(complement)

      components.expansionCount =
        components.compounds.object.length *
        components.compounds.complement.length

      return components
    }
  }

  // Pattern 5: Simple compound (no preposition)
  // Example: "Heated or cooled air or water"
  if (lower.includes(' and ') || lower.includes(' or ')) {
    components.object = name
    components.compounds.object = parseCompound(name)
    components.expansionCount = components.compounds.object.length

    return components
  }

  // Pattern 6: Simple service (no compounds)
  components.object = name
  components.compounds.object = [name]
  components.expansionCount = 1

  return components
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 PARSING SERVICE SEMANTICS\n')
  console.log('='.repeat(100) + '\n')

  // Read Services.tsv
  const servicesPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services.tsv'
  const content = readFileSync(servicesPath, 'utf-8')
  const lines = content.trim().split('\n')
  const headers = lines[0].split('\t')

  const services: ServiceRecord[] = lines.slice(1).map(line => {
    const fields = line.split('\t')
    return {
      url: fields[0] || '',
      ns: fields[1] || '',
      type: fields[2] || '',
      id: fields[3] || '',
      code: fields[4] || '',
      name: fields[5] || '',
      description: fields[6] || ''
    }
  })

  console.log(`📊 Total services: ${services.length.toLocaleString()}\n`)

  // Parse semantics for all services
  const parsed: ParsedService[] = services.map(service => ({
    ...service,
    semantics: parseServiceSemantics(service.name)
  }))

  // Analyze results
  const stats = {
    withActivity: parsed.filter(s => s.semantics.activity).length,
    withObject: parsed.filter(s => s.semantics.object).length,
    withPreposition: parsed.filter(s => s.semantics.preposition).length,
    withComplement: parsed.filter(s => s.semantics.complement).length,
    needsExpansion: parsed.filter(s => s.semantics.expansionCount > 1).length,
    totalExpansions: parsed.reduce((sum, s) => sum + s.semantics.expansionCount, 0)
  }

  console.log('📈 PARSING RESULTS\n')
  console.log(`Services with activity: ${stats.withActivity.toLocaleString()}`)
  console.log(`Services with object: ${stats.withObject.toLocaleString()}`)
  console.log(`Services with preposition: ${stats.withPreposition.toLocaleString()}`)
  console.log(`Services with complement: ${stats.withComplement.toLocaleString()}`)
  console.log(`Services needing expansion: ${stats.needsExpansion.toLocaleString()}`)
  console.log(`Total expansions: ${stats.totalExpansions.toLocaleString()}\n`)

  // Show examples
  console.log('📋 EXAMPLE PARSES\n')
  console.log('='.repeat(100) + '\n')

  const examples = [
    'Maintenance and repair services for automobiles and light trucks',
    'Heated or cooled air or water',
    'Steam and heated or cooled air or water',
    'Rental or leasing of automobiles and light trucks',
    'Freight transportation by road or rail'
  ]

  for (const example of examples) {
    const service = services.find(s => s.name === example)
    if (service) {
      const parsed = parseServiceSemantics(service.name)
      console.log(`🔸 "${example}"`)
      console.log(`   Activity: ${parsed.activity || '(none)'}`)
      console.log(`   Activity compounds: [${parsed.compounds.activity.join(', ')}]`)
      console.log(`   Object: ${parsed.object || '(none)'}`)
      console.log(`   Object compounds: [${parsed.compounds.object.join(', ')}]`)
      console.log(`   Preposition: ${parsed.preposition || '(none)'}`)
      console.log(`   Complement: ${parsed.complement || '(none)'}`)
      console.log(`   Complement compounds: [${parsed.compounds.complement.join(', ')}]`)
      console.log(`   Expansion count: ${parsed.expansionCount}`)
      console.log()
    }
  }

  // Save parsed results
  const outputPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services-Parsed.json'
  writeFileSync(outputPath, JSON.stringify(parsed, null, 2))
  console.log(`\n✅ Saved parsed services to: ${outputPath}`)
}

main()

#!/usr/bin/env tsx
/**
 * Comprehensive semantic statement parser for services
 * Handles scope-aware parsing of complex service patterns
 *
 * Key capabilities:
 * - Semantic role detection (activities vs objects)
 * - Prepositional phrase boundary detection
 * - Scope-aware compound expansion
 * - Cartesian product generation
 * - Exclusion handling
 */

import { readFileSync, writeFileSync } from 'fs'

// Common service activity verbs
const SERVICE_VERBS = new Set([
  'maintenance', 'repair', 'installation', 'removal', 'cleaning', 'washing',
  'transportation', 'distribution', 'delivery', 'shipping', 'freight',
  'rental', 'leasing', 'licensing', 'hiring',
  'consulting', 'advisory', 'management', 'administration',
  'design', 'engineering', 'architecture', 'planning',
  'testing', 'inspection', 'certification', 'validation',
  'training', 'education', 'instruction', 'teaching',
  'hosting', 'storage', 'warehousing', 'processing',
  'publishing', 'broadcasting', 'production', 'manufacturing',
  'construction', 'building', 'fabrication',
  'excavation', 'drilling', 'mining',
  'planting', 'harvesting', 'growing',
  'treatment', 'diagnosis', 'therapy',
  'catering', 'feeding', 'serving'
])

// Prepositions that create scope boundaries
const PREPOSITIONS = new Set([
  'for', 'by', 'of', 'to', 'with', 'in', 'on', 'at', 'from', 'using', 'via'
])

interface ServiceStatement {
  original: string
  activities: string[]      // Compound activities (e.g., ["Maintenance", "Repair"])
  serviceKeyword?: string   // "services", "service", etc.
  preposition?: string      // "for", "by", etc.
  objects: string[]         // Compound objects/complements
  exclusions: string[]      // "(except ...)" clauses
  modifiers: string[]       // Additional modifiers (before/during/after activities)
  scope: {
    activityPhrase: string  // The full activity phrase
    objectPhrase: string    // The full object phrase
    boundary?: string       // The prepositional boundary (e.g., "services for")
  }
}

interface ExpandedService {
  activity?: string
  serviceKeyword?: string
  preposition?: string
  object?: string
  exclusion?: string
  fullName: string
  id: string
}

/**
 * Split a phrase on "and"/"or" while respecting parentheses
 */
function splitCompound(text: string): string[] {
  if (!text) return []

  // Handle parenthetical content
  const withoutParens = text.replace(/\([^)]+\)/g, '')

  // Split on conjunctions
  const parts = withoutParens.split(/\s+(?:and|or)\s+/)
  return parts.map(p => p.trim()).filter(Boolean)
}

/**
 * Extract exclusions from parenthetical "(except ...)" clauses
 */
function extractExclusions(text: string): { cleaned: string; exclusions: string[] } {
  const exclusions: string[] = []

  // Match (except ...) patterns
  const exceptPattern = /\(except\s+([^)]+)\)/gi
  let cleaned = text

  let match
  while ((match = exceptPattern.exec(text)) !== null) {
    exclusions.push(match[1].trim())
    cleaned = cleaned.replace(match[0], '').trim()
  }

  // Also handle (including ...) as context, not exclusions
  cleaned = cleaned.replace(/\(including\s+[^)]+\)/gi, '').trim()

  return { cleaned, exclusions }
}

/**
 * Detect if a word is likely an activity verb
 */
function isActivityVerb(word: string): boolean {
  const lower = word.toLowerCase()

  // Check direct match
  if (SERVICE_VERBS.has(lower)) return true

  // Check if it ends in common verb suffixes
  if (lower.endsWith('ing')) {
    // Remove -ing and check
    const base = lower.slice(0, -3)
    if (SERVICE_VERBS.has(base)) return true
    // Handle double consonants (e.g., "planning" -> "plan")
    if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
      if (SERVICE_VERBS.has(base.slice(0, -1))) return true
    }
  }

  // Check for "tion" suffix (e.g., "transportation")
  if (lower.endsWith('tion')) {
    const base = lower.slice(0, -4)
    if (SERVICE_VERBS.has(base)) return true
    if (SERVICE_VERBS.has(base + 't')) return true // e.g., "transportation" -> "transport"
  }

  return false
}

/**
 * Parse a service name into semantic components with scope awareness
 */
function parseServiceStatement(name: string): ServiceStatement {
  // Extract and remove exclusions first
  const { cleaned, exclusions } = extractExclusions(name)

  const result: ServiceStatement = {
    original: name,
    activities: [],
    objects: [],
    exclusions,
    modifiers: [],
    scope: {
      activityPhrase: '',
      objectPhrase: ''
    }
  }

  const lower = cleaned.toLowerCase()

  // Pattern 1: "Activity [and Activity]* services [preposition] Object [and Object]*"
  // Example: "Maintenance and repair services for automobiles and light trucks"
  const servicesPattern = /^(.+?)\s+(services?)\s+(?:(for|by|of|to|with|in|on|at|from)\s+(.+))?$/i
  const servicesMatch = cleaned.match(servicesPattern)

  if (servicesMatch) {
    const [, activityPhrase, serviceKeyword, prep, objectPhrase] = servicesMatch

    result.serviceKeyword = serviceKeyword
    result.scope.activityPhrase = activityPhrase.trim()
    result.scope.boundary = prep ? `${serviceKeyword} ${prep}` : serviceKeyword

    // Parse activities from the phrase before "services"
    const activityParts = splitCompound(activityPhrase)
    result.activities = activityParts.map(a => a.trim()).filter(Boolean)

    if (prep && objectPhrase) {
      result.preposition = prep
      result.scope.objectPhrase = objectPhrase.trim()

      // Parse objects from the phrase after the preposition
      const objectParts = splitCompound(objectPhrase)
      result.objects = objectParts.map(o => o.trim()).filter(Boolean)
    }

    return result
  }

  // Pattern 2: "Activity [and Activity]* of Object [and Object]*"
  // Example: "Rental or leasing of automobiles and light trucks"
  const activityOfPattern = /^(.+?)\s+of\s+(.+)$/i
  const activityOfMatch = cleaned.match(activityOfPattern)

  if (activityOfMatch) {
    const [, activityPhrase, objectPhrase] = activityOfMatch

    // Check if the first part contains activity verbs
    const firstWords = activityPhrase.toLowerCase().split(/\s+/)
    const hasActivity = firstWords.some(w => isActivityVerb(w))

    if (hasActivity) {
      result.preposition = 'of'
      result.scope.activityPhrase = activityPhrase.trim()
      result.scope.objectPhrase = objectPhrase.trim()
      result.scope.boundary = 'of'

      const activityParts = splitCompound(activityPhrase)
      result.activities = activityParts.map(a => a.trim()).filter(Boolean)

      const objectParts = splitCompound(objectPhrase)
      result.objects = objectParts.map(o => o.trim()).filter(Boolean)

      return result
    } else {
      // Pattern 2b: "Noun and Noun of Noun and Noun"
      // Example: "Logs and bolts of Douglas fir and Western larch"
      // Result: ["Logs of Douglas fir", "Logs of Western larch", "bolts of Douglas fir", "bolts of Western larch"]

      // Check if both parts have compounds
      const beforeParts = splitCompound(activityPhrase)
      const afterParts = splitCompound(objectPhrase)

      if (beforeParts.length > 1 || afterParts.length > 1) {
        // Cartesian: each "before" item paired with each "after" item, connected by "of"
        const expandedObjects: string[] = []

        for (const before of beforeParts) {
          for (const after of afterParts) {
            expandedObjects.push(`${before.trim()} of ${after.trim()}`)
          }
        }

        result.objects = expandedObjects
        result.scope.objectPhrase = cleaned
        return result
      }
    }
  }

  // Pattern 3: "Object [and Object]* by Method [and Method]*"
  // Example: "Freight transportation by road or rail"
  for (const prep of Array.from(PREPOSITIONS)) {
    const prepPattern = new RegExp(`^(.+?)\\s+${prep}\\s+(.+)$`, 'i')
    const prepMatch = cleaned.match(prepPattern)

    if (prepMatch) {
      const [, beforePrep, afterPrep] = prepMatch

      result.preposition = prep
      result.scope.activityPhrase = beforePrep.trim()
      result.scope.objectPhrase = afterPrep.trim()
      result.scope.boundary = prep

      // Check if before-prep contains activities
      const beforeWords = beforePrep.toLowerCase().split(/\s+/)
      const hasActivity = beforeWords.some(w => isActivityVerb(w))

      if (hasActivity) {
        // Activity by Method pattern
        const activityParts = splitCompound(beforePrep)
        result.activities = activityParts.map(a => a.trim()).filter(Boolean)
      } else {
        // Object by Method pattern - treat beforePrep as single object
        result.objects.push(beforePrep.trim())
      }

      const afterParts = splitCompound(afterPrep)
      result.objects.push(...afterParts.map(o => o.trim()).filter(Boolean))

      return result
    }
  }

  // Pattern 4: "modifier [or modifier]* noun [or noun]*"
  // Example: "Heated or cooled air or water"
  // This is the complex cartesian case

  const parts = splitCompound(cleaned)
  if (parts.length > 1) {
    // Try to detect if we have modifier-noun patterns
    // Heuristic: single-word parts might be modifiers, multi-word might be modifier+noun

    const modifiers: string[] = []
    const nouns: string[] = []

    let foundMultiWord = false

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim()
      const words = part.split(/\s+/)

      if (words.length > 1) {
        // Multi-word: likely "modifier noun"
        foundMultiWord = true
        modifiers.push(words.slice(0, -1).join(' '))
        nouns.push(words[words.length - 1])
      } else {
        // Single word
        if (!foundMultiWord) {
          // Before any multi-word parts: could be standalone or modifier
          // Check if it looks like an adjective
          if (i < parts.length - 1) {
            modifiers.push(part)
          } else {
            nouns.push(part)
          }
        } else {
          // After multi-word parts: likely a noun
          nouns.push(part)
        }
      }
    }

    if (modifiers.length > 0 && nouns.length > 0) {
      // Cartesian pattern detected
      result.modifiers = modifiers
      result.objects = nouns
      result.scope.activityPhrase = modifiers.join(' or ')
      result.scope.objectPhrase = nouns.join(' or ')
    } else {
      // Simple compound - just multiple objects
      result.objects = parts
      result.scope.objectPhrase = parts.join(' and ')
    }

    return result
  }

  // Pattern 5: Simple service (no compounds)
  result.objects = [cleaned]
  result.scope.objectPhrase = cleaned

  return result
}

/**
 * Expand a parsed service statement into all discrete services
 */
function expandServiceStatement(statement: ServiceStatement): ExpandedService[] {
  const expanded: ExpandedService[] = []

  // Case 1: Activities × Objects (with optional preposition)
  if (statement.activities.length > 0 && statement.objects.length > 0) {
    for (const activity of statement.activities) {
      for (const object of statement.objects) {
        const parts = [activity]
        if (statement.serviceKeyword) parts.push(statement.serviceKeyword)
        if (statement.preposition) parts.push(statement.preposition)
        parts.push(object)

        let fullName = parts.join(' ')

        // Add exclusions if present
        if (statement.exclusions.length > 0) {
          fullName += ` (except ${statement.exclusions.join(' and ')})`
        }

        const id = fullName
          .replace(/[^a-zA-Z0-9]+/g, '')
          .replace(/^(.)/, (m) => m.toUpperCase())

        expanded.push({
          activity,
          serviceKeyword: statement.serviceKeyword,
          preposition: statement.preposition,
          object,
          exclusion: statement.exclusions.join(' and ') || undefined,
          fullName,
          id
        })
      }
    }
  }
  // Case 2: Modifiers × Objects (cartesian product)
  else if (statement.modifiers.length > 0 && statement.objects.length > 0) {
    for (const modifier of statement.modifiers) {
      for (const object of statement.objects) {
        let fullName = `${modifier} ${object}`

        // Add exclusions if present
        if (statement.exclusions.length > 0) {
          fullName += ` (except ${statement.exclusions.join(' and ')})`
        }

        const id = fullName
          .replace(/[^a-zA-Z0-9]+/g, '')
          .replace(/^(.)/, (m) => m.toUpperCase())

        expanded.push({
          exclusion: statement.exclusions.join(' and ') || undefined,
          fullName,
          id
        })
      }
    }
  }
  // Case 3: Activities only (no objects specified)
  else if (statement.activities.length > 0) {
    for (const activity of statement.activities) {
      const parts = [activity]
      if (statement.serviceKeyword) parts.push(statement.serviceKeyword)

      const fullName = parts.join(' ')
      const id = fullName
        .replace(/[^a-zA-Z0-9]+/g, '')
        .replace(/^(.)/, (m) => m.toUpperCase())

      expanded.push({
        activity,
        serviceKeyword: statement.serviceKeyword,
        fullName,
        id
      })
    }
  }
  // Case 4: Objects only (simple compound)
  else if (statement.objects.length > 1) {
    for (const object of statement.objects) {
      let fullName = object

      // Add exclusions if present
      if (statement.exclusions.length > 0) {
        fullName += ` (except ${statement.exclusions.join(' and ')})`
      }

      const id = fullName
        .replace(/[^a-zA-Z0-9]+/g, '')
        .replace(/^(.)/, (m) => m.toUpperCase())

      expanded.push({
        object,
        exclusion: statement.exclusions.join(' and ') || undefined,
        fullName,
        id
      })
    }
  }
  // Case 5: No expansion needed
  else {
    expanded.push({
      fullName: statement.original,
      id: statement.original
        .replace(/[^a-zA-Z0-9]+/g, '')
        .replace(/^(.)/, (m) => m.toUpperCase())
    })
  }

  // Deduplicate expansions (case-insensitive)
  const seen = new Set<string>()
  const deduplicated: ExpandedService[] = []

  for (const item of expanded) {
    const lowerName = item.fullName.toLowerCase()

    if (!seen.has(lowerName)) {
      seen.add(lowerName)
      deduplicated.push(item)
    }
  }

  return deduplicated
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 COMPREHENSIVE SERVICE SEMANTIC PARSING\n')
  console.log('='.repeat(100) + '\n')

  // Test cases
  const testCases = [
    'Maintenance and repair services for automobiles and light trucks',
    'Maintenance and repair services for automobiles and light trucks (except washing)',
    'Steam and heated or cooled air or water',
    'Heated or cooled air or water',
    'Rental or leasing of automobiles and light trucks',
    'Freight transportation by road or rail',
    'Fresh or frozen fruit',
    'Turkish or steam or ritual baths',
    'Road transportation services for general freight',
    'Installation and removal services for equipment'
  ]

  console.log('📋 TEST PARSING & EXPANSION\n')

  for (const testCase of testCases) {
    const parsed = parseServiceStatement(testCase)
    const expanded = expandServiceStatement(parsed)

    console.log(`🔸 "${testCase}"`)
    console.log(`   Activities: [${parsed.activities.join(', ')}]`)
    console.log(`   Service keyword: ${parsed.serviceKeyword || '(none)'}`)
    console.log(`   Preposition: ${parsed.preposition || '(none)'}`)
    console.log(`   Objects: [${parsed.objects.join(', ')}]`)
    console.log(`   Modifiers: [${parsed.modifiers.join(', ')}]`)
    console.log(`   Exclusions: [${parsed.exclusions.join(', ')}]`)
    console.log(`   Scope boundary: ${parsed.scope.boundary || '(none)'}`)
    console.log(`   Expansions (${expanded.length}):`)
    for (const exp of expanded) {
      console.log(`     → ${exp.fullName}`)
    }
    console.log()
  }

  // Process all services
  const servicesPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services.tsv'
  const content = readFileSync(servicesPath, 'utf-8')
  const lines = content.trim().split('\n')

  const services = lines.slice(1).map(line => {
    const fields = line.split('\t')
    return {
      url: fields[0] || '',
      name: fields[5] || '',
      code: fields[4] || '',
      description: fields[6] || ''
    }
  })

  console.log(`\n📊 Processing ${services.length.toLocaleString()} services...\n`)

  const allParsed = services.map(service => ({
    ...service,
    parsed: parseServiceStatement(service.name),
    expanded: expandServiceStatement(parseServiceStatement(service.name))
  }))

  // Statistics
  const needsExpansion = allParsed.filter(s => s.expanded.length > 1)
  const totalExpanded = allParsed.reduce((sum, s) => sum + s.expanded.length, 0)

  const withActivities = allParsed.filter(s => s.parsed.activities.length > 0)
  const withPrepositions = allParsed.filter(s => s.parsed.preposition)
  const withExclusions = allParsed.filter(s => s.parsed.exclusions.length > 0)
  const withModifiers = allParsed.filter(s => s.parsed.modifiers.length > 0)

  console.log('📈 PARSING STATISTICS\n')
  console.log(`Services with activities: ${withActivities.length.toLocaleString()} (${Math.round(withActivities.length/services.length*100)}%)`)
  console.log(`Services with prepositions: ${withPrepositions.length.toLocaleString()} (${Math.round(withPrepositions.length/services.length*100)}%)`)
  console.log(`Services with exclusions: ${withExclusions.length.toLocaleString()} (${Math.round(withExclusions.length/services.length*100)}%)`)
  console.log(`Services with modifiers: ${withModifiers.length.toLocaleString()} (${Math.round(withModifiers.length/services.length*100)}%)`)
  console.log()
  console.log(`Services needing expansion: ${needsExpansion.length.toLocaleString()} (${Math.round(needsExpansion.length/services.length*100)}%)`)
  console.log(`Total expanded services: ${totalExpanded.toLocaleString()}`)
  console.log(`Net expansion: ${(totalExpanded - services.length).toLocaleString()} additional services\n`)

  // Show most complex expansions
  const topExpansions = allParsed
    .filter(s => s.expanded.length > 1)
    .sort((a, b) => b.expanded.length - a.expanded.length)
    .slice(0, 15)

  console.log('🔝 TOP 15 MOST COMPLEX EXPANSIONS\n')
  for (const service of topExpansions) {
    console.log(`${service.expanded.length}× "${service.name}"`)
    for (const exp of service.expanded.slice(0, 10)) {
      console.log(`     → ${exp.fullName}`)
    }
    if (service.expanded.length > 10) {
      console.log(`     ... and ${service.expanded.length - 10} more`)
    }
    console.log()
  }

  // Save results
  const outputPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services-Parsed-Full.json'
  writeFileSync(outputPath, JSON.stringify(allParsed, null, 2))
  console.log(`💾 Saved parsed results to: ${outputPath}`)

  // Generate expanded services TSV
  const expandedLines: string[] = []
  expandedLines.push('url\tns\ttype\tid\tcode\tname\tdescription\toriginalUrl\tactivity\tpreposition\tobject\texclusion')

  for (const service of allParsed) {
    for (const exp of service.expanded) {
      const url = `https://napcs.org.ai/Service/${exp.id}`
      const fields = [
        url,
        'napcs.org.ai',
        'Service',
        exp.id,
        service.code,
        exp.fullName,
        service.description,
        service.url,
        exp.activity || '',
        exp.preposition || '',
        exp.object || '',
        exp.exclusion || ''
      ]
      expandedLines.push(fields.join('\t'))
    }
  }

  const expandedPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services-Expanded.tsv'
  writeFileSync(expandedPath, expandedLines.join('\n'))
  console.log(`💾 Saved expanded services to: ${expandedPath}`)
  console.log(`   ${expandedLines.length - 1} total services (including ${totalExpanded - services.length} new expansions)`)
}

main()

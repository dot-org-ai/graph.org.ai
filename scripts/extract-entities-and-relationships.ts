#!/usr/bin/env tsx
/**
 * Extract entities (verbs, nouns) and generate comprehensive relationships
 *
 * This script:
 * 1. Extracts ALL verbs from service statements
 * 2. Extracts ALL nouns/objects from service statements
 * 3. Creates Verbs.tsv with unique verbs
 * 4. Updates Nouns.tsv with unique nouns
 * 5. Generates comprehensive Services.Relationships.tsv with:
 *    - Services → Verbs relationships
 *    - Services → Nouns relationships
 *    - Services → Products relationships
 *
 * Target: 3-6× relationships per service
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'

interface Service {
  url: string
  ns: string
  type: string
  id: string
  code: string
  unspsc?: string
  gpc?: string
  napcs?: string
  name: string
  description: string
  source: string
  segment?: string
  segmentCode?: string
  family?: string
  familyCode?: string
  class?: string
  classCode?: string
  parent?: string
  hierarchy?: string
  originalUrl?: string
  activity?: string
  preposition?: string
  object?: string
  exclusion?: string
}

interface Verb {
  url: string
  ns: string
  type: string
  id: string
  name: string
  baseForm: string
  variants: string[]
  sources: Set<string> // service URLs that use this verb
}

interface Noun {
  url: string
  ns: string
  type: string
  id: string
  name: string
  singular: string
  plural?: string
  sources: Set<string> // service URLs that reference this noun
}

interface Relationship {
  sourceUrl: string
  relationshipType: string
  targetUrl: string
  targetType: string
  confidence: 'high' | 'medium' | 'low'
  extractionMethod: string
}

/**
 * Common service verbs with their base forms
 */
const COMMON_VERBS = new Map<string, string>([
  // Maintenance & Repair
  ['maintenance', 'maintain'],
  ['maintains', 'maintain'],
  ['maintaining', 'maintain'],
  ['repair', 'repair'],
  ['repairs', 'repair'],
  ['repairing', 'repair'],
  ['service', 'service'],
  ['services', 'service'],
  ['servicing', 'service'],

  // Installation & Setup
  ['installation', 'install'],
  ['install', 'install'],
  ['installs', 'install'],
  ['installing', 'install'],
  ['setup', 'setup'],
  ['setups', 'setup'],
  ['setting', 'set'],

  // Transportation & Delivery
  ['transportation', 'transport'],
  ['transport', 'transport'],
  ['transports', 'transport'],
  ['transporting', 'transport'],
  ['delivery', 'deliver'],
  ['deliver', 'deliver'],
  ['delivers', 'deliver'],
  ['delivering', 'deliver'],
  ['shipping', 'ship'],
  ['ship', 'ship'],
  ['ships', 'ship'],

  // Storage & Warehousing
  ['storage', 'store'],
  ['store', 'store'],
  ['stores', 'store'],
  ['storing', 'store'],
  ['warehousing', 'warehouse'],
  ['warehouse', 'warehouse'],

  // Manufacturing & Production
  ['manufacturing', 'manufacture'],
  ['manufacture', 'manufacture'],
  ['manufactures', 'manufacture'],
  ['production', 'produce'],
  ['produce', 'produce'],
  ['produces', 'produce'],
  ['producing', 'produce'],
  ['fabrication', 'fabricate'],
  ['fabricate', 'fabricate'],

  // Design & Engineering
  ['design', 'design'],
  ['designs', 'design'],
  ['designing', 'design'],
  ['engineering', 'engineer'],
  ['engineer', 'engineer'],
  ['development', 'develop'],
  ['develop', 'develop'],
  ['develops', 'develop'],
  ['developing', 'develop'],

  // Rental & Leasing
  ['rental', 'rent'],
  ['rent', 'rent'],
  ['rents', 'rent'],
  ['renting', 'rent'],
  ['leasing', 'lease'],
  ['lease', 'lease'],
  ['leases', 'lease'],

  // Consulting & Advisory
  ['consulting', 'consult'],
  ['consult', 'consult'],
  ['consultation', 'consult'],
  ['advisory', 'advise'],
  ['advise', 'advise'],
  ['advising', 'advise'],

  // Testing & Inspection
  ['testing', 'test'],
  ['test', 'test'],
  ['tests', 'test'],
  ['inspection', 'inspect'],
  ['inspect', 'inspect'],
  ['inspects', 'inspect'],
  ['inspecting', 'inspect'],

  // Training & Education
  ['training', 'train'],
  ['train', 'train'],
  ['trains', 'train'],
  ['education', 'educate'],
  ['educate', 'educate'],
  ['teaching', 'teach'],
  ['teach', 'teach'],

  // Management & Administration
  ['management', 'manage'],
  ['manage', 'manage'],
  ['manages', 'manage'],
  ['managing', 'manage'],
  ['administration', 'administer'],
  ['administer', 'administer'],

  // Sales & Marketing
  ['sales', 'sell'],
  ['sell', 'sell'],
  ['sells', 'sell'],
  ['selling', 'sell'],
  ['marketing', 'market'],
  ['market', 'market'],

  // Processing & Handling
  ['processing', 'process'],
  ['process', 'process'],
  ['processes', 'process'],
  ['handling', 'handle'],
  ['handle', 'handle'],
  ['handles', 'handle'],

  // Cleaning & Sanitation
  ['cleaning', 'clean'],
  ['clean', 'clean'],
  ['cleans', 'clean'],
  ['sanitation', 'sanitize'],
  ['sanitize', 'sanitize'],

  // General Actions
  ['provision', 'provide'],
  ['provide', 'provide'],
  ['provides', 'provide'],
  ['providing', 'provide'],
  ['supply', 'supply'],
  ['supplies', 'supply'],
  ['supplying', 'supply'],
  ['operation', 'operate'],
  ['operate', 'operate'],
  ['operates', 'operate'],
  ['operating', 'operate'],
])

/**
 * Extract verbs from a text string
 */
function extractVerbs(text: string, serviceUrl: string): Map<string, Verb> {
  const verbs = new Map<string, Verb>()
  const words = text.toLowerCase().split(/[\s,;.()]+/).filter(w => w.length > 0)

  for (const word of words) {
    if (COMMON_VERBS.has(word)) {
      const baseForm = COMMON_VERBS.get(word)!
      const verbId = toUrlId(baseForm)
      const verbUrl = `https://verbs.org.ai/Verb/${verbId}`

      if (!verbs.has(verbUrl)) {
        verbs.set(verbUrl, {
          url: verbUrl,
          ns: 'verbs.org.ai',
          type: 'Verb',
          id: verbId,
          name: capitalize(baseForm),
          baseForm: baseForm,
          variants: [],
          sources: new Set([serviceUrl])
        })
      } else {
        verbs.get(verbUrl)!.sources.add(serviceUrl)
      }

      // Add variant if different from base form
      if (word !== baseForm) {
        const verb = verbs.get(verbUrl)!
        if (!verb.variants.includes(word)) {
          verb.variants.push(word)
        }
      }
    }
  }

  return verbs
}

/**
 * Extract nouns from a text string
 */
function extractNouns(text: string, serviceUrl: string): Map<string, Noun> {
  const nouns = new Map<string, Noun>()

  // Parse "X of Y" patterns to extract Y as the main noun
  const ofPattern = /\s+of\s+(.+?)(?:\s+and\s+|\s+or\s+|,|$)/gi
  let match
  while ((match = ofPattern.exec(text)) !== null) {
    const objectPhrase = match[1].trim()
    if (objectPhrase.length >= 3 && objectPhrase.length <= 50) {
      addNoun(objectPhrase, serviceUrl, nouns)
    }
  }

  // Also extract final phrase after last "of"
  const lastOfMatch = text.match(/\s+of\s+([^,]+)$/i)
  if (lastOfMatch) {
    const objectPhrase = lastOfMatch[1].trim()
    if (objectPhrase.length >= 3 && objectPhrase.length <= 50) {
      addNoun(objectPhrase, serviceUrl, nouns)
    }
  }

  // Split by common separators and clean
  const phrases = text
    .split(/\s+and\s+|\s+or\s+|,\s*/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && p.length <= 50) // Filter out full service descriptions

  for (const phrase of phrases) {
    // Skip if contains "of" (already handled above)
    if (phrase.includes(' of ')) continue

    // Remove common prefixes and suffixes
    let cleaned = phrase
      .replace(/^(the|a|an)\s+/i, '')
      .replace(/\s+(services?|products?|equipment|systems?|goods)$/i, '')
      .trim()

    if (cleaned.length < 3 || cleaned.length > 50) continue

    // Skip if it's a verb
    if (COMMON_VERBS.has(cleaned.toLowerCase())) continue

    // Skip if it starts with a common verb
    const firstWord = cleaned.split(/\s+/)[0].toLowerCase()
    if (COMMON_VERBS.has(firstWord)) continue

    addNoun(cleaned, serviceUrl, nouns)
  }

  return nouns
}

/**
 * Helper to add a noun to the collection
 */
function addNoun(text: string, serviceUrl: string, nouns: Map<string, Noun>): void {
  const cleaned = text
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/\s+(services?|products?|equipment|systems?|goods)$/i, '')
    .trim()

  if (cleaned.length < 3) return

  // Skip if it's a verb
  if (COMMON_VERBS.has(cleaned.toLowerCase())) return

  const singular = singularize(cleaned)
  const nounId = toUrlId(singular)
  const nounUrl = `https://nouns.org.ai/Noun/${nounId}`

  if (!nouns.has(nounUrl)) {
    nouns.set(nounUrl, {
      url: nounUrl,
      ns: 'nouns.org.ai',
      type: 'Noun',
      id: nounId,
      name: capitalize(singular),
      singular: singular,
      plural: cleaned !== singular ? cleaned : undefined,
      sources: new Set([serviceUrl])
    })
  } else {
    nouns.get(nounUrl)!.sources.add(serviceUrl)
  }
}

/**
 * Simple singularization (not perfect but works for most cases)
 */
function singularize(word: string): string {
  const lower = word.toLowerCase()

  // Common irregular plurals
  const irregulars: Record<string, string> = {
    'children': 'child',
    'people': 'person',
    'men': 'man',
    'women': 'woman',
    'teeth': 'tooth',
    'feet': 'foot',
    'mice': 'mouse',
    'geese': 'goose',
  }

  if (irregulars[lower]) {
    return word.charAt(0) === word.charAt(0).toUpperCase()
      ? capitalize(irregulars[lower])
      : irregulars[lower]
  }

  // Regular patterns
  if (lower.endsWith('ies') && lower.length > 4) {
    return word.slice(0, -3) + 'y'
  }
  if (lower.endsWith('es') && lower.length > 3) {
    // Check for -ches, -shes, -sses, -xes
    if (lower.endsWith('ches') || lower.endsWith('shes') ||
        lower.endsWith('sses') || lower.endsWith('xes')) {
      return word.slice(0, -2)
    }
    return word.slice(0, -2)
  }
  if (lower.endsWith('s') && lower.length > 2 && !lower.endsWith('ss')) {
    return word.slice(0, -1)
  }

  return word
}

/**
 * Convert text to URL-safe ID
 */
function toUrlId(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9]+/g, '')
    .replace(/^[0-9]+/, '')
    .replace(/([A-Z])/g, (match, p1, offset) => offset > 0 ? match : match.toLowerCase())
}

/**
 * Capitalize first letter
 */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 EXTRACTING ENTITIES AND RELATIONSHIPS\n')
  console.log('='.repeat(100) + '\n')

  // Read unified Services.tsv
  console.log('📖 Reading Services.tsv...')
  const servicesPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services.tsv'
  const servicesContent = readFileSync(servicesPath, 'utf-8')
  const servicesLines = servicesContent.trim().split('\n')
  const servicesHeaders = servicesLines[0].split('\t')

  const services: Service[] = servicesLines.slice(1).map(line => {
    const fields = line.split('\t')
    return {
      url: fields[0] || '',
      ns: fields[1] || '',
      type: fields[2] || '',
      id: fields[3] || '',
      code: fields[4] || '',
      unspsc: fields[5] || undefined,
      gpc: fields[6] || undefined,
      napcs: fields[7] || undefined,
      name: fields[8] || '',
      description: fields[9] || '',
      source: fields[10] || '',
      segment: fields[11] || undefined,
      segmentCode: fields[12] || undefined,
      family: fields[13] || undefined,
      familyCode: fields[14] || undefined,
      class: fields[15] || undefined,
      classCode: fields[16] || undefined,
      parent: fields[17] || undefined,
      hierarchy: fields[18] || undefined,
      originalUrl: fields[19] || undefined,
      activity: fields[20] || undefined,
      preposition: fields[21] || undefined,
      object: fields[22] || undefined,
      exclusion: fields[23] || undefined
    }
  }).filter(s => s.name)

  console.log(`  Loaded ${services.length.toLocaleString()} services\n`)

  // Extract all verbs and nouns
  console.log('🔍 Extracting verbs and nouns from services...')
  const allVerbs = new Map<string, Verb>()
  const allNouns = new Map<string, Noun>()
  const relationships: Relationship[] = []

  let verbRelationships = 0
  let nounRelationships = 0

  for (const service of services) {
    // Extract verbs from activity and name
    const verbSources = [
      service.activity || '',
      service.name
    ].filter(s => s.length > 0)

    for (const source of verbSources) {
      const verbs = extractVerbs(source, service.url)
      for (const [verbUrl, verb] of verbs.entries()) {
        if (!allVerbs.has(verbUrl)) {
          allVerbs.set(verbUrl, verb)
        } else {
          allVerbs.get(verbUrl)!.sources.add(service.url)
        }

        // Create relationship: Service → Verb
        relationships.push({
          sourceUrl: service.url,
          relationshipType: 'usesVerb',
          targetUrl: verbUrl,
          targetType: 'Verb',
          confidence: service.activity === verb.baseForm || service.activity?.toLowerCase().includes(verb.baseForm) ? 'high' : 'medium',
          extractionMethod: service.activity?.toLowerCase().includes(verb.baseForm) ? 'activity_column' : 'name_parsing'
        })
        verbRelationships++
      }
    }

    // Extract nouns - prioritize object field when available
    let nounSource = ''
    let extractionMethod = ''

    if (service.object && service.object.length > 0) {
      // Use parsed object field (high confidence)
      nounSource = service.object
      extractionMethod = 'object_column'
    } else {
      // Parse from name (medium confidence)
      // Remove activity/verb prefix if present
      let nameWithoutActivity = service.name
      if (service.activity) {
        nameWithoutActivity = service.name.replace(new RegExp(`^(${service.activity})\\s+`, 'i'), '')
      }
      nounSource = nameWithoutActivity
      extractionMethod = 'name_parsing'
    }

    if (nounSource.length > 0) {
      const nouns = extractNouns(nounSource, service.url)
      for (const [nounUrl, noun] of nouns.entries()) {
        if (!allNouns.has(nounUrl)) {
          allNouns.set(nounUrl, noun)
        } else {
          allNouns.get(nounUrl)!.sources.add(service.url)
        }

        // Create relationship: Service → Noun
        relationships.push({
          sourceUrl: service.url,
          relationshipType: 'hasObject',
          targetUrl: nounUrl,
          targetType: 'Noun',
          confidence: extractionMethod === 'object_column' ? 'high' : 'medium',
          extractionMethod: extractionMethod
        })
        nounRelationships++
      }
    }
  }

  console.log(`  Extracted ${allVerbs.size.toLocaleString()} unique verbs`)
  console.log(`  Extracted ${allNouns.size.toLocaleString()} unique nouns`)
  console.log(`  Created ${verbRelationships.toLocaleString()} service→verb relationships`)
  console.log(`  Created ${nounRelationships.toLocaleString()} service→noun relationships\n`)

  // Read existing Service-Product-Relationships.tsv if it exists
  const serviceProductRelPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Service-Product-Relationships.tsv'
  if (existsSync(serviceProductRelPath)) {
    console.log('📖 Reading existing Service-Product-Relationships.tsv...')
    const spContent = readFileSync(serviceProductRelPath, 'utf-8')
    const spLines = spContent.trim().split('\n')

    for (const line of spLines.slice(1)) {
      const fields = line.split('\t')
      if (fields.length >= 5) {
        relationships.push({
          sourceUrl: fields[0],
          relationshipType: fields[4], // maintains, rents, transports, etc.
          targetUrl: fields[2],
          targetType: 'Product',
          confidence: fields[5] as any || 'medium',
          extractionMethod: 'service_product_matching'
        })
      }
    }
    console.log(`  Added ${spLines.length - 1} service→product relationships\n`)
  }

  // Calculate statistics
  const totalRelationships = relationships.length
  const avgRelationshipsPerService = (totalRelationships / services.length).toFixed(2)

  console.log('📊 RELATIONSHIP STATISTICS\n')
  console.log(`Total relationships: ${totalRelationships.toLocaleString()}`)
  console.log(`Average per service: ${avgRelationshipsPerService}×`)
  console.log(`Total services: ${services.length.toLocaleString()}\n`)

  const byType = new Map<string, number>()
  for (const rel of relationships) {
    byType.set(rel.relationshipType, (byType.get(rel.relationshipType) || 0) + 1)
  }

  console.log('By Relationship Type:')
  for (const [type, count] of Array.from(byType.entries()).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / totalRelationships) * 100).toFixed(1)
    console.log(`  ${type}: ${count.toLocaleString()} (${pct}%)`)
  }

  // Save Verbs.tsv
  console.log('\n💾 Saving Verbs.tsv...')
  const verbsPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Verbs.tsv'
  const verbsLines = [
    'url\tns\ttype\tid\tname\tbaseForm\tvariants\tusageCount'
  ]

  for (const verb of Array.from(allVerbs.values()).sort((a, b) => a.name.localeCompare(b.name))) {
    verbsLines.push([
      verb.url,
      verb.ns,
      verb.type,
      verb.id,
      verb.name,
      verb.baseForm,
      verb.variants.join(', '),
      verb.sources.size.toString()
    ].join('\t'))
  }

  writeFileSync(verbsPath, verbsLines.join('\n'))
  console.log(`  Saved ${allVerbs.size.toLocaleString()} verbs to: ${verbsPath}`)

  // Save Nouns.tsv
  console.log('\n💾 Saving Nouns.tsv...')
  const nounsPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Nouns.tsv'
  const nounsLines = [
    'url\tns\ttype\tid\tname\tsingular\tplural\tusageCount'
  ]

  for (const noun of Array.from(allNouns.values()).sort((a, b) => a.name.localeCompare(b.name))) {
    nounsLines.push([
      noun.url,
      noun.ns,
      noun.type,
      noun.id,
      noun.name,
      noun.singular,
      noun.plural || '',
      noun.sources.size.toString()
    ].join('\t'))
  }

  writeFileSync(nounsPath, nounsLines.join('\n'))
  console.log(`  Saved ${allNouns.size.toLocaleString()} nouns to: ${nounsPath}`)

  // Save Services.Relationships.tsv
  console.log('\n💾 Saving Services.Relationships.tsv...')
  const relPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services.Relationships.tsv'
  const relLines = [
    'sourceUrl\trelationshipType\ttargetUrl\ttargetType\tconfidence\textractionMethod'
  ]

  for (const rel of relationships) {
    relLines.push([
      rel.sourceUrl,
      rel.relationshipType,
      rel.targetUrl,
      rel.targetType,
      rel.confidence,
      rel.extractionMethod
    ].join('\t'))
  }

  writeFileSync(relPath, relLines.join('\n'))
  console.log(`  Saved ${relationships.length.toLocaleString()} relationships to: ${relPath}`)

  // Show examples
  console.log('\n📋 EXAMPLE RELATIONSHIPS\n')

  // Group by service and show a few examples
  const byService = new Map<string, Relationship[]>()
  for (const rel of relationships) {
    if (!byService.has(rel.sourceUrl)) {
      byService.set(rel.sourceUrl, [])
    }
    byService.get(rel.sourceUrl)!.push(rel)
  }

  const exampleServices = Array.from(byService.entries()).slice(0, 5)
  for (const [serviceUrl, rels] of exampleServices) {
    const service = services.find(s => s.url === serviceUrl)
    if (service) {
      console.log(`Service: "${service.name}"`)
      console.log(`  ${rels.length} relationships:`)
      for (const rel of rels.slice(0, 6)) {
        const targetName = rel.targetType === 'Verb'
          ? allVerbs.get(rel.targetUrl)?.name
          : rel.targetType === 'Noun'
          ? allNouns.get(rel.targetUrl)?.name
          : rel.targetUrl.split('/').pop()
        console.log(`    ${rel.relationshipType} → ${targetName} (${rel.targetType}, ${rel.confidence})`)
      }
      if (rels.length > 6) {
        console.log(`    ... and ${rels.length - 6} more`)
      }
      console.log()
    }
  }

  console.log('\n✅ ENTITY EXTRACTION AND RELATIONSHIP GENERATION COMPLETE\n')
  console.log('Files generated:')
  console.log(`  - Verbs.tsv: ${allVerbs.size.toLocaleString()} verbs`)
  console.log(`  - Nouns.tsv: ${allNouns.size.toLocaleString()} nouns`)
  console.log(`  - Services.Relationships.tsv: ${relationships.length.toLocaleString()} relationships`)
  console.log(`  - Average: ${avgRelationshipsPerService}× relationships per service\n`)
}

main()

#!/usr/bin/env tsx

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createStorage, type StorageBackend } from '../.mdxdb/storage.js'
import type { NewThing, NewRelationship } from '../.mdxdb/schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')

const SOURCE_DIR = '.source'

// Get storage backend from CLI args (default: sqlite)
const storageBackend = (process.argv[2] || 'sqlite') as StorageBackend
const storage = createStorage(storageBackend)

console.log(`📦 Storage backend: ${storageBackend}\n`)

/**
 * Digital Score Lookup
 */
interface ScoreLookup {
  exact: Map<string, number | null>
  wildcards: Array<{ pattern: string, score: number | null }>
  ranges: Array<{ start: string, end: string, score: number | null }>
}

let digitalScoreLookup: ScoreLookup | null = null

function loadDigitalScores(): ScoreLookup {
  if (digitalScoreLookup) return digitalScoreLookup

  const filepath = join(PROJECT_ROOT, '.enrichment/DigitalScores.tsv')
  const content = readFileSync(filepath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))

  const lookup: ScoreLookup = {
    exact: new Map(),
    wildcards: [],
    ranges: []
  }

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t')
    if (parts.length < 4) continue

    const codes = parts[2]
    const actionScore = parts[3]

    // Parse action score as float or null
    const score = actionScore === 'null' || actionScore === '' ? null : parseFloat(actionScore)

    // Handle different code patterns
    if (codes.includes('*')) {
      // Wildcard pattern
      lookup.wildcards.push({ pattern: codes, score })
    } else if (codes.includes('-') && !codes.match(/^\d{2}-\d{4}\.\d{2}$/)) {
      // Range pattern (but not SOC code like 11-1011.00)
      const [start, end] = codes.split('-')
      lookup.ranges.push({ start: start.trim(), end: end.trim(), score })
    } else if (codes.startsWith('[')) {
      // Array of codes
      try {
        const codeArray = JSON.parse(codes)
        for (const code of codeArray) {
          lookup.exact.set(code, score)
        }
      } catch (e) {
        // Ignore parse errors
      }
    } else {
      // Exact match
      lookup.exact.set(codes, score)
    }
  }

  digitalScoreLookup = lookup
  return lookup
}

function matchesWildcard(code: string, pattern: string): boolean {
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
  return regex.test(code)
}

function inRange(code: string, start: string, end: string): boolean {
  return code >= start && code <= end
}

function lookupDigitalScore(code: string | undefined): number | null {
  if (!code) return null

  const lookup = loadDigitalScores()

  // 1. Try exact match first
  if (lookup.exact.has(code)) {
    return lookup.exact.get(code)!
  }

  // 2. Try wildcard patterns
  for (const { pattern, score } of lookup.wildcards) {
    if (matchesWildcard(code, pattern)) {
      return score
    }
  }

  // 3. Try ranges
  for (const { start, end, score } of lookup.ranges) {
    if (inRange(code, start, end)) {
      return score
    }
  }

  return null
}

/**
 * Parse TSV file into array of objects
 */
function parseTSV(filepath: string): Record<string, string>[] {
  const content = readFileSync(filepath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())

  if (lines.length === 0) return []

  const headers = lines[0].split('\t')
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t')
    const row: Record<string, string> = {}

    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || ''
    }

    rows.push(row)
  }

  return rows
}

/**
 * Convert string to TitleCase (e.g., "chief executive" -> "ChiefExecutive")
 * Preserves existing capital letters (e.g., "3DModel" stays "3DModel")
 */
function toTitleCase(str: string | undefined): string {
  if (!str) return ''
  return str
    .split(/[\s\-_\.]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

/**
 * Namespace to domain mapping
 */
const NAMESPACE_DOMAINS: Record<string, string> = {
  'schema.org': 'schema.org',
  'onet': 'onet',
  'unspsc': 'unspsc',
  'apqc': 'apqc',
  'model': 'model',
}

/**
 * Create relative URL path for things
 * @param domain - Domain name (e.g., 'onet', 'schema.org')
 * @param type - Type/category in singular form (e.g., 'Occupation', 'Ability')
 * @param name - Human-readable name to convert to TitleCase ID
 */
function createURL(domain: string, type: string, name: string): string {
  const identifier = toTitleCase(name)
  return `${domain}/${type}/${identifier}`
}

/**
 * Predicate mapping with simple, intuitive bidirectional relationships
 * All predicates are in camelCase for consistency
 */
const PREDICATES = {
  // Schema.org predicates
  subClassOf: { forward: 'subClassOf', reverse: 'superClassOf' },
  domainIncludes: { forward: 'domainIncludes', reverse: 'domainOf' },
  rangeIncludes: { forward: 'rangeIncludes', reverse: 'rangeOf' },

  // O*NET predicates - simple and intuitive
  requiresSkill: { forward: 'requires', reverse: 'requiredBy' },
  requiresKnowledge: { forward: 'requires', reverse: 'requiredBy' },
  requiresAbility: { forward: 'requires', reverse: 'requiredBy' },
  requiresStyle: { forward: 'requires', reverse: 'requiredBy' },
  involvesActivity: { forward: 'involves', reverse: 'involvedIn' },
  hasContext: { forward: 'hasContext', reverse: 'contextOf' },
  valuesWork: { forward: 'values', reverse: 'valuedBy' },
  alignsWithInterest: { forward: 'alignsWith', reverse: 'alignedWith' },
  performsTask: { forward: 'performs', reverse: 'performedBy' },
  usesTechnology: { forward: 'uses', reverse: 'usedBy' },
  usesTool: { forward: 'uses', reverse: 'usedBy' },

  // Hierarchy predicates - simple and natural
  partOf: { forward: 'partOf', reverse: 'parts' },
  childOf: { forward: 'parent', reverse: 'children' },
} as const

/**
 * Get predicate and reverse predicate for a relationship
 */
function getPredicate(key: keyof typeof PREDICATES) {
  return PREDICATES[key]
}

/**
 * Ingest Schema.org data
 */
async function ingestSchemaOrg() {
  console.log('\n📦 Ingesting Schema.org...')

  const things: NewThing[] = []
  const relationships: NewRelationship[] = []

  // Ingest Types
  const types = parseTSV(join(SOURCE_DIR, 'Schema.org/Schema.org.Types.tsv'))
  console.log(`  Found ${types.length} types`)

  const domain = NAMESPACE_DOMAINS['schema.org']

  for (const row of types) {
    const sourceId = row.id
    const label = row.label || sourceId
    const identifier = toTitleCase(label)
    const url = createURL(domain, 'Type', label)

    things.push({
      ns: domain,
      type: 'Type',
      id: identifier,
      name: label,
      code: sourceId,
      url,
      data: {
        comment: row.comment,
        layer: row.layer,
      },
      content: row.comment,
      meta: { source: 'Schema.org.Types' },
    })

    // Add subClassOf relationships
    if (row.subClassOf) {
      const parents = row.subClassOf.split(',').map(p => p.trim())
      const pred = getPredicate('subClassOf')
      for (const parent of parents) {
        const parentUrl = createURL(domain, 'Type', parent)
        relationships.push({
          from: url,
          predicate: pred.forward,
          reverse: pred.reverse,
          to: parentUrl,
          content: `${label} is a ${parent}`,
        })
      }
    }
  }

  // Ingest Properties
  const properties = parseTSV(join(SOURCE_DIR, 'Schema.org/Schema.org.Properties.tsv'))
  console.log(`  Found ${properties.length} properties`)

  for (const row of properties) {
    const sourceId = row.id
    const label = row.label || sourceId
    const identifier = toTitleCase(label)
    const url = createURL(domain, 'Property', label)

    things.push({
      ns: domain,
      type: 'Property',
      id: identifier,
      name: label,
      code: sourceId,
      url,
      data: {
        comment: row.comment,
        rangeIncludes: row.rangeIncludes,
      },
      content: row.comment,
      meta: { source: 'Schema.org.Properties' },
    })

    // Add domainIncludes relationships
    if (row.domainIncludes) {
      const domains = row.domainIncludes.split(',').map(d => d.trim())
      const pred = getPredicate('domainIncludes')
      for (const d of domains) {
        const domainUrl = createURL(domain, 'Type', d)
        relationships.push({
          from: url,
          predicate: pred.forward,
          reverse: pred.reverse,
          to: domainUrl,
          content: `${label} property has domain ${d}`,
        })
      }
    }

    // Add rangeIncludes relationships (if we add this to the mapping)
    if (row.rangeIncludes && PREDICATES.rangeIncludes) {
      const ranges = row.rangeIncludes.split(',').map(r => r.trim())
      const pred = getPredicate('rangeIncludes')
      for (const range of ranges) {
        const rangeUrl = createURL(domain, 'Type', range)
        relationships.push({
          from: url,
          predicate: pred.forward,
          reverse: pred.reverse,
          to: rangeUrl,
          content: `${label} property has range ${range}`,
        })
      }
    }
  }

  // Batch insert
  if (things.length > 0) {
    console.log(`  Inserting ${things.length} things...`)
    await storage.insertThings(things)
  }

  if (relationships.length > 0) {
    console.log(`  Inserting ${relationships.length} relationships...`)
    await storage.insertRelationships(relationships)
  }
}

/**
 * Helper function to process O*NET element-based files (Skills, Knowledge, Abilities, etc.)
 */
function processONETElements(
  rows: Record<string, string>[],
  elementType: string,
  predicateKey: keyof typeof PREDICATES,
  uniqueMap: Map<string, any>,
  relationships: NewRelationship[],
  sourceName: string,
  domain: string,
  occupationTitles: Map<string, string>
) {
  const pred = getPredicate(predicateKey)

  for (const row of rows) {
    const elementId = row.elementID || row['Element ID']
    const elementName = row.elementName || row['Element Name']
    const socCode = row.oNETSOCCode || row['O*NET-SOC Code']
    const dataValue = row.dataValue || row['Data Value']
    const scaleId = row.scaleID || row['Scale ID']

    if (!elementId || !socCode) continue

    // Create unique element
    if (!uniqueMap.has(elementId)) {
      const identifier = toTitleCase(elementName)
      const url = createURL(domain, elementType, elementName)

      uniqueMap.set(elementId, {
        ns: domain,
        type: elementType,
        id: identifier,
        name: elementName,
        code: elementId,
        url,
        data: {},
        content: elementName,
        meta: { source: sourceName },
      })
    }

    const occupationTitle = occupationTitles.get(socCode)
    const fromUrl = createURL(domain, 'Occupation', occupationTitle || socCode)
    const toUrl = createURL(domain, elementType, elementName)

    // Create relationship with predicate mapping and content
    relationships.push({
      from: fromUrl,
      predicate: pred.forward,
      reverse: pred.reverse,
      to: toUrl,
      data: { dataValue, scaleId },
      content: elementName,
    })
  }
}

/**
 * Ingest O*NET data - comprehensive version covering all major dimensions
 */
async function ingestONET() {
  console.log('\n📦 Ingesting O*NET...')

  const things: NewThing[] = []
  const relationships: NewRelationship[] = []

  // 1. Ingest Occupations and build title lookup map
  const occupations = parseTSV(join(SOURCE_DIR, 'ONET/ONET.OccupationData.tsv'))
  console.log(`  Found ${occupations.length} occupations`)

  const domain = NAMESPACE_DOMAINS['onet']
  const occupationTitles = new Map<string, string>()

  for (const row of occupations) {
    const socCode = row.oNETSOCCode || row['O*NET-SOC Code']
    const title = row.title || row.Title
    const description = row.description || row.Description

    if (!socCode) continue

    occupationTitles.set(socCode, title)

    const identifier = toTitleCase(title)
    const url = createURL(domain, 'Occupation', title)

    things.push({
      ns: domain,
      type: 'Occupation',
      id: identifier,
      name: title,
      code: socCode,
      url,
      data: { description },
      content: description,
      meta: { source: 'ONET.OccupationData' },
    })
  }

  // 2. Ingest Skills
  const skills = parseTSV(join(SOURCE_DIR, 'ONET/ONET.Skills.tsv'))
  console.log(`  Found ${skills.length} skill entries`)
  const uniqueSkills = new Map<string, any>()
  processONETElements(skills, 'Skill', 'requiresSkill', uniqueSkills, relationships, 'ONET.Skills', domain, occupationTitles)
  things.push(...Array.from(uniqueSkills.values()))

  // 3. Ingest Knowledge
  const knowledge = parseTSV(join(SOURCE_DIR, 'ONET/ONET.Knowledge.tsv'))
  console.log(`  Found ${knowledge.length} knowledge entries`)
  const uniqueKnowledge = new Map<string, any>()
  processONETElements(knowledge, 'Knowledge', 'requiresKnowledge', uniqueKnowledge, relationships, 'ONET.Knowledge', domain, occupationTitles)
  things.push(...Array.from(uniqueKnowledge.values()))

  // 4. Ingest Abilities
  const abilities = parseTSV(join(SOURCE_DIR, 'ONET/ONET.Abilities.tsv'))
  console.log(`  Found ${abilities.length} ability entries`)
  const uniqueAbilities = new Map<string, any>()
  processONETElements(abilities, 'Ability', 'requiresAbility', uniqueAbilities, relationships, 'ONET.Abilities', domain, occupationTitles)
  things.push(...Array.from(uniqueAbilities.values()))

  // 5. Ingest Work Activities
  const workActivities = parseTSV(join(SOURCE_DIR, 'ONET/ONET.WorkActivities.tsv'))
  console.log(`  Found ${workActivities.length} work activity entries`)
  const uniqueWorkActivities = new Map<string, any>()
  processONETElements(workActivities, 'WorkActivity', 'involvesActivity', uniqueWorkActivities, relationships, 'ONET.WorkActivities', domain, occupationTitles)
  things.push(...Array.from(uniqueWorkActivities.values()))

  // 6. Ingest Work Context
  const workContext = parseTSV(join(SOURCE_DIR, 'ONET/ONET.WorkContext.tsv'))
  console.log(`  Found ${workContext.length} work context entries`)
  const uniqueWorkContext = new Map<string, any>()
  processONETElements(workContext, 'WorkContext', 'hasContext', uniqueWorkContext, relationships, 'ONET.WorkContext', domain, occupationTitles)
  things.push(...Array.from(uniqueWorkContext.values()))

  // 7. Ingest Work Styles
  const workStyles = parseTSV(join(SOURCE_DIR, 'ONET/ONET.WorkStyles.tsv'))
  console.log(`  Found ${workStyles.length} work style entries`)
  const uniqueWorkStyles = new Map<string, any>()
  processONETElements(workStyles, 'WorkStyle', 'requiresStyle', uniqueWorkStyles, relationships, 'ONET.WorkStyles', domain, occupationTitles)
  things.push(...Array.from(uniqueWorkStyles.values()))

  // 8. Ingest Work Values
  const workValues = parseTSV(join(SOURCE_DIR, 'ONET/ONET.WorkValues.tsv'))
  console.log(`  Found ${workValues.length} work value entries`)
  const uniqueWorkValues = new Map<string, any>()
  processONETElements(workValues, 'WorkValue', 'valuesWork', uniqueWorkValues, relationships, 'ONET.WorkValues', domain, occupationTitles)
  things.push(...Array.from(uniqueWorkValues.values()))

  // 9. Ingest Interests
  const interests = parseTSV(join(SOURCE_DIR, 'ONET/ONET.Interests.tsv'))
  console.log(`  Found ${interests.length} interest entries`)
  const uniqueInterests = new Map<string, any>()
  processONETElements(interests, 'Interest', 'alignsWithInterest', uniqueInterests, relationships, 'ONET.Interests', domain, occupationTitles)
  things.push(...Array.from(uniqueInterests.values()))

  // 10. Ingest Tasks
  const taskRatings = parseTSV(join(SOURCE_DIR, 'ONET/ONET.TaskRatings.tsv'))
  console.log(`  Found ${taskRatings.length} task ratings`)
  // Tasks use Task ID instead of Element ID
  const uniqueTasks = new Map<string, any>()
  for (const row of taskRatings) {
    const taskId = row.taskID || row['Task ID']
    const task = row.task || row.Task
    const socCode = row.oNETSOCCode || row['O*NET-SOC Code']

    if (!taskId || !socCode || !task) continue

    if (!uniqueTasks.has(taskId)) {
      const identifier = toTitleCase(task)
      const url = createURL(domain, 'Task', task)

      uniqueTasks.set(taskId, {
        ns: domain,
        type: 'Task',
        id: identifier,
        name: task,
        code: taskId,
        url,
        data: {},
        content: task,
        meta: { source: 'ONET.TaskRatings' },
      })
    }

    const pred = getPredicate('performsTask')
    const occupationTitle = occupationTitles.get(socCode)
    const fromUrl = createURL(domain, 'Occupation', occupationTitle || socCode)
    const toUrl = createURL(domain, 'Task', task)

    relationships.push({
      from: fromUrl,
      predicate: pred.forward,
      reverse: pred.reverse,
      to: toUrl,
      content: task,
    })
  }
  things.push(...Array.from(uniqueTasks.values()))

  // 11. Ingest Technology Skills
  const techSkills = parseTSV(join(SOURCE_DIR, 'ONET/ONET.TechnologySkills.tsv'))
  console.log(`  Found ${techSkills.length} technology skills`)
  const uniqueTechSkills = new Map<string, any>()
  for (const row of techSkills) {
    const commodityCode = row.commodityCode || row['Commodity Code']
    const commodityTitle = row.commodityTitle || row['Commodity Title']
    const socCode = row.oNETSOCCode || row['O*NET-SOC Code']

    if (!commodityCode || !socCode) continue

    if (!uniqueTechSkills.has(commodityCode)) {
      const identifier = toTitleCase(commodityTitle)
      const url = createURL(domain, 'Technology', commodityTitle)

      uniqueTechSkills.set(commodityCode, {
        ns: domain,
        type: 'Technology',
        id: identifier,
        name: commodityTitle,
        code: commodityCode,
        url,
        data: {},
        content: commodityTitle,
        meta: { source: 'ONET.TechnologySkills' },
      })
    }

    const pred = getPredicate('usesTechnology')
    const occupationTitle = occupationTitles.get(socCode)
    const fromUrl = createURL(domain, 'Occupation', occupationTitle || socCode)
    const toUrl = createURL(domain, 'Technology', commodityTitle)

    relationships.push({
      from: fromUrl,
      predicate: pred.forward,
      reverse: pred.reverse,
      to: toUrl,
      content: commodityTitle,
    })
  }
  things.push(...Array.from(uniqueTechSkills.values()))

  // 12. Ingest Tools
  const tools = parseTSV(join(SOURCE_DIR, 'ONET/ONET.ToolsUsed.tsv'))
  console.log(`  Found ${tools.length} tools`)
  const uniqueTools = new Map<string, any>()
  for (const row of tools) {
    const commodityCode = row.commodityCode || row['Commodity Code']
    const commodityTitle = row.commodityTitle || row['Commodity Title']
    const socCode = row.oNETSOCCode || row['O*NET-SOC Code']

    if (!commodityCode || !socCode) continue

    if (!uniqueTools.has(commodityCode)) {
      const identifier = toTitleCase(commodityTitle)
      const url = createURL(domain, 'Tool', commodityTitle)

      uniqueTools.set(commodityCode, {
        ns: domain,
        type: 'Tool',
        id: identifier,
        name: commodityTitle,
        code: commodityCode,
        url,
        data: {},
        content: commodityTitle,
        meta: { source: 'ONET.ToolsUsed' },
      })
    }

    const pred = getPredicate('usesTool')
    const occupationTitle = occupationTitles.get(socCode)
    const fromUrl = createURL(domain, 'Occupation', occupationTitle || socCode)
    const toUrl = createURL(domain, 'Tool', commodityTitle)

    relationships.push({
      from: fromUrl,
      predicate: pred.forward,
      reverse: pred.reverse,
      to: toUrl,
      content: commodityTitle,
    })
  }
  things.push(...Array.from(uniqueTools.values()))

  console.log(`\n  Total unique O*NET things: ${things.length.toLocaleString()}`)
  console.log(`  Total O*NET relationships: ${relationships.length.toLocaleString()}`)

  // Batch insert in chunks - ClickHouse can handle large batches efficiently
  const CHUNK_SIZE = 100000

  for (let i = 0; i < things.length; i += CHUNK_SIZE) {
    const chunk = things.slice(i, i + CHUNK_SIZE)
    console.log(`  Inserting things ${i + 1}-${Math.min(i + CHUNK_SIZE, things.length)}...`)
    await storage.insertThings(chunk)
  }

  for (let i = 0; i < relationships.length; i += CHUNK_SIZE) {
    const chunk = relationships.slice(i, i + CHUNK_SIZE)
    console.log(`  Inserting relationships ${i + 1}-${Math.min(i + CHUNK_SIZE, relationships.length)}...`)
    await storage.insertRelationships(chunk)
  }
}

/**
 * Ingest UNSPSC data
 */
async function ingestUNSPSC() {
  console.log('\n📦 Ingesting UNSPSC...')

  const things: NewThing[] = []
  const relationships: NewRelationship[] = []

  const codes = parseTSV(join(SOURCE_DIR, 'UNSPSC/UNSPSC.Codes.tsv'))
  console.log(`  Found ${codes.length} codes`)

  const domain = NAMESPACE_DOMAINS['unspsc']
  const codeMap = new Map<string, any>()

  for (const row of codes) {
    const segmentCode = row.segmentCode
    const segmentTitle = row.segmentTitle
    const familyCode = row.familyCode
    const familyTitle = row.familyTitle
    const classCode = row.classCode
    const classTitle = row.classTitle
    const commodityCode = row.commodityCode
    const commodityTitle = row.commodityTitle
    const definition = row.definition

    // Add segment
    if (segmentCode && segmentTitle && !codeMap.has(segmentCode)) {
      const identifier = toTitleCase(segmentTitle)
      const url = createURL(domain, 'Segment', segmentTitle)

      codeMap.set(segmentCode, {
        ns: domain,
        type: 'Segment',
        id: identifier,
        name: segmentTitle,
        code: segmentCode,
        url,
        data: {},
        content: segmentTitle,
        meta: { source: 'UNSPSC.Codes', level: 'segment' },
      })
    }

    // Add family
    if (familyCode && familyTitle && !codeMap.has(familyCode)) {
      const identifier = toTitleCase(familyTitle)
      const url = createURL(domain, 'Family', familyTitle)

      codeMap.set(familyCode, {
        ns: domain,
        type: 'Family',
        id: identifier,
        name: familyTitle,
        code: familyCode,
        url,
        data: {},
        content: familyTitle,
        meta: { source: 'UNSPSC.Codes', level: 'family' },
      })

      // Create family -> segment relationship
      if (segmentCode) {
        const pred = getPredicate('partOf')
        const fromUrl = createURL(domain, 'Family', familyTitle)
        const toUrl = createURL(domain, 'Segment', segmentTitle)

        relationships.push({
          from: fromUrl,
          predicate: pred.forward,
          reverse: pred.reverse,
          to: toUrl,
          content: `${familyTitle} is part of ${segmentTitle}`,
        })
      }
    }

    // Add class
    if (classCode && classTitle && !codeMap.has(classCode)) {
      const identifier = toTitleCase(classTitle)
      const url = createURL(domain, 'Class', classTitle)

      codeMap.set(classCode, {
        ns: domain,
        type: 'Class',
        id: identifier,
        name: classTitle,
        code: classCode,
        url,
        data: {},
        content: classTitle,
        meta: { source: 'UNSPSC.Codes', level: 'class' },
      })

      // Create class -> family relationship
      if (familyCode) {
        const pred = getPredicate('partOf')
        const fromUrl = createURL(domain, 'Class', classTitle)
        const toUrl = createURL(domain, 'Family', familyTitle)

        relationships.push({
          from: fromUrl,
          predicate: pred.forward,
          reverse: pred.reverse,
          to: toUrl,
          content: `${classTitle} is part of ${familyTitle}`,
        })
      }
    }

    // Add commodity
    if (commodityCode && commodityTitle) {
      const commodityId = `${commodityCode}`

      if (!codeMap.has(commodityId)) {
        const identifier = toTitleCase(commodityTitle)
        const url = createURL(domain, 'Commodity', commodityTitle)

        codeMap.set(commodityId, {
          ns: domain,
          type: 'Commodity',
          id: identifier,
          name: commodityTitle,
          code: commodityCode,
          url,
          data: { definition },
          content: definition ? `${commodityTitle}\n${definition}` : commodityTitle,
          meta: { source: 'UNSPSC.Codes', level: 'commodity' },
        })

        // Create commodity -> class relationship
        if (classCode) {
          const pred = getPredicate('partOf')
          const fromUrl = createURL(domain, 'Commodity', commodityTitle)
          const toUrl = createURL(domain, 'Class', classTitle)

          relationships.push({
            from: fromUrl,
            predicate: pred.forward,
            reverse: pred.reverse,
            to: toUrl,
            content: `${commodityTitle} is part of ${classTitle}`,
          })
        }
      }
    }
  }

  // Add all codes to things array (avoid spread operator for large arrays)
  for (const thing of codeMap.values()) {
    things.push(thing)
  }

  // Batch insert
  const CHUNK_SIZE = 1000

  for (let i = 0; i < things.length; i += CHUNK_SIZE) {
    const chunk = things.slice(i, i + CHUNK_SIZE)
    console.log(`  Inserting things ${i + 1}-${Math.min(i + CHUNK_SIZE, things.length)}...`)
    await storage.insertThings(chunk)
  }

  for (let i = 0; i < relationships.length; i += CHUNK_SIZE) {
    const chunk = relationships.slice(i, i + CHUNK_SIZE)
    console.log(`  Inserting relationships ${i + 1}-${Math.min(i + CHUNK_SIZE, relationships.length)}...`)
    await storage.insertRelationships(chunk)
  }
}

/**
 * Ingest APQC data
 */
async function ingestAPQC() {
  console.log('\n📦 Ingesting APQC...')

  const things: NewThing[] = []
  const relationships: NewRelationship[] = []

  // Ingest Processes
  const processes = parseTSV(join(SOURCE_DIR, 'APQC/APQC.Processes.tsv'))
  console.log(`  Found ${processes.length} processes`)

  const domain = NAMESPACE_DOMAINS['apqc']
  const processNames = new Map<string, string>()

  for (const row of processes) {
    const pcfId = row.pcfId || row.ID
    const hierarchyId = row.hierarchyId || row['Hierarchy ID']
    const name = row.name || row.Name
    const description = row.description || row.Description
    const level = row.level || row.Level
    const category = row.category || row.Category
    const parent = row.parent || row['Parent ID']

    if (!pcfId) continue

    processNames.set(pcfId, name)

    const identifier = toTitleCase(name)
    const url = createURL(domain, 'Process', name)

    const digitalScore = lookupDigitalScore(pcfId)

    things.push({
      ns: domain,
      type: 'Process',
      id: identifier,
      name,
      code: pcfId,
      url,
      data: {
        hierarchyId,
        description,
        level,
        category,
        ...(digitalScore !== null && { digital: digitalScore }),
      },
      content: description || name,
      meta: { source: 'APQC.Processes' },
    })

    // Create parent-child relationships
    if (parent) {
      const pred = getPredicate('childOf')
      const parentName = processNames.get(parent) || parent
      const parentUrl = createURL(domain, 'Process', parentName)

      relationships.push({
        from: url,
        predicate: pred.forward,
        reverse: pred.reverse,
        to: parentUrl,
        content: `${name} is a child of ${parentName}`,
      })
    }
  }

  // Batch insert
  if (things.length > 0) {
    console.log(`  Inserting ${things.length} things...`)
    await storage.insertThings(things)
  }

  if (relationships.length > 0) {
    console.log(`  Inserting ${relationships.length} relationships...`)
    await storage.insertRelationships(relationships)
  }
}

/**
 * Ingest Models data
 */
async function ingestModels() {
  console.log('\n📦 Ingesting Models...')

  const things: NewThing[] = []

  const models = parseTSV(join(SOURCE_DIR, 'Models/Models.tsv'))
  console.log(`  Found ${models.length} models`)

  const domain = NAMESPACE_DOMAINS['model']

  for (const row of models) {
    const modelId = row.id
    const modelName = row.name
    const identifier = toTitleCase(modelName)
    const url = createURL(domain, 'Model', modelName)

    things.push({
      ns: domain,
      type: 'LLM',
      id: identifier,
      name: modelName,
      code: modelId,
      url,
      data: {
        created: row.created,
        description: row.description,
        contextLength: row.context_length,
        pricing: {
          prompt: row.pricing_prompt,
          completion: row.pricing_completion,
        },
      },
      content: row.description,
      meta: { source: 'Model' },
    })
  }

  if (things.length > 0) {
    console.log(`  Inserting ${things.length} things...`)
    await storage.insertThings(things)
  }
}

/**
 * Main ingestion function
 */
async function main() {
  console.log('🚀 Starting database ingestion...')

  const startTime = Date.now()

  try {
    await ingestSchemaOrg()
    await ingestONET()
    await ingestUNSPSC()
    await ingestAPQC()
    await ingestModels()

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`\n✅ Database ingestion complete in ${duration}s!`)

    // Statistics are tracked per-ingestion function
    console.log(`\n📊 Data successfully loaded into ${storageBackend}`)

  } catch (error) {
    console.error('❌ Error during ingestion:', error)
    process.exit(1)
  }
}

main()

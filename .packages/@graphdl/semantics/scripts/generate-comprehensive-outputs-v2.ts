#!/usr/bin/env tsx
import { GraphDLParser } from '../dist/parser.js'
import fs from 'fs'
import path from 'path'

/**
 * Convert entity names (occupations, industries) to CamelCase without dots
 * Returns an array to handle conjunctions (e.g., "Accountants and Auditors" → ["Accountants", "Auditors"])
 * Example: "Chief Executives" → ["ChiefExecutives"]
 * Example: "Accountants and Auditors" → ["Accountants", "Auditors"]
 */
function toEntityTypes(text: string, parser: GraphDLParser, shortNames?: Map<string, string>): string[] {
  // Check shortNames first for exact match
  if (shortNames) {
    const shortName = shortNames.get(text)
    if (shortName) {
      return [shortName]
    }
  }

  // Check for "including X" or "except X" clauses - handle separately
  const includingMatch = text.match(/^(.+?),?\s+(including|except)\s+(.+)$/i)
  if (includingMatch) {
    const [, main, modifier, addendum] = includingMatch
    // Process main part and addendum separately
    const mainEntities = toEntityTypes(main.trim(), parser, shortNames)
    const addendumEntities = toEntityTypes(addendum.trim(), parser, shortNames)
    return [...mainEntities, ...addendumEntities]
  }

  // Check for comma-separated lists: "A, B, and C Suffix"
  // Pattern: "X, Y, and Z something" where "something" is shared
  const commaListMatch = text.match(/^(.+),\s*(.+?),?\s+(and|or)\s+(.+)$/i)
  if (commaListMatch) {
    const [, first, middle, conj, last] = commaListMatch
    // Check if last has a suffix that should be distributed
    const lastWords = last.trim().split(/\s+/)
    if (lastWords.length > 1) {
      // Assume the last word is the shared suffix
      const suffix = lastWords.slice(1).join(' ')
      const lastPrefix = lastWords[0]

      // Recursively process all parts with suffix
      const firstEntities = toEntityTypes(`${first.trim()} ${suffix}`.trim(), parser, shortNames)
      const middleItems = middle.split(',').map(m => m.trim()).filter(m => m)
      const middleEntities = middleItems.flatMap(m => toEntityTypes(`${m} ${suffix}`.trim(), parser, shortNames))
      const lastEntities = toEntityTypes(last.trim(), parser, shortNames)

      return [...firstEntities, ...middleEntities, ...lastEntities]
    }
  }

  // Check for " and " or " or " conjunctions with shared suffix
  // Pattern: "X and Y something" where "something" is shared
  const sharedSuffixMatch = text.match(/^(.+?)\s+(and|or)\s+([^\s,]+)\s+(.+)$/i)
  if (sharedSuffixMatch) {
    const [, left, conj, middle, suffix] = sharedSuffixMatch
    // Recursively process left and middle with suffix appended
    const leftEntities = toEntityTypes(`${left} ${suffix}`.trim(), parser, shortNames)
    const middleEntities = toEntityTypes(`${middle} ${suffix}`.trim(), parser, shortNames)
    return [...leftEntities, ...middleEntities]
  }

  // Check for simple " and " or " or " conjunctions (no shared suffix)
  const simpleMatch = text.match(/^(.+?)\s+(and|or)\s+(.+)$/i)
  if (simpleMatch) {
    const [, left, conj, right] = simpleMatch
    // Recursively process each side
    const leftEntities = toEntityTypes(left.trim(), parser, shortNames)
    const rightEntities = toEntityTypes(right.trim(), parser, shortNames)
    return [...leftEntities, ...rightEntities]
  }

  // Simple conversion for non-conjunction cases
  // Remove commas and split on whitespace, hyphens, slashes, etc
  const tokens = text.replace(/,/g, '').split(/[\s\-\/;:()]+/).filter(t => t.trim())

  const processed = tokens.map(t => {
    // If it's already CamelCase (has internal capitals), preserve it
    if (/^[A-Z][a-z]+[A-Z]/.test(t)) {
      return t
    }
    // Otherwise capitalize first letter only
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
  })

  return [processed.join('')]
}

/**
 * Convert text to proper CamelCase for GraphDL objects/complements
 * Handles multi-word phrases by capitalizing each word and joining with dots
 * Preserves concepts in their CamelCase form
 */
function toCamelCase(text: string, conceptIndex: Map<string, any>, shortNames?: Map<string, string>): string {
  // Check shortNames first for exact match
  if (shortNames) {
    const shortName = shortNames.get(text)
    if (shortName) {
      return shortName
    }
  }

  // First replace concepts with placeholders
  let normalized = text
  const concepts = Array.from(conceptIndex.entries())
    .sort((a, b) => b[0].length - a[0].length)

  const conceptPlaceholders: Array<{placeholder: string, id: string}> = []
  for (const [phrase, entry] of concepts) {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    const placeholder = `__CONCEPT_${conceptPlaceholders.length}__`
    const beforeReplace = normalized
    normalized = normalized.replace(regex, ` ${placeholder} `)
    if (normalized !== beforeReplace) {
      conceptPlaceholders.push({placeholder, id: entry.id})
    }
  }

  // Split and capitalize each word, then join (but preserve concept placeholders and existing CamelCase)
  const tokens = normalized.split(/[\s\-\/,;:()]+/).filter(t => t.trim())

  // Articles and common lowercase words
  const lowercaseWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'nor', 'for', 'so', 'yet',
                                   'to', 'from', 'with', 'without', 'in', 'on', 'at', 'by', 'of'])

  const processed = tokens.map(t => {
    // If it's a concept placeholder, it will be replaced later
    if (t.startsWith('__CONCEPT_')) {
      return t
    }
    // If it's already CamelCase (has internal capitals), preserve it as a concept
    if (/^[A-Z][a-z]+[A-Z]/.test(t)) {
      return t
    }
    // Keep articles and common words lowercase
    if (lowercaseWords.has(t.toLowerCase())) {
      return t.toLowerCase()
    }
    // Otherwise capitalize first letter only
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
  })

  // Join with dots and replace concept placeholders with actual concept IDs
  let result = processed.join('.')
  for (const {placeholder, id} of conceptPlaceholders) {
    result = result.replace(placeholder, id)
  }

  return result
}

/**
 * Convert NAICS industry name to plural entity form for GraphDL
 * Examples:
 *   "Soybean Farming" → "SoybeanFarms"
 *   "Hair Salons" → "HairSalons"
 *   "Computer Systems Design and Related Services" → "ComputerSystemsDesignAndRelatedServices"
 */
function naicsToEntityType(naicsName: string): string {
  // Remove common suffixes and convert to CamelCase
  let normalized = naicsName
    .replace(/\s+Manufacturing$/i, '')
    .replace(/\s+Services$/i, '')

  const tokens = normalized.split(/[\s\-\/,]+/).filter(t => t.trim())
  const camelCase = tokens.map(t =>
    t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
  ).join('')

  // Pluralize if needed (simple heuristic)
  if (!camelCase.endsWith('s') && !camelCase.endsWith('S')) {
    return camelCase + 's'
  }

  return camelCase
}

/**
 * Get ShortNames for industries and occupations
 */
function loadShortNames(): Map<string, string> {
  const shortNames = new Map<string, string>()

  // NAICS Sector short names (2-digit codes)
  shortNames.set('Agriculture, Forestry, Fishing and Hunting', 'Agriculture')
  shortNames.set('Mining, Quarrying, and Oil and Gas Extraction', 'Mining')
  shortNames.set('Professional, Scientific, and Technical Services', 'ProfessionalServices')
  shortNames.set('Management of Companies and Enterprises', 'Management')
  shortNames.set('Administrative and Support and Waste Management and Remediation Services', 'AdministrativeServices')
  shortNames.set('Health Care and Social Assistance', 'Healthcare')
  shortNames.set('Arts, Entertainment, and Recreation', 'Entertainment')
  shortNames.set('Accommodation and Food Services', 'Hospitality')
  shortNames.set('Other Services (except Public Administration)', 'OtherServices')
  shortNames.set('Real Estate and Rental and Leasing', 'RealEstate')
  shortNames.set('Finance and Insurance', 'Finance')

  // ONET Occupation short names
  shortNames.set('Adult Basic Education, Adult Secondary Education, and English as a Second Language Instructors', 'ESLInstructors')
  shortNames.set('Extruding and Forming Machine Setters, Operators, and Tenders, Synthetic and Glass Fibers', 'ExtrudingMachineOperators')
  shortNames.set('Teaching Assistants, Preschool, Elementary, Middle, and Secondary School, Except Special Education', 'TeachingAssistants')
  shortNames.set('Foreign Language and Literature Teachers, Postsecondary', 'ForeignLanguageTeachers')
  shortNames.set('Environmental Scientists and Specialists, Including Health', 'EnvironmentalScientists')
  shortNames.set('Electrical and Electronics Repairers, Commercial and Industrial Equipment', 'ElectricalRepairers')
  shortNames.set('Janitors and Cleaners, Except Maids and Housekeeping Cleaners', 'Janitors')

  // APQC Industry short names
  shortNames.set('petroleum-downstream', 'Refineries')
  shortNames.set('petroleum-upstream', 'OilProducers')
  shortNames.set('aerospace-and-defense', 'AerospaceCompanies')
  shortNames.set('consumer-electronics', 'ElectronicsCompanies')
  shortNames.set('property-and-casualty-insurance', 'PropertyInsurers')
  shortNames.set('health-insurance', 'HealthInsurers')
  shortNames.set('healthcare-provider', 'Hospitals')
  shortNames.set('city-government', 'Municipalities')
  shortNames.set('life-sciences', 'BiotechCompanies')
  shortNames.set('education', 'Schools')

  return shortNames
}

/**
 * Convert APQC industry name to plural entity form
 */
function apqcIndustryToEntityType(industryId: string, shortNames: Map<string, string>): string {
  // Check ShortNames first
  const shortName = shortNames.get(industryId)
  if (shortName) {
    return shortName
  }

  if (industryId === 'cross-industry') {
    return 'Companies'
  }

  // Default fallback map
  const industryMap: Record<string, string> = {
    'aerospace-and-defense': 'AerospaceCompanies',
    'airline': 'Airlines',
    'automotive': 'AutomotiveCompanies',
    'banking': 'Banks',
    'broadcasting': 'Broadcasters',
    'education': 'Schools',
    'city-government': 'Municipalities',
    'life-sciences': 'BiotechCompanies',
    'consumer-electronics': 'ElectronicsCompanies',
    'petroleum-downstream': 'Refineries',
    'petroleum-upstream': 'OilProducers',
    'healthcare-provider': 'Hospitals',
    'property-and-casualty-insurance': 'PropertyInsurers',
    'health-insurance': 'HealthInsurers',
    'utilities': 'Utilities',
    'retail': 'Retailers',
    'consumer-products': 'ConsumerProductsCompanies'
  }

  return industryMap[industryId] || 'Companies'
}

async function main() {
  const parser = new GraphDLParser()
  await parser.initialize()

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const outputDir = path.join(repoRoot, '.data')

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const conceptIndex = (parser as any).lexicon.concepts
  const verbIndex = (parser as any).lexicon.verbs
  const shortNames = loadShortNames()

  console.log('='.repeat(100))
  console.log('COMPREHENSIVE GRAPHDL GENERATION v2')
  console.log('='.repeat(100))
  console.log()

  // STEP 0: Copy Lexicons to .data
  console.log('STEP 0: Copying Lexicons...')

  // Copy Concepts
  const conceptsSourcePath = path.join(repoRoot, '.packages/@graphdl/semantics/lexicons/Business.Concepts.tsv')
  const conceptsDestPath = path.join(outputDir, 'Concepts.tsv')
  const conceptsContent = fs.readFileSync(conceptsSourcePath, 'utf-8')
  fs.writeFileSync(conceptsDestPath, conceptsContent)
  const conceptLines = conceptsContent.split('\n').slice(1).filter(l => l.trim())
  console.log(`  ✓ Copied ${conceptLines.length} concepts to ${conceptsDestPath}`)

  // Copy Verbs
  const verbsSourcePath = path.join(repoRoot, '.enrichment/Language/Language.Verbs.tsv')
  const verbsDestPath = path.join(outputDir, 'Verbs.tsv')
  const verbsContent = fs.readFileSync(verbsSourcePath, 'utf-8')
  fs.writeFileSync(verbsDestPath, verbsContent)
  const verbLines = verbsContent.split('\n').slice(1).filter(l => l.trim())
  console.log(`  ✓ Copied ${verbLines.length} verbs to ${verbsDestPath}`)

  // STEP 1: Parse NAICS Industries and generate expanded entities
  console.log('STEP 1: Parsing NAICS Industries...')
  const naicsPath = path.join(repoRoot, '.source/NAICS/NAICS.Industries.tsv')
  const naicsContent = fs.readFileSync(naicsPath, 'utf-8')
  const naicsLines = naicsContent.split('\n').slice(1)

  const industries = new Map<string, { code: string; title: string; entityType: string; entityTypes: string[] }>()
  const expandedIndustries: Array<{ code: string; title: string; description: string; entityType: string }> = []
  for (const line of naicsLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const code = cols[1] // 2022NAICSCode
    let title = cols[2] // 2022NAICSTitle
    if (!code || !title) continue

    // Clean title: remove trailing T and extra spaces
    title = title.replace(/T\s*$/, '').trim()

    // Handle "(except X)" patterns: "Oilseed (except Soybean) Farming" → "Oilseed Farming" (without Soybean)
    let cleanTitle = title
    let exceptClause = ''
    const exceptMatch = title.match(/^(.+?)\s*\(except\s+(.+?)\)\s*(.*)$/i)
    if (exceptMatch) {
      const [, before, exception, after] = exceptMatch
      cleanTitle = `${before} ${after}`.trim()
      exceptClause = exception
    }

    const entityTypes = toEntityTypes(cleanTitle, parser, shortNames)
    const entityType = naicsToEntityType(cleanTitle)
    industries.set(code, { code, title: cleanTitle, entityType, entityTypes })

    // Add each expanded entity type
    for (const et of entityTypes) {
      const description = exceptClause
        ? `${cleanTitle} (excluding ${exceptClause})`
        : cleanTitle
      expandedIndustries.push({ code, title: cleanTitle, description, entityType: et })
    }
  }
  console.log(`  ✓ Loaded ${industries.size} NAICS industries`)
  console.log(`  ✓ Expanded to ${expandedIndustries.length} industry entities`)

  // Write Industries output
  const industriesTsvHeaders = ['id', 'name', 'description', 'code', 'type']
  const industriesTsvRows = expandedIndustries.map(i =>
    [i.entityType, i.title, i.description, i.code, 'Industry'].join('\t')
  )
  const industriesTsv = [industriesTsvHeaders.join('\t'), ...industriesTsvRows].join('\n')
  const industriesOutputPath = path.join(outputDir, 'Industries.tsv')
  fs.writeFileSync(industriesOutputPath, industriesTsv)
  console.log(`  ✓ Wrote ${industriesOutputPath}`)

  // STEP 2: Parse APQC Processes (ALL industries)
  console.log('\nSTEP 2: Parsing APQC Processes...')
  const apqcProcessesPath = path.join(repoRoot, '.source/APQC/APQC.Processes.tsv')
  const apqcContent = fs.readFileSync(apqcProcessesPath, 'utf-8')
  const apqcLines = apqcContent.split('\n').slice(1)

  const apqcProcesses: Array<{
    id: string
    pcfId: string
    hierarchyId: string
    name: string
    industry: string
  }> = []

  let processedCount = 0
  for (const line of apqcLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const pcfId = cols[0]
    const hierarchyId = cols[1]
    const name = cols[2]
    const industry = cols[4]  // industry column
    if (!pcfId || !name || !industry) continue

    try {
      const parsed = parser.parse(name.trim())
      const entityPrefix = apqcIndustryToEntityType(industry, shortNames)

      // Build expanded GraphDL - each expansion becomes a separate row
      if (parsed.expansions && parsed.expansions.length > 0) {
        for (const exp of parsed.expansions) {
          const parts: string[] = [entityPrefix]
          if (exp.predicate) parts.push(exp.predicate.toLowerCase())
          if (exp.object) parts.push(toCamelCase(exp.object, conceptIndex, shortNames))
          if (exp.preposition && exp.preposition !== 'undefined') parts.push(exp.preposition.toLowerCase())
          if (exp.complement && exp.complement !== 'undefined') {
            parts.push(toCamelCase(exp.complement, conceptIndex, shortNames))
          }
          const id = parts.join('.')
          apqcProcesses.push({ id, pcfId, hierarchyId, name: name.trim(), industry })
          processedCount++
        }
      } else {
        const parts: string[] = [entityPrefix]
        if (parsed.predicate) parts.push(parsed.predicate.toLowerCase())
        if (parsed.object) parts.push(toCamelCase(parsed.object, conceptIndex, shortNames))
        if (parsed.preposition && parsed.preposition !== 'undefined') parts.push(parsed.preposition.toLowerCase())
        if (parsed.complement && parsed.complement !== 'undefined') {
          parts.push(toCamelCase(parsed.complement, conceptIndex, shortNames))
        }
        const id = parts.join('.')
        apqcProcesses.push({ id, pcfId, hierarchyId, name: name.trim(), industry })
        processedCount++
      }
    } catch (err) {
      // Skip parse errors
    }
  }
  console.log(`  ✓ Loaded ${processedCount} APQC process expansions across all industries`)

  // Write APQC output
  const apqcTsvHeaders = ['id', 'pcfId', 'hierarchyId', 'name', 'industry']
  const apqcTsvRows = apqcProcesses.map(p =>
    [p.id, p.pcfId, p.hierarchyId, p.name, p.industry].join('\t')
  )
  const apqcTsv = [apqcTsvHeaders.join('\t'), ...apqcTsvRows].join('\n')
  const apqcOutputPath = path.join(outputDir, 'Processes.tsv')
  fs.writeFileSync(apqcOutputPath, apqcTsv)
  console.log(`  ✓ Wrote ${apqcOutputPath}`)

  // STEP 3: Parse ONET Task Statements (ALL 18,797 tasks)
  console.log('\nSTEP 3: Parsing ONET Task Statements...')
  const onetTasksPath = path.join(repoRoot, '.source/ONET/ONET.TaskStatements.tsv')
  const onetContent = fs.readFileSync(onetTasksPath, 'utf-8')
  const onetLines = onetContent.split('\n').slice(1)

  // Load occupation data for names and generate expanded entities
  const occupationsPath = path.join(repoRoot, '.source/ONET/ONET.OccupationData.tsv')
  const occupationsContent = fs.readFileSync(occupationsPath, 'utf-8')
  const occupationsLines = occupationsContent.split('\n').slice(1)
  const occupations = new Map<string, string>()
  const expandedOccupations: Array<{ code: string; title: string; description: string; entityType: string }> = []

  for (const line of occupationsLines) {
    if (!line.trim()) continue
    const [code, title] = line.split('\t')
    if (code && title) {
      occupations.set(code, title)

      // Expand occupation titles with conjunctions
      const entityTypes = toEntityTypes(title, parser, shortNames)
      for (const et of entityTypes) {
        expandedOccupations.push({ code, title, description: title, entityType: et })
      }
    }
  }
  console.log(`  ✓ Loaded ${occupations.size} occupation titles`)
  console.log(`  ✓ Expanded to ${expandedOccupations.length} occupation entities`)

  // Write Occupations output
  const occupationsTsvHeaders = ['id', 'name', 'description', 'code', 'type']
  const occupationsTsvRows = expandedOccupations.map(o =>
    [o.entityType, o.title, o.description, o.code, 'Occupation'].join('\t')
  )
  const occupationsTsv = [occupationsTsvHeaders.join('\t'), ...occupationsTsvRows].join('\n')
  const occupationsOutputPath = path.join(outputDir, 'Occupations.tsv')
  fs.writeFileSync(occupationsOutputPath, occupationsTsv)
  console.log(`  ✓ Wrote ${occupationsOutputPath}`)

  const onetTasks: Array<{
    id: string
    onetCode: string
    taskId: string
    task: string
    occupationTitle: string
  }> = []

  let taskProcessedCount = 0
  for (const line of onetLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const onetCode = cols[0]
    const taskId = cols[1]
    const task = cols[2]
    if (!onetCode || !taskId || !task) continue

    const occupationTitle = occupations.get(onetCode) || 'Unknown'

    try {
      const parsed = parser.parse(task.trim())

      // Parse occupation title to handle conjunctions (e.g., "Accountants and Auditors" → ["Accountants", "Auditors"])
      const occupationEntities = toEntityTypes(occupationTitle, parser, shortNames)

      // Create cartesian product: each occupation entity × each task expansion
      for (const occupationEntity of occupationEntities) {
        if (parsed.expansions && parsed.expansions.length > 0) {
          for (const exp of parsed.expansions) {
            const parts: string[] = [occupationEntity]
            if (exp.predicate) parts.push(exp.predicate.toLowerCase())
            if (exp.object) parts.push(toCamelCase(exp.object, conceptIndex, shortNames))
            if (exp.preposition && exp.preposition !== 'undefined') parts.push(exp.preposition.toLowerCase())
            if (exp.complement && exp.complement !== 'undefined') {
              parts.push(toCamelCase(exp.complement, conceptIndex, shortNames))
            }
            const id = parts.join('.')
            onetTasks.push({ id, onetCode, taskId, task: task.trim(), occupationTitle })
            taskProcessedCount++
          }
        } else {
          const parts: string[] = [occupationEntity]
          if (parsed.predicate) parts.push(parsed.predicate.toLowerCase())
          if (parsed.object) parts.push(toCamelCase(parsed.object, conceptIndex, shortNames))
          if (parsed.preposition && parsed.preposition !== 'undefined') parts.push(parsed.preposition.toLowerCase())
          if (parsed.complement && parsed.complement !== 'undefined') {
            parts.push(toCamelCase(parsed.complement, conceptIndex, shortNames))
          }
          const id = parts.join('.')
          onetTasks.push({ id, onetCode, taskId, task: task.trim(), occupationTitle })
          taskProcessedCount++
        }
      }
    } catch (err) {
      // Skip parse errors
    }
  }
  console.log(`  ✓ Loaded ${taskProcessedCount} ONET task expansions`)

  // Write ONET output
  const onetTsvHeaders = ['id', 'onetCode', 'taskId', 'task', 'occupationTitle']
  const onetTsvRows = onetTasks.map(t =>
    [t.id, t.onetCode, t.taskId, t.task, t.occupationTitle].join('\t')
  )
  const onetTsv = [onetTsvHeaders.join('\t'), ...onetTsvRows].join('\n')
  const onetOutputPath = path.join(outputDir, 'Tasks.tsv')
  fs.writeFileSync(onetOutputPath, onetTsv)
  console.log(`  ✓ Wrote ${onetOutputPath}`)

  console.log()
  console.log('='.repeat(100))
  console.log('GENERATION COMPLETE')
  console.log('='.repeat(100))
  console.log(`Industries: ${industries.size}`)
  console.log(`APQC Processes: ${apqcProcesses.length}`)
  console.log(`ONET Tasks: ${onetTasks.length}`)
  console.log()
  console.log(`Output directory: ${outputDir}`)
}

main().catch(console.error)

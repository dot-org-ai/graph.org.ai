#!/usr/bin/env tsx
import { GraphDLParser } from '../dist/parser.js'
import fs from 'fs'
import path from 'path'

/**
 * Generate simple GraphDL: normalize text with proper concepts
 * Keep multi-word concepts as CamelCase, capitalize other words properly
 * verbs: lowercase, nouns: Capitalized, conjunctions/prepositions: lowercase
 */
function toSimpleGraphDL(text: string, conceptIndex: Map<string, any>, verbIndex?: Map<string, any>): string {
  // Replace concepts first (longest to shortest)
  let normalized = text
  const concepts = Array.from(conceptIndex.entries())
    .sort((a, b) => b[0].length - a[0].length)

  for (const [phrase, entry] of concepts) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi')
    normalized = normalized.replace(regex, ` ${entry.id} `) // Use spaces to preserve word boundaries
  }

  // Split on whitespace and punctuation
  const tokens = normalized.split(/[\s\-\/,;:()]+/).filter(t => t.trim())

  // Process each token with proper GraphDL conventions:
  // - Concepts (multi-word): CamelCase (already handled)
  // - Nouns: Capitalized
  // - Verbs: lowercase
  // - Conjunctions/prepositions: lowercase
  const processed = tokens.map((token, idx) => {
    if (!token) return ''

    // If it's already a concept (CamelCase), keep it
    if (/^[A-Z]/.test(token) && /[A-Z][a-z]+[A-Z]/.test(token)) {
      return token
    }

    // Common conjunctions and prepositions - lowercase
    const lowerWords = new Set(['and', 'or', 'but', 'nor', 'for', 'so', 'yet',
                                 'to', 'from', 'with', 'without', 'in', 'on', 'at', 'by', 'of'])
    if (lowerWords.has(token.toLowerCase())) {
      return token.toLowerCase()
    }

    // Check if it's a verb (use verb index if available)
    if (verbIndex && verbIndex.has(token.toLowerCase())) {
      return token.toLowerCase()
    }

    // Otherwise it's a noun - capitalize first letter
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase()
  })

  return processed.filter(t => t).join('.')
}

/**
 * Convert text to proper CamelCase for GraphDL objects/complements
 * Handles multi-word phrases by capitalizing each word and joining without dots
 * Preserves concepts in their CamelCase form
 */
function toCamelCase(text: string, conceptIndex: Map<string, any>): string {
  // First replace concepts with placeholders
  let normalized = text
  const concepts = Array.from(conceptIndex.entries())
    .sort((a, b) => b[0].length - a[0].length)

  const conceptPlaceholders: Array<{placeholder: string, id: string}> = []
  for (const [phrase, entry] of concepts) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi')
    const placeholder = `__CONCEPT_${conceptPlaceholders.length}__`
    conceptPlaceholders.push({placeholder, id: entry.id})
    normalized = normalized.replace(regex, ` ${placeholder} `)
  }

  // Split and capitalize each word, then join (but preserve concept placeholders)
  const tokens = normalized.split(/[\s\-\/,;:()]+/).filter(t => t.trim())
  const processed = tokens.map(t => {
    // If it's a concept placeholder, it will be replaced later
    if (t.startsWith('__CONCEPT_')) {
      return t
    }
    // Otherwise capitalize first letter only
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
  })

  // Join and replace concept placeholders with actual concept IDs
  let result = processed.join('')
  for (const {placeholder, id} of conceptPlaceholders) {
    result = result.replace(placeholder, id)
  }

  return result
}

/**
 * Convert industry name to plural entity form
 * "Cross-Industry" → "Companies"
 * "Healthcare Provider" → "HealthcareProviders"
 * "Aerospace and Defense" → "AerospaceAndDefenseCompanies"
 */
function industryToEntityType(industryName: string): string {
  if (industryName.toLowerCase() === 'cross-industry') {
    return 'Companies'
  }

  // Convert to CamelCase and pluralize
  const tokens = industryName.split(/[\s\-\/]+/).filter(t => t.trim())
  const camelCase = tokens.map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).join('')

  // Add 's' if not already ending in 's'
  if (camelCase.endsWith('s') || camelCase.endsWith('S')) {
    return camelCase
  }
  return camelCase + 's'
}

async function main() {
  const parser = new GraphDLParser()
  await parser.initialize()

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const outputDir = path.join(repoRoot, '.data/GraphDL')

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const conceptIndex = (parser as any).lexicon.concepts
  const verbIndex = (parser as any).lexicon.verbs

  console.log('='.repeat(100))
  console.log('COMPREHENSIVE GRAPHDL GENERATION')
  console.log('='.repeat(100))
  console.log()

  // STEP 1: Parse Occupations
  console.log('STEP 1: Parsing Occupations...')
  const occupationsPath = path.join(repoRoot, '.source/ONET/ONET.OccupationData.tsv')
  const occupationsContent = fs.readFileSync(occupationsPath, 'utf-8')
  const occupationsLines = occupationsContent.split('\n').slice(1)

  const occupations = new Map<string, { code: string; title: string; simpleGraphDL: string }>()
  for (const line of occupationsLines) {
    if (!line.trim()) continue
    const [code, title] = line.split('\t')
    if (!code || !title) continue

    const simple = toSimpleGraphDL(title, conceptIndex, verbIndex)
    occupations.set(code, { code, title, simpleGraphDL: simple })
  }
  console.log(`  ✓ Loaded ${occupations.size} occupations`)

  // STEP 2: Parse Industries
  console.log('\nSTEP 2: Parsing Industries...')
  const industriesPath = path.join(repoRoot, '.source/APQC/APQC.Industries.tsv')
  const industriesContent = fs.readFileSync(industriesPath, 'utf-8')
  const industriesLines = industriesContent.split('\n').slice(1)

  const industries = new Map<string, { id: string; name: string; simpleGraphDL: string }>()
  for (const line of industriesLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const id = cols[0]
    const name = cols[1]
    if (!id || !name) continue

    const simple = toSimpleGraphDL(name, conceptIndex, verbIndex)
    industries.set(id, { id, name, simpleGraphDL: simple })
  }
  console.log(`  ✓ Loaded ${industries.size} industries`)

  // STEP 3: Parse APQC Processes
  console.log('\nSTEP 3: Parsing APQC Processes...')
  const apqcProcessesPath = path.join(repoRoot, '.source/APQC/APQC.Processes.tsv')
  const apqcContent = fs.readFileSync(apqcProcessesPath, 'utf-8')
  const apqcLines = apqcContent.split('\n').slice(1)

  const apqcProcesses: Array<{
    id: string
    name: string
    industry: string
    simpleGraphDL: string
    expandedGraphDL: string
    expansionCount: number
  }> = []

  for (const line of apqcLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const id = cols[0]
    const name = cols[2]
    if (!id || !name) continue

    const parsed = parser.parse(name.trim())
    const simple = toSimpleGraphDL(name.trim(), conceptIndex, verbIndex)

    // Expanded with "Companies" prefix (cross-industry processes)
    let expanded: string
    if (parsed.expansions && parsed.expansions.length > 0) {
      const tasks = parsed.expansions.map((exp: any) => {
        const parts: string[] = ['Companies']
        if (exp.predicate) parts.push(exp.predicate.toLowerCase())
        if (exp.object) parts.push(toCamelCase(exp.object, conceptIndex))
        if (exp.preposition && exp.preposition !== 'undefined') parts.push(exp.preposition.toLowerCase())
        if (exp.complement && exp.complement !== 'undefined') {
          parts.push(toCamelCase(exp.complement, conceptIndex))
        }
        return parts.join('.')
      })
      expanded = `[${tasks.join(', ')}]`
    } else {
      const parts: string[] = ['Companies']
      if (parsed.predicate) parts.push(parsed.predicate.toLowerCase())
      if (parsed.object) parts.push(toCamelCase(parsed.object, conceptIndex))
      if (parsed.preposition && parsed.preposition !== 'undefined') parts.push(parsed.preposition.toLowerCase())
      if (parsed.complement && parsed.complement !== 'undefined') {
        parts.push(toCamelCase(parsed.complement, conceptIndex))
      }
      expanded = parts.join('.')
    }

    apqcProcesses.push({
      id,
      name: name.trim(),
      industry: 'cross-industry',
      simpleGraphDL: simple,
      expandedGraphDL: expanded,
      expansionCount: parsed.expansions?.length || 0,
    })
  }
  console.log(`  ✓ Loaded ${apqcProcesses.length} APQC processes`)

  // STEP 4: Parse ONET Tasks with Occupation expansion
  console.log('\nSTEP 4: Parsing ONET Tasks...')
  const onetTasksPath = path.join(repoRoot, '.source/ONET/ONET.EmergingTasks.tsv')
  const onetContent = fs.readFileSync(onetTasksPath, 'utf-8')
  const onetLines = onetContent.split('\n').slice(1)

  const onetTasks: Array<{
    occupation: string
    occupationTitle: string
    task: string
    simpleGraphDL: string
    expandedGraphDL: string
    expansionCount: number
  }> = []

  for (const line of onetLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const occupationCode = cols[0]
    const task = cols[1]
    if (!occupationCode || !task) continue

    const occupation = occupations.get(occupationCode)
    if (!occupation) continue

    const parsed = parser.parse(task.trim())
    const simple = toSimpleGraphDL(task.trim(), conceptIndex, verbIndex)

    // Expanded with occupation code prefix
    let expanded: string
    if (parsed.expansions && parsed.expansions.length > 0) {
      const tasks = parsed.expansions.map((exp: any) => {
        const parts: string[] = [occupationCode]
        if (exp.predicate) parts.push(exp.predicate.toLowerCase())
        if (exp.object) parts.push(toCamelCase(exp.object, conceptIndex))
        if (exp.preposition && exp.preposition !== 'undefined') parts.push(exp.preposition.toLowerCase())
        if (exp.complement && exp.complement !== 'undefined') {
          parts.push(toCamelCase(exp.complement, conceptIndex))
        }
        return parts.join('.')
      })
      expanded = `[${tasks.join(', ')}]`
    } else {
      const parts: string[] = [occupationCode]
      if (parsed.predicate) parts.push(parsed.predicate.toLowerCase())
      if (parsed.object) parts.push(toCamelCase(parsed.object, conceptIndex))
      if (parsed.preposition && parsed.preposition !== 'undefined') parts.push(parsed.preposition.toLowerCase())
      if (parsed.complement && parsed.complement !== 'undefined') {
        parts.push(toCamelCase(parsed.complement, conceptIndex))
      }
      expanded = parts.join('.')
    }

    onetTasks.push({
      occupation: occupationCode,
      occupationTitle: occupation.title,
      task: task.trim(),
      simpleGraphDL: simple,
      expandedGraphDL: expanded,
      expansionCount: parsed.expansions?.length || 0,
    })
  }
  console.log(`  ✓ Loaded ${onetTasks.length} ONET tasks`)

  // GENERATE OUTPUTS
  console.log('\n' + '='.repeat(100))
  console.log('GENERATING OUTPUTS')
  console.log('='.repeat(100))

  // Output 1: Occupations
  console.log('\n1. Occupations...')
  const occupationsOutput = ['OccupationCode\tOccupationTitle\tSimpleGraphDL']
  for (const [code, occ] of occupations) {
    occupationsOutput.push(`${code}\t${occ.title}\t${occ.simpleGraphDL}`)
  }
  fs.writeFileSync(path.join(outputDir, 'ONET.Occupations.tsv'), occupationsOutput.join('\n'))
  console.log(`  ✓ ${outputDir}/ONET.Occupations.tsv (${occupations.size} rows)`)

  // Output 2: Industries
  console.log('\n2. Industries...')
  const industriesOutput = ['IndustryID\tIndustryName\tSimpleGraphDL']
  for (const [id, ind] of industries) {
    industriesOutput.push(`${ind.id}\t${ind.name}\t${ind.simpleGraphDL}`)
  }
  fs.writeFileSync(path.join(outputDir, 'APQC.Industries.tsv'), industriesOutput.join('\n'))
  console.log(`  ✓ ${outputDir}/APQC.Industries.tsv (${industries.size} rows)`)

  // Output 3: APQC Processes (Simple)
  console.log('\n3. APQC Processes (Simple)...')
  const apqcSimple = ['ProcessID\tIndustry\tProcessName\tSimpleGraphDL']
  for (const proc of apqcProcesses) {
    apqcSimple.push(`${proc.id}\t${proc.industry}\t${proc.name}\t${proc.simpleGraphDL}`)
  }
  fs.writeFileSync(path.join(outputDir, 'APQC.Processes.Simple.tsv'), apqcSimple.join('\n'))
  console.log(`  ✓ ${outputDir}/APQC.Processes.Simple.tsv (${apqcProcesses.length} rows)`)

  // Output 4: APQC Processes (Expanded)
  console.log('\n4. APQC Processes (Expanded)...')
  const apqcExpanded = ['ProcessID\tIndustry\tProcessName\tExpandedGraphDL\tExpansionCount']
  for (const proc of apqcProcesses) {
    apqcExpanded.push(`${proc.id}\t${proc.industry}\t${proc.name}\t${proc.expandedGraphDL}\t${proc.expansionCount}`)
  }
  fs.writeFileSync(path.join(outputDir, 'APQC.Processes.Expanded.tsv'), apqcExpanded.join('\n'))
  console.log(`  ✓ ${outputDir}/APQC.Processes.Expanded.tsv (${apqcProcesses.length} rows)`)

  // Output 5: ONET Tasks (Simple)
  console.log('\n5. ONET Tasks (Simple)...')
  const onetSimple = ['OccupationCode\tOccupationTitle\tTask\tSimpleGraphDL']
  for (const task of onetTasks) {
    onetSimple.push(`${task.occupation}\t${task.occupationTitle}\t${task.task}\t${task.simpleGraphDL}`)
  }
  fs.writeFileSync(path.join(outputDir, 'ONET.Tasks.Simple.tsv'), onetSimple.join('\n'))
  console.log(`  ✓ ${outputDir}/ONET.Tasks.Simple.tsv (${onetTasks.length} rows)`)

  // Output 6: ONET Tasks (Expanded)
  console.log('\n6. ONET Tasks (Expanded)...')
  const onetExpanded = ['OccupationCode\tOccupationTitle\tTask\tExpandedGraphDL\tExpansionCount']
  for (const task of onetTasks) {
    onetExpanded.push(`${task.occupation}\t${task.occupationTitle}\t${task.task}\t${task.expandedGraphDL}\t${task.expansionCount}`)
  }
  fs.writeFileSync(path.join(outputDir, 'ONET.Tasks.Expanded.tsv'), onetExpanded.join('\n'))
  console.log(`  ✓ ${outputDir}/ONET.Tasks.Expanded.tsv (${onetTasks.length} rows)`)

  // Statistics
  console.log('\n' + '='.repeat(100))
  console.log('STATISTICS')
  console.log('='.repeat(100))
  console.log(`Occupations: ${occupations.size}`)
  console.log(`Industries: ${industries.size}`)
  console.log(`APQC Processes: ${apqcProcesses.length}`)
  console.log(`  - With expansions: ${apqcProcesses.filter(p => p.expansionCount > 0).length} (${(apqcProcesses.filter(p => p.expansionCount > 0).length / apqcProcesses.length * 100).toFixed(1)}%)`)
  console.log(`ONET Tasks: ${onetTasks.length}`)
  console.log(`  - With expansions: ${onetTasks.filter(t => t.expansionCount > 0).length} (${(onetTasks.filter(t => t.expansionCount > 0).length / onetTasks.length * 100).toFixed(1)}%)`)
  console.log()
  console.log('✅ All GraphDL outputs generated successfully!')
}

main().catch(console.error)

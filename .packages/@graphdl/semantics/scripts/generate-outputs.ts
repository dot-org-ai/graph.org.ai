#!/usr/bin/env tsx
import { GraphDLParser } from '../dist/parser.js'
import fs from 'fs'
import path from 'path'

interface TaskRecord {
  occupation?: string
  original: string
  simpleGraphDL: string
  expandedGraphDL?: string
  expansionCount: number
}

/**
 * Generate simple GraphDL: normalize text to dots with proper concepts
 * Example: "Monitor and evaluate quality" -> "Monitor.and.evaluate.quality"
 */
function toSimpleGraphDL(text: string, conceptIndex: Map<string, any>): string {
  // Replace concepts first (longest to shortest to avoid partial matches)
  let normalized = text
  const concepts = Array.from(conceptIndex.entries())
    .sort((a, b) => b[0].length - a[0].length)

  for (const [phrase, entry] of concepts) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi')
    normalized = normalized.replace(regex, entry.id)
  }

  // Replace spaces and punctuation with dots
  // Keep concept IDs intact (CamelCase)
  const tokens = normalized.split(/[\s\-\/,;:()]+/).filter(t => t.trim())

  // Capitalize first letter of each token (unless it's already a Concept)
  const capitalized = tokens.map(token => {
    if (!token) return ''
    // If it's a concept (starts with capital), keep it
    if (/^[A-Z]/.test(token)) return token
    // Otherwise capitalize first letter
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase()
  })

  return capitalized.filter(t => t).join('.')
}

/**
 * Generate expanded GraphDL with full structure:
 * [Occupation.]action.Object.preposition.Concept, [next expansion], ...
 */
function toExpandedGraphDL(parsed: any, occupation?: string): string {
  if (!parsed.expansions || parsed.expansions.length === 0) {
    // No expansion, return single task
    const parts: string[] = []
    if (occupation) parts.push(occupation)
    if (parsed.predicate) parts.push(parsed.predicate)
    if (parsed.object) {
      // Capitalize and join adjectives to nouns
      const obj = parsed.object.split(' ')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('')
      parts.push(obj)
    }
    if (parsed.preposition) parts.push(parsed.preposition)
    if (parsed.complement) {
      // Capitalize - concepts should already be CamelCase
      const comp = parsed.complement.split(' ')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('')
      parts.push(comp)
    }
    return parts.join('.')
  }

  // Has expansions - return cartesian product
  const expanded = parsed.expansions.map((exp: any) => {
    const parts: string[] = []
    if (occupation) parts.push(occupation)
    if (exp.predicate) parts.push(exp.predicate)
    if (exp.object) {
      const obj = exp.object.split(' ')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('')
      parts.push(obj)
    }
    if (exp.preposition && exp.preposition !== 'undefined') parts.push(exp.preposition)
    if (exp.complement && exp.complement !== 'undefined') {
      const comp = exp.complement.split(' ')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('')
      parts.push(comp)
    }
    return parts.join('.')
  })

  return `[${expanded.join(', ')}]`
}

async function main() {
  const parser = new GraphDLParser()
  await parser.initialize()

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const outputDir = path.join(repoRoot, '.output/GraphDL')

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Load APQC Processes
  console.log('Loading APQC Processes...')
  const apqcProcessesPath = path.join(repoRoot, '.source/APQC/APQC.Processes.tsv')
  const apqcContent = fs.readFileSync(apqcProcessesPath, 'utf-8')
  const apqcLines = apqcContent.split('\n').slice(1)

  const apqcRecords: TaskRecord[] = []
  for (const line of apqcLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const name = cols[2]
    if (!name || !name.trim()) continue

    const parsed = parser.parse(name.trim())
    const simple = toSimpleGraphDL(name.trim(), (parser as any).lexicon.concepts)
    const expanded = toExpandedGraphDL(parsed)

    apqcRecords.push({
      original: name.trim(),
      simpleGraphDL: simple,
      expandedGraphDL: expanded,
      expansionCount: parsed.expansions?.length || 0,
    })
  }

  console.log(`  Loaded ${apqcRecords.length} APQC processes`)

  // Load ONET Tasks
  console.log('Loading ONET Tasks...')
  const onetTasksPath = path.join(repoRoot, '.source/ONET/ONET.EmergingTasks.tsv')
  const onetContent = fs.readFileSync(onetTasksPath, 'utf-8')
  const onetLines = onetContent.split('\n').slice(1)

  const onetRecords: TaskRecord[] = []
  for (const line of onetLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const occupation = cols[0]  // ONET SOC Code
    const task = cols[1]
    if (!task || !task.trim()) continue

    const parsed = parser.parse(task.trim())
    const simple = toSimpleGraphDL(task.trim(), (parser as any).lexicon.concepts)
    const expanded = toExpandedGraphDL(parsed, occupation)

    onetRecords.push({
      occupation,
      original: task.trim(),
      simpleGraphDL: simple,
      expandedGraphDL: expanded,
      expansionCount: parsed.expansions?.length || 0,
    })
  }

  console.log(`  Loaded ${onetRecords.length} ONET tasks`)

  // Generate OUTPUT 1: Simple GraphDL (just normalization)
  console.log('\nGenerating Output 1: Simple GraphDL...')
  const simpleAPQC = ['ProcessID\tOriginalStatement\tSimpleGraphDL']
  apqcRecords.forEach((rec, idx) => {
    simpleAPQC.push(`APQC-${idx + 1}\t${rec.original}\t${rec.simpleGraphDL}`)
  })

  const simpleONET = ['OccupationCode\tOriginalTask\tSimpleGraphDL']
  onetRecords.forEach(rec => {
    simpleONET.push(`${rec.occupation}\t${rec.original}\t${rec.simpleGraphDL}`)
  })

  fs.writeFileSync(path.join(outputDir, 'APQC.SimpleGraphDL.tsv'), simpleAPQC.join('\n'))
  fs.writeFileSync(path.join(outputDir, 'ONET.SimpleGraphDL.tsv'), simpleONET.join('\n'))

  console.log(`  ✓ ${outputDir}/APQC.SimpleGraphDL.tsv (${apqcRecords.length} rows)`)
  console.log(`  ✓ ${outputDir}/ONET.SimpleGraphDL.tsv (${onetRecords.length} rows)`)

  // Generate OUTPUT 2: Expanded GraphDL (cartesian product)
  console.log('\nGenerating Output 2: Expanded GraphDL...')
  const expandedAPQC = ['ProcessID\tOriginalStatement\tExpandedGraphDL\tExpansionCount']
  apqcRecords.forEach((rec, idx) => {
    expandedAPQC.push(`APQC-${idx + 1}\t${rec.original}\t${rec.expandedGraphDL}\t${rec.expansionCount}`)
  })

  const expandedONET = ['OccupationCode\tOriginalTask\tExpandedGraphDL\tExpansionCount']
  onetRecords.forEach(rec => {
    expandedONET.push(`${rec.occupation}\t${rec.original}\t${rec.expandedGraphDL}\t${rec.expansionCount}`)
  })

  fs.writeFileSync(path.join(outputDir, 'APQC.ExpandedGraphDL.tsv'), expandedAPQC.join('\n'))
  fs.writeFileSync(path.join(outputDir, 'ONET.ExpandedGraphDL.tsv'), expandedONET.join('\n'))

  console.log(`  ✓ ${outputDir}/APQC.ExpandedGraphDL.tsv (${apqcRecords.length} rows)`)
  console.log(`  ✓ ${outputDir}/ONET.ExpandedGraphDL.tsv (${onetRecords.length} rows)`)

  // Statistics
  console.log('\nStatistics:')
  console.log(`  Total statements: ${apqcRecords.length + onetRecords.length}`)
  console.log(`  With expansions: ${apqcRecords.filter(r => r.expansionCount > 0).length + onetRecords.filter(r => r.expansionCount > 0).length}`)
  console.log(`  Average simple GraphDL length: ${Math.round((apqcRecords.reduce((sum, r) => sum + r.simpleGraphDL.length, 0) + onetRecords.reduce((sum, r) => sum + r.simpleGraphDL.length, 0)) / (apqcRecords.length + onetRecords.length))} chars`)

  console.log('\n✅ GraphDL outputs generated!')
}

main().catch(console.error)

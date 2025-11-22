#!/usr/bin/env tsx
import { GraphDLParser } from '../dist/parser.js'
import fs from 'fs'
import path from 'path'

async function main() {
  const parser = new GraphDLParser()
  await parser.initialize()

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')

  // Load APQC Processes
  const apqcProcessesPath = path.join(repoRoot, '.source/APQC/APQC.Processes.tsv')
  const apqcContent = fs.readFileSync(apqcProcessesPath, 'utf-8')
  const apqcLines = apqcContent.split('\n').slice(1) // Skip header

  const apqcStatements: string[] = []
  for (const line of apqcLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const name = cols[2] // Process Name column
    if (name && name.trim()) {
      apqcStatements.push(name.trim())
    }
  }

  // Load ONET Tasks from EmergingTasks
  const onetTasksPath = path.join(repoRoot, '.source/ONET/ONET.EmergingTasks.tsv')
  const onetContent = fs.readFileSync(onetTasksPath, 'utf-8')
  const onetLines = onetContent.split('\n').slice(1)

  const onetStatements: string[] = []
  for (const line of onetLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const task = cols[1] // Task column (2nd column)
    if (task && task.trim()) {
      onetStatements.push(task.trim())
    }
  }

  // Also load ONET Work Activities
  const onetActivitiesPath = path.join(repoRoot, '.source/ONET/ONET.WorkActivities.tsv')
  const onetActivitiesContent = fs.readFileSync(onetActivitiesPath, 'utf-8')
  const onetActivitiesLines = onetActivitiesContent.split('\n').slice(1)

  for (const line of onetActivitiesLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const elementName = cols[2] // elementName column (3rd column)
    if (elementName && elementName.trim() && !onetStatements.includes(elementName.trim())) {
      onetStatements.push(elementName.trim())
    }
  }

  console.log('GraphDL Parser - Full Dataset Analysis')
  console.log('='.repeat(100))
  console.log()
  console.log(`APQC Processes: ${apqcStatements.length}`)
  console.log(`ONET Tasks: ${onetStatements.length}`)
  console.log(`Total Statements: ${apqcStatements.length + onetStatements.length}`)
  console.log()

  // Parse all statements
  const allStatements = [...apqcStatements, ...onetStatements]
  const results = allStatements.map(stmt => ({
    original: stmt,
    parsed: parser.parse(stmt),
  }))

  // Calculate statistics
  const withConjunctions = results.filter(r => r.parsed.hasConjunction)
  const withExpansions = results.filter(r => r.parsed.expansions && r.parsed.expansions.length > 0)

  const graphdlOutputs = results.map(r => ({
    original: r.original,
    graphdl: parser.toGraphDL(r.parsed),
  }))

  const lengths = graphdlOutputs.map(g => g.graphdl.length)
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
  const maxLength = Math.max(...lengths)
  const minLength = Math.min(...lengths)

  console.log('PARSING STATISTICS:')
  console.log('='.repeat(100))
  console.log(`Statements with Conjunctions: ${withConjunctions.length} (${(withConjunctions.length / results.length * 100).toFixed(1)}%)`)
  console.log(`Statements with Expansions: ${withExpansions.length} (${(withExpansions.length / results.length * 100).toFixed(1)}%)`)
  console.log()

  console.log('GRAPHDL OUTPUT STATISTICS:')
  console.log('='.repeat(100))
  console.log(`Average GraphDL Length: ${avgLength.toFixed(1)} chars`)
  console.log(`Min GraphDL Length: ${minLength} chars`)
  console.log(`Max GraphDL Length: ${maxLength} chars`)
  console.log()

  // Show distribution
  const buckets = {
    '0-50': 0,
    '51-100': 0,
    '101-150': 0,
    '151-200': 0,
    '201+': 0,
  }

  for (const len of lengths) {
    if (len <= 50) buckets['0-50']++
    else if (len <= 100) buckets['51-100']++
    else if (len <= 150) buckets['101-150']++
    else if (len <= 200) buckets['151-200']++
    else buckets['201+']++
  }

  console.log('GraphDL Length Distribution:')
  for (const [bucket, count] of Object.entries(buckets)) {
    const pct = (count / results.length * 100).toFixed(1)
    console.log(`  ${bucket} chars: ${count} (${pct}%)`)
  }
  console.log()

  // Show longest outputs
  const sorted = graphdlOutputs.sort((a, b) => b.graphdl.length - a.graphdl.length)
  console.log('TOP 10 LONGEST GRAPHDL OUTPUTS:')
  console.log('='.repeat(100))
  for (let i = 0; i < Math.min(10, sorted.length); i++) {
    const item = sorted[i]
    console.log(`${i + 1}. Length: ${item.graphdl.length} chars`)
    console.log(`   Original: "${item.original}"`)
    console.log(`   GraphDL: ${item.graphdl}`)
    console.log()
  }

  // Show unknown words
  const unknowns = parser.getUnknownWords(30)
  if (unknowns.length > 0) {
    console.log('TOP 30 UNKNOWN WORDS:')
    console.log('='.repeat(100))
    for (const [word, freq] of unknowns) {
      console.log(`  ${word}: ${freq}`)
    }
  }
}

main().catch(console.error)

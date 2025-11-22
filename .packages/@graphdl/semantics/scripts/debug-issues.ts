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
  const apqcLines = apqcContent.split('\n').slice(1)

  const apqcStatements: string[] = []
  for (const line of apqcLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const name = cols[2]
    if (name && name.trim()) {
      apqcStatements.push(name.trim())
    }
  }

  // Load ONET Tasks
  const onetTasksPath = path.join(repoRoot, '.source/ONET/ONET.EmergingTasks.tsv')
  const onetContent = fs.readFileSync(onetTasksPath, 'utf-8')
  const onetLines = onetContent.split('\n').slice(1)

  const onetStatements: string[] = []
  for (const line of onetLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const task = cols[1]
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
    const elementName = cols[2]
    if (elementName && elementName.trim() && !onetStatements.includes(elementName.trim())) {
      onetStatements.push(elementName.trim())
    }
  }

  const allStatements = [...apqcStatements, ...onetStatements]

  console.log('ROOT CAUSE ANALYSIS')
  console.log('='.repeat(100))
  console.log()

  // 1. Find zero-length outputs
  console.log('ISSUE 1: ZERO-LENGTH GRAPHDL OUTPUTS')
  console.log('='.repeat(100))
  const zeroLengthCases: Array<{ original: string; parsed: any; graphdl: string }> = []

  for (const stmt of allStatements) {
    const parsed = parser.parse(stmt)
    const graphdl = parser.toGraphDL(parsed)
    if (graphdl.length === 0) {
      zeroLengthCases.push({ original: stmt, parsed, graphdl })
    }
  }

  console.log(`Found ${zeroLengthCases.length} zero-length cases`)
  console.log()

  for (let i = 0; i < Math.min(10, zeroLengthCases.length); i++) {
    const c = zeroLengthCases[i]
    console.log(`${i + 1}. Original: "${c.original}"`)
    console.log(`   Parsed:`, JSON.stringify(c.parsed, null, 2))
    console.log(`   GraphDL: "${c.graphdl}"`)
    console.log()
  }

  // 2. Find statements with "performance management"
  console.log('ISSUE 2: MULTI-WORD CONCEPT "PERFORMANCE MANAGEMENT"')
  console.log('='.repeat(100))
  const perfMgmtCases: Array<{ original: string; parsed: any; graphdl: string }> = []

  for (const stmt of allStatements) {
    if (/performance\s+management/i.test(stmt)) {
      const parsed = parser.parse(stmt)
      const graphdl = parser.toGraphDL(parsed)
      perfMgmtCases.push({ original: stmt, parsed, graphdl })
    }
  }

  console.log(`Found ${perfMgmtCases.length} statements containing "performance management"`)
  console.log()

  for (let i = 0; i < Math.min(10, perfMgmtCases.length); i++) {
    const c = perfMgmtCases[i]
    console.log(`${i + 1}. Original: "${c.original}"`)
    console.log(`   Object: "${c.parsed.object || ''}"`)
    console.log(`   Complement: "${c.parsed.complement || ''}"`)
    console.log(`   GraphDL: ${c.graphdl}`)
    console.log()
  }

  // 3. Find other common multi-word phrases
  console.log('ISSUE 3: OTHER POTENTIAL MULTI-WORD CONCEPTS')
  console.log('='.repeat(100))

  const multiWordPatterns = [
    /risk\s+management/i,
    /project\s+management/i,
    /supply\s+chain/i,
    /customer\s+service/i,
    /human\s+resources/i,
    /quality\s+assurance/i,
    /business\s+intelligence/i,
    /data\s+analytics/i,
    /strategic\s+planning/i,
    /change\s+management/i,
  ]

  const multiWordMatches = new Map<string, number>()

  for (const stmt of allStatements) {
    for (const pattern of multiWordPatterns) {
      const match = stmt.match(pattern)
      if (match) {
        const phrase = match[0].toLowerCase()
        multiWordMatches.set(phrase, (multiWordMatches.get(phrase) || 0) + 1)
      }
    }
  }

  console.log('Common multi-word phrases that should be concepts:')
  const sorted = Array.from(multiWordMatches.entries()).sort((a, b) => b[1] - a[1])
  for (const [phrase, count] of sorted.slice(0, 20)) {
    console.log(`  ${phrase}: ${count} occurrences`)
  }
  console.log()

  // 4. Find statements with very long GraphDL outputs
  console.log('ISSUE 4: LONGEST GRAPHDL OUTPUTS (>100 chars)')
  console.log('='.repeat(100))

  const longCases: Array<{ original: string; parsed: any; graphdl: string; length: number }> = []

  for (const stmt of allStatements) {
    const parsed = parser.parse(stmt)
    const graphdl = parser.toGraphDL(parsed)
    if (graphdl.length > 100) {
      longCases.push({ original: stmt, parsed, graphdl, length: graphdl.length })
    }
  }

  const sortedLong = longCases.sort((a, b) => b.length - a.length)

  for (let i = 0; i < Math.min(5, sortedLong.length); i++) {
    const c = sortedLong[i]
    console.log(`${i + 1}. Length: ${c.length} chars`)
    console.log(`   Original: "${c.original}"`)
    console.log(`   Has Conjunction: ${c.parsed.hasConjunction}`)
    console.log(`   Expansions: ${c.parsed.expansions?.length || 0}`)
    if (c.parsed.expansions) {
      c.parsed.expansions.forEach((exp: any, idx: number) => {
        console.log(`     ${idx + 1}. predicate="${exp.predicate}", object="${exp.object}", complement="${exp.complement}"`)
      })
    }
    console.log(`   GraphDL: ${c.graphdl}`)
    console.log()
  }
}

main().catch(console.error)

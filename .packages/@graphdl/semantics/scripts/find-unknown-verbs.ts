#!/usr/bin/env tsx
import { GraphDLParser } from '../dist/parser.js'
import fs from 'fs'
import path from 'path'

/**
 * Find all unknown verbs from APQC and ONET source data
 */
async function main() {
  console.log('Finding Unknown Verbs...')
  console.log('='.repeat(100))

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const parser = new GraphDLParser()
  await parser.initialize()

  const unknownVerbs = new Map<string, number>()
  const knownVerbs = new Set<string>()

  // Load existing verbs
  const verbsPath = path.join(repoRoot, '.enrichment/Language/Language.Verbs.tsv')
  const verbsContent = fs.readFileSync(verbsPath, 'utf-8')
  for (const line of verbsContent.split('\n').slice(1)) {
    if (!line.trim()) continue
    const canonical = line.split('\t')[0]
    if (canonical) knownVerbs.add(canonical.toLowerCase())
  }
  console.log(`Loaded ${knownVerbs.size} known verbs`)

  // Process APQC
  console.log('\n📋 Processing APQC Processes...')
  const apqcPath = path.join(repoRoot, '.source/APQC/APQC.Processes.tsv')
  const apqcContent = fs.readFileSync(apqcPath, 'utf-8')
  const apqcLines = apqcContent.split('\n').slice(1)

  for (const line of apqcLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const name = cols[2]
    if (!name) continue

    // Extract first word (potential verb)
    const firstWord = name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '')
    if (firstWord && !knownVerbs.has(firstWord)) {
      unknownVerbs.set(firstWord, (unknownVerbs.get(firstWord) || 0) + 1)
    }
  }

  // Process ONET
  console.log('📋 Processing ONET Tasks...')
  const onetPath = path.join(repoRoot, '.source/ONET/ONET.TaskStatements.tsv')
  const onetContent = fs.readFileSync(onetPath, 'utf-8')
  const onetLines = onetContent.split('\n').slice(1)

  for (const line of onetLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const task = cols[2]
    if (!task) continue

    // Extract first word (potential verb)
    const firstWord = task.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '')
    if (firstWord && !knownVerbs.has(firstWord)) {
      unknownVerbs.set(firstWord, (unknownVerbs.get(firstWord) || 0) + 1)
    }
  }

  // Sort by frequency
  const sorted = Array.from(unknownVerbs.entries())
    .sort((a, b) => b[1] - a[1])

  console.log(`\n📊 Found ${sorted.length} potential missing verbs`)
  console.log('\nTop 50 missing verbs:')
  console.log('='.repeat(100))

  for (const [verb, count] of sorted.slice(0, 50)) {
    console.log(`${verb.padEnd(20)} ${count.toString().padStart(5)} occurrences`)
  }

  // Export all to file for review
  const outputPath = path.join(repoRoot, '.packages/@graphdl/semantics/.analysis/unknown-verbs.tsv')
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const lines = ['verb\tfrequency']
  for (const [verb, count] of sorted) {
    lines.push(`${verb}\t${count}`)
  }
  fs.writeFileSync(outputPath, lines.join('\n'))
  console.log(`\n✅ Exported all ${sorted.length} verbs to ${outputPath}`)
}

main().catch(console.error)

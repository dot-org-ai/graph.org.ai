import fs from 'fs'
import path from 'path'
import { GraphDLParser } from './graphdl-parser.js'

/**
 * Batch parse all APQC processes to:
 * 1. Generate GraphDL representations
 * 2. Identify unknown vocabulary
 * 3. Compute parsing confidence scores
 */

interface APQCProcess {
  pcfId: string
  hierarchyId: string
  name: string
  description: string
  level: string
  category: string
  parent: string
}

async function main() {
  console.log('='.repeat(80))
  console.log('GraphDL Parser - APQC Process Framework Batch Analysis')
  console.log('='.repeat(80))
  console.log()

  // Initialize parser
  const parser = new GraphDLParser()
  await parser.initialize()

  // Load APQC processes
  const apqcFile = '.source/APQC/APQC.Processes.tsv'
  const content = fs.readFileSync(apqcFile, 'utf-8')
  const lines = content.split('\n')
  const header = lines[0].split('\t')

  const processes: APQCProcess[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const cells = lines[i].split('\t')
    processes.push({
      pcfId: cells[0],
      hierarchyId: cells[1],
      name: cells[2],
      description: cells[3],
      level: cells[4],
      category: cells[5],
      parent: cells[6],
    })
  }

  console.log(`Loaded ${processes.length} APQC processes`)
  console.log()

  // Parse each process name
  const results: Array<{
    pcfId: string
    hierarchyId: string
    name: string
    graphdl: string
    confidence: number
    unknownWords: string[]
  }> = []

  let totalParsed = 0
  let totalWithUnknowns = 0
  const confidenceBuckets = { high: 0, medium: 0, low: 0 }

  for (const process of processes) {
    const parsed = parser.parse(process.name)
    const graphdl = parser.toGraphDL(parsed)

    results.push({
      pcfId: process.pcfId,
      hierarchyId: process.hierarchyId,
      name: process.name,
      graphdl,
      confidence: parsed.confidence,
      unknownWords: parsed.unknownWords,
    })

    totalParsed++

    if (parsed.unknownWords.length > 0) {
      totalWithUnknowns++
    }

    if (parsed.confidence >= 0.8) confidenceBuckets.high++
    else if (parsed.confidence >= 0.5) confidenceBuckets.medium++
    else confidenceBuckets.low++
  }

  // Generate statistics
  console.log('Parsing Statistics:')
  console.log(`  Total processes parsed: ${totalParsed}`)
  console.log(`  Processes with unknown words: ${totalWithUnknowns} (${((totalWithUnknowns / totalParsed) * 100).toFixed(1)}%)`)
  console.log()
  console.log('Confidence Distribution:')
  console.log(`  High (≥0.8): ${confidenceBuckets.high} (${((confidenceBuckets.high / totalParsed) * 100).toFixed(1)}%)`)
  console.log(`  Medium (0.5-0.8): ${confidenceBuckets.medium} (${((confidenceBuckets.medium / totalParsed) * 100).toFixed(1)}%)`)
  console.log(`  Low (<0.5): ${confidenceBuckets.low} (${((confidenceBuckets.low / totalParsed) * 100).toFixed(1)}%)`)
  console.log()

  // Show top unknown words
  const unknowns = parser.getUnknownWords(50)
  console.log(`Top 50 Unknown Words (of ${unknowns.length} total):`)
  console.log('-'.repeat(80))
  for (const [word, freq] of unknowns.slice(0, 50)) {
    console.log(`  ${word.padEnd(30)} ${freq.toString().padStart(5)} occurrences`)
  }
  console.log()

  // Export results
  const outputDir = '.output'
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Export GraphDL mappings
  const graphdlOutput = results.map(r =>
    [r.pcfId, r.hierarchyId, r.name, r.graphdl, r.confidence, r.unknownWords.join('; ')].join('\t')
  )
  fs.writeFileSync(
    path.join(outputDir, 'APQC.Processes.GraphDL.tsv'),
    ['pcfId', 'hierarchyId', 'name', 'graphdl', 'confidence', 'unknownWords'].join('\t') + '\n' +
    graphdlOutput.join('\n')
  )

  // Export unknown words for vocabulary augmentation
  parser.exportUnknownWords(path.join(outputDir, 'APQC.UnknownWords.tsv'))

  console.log('Output files generated:')
  console.log(`  ${path.join(outputDir, 'APQC.Processes.GraphDL.tsv')}`)
  console.log(`  ${path.join(outputDir, 'APQC.UnknownWords.tsv')}`)
  console.log()

  // Show sample results
  console.log('Sample GraphDL Mappings (first 10):')
  console.log('-'.repeat(80))
  for (const result of results.slice(0, 10)) {
    console.log(`${result.hierarchyId.padEnd(12)} ${result.name}`)
    console.log(`${' '.repeat(12)} → ${result.graphdl}`)
    if (result.unknownWords.length > 0) {
      console.log(`${' '.repeat(12)} ⚠️  Unknown: ${result.unknownWords.join(', ')}`)
    }
    console.log()
  }

  console.log('Done! 🎉')
}

main().catch(console.error)

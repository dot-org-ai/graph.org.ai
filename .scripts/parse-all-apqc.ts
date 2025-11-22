import fs from 'fs'
import { GraphDLParser } from './graphdl-parser'

const parser = new GraphDLParser()
await parser.initialize()

const results: Array<{
  source: string
  id: string
  name: string
  graphdl: string
  length: number
  hasConjunction: boolean
  expansions: number
}> = []

let parsed = 0
let failed = 0

// Parse APQC Processes
console.log('Parsing APQC Processes...')
const apqcFile = '.source/APQC/APQC.Processes.tsv'
const apqcContent = fs.readFileSync(apqcFile, 'utf-8')
const apqcLines = apqcContent.split('\n').slice(1)

for (const line of apqcLines) {
  if (!line.trim()) continue
  const cells = line.split('\t')
  const id = cells[0]
  const name = cells[2]

  if (!name || name.trim().length === 0) continue

  try {
    const statement = parser.parse(name)
    const graphdl = parser.toGraphDL(statement)

    results.push({
      source: 'APQC',
      id,
      name,
      graphdl,
      length: graphdl.length,
      hasConjunction: statement.hasConjunction || false,
      expansions: statement.expansions?.length || 0
    })
    parsed++
  } catch (error) {
    failed++
    if (failed <= 3) {
      console.error(`  Parse error on "${name}": ${(error as Error).message}`)
    }
    results.push({
      source: 'APQC',
      id,
      name,
      graphdl: 'PARSE_FAILED',
      length: name.length,
      hasConjunction: false,
      expansions: 0
    })
  }
}

console.log(`  APQC: ${parsed} parsed, ${failed} failed`)

// Parse O*NET Emerging Tasks
console.log('Parsing O*NET Emerging Tasks...')
const onetEmergingFile = '.source/ONET/ONET.EmergingTasks.tsv'
if (fs.existsSync(onetEmergingFile)) {
  const onetContent = fs.readFileSync(onetEmergingFile, 'utf-8')
  const onetLines = onetContent.split('\n').slice(1)

  let onetParsed = 0
  let onetFailed = 0

  for (const line of onetLines) {
    if (!line.trim()) continue
    const cells = line.split('\t')
    const id = cells[0]
    const taskId = cells[1]
    const task = cells[2]

    if (!task || task.trim().length === 0) continue

    try {
      const statement = parser.parse(task)
      const graphdl = parser.toGraphDL(statement)

      results.push({
        source: 'ONET-EmergingTasks',
        id: `${id}-${taskId}`,
        name: task,
        graphdl,
        length: graphdl.length,
        hasConjunction: statement.hasConjunction || false,
        expansions: statement.expansions?.length || 0
      })
      onetParsed++
    } catch (error) {
      onetFailed++
      results.push({
        source: 'ONET-EmergingTasks',
        id: `${id}-${taskId}`,
        name: task,
        graphdl: 'PARSE_FAILED',
        length: task.length,
        hasConjunction: false,
        expansions: 0
      })
    }
  }

  parsed += onetParsed
  failed += onetFailed
  console.log(`  O*NET Emerging Tasks: ${onetParsed} parsed, ${onetFailed} failed`)
}

// Parse O*NET Tasks (if exists)
console.log('Parsing O*NET Tasks...')
const onetTasksFile = '.source/ONET/ONET.Tasks.tsv'
if (fs.existsSync(onetTasksFile)) {
  const onetContent = fs.readFileSync(onetTasksFile, 'utf-8')
  const onetLines = onetContent.split('\n').slice(1)

  let onetParsed = 0
  let onetFailed = 0

  for (const line of onetLines) {
    if (!line.trim()) continue
    const cells = line.split('\t')
    const id = cells[0]
    const taskId = cells[1]
    const task = cells[2]

    if (!task || task.trim().length === 0) continue

    try {
      const statement = parser.parse(task)
      const graphdl = parser.toGraphDL(statement)

      results.push({
        source: 'ONET-Tasks',
        id: `${id}-${taskId}`,
        name: task,
        graphdl,
        length: graphdl.length,
        hasConjunction: statement.hasConjunction || false,
        expansions: statement.expansions?.length || 0
      })
      onetParsed++
    } catch (error) {
      onetFailed++
      results.push({
        source: 'ONET-Tasks',
        id: `${id}-${taskId}`,
        name: task,
        graphdl: 'PARSE_FAILED',
        length: task.length,
        hasConjunction: false,
        expansions: 0
      })
    }
  }

  parsed += onetParsed
  failed += onetFailed
  console.log(`  O*NET Tasks: ${onetParsed} parsed, ${onetFailed} failed`)
} else {
  console.log('  O*NET Tasks: file not found, skipping')
}

console.log(`Parsed: ${parsed}`)
console.log(`Failed: ${failed}`)
console.log(`Total: ${results.length}`)

// Sort by descending length
results.sort((a, b) => b.length - a.length)

// Write full results
const outputLines = ['source\tid\tname\tgraphdl\tlength\thasConjunction\texpansions']
for (const result of results) {
  outputLines.push(
    `${result.source}\t${result.id}\t${result.name}\t${result.graphdl}\t${result.length}\t${result.hasConjunction}\t${result.expansions}`
  )
}

fs.writeFileSync('.output/All-Parsed.tsv', outputLines.join('\n'))
console.log(`\nWrote all results to .output/All-Parsed.tsv`)

// Show longest/most problematic
console.log('\n=== TOP 100 LONGEST GRAPHDL STATEMENTS ===')
console.log('Len\tSource\tGraphDL\tOriginal')
console.log('='.repeat(120))
for (const result of results.slice(0, 100)) {
  const graphdlPreview = result.graphdl.slice(0, 70) + (result.graphdl.length > 70 ? '...' : '')
  const namePreview = result.name.slice(0, 50) + (result.name.length > 50 ? '...' : '')
  console.log(`${result.length}\t${result.source}\t${graphdlPreview}\t${namePreview}`)
}

// Show failures
console.log('\n=== PARSE FAILURES ===')
const failures = results.filter(r => r.graphdl === 'PARSE_FAILED')
console.log(`Total failures: ${failures.length}`)
for (const failure of failures.slice(0, 20)) {
  console.log(`  ${failure.name}`)
}

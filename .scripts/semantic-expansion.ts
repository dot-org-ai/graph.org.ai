import fs from 'fs'
import path from 'path'
import { GraphDLParser } from './graphdl-parser.js'

// ============================================================================
// CONFIGURATION
// ============================================================================

const DATA_DIR = '.data'
const ENRICHMENT_DIR = '.enrichment/Language'

// Helper functions from generate-data.ts
function parseTSV(filePath: string): any[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split('\t')
  const data: any[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = lines[i].split('\t')
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    data.push(row)
  }

  return data
}

function writeTSV(filePath: string, data: any[]): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const lines = [headers.join('\t')]

  for (const row of data) {
    const values = headers.map(header => row[header] ?? '')
    lines.push(values.join('\t'))
  }

  fs.writeFileSync(filePath, lines.join('\n'))
  console.log(`  ✅ ${path.basename(filePath)} (${data.length} rows)`)
}

function createId(name: string): string {
  return name
    .replace(/ /g, '_')
    .replace(/\//g, '_')
    .replace(/\?/g, '')
}

function toCamelCase(value: string): string {
  if (!value) return ''
  return value.charAt(0).toLowerCase() + value.slice(1)
}

// ============================================================================
// SEMANTIC EXPANSION FUNCTIONS
// ============================================================================

/**
 * Generate Occupations.org.ai from ONET data with semantic expansions
 */
async function generateOccupations(parser: GraphDLParser): Promise<void> {
  console.log('\n📊 Generating Occupations.org.ai...')

  const domain = 'https://occupations.org.ai'
  const onetOccupations = parseTSV(path.join(DATA_DIR, 'ONET.Occupation.tsv'))

  const occupations = onetOccupations.map(row => {
    const parsed = parser.parse(row.name)

    return {
      url: `${domain}/${row.id}`,
      ns: 'occupations.org.ai',
      type: 'Occupation',
      id: row.id,
      name: row.name,
      description: row.description,
      code: row.code,
      sourceUrl: row.sourceUrl,
      // Semantic fields
      graphdl: parser.toGraphDL(parsed),
      predicate: parsed.predicate || '',
      object: parsed.object || '',
      preposition: parsed.preposition || '',
      complement: parsed.complement || '',
      confidence: parsed.confidence,
    }
  })

  writeTSV(path.join(DATA_DIR, 'Occupations.Occupation.tsv'), occupations)
}

/**
 * Generate Tasks.org.ai from ONET task data with semantic expansions
 */
async function generateTasks(parser: GraphDLParser): Promise<void> {
  console.log('\n📊 Generating Tasks.org.ai...')

  const domain = 'https://tasks.org.ai'
  const onetTasks = parseTSV(path.join(DATA_DIR, 'ONET.Task.tsv'))

  const tasks: any[] = []
  const taskMap = new Map<string, any>()

  for (const row of onetTasks) {
    const taskText = row.name || row.description
    if (!taskText) continue

    const parsed = parser.parse(taskText)
    const taskId = createId(taskText)

    // Check if we already have this task
    if (!taskMap.has(taskId)) {
      const task = {
        url: `${domain}/${taskId}`,
        ns: 'tasks.org.ai',
        type: 'Task',
        id: taskId,
        name: taskText,
        description: row.description || taskText,
        code: row.code || '',
        // Semantic fields
        graphdl: parser.toGraphDL(parsed),
        predicate: parsed.predicate || '',
        object: parsed.object || '',
        preposition: parsed.preposition || '',
        complement: parsed.complement || '',
        confidence: parsed.confidence,
        // Track which occupations need this task
        occupations: [row.url],
      }
      taskMap.set(taskId, task)
    } else {
      // Add this occupation to the existing task
      const existing = taskMap.get(taskId)
      if (!existing.occupations.includes(row.url)) {
        existing.occupations.push(row.url)
      }
    }
  }

  // Convert occupations array to count
  for (const task of taskMap.values()) {
    task.occupationCount = task.occupations.length
    task.occupations = task.occupations.join(',')
    tasks.push(task)
  }

  writeTSV(path.join(DATA_DIR, 'Tasks.Task.tsv'), tasks)
}

/**
 * Generate Processes.org.ai from APQC data with semantic expansions
 */
async function generateProcesses(parser: GraphDLParser): Promise<void> {
  console.log('\n📊 Generating Processes.org.ai...')

  const domain = 'https://processes.org.ai'
  const apqcProcesses = parseTSV(path.join(DATA_DIR, 'APQC.Process.tsv'))

  const processes = apqcProcesses.map(row => {
    const parsed = parser.parse(row.name)

    const process = {
      url: `${domain}/${row.id}`,
      ns: 'processes.org.ai',
      type: 'Process',
      id: row.id,
      name: row.name,
      description: row.description,
      code: row.code,
      // Semantic fields
      graphdl: parser.toGraphDL(parsed),
      predicate: parsed.predicate || '',
      object: parsed.object || '',
      preposition: parsed.preposition || '',
      complement: parsed.complement || '',
      confidence: parsed.confidence,
      hasConjunction: parsed.hasConjunction || false,
    }

    return process
  })

  writeTSV(path.join(DATA_DIR, 'Processes.Process.tsv'), processes)

  // Generate expansions for processes with conjunctions
  const expansions: any[] = []
  for (const row of apqcProcesses) {
    const parsed = parser.parse(row.name)
    if (parsed.expansions && parsed.expansions.length > 0) {
      for (const expansion of parsed.expansions) {
        const expId = createId(expansion.original || '')
        expansions.push({
          url: `${domain}/${expId}`,
          ns: 'processes.org.ai',
          type: 'Process',
          id: expId,
          name: expansion.original,
          description: `Expanded from: ${row.name}`,
          code: '',
          graphdl: parser.toGraphDL(expansion),
          predicate: expansion.predicate || '',
          object: expansion.object || '',
          preposition: expansion.preposition || '',
          complement: expansion.complement || '',
          confidence: expansion.confidence,
          parentProcess: row.url,
        })
      }
    }
  }

  if (expansions.length > 0) {
    writeTSV(path.join(DATA_DIR, 'Processes.ProcessExpansion.tsv'), expansions)
  }
}

/**
 * Generate Industries.org.ai from NAICS data
 */
async function generateIndustries(parser: GraphDLParser): Promise<void> {
  console.log('\n📊 Generating Industries.org.ai...')

  const domain = 'https://industries.org.ai'
  const naicsIndustries = parseTSV(path.join(DATA_DIR, 'NAICS.Industry.tsv'))

  const industries = naicsIndustries.map(row => {
    return {
      url: `${domain}/${row.id}`,
      ns: 'industries.org.ai',
      type: 'Industry',
      id: row.id,
      name: row.name,
      description: row.description,
      code: row.code,
      sourceUrl: row.sourceUrl || '',
    }
  })

  writeTSV(path.join(DATA_DIR, 'Industries.Industry.tsv'), industries)
}

/**
 * Generate Products.org.ai from UNSPSC and GS1 data
 */
async function generateProducts(parser: GraphDLParser): Promise<void> {
  console.log('\n📊 Generating Products.org.ai...')

  const domain = 'https://products.org.ai'

  // UNSPSC products
  const unspscFile = path.join(DATA_DIR, 'Standards.UNSPSC.Product.tsv')
  if (fs.existsSync(unspscFile)) {
    const unspscProducts = parseTSV(unspscFile)

    const products = unspscProducts.map(row => {
      return {
        url: `${domain}/UNSPSC/${row.id}`,
        ns: 'products.org.ai',
        type: 'Product',
        id: `UNSPSC_${row.id}`,
        name: row.name,
        description: row.description || row.name,
        code: row.code,
        standard: 'UNSPSC',
        sourceUrl: row.sourceUrl || '',
      }
    })

    writeTSV(path.join(DATA_DIR, 'Products.Product.UNSPSC.tsv'), products)
  }

  // GS1 products
  const gs1File = path.join(DATA_DIR, 'Standards.GS1.Product.tsv')
  if (fs.existsSync(gs1File)) {
    const gs1Products = parseTSV(gs1File)

    const products = gs1Products.map(row => {
      return {
        url: `${domain}/GS1/${row.id}`,
        ns: 'products.org.ai',
        type: 'Product',
        id: `GS1_${row.id}`,
        name: row.name,
        description: row.description || row.name,
        code: row.code,
        standard: 'GS1',
        sourceUrl: row.sourceUrl || '',
      }
    })

    writeTSV(path.join(DATA_DIR, 'Products.Product.GS1.tsv'), products)
  }
}

/**
 * Generate Services.org.ai from NAPCS data
 */
async function generateServices(parser: GraphDLParser): Promise<void> {
  console.log('\n📊 Generating Services.org.ai...')

  const domain = 'https://services.org.ai'
  const napcsServices = parseTSV(path.join(DATA_DIR, 'NAPCS.Product.tsv'))

  const services = napcsServices.map(row => {
    return {
      url: `${domain}/${row.id}`,
      ns: 'services.org.ai',
      type: 'Service',
      id: row.id,
      name: row.name,
      description: row.description || row.name,
      code: row.code,
      sourceUrl: row.sourceUrl || '',
    }
  })

  writeTSV(path.join(DATA_DIR, 'Services.Service.tsv'), services)
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('🔄 Starting Semantic Expansion...')
  console.log('=' .repeat(80))

  // Initialize GraphDL parser with correct source directory
  const parser = new GraphDLParser('.source/Language')
  await parser.initialize()

  await generateOccupations(parser)
  await generateTasks(parser)
  await generateProcesses(parser)
  await generateIndustries(parser)
  await generateProducts(parser)
  await generateServices(parser)

  console.log('\n' + '='.repeat(80))
  console.log('✅ Semantic expansion complete!')
  console.log(`\n📁 Output: ${DATA_DIR}/`)

  // Export unknown words for review
  const unknowns = parser.getUnknownWords(50)
  if (unknowns.length > 0) {
    console.log('\n📝 Top Unknown Words:')
    unknowns.slice(0, 20).forEach(([word, count]) => {
      console.log(`  ${word}: ${count}`)
    })
    parser.exportUnknownWords('.enrichment/Language/unknown-words.tsv')
    console.log('\n  Full list exported to .enrichment/Language/unknown-words.tsv')
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export {
  generateOccupations,
  generateTasks,
  generateProcesses,
  generateIndustries,
  generateProducts,
  generateServices,
}

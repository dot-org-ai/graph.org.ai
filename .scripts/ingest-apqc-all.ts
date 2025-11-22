#!/usr/bin/env tsx
import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

const sourceDir = '.source/APQC'
const outputDir = '.source/APQC'

// Simplified column name mapping
const columnMapping: Record<string, string> = {
  'PCF ID': 'pcfId',
  'Hierarchy ID': 'hierarchyId',
  'Name': 'name',
  'Difference Index': 'differenceIndex',
  'Change Details': 'changeDetails',
  'Metrics Available?': 'metricsAvailable',
  'Element Description': 'elementDescription'
}

interface ProcessRow {
  pcfId: string
  hierarchyId: string
  name: string
  differenceIndex: string
  changeDetails: string
  metricsAvailable: string
  elementDescription: string
  industry: string
}

// Parse a single Excel file
function parseExcelFile(filePath: string, industryName: string): ProcessRow[] {
  console.log(`\nParsing: ${path.basename(filePath)}`)

  const workbook = XLSX.readFile(filePath)

  // Try to find the Combined sheet
  let sheetName = 'Combined'
  if (!workbook.SheetNames.includes(sheetName)) {
    console.log(`  No 'Combined' sheet found, checking for other sheets...`)
    // Try to find a sheet with process data
    const candidateSheets = workbook.SheetNames.filter(s =>
      !['Introduction', 'About', 'Copyright and Attribution', 'Copyright', 'Index'].includes(s)
    )
    if (candidateSheets.length === 0) {
      console.log(`  No suitable sheet found`)
      return []
    }
    sheetName = candidateSheets[0]
    console.log(`  Using sheet: ${sheetName}`)
  }

  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][]

  // Find header row
  let headerRowIndex = -1
  for (let i = 0; i < Math.min(50, data.length); i++) {
    const row = data[i]
    if (row && row.some(cell => cell === 'PCF ID' || cell === 'PCFID')) {
      headerRowIndex = i
      break
    }
  }

  if (headerRowIndex === -1) {
    console.log(`  Could not find header row`)
    return []
  }

  const headers = data[headerRowIndex]
  const rows = data.slice(headerRowIndex + 1)

  console.log(`  Found ${rows.length} rows with headers at row ${headerRowIndex}`)

  // Parse rows
  const processes: ProcessRow[] = []
  for (const row of rows) {
    if (!row || row.length === 0 || !row[0]) continue

    const process: any = {
      industry: industryName
    }

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]?.toString() || ''
      const mappedName = columnMapping[header] || header.toLowerCase().replace(/[^a-z0-9]+/g, '')
      const value = row[i]?.toString() || ''
      process[mappedName] = value
    }

    // Only include rows with PCF ID
    if (process.pcfId) {
      processes.push(process)
    }
  }

  console.log(`  Extracted ${processes.length} processes`)
  return processes
}

// Main execution
console.log('Starting APQC ingestion...\n')

// Get all Excel files
const files = fs.readdirSync(sourceDir)
  .filter(f => f.endsWith('.xlsx'))
  .map(f => path.join(sourceDir, f))

console.log(`Found ${files.length} Excel files`)

// Industry name extraction with explicit mapping
const industryNameMap: Record<string, string> = {
  'K06637': 'aerospace-and-defense',
  'K06638': 'airline',
  'K06639': 'automotive',
  'K06640': 'banking',
  'K06641': 'broadcasting',
  'K06710': 'education',
  'K07121': 'city-government',
  'K07122': 'life-sciences',
  'K07123': 'consumer-electronics',
  'K07126': 'petroleum-downstream',
  'K07127': 'petroleum-upstream',
  'K07128': 'healthcare-provider',
  'K07129': 'property-and-casualty-insurance',
  'K07130': 'health-insurance',
  'K07220': 'utilities',
  'K09276': 'retail',
  'K09277': 'consumer-products'
}

function getIndustryName(filename: string): string {
  const base = path.basename(filename, '.xlsx')

  // Handle cross-industry file
  if (base.includes('Cross-Industry') || base === 'APQC_PCF_7.4') {
    return 'cross-industry'
  }

  // Try explicit mapping first
  const kMatch = base.match(/^(K\d+)/)
  if (kMatch && industryNameMap[kMatch[1]]) {
    return industryNameMap[kMatch[1]]
  }

  // Fallback to extraction
  let match = base.match(/K\d+_(.+?)_v\d/)
  if (match) {
    return match[1].toLowerCase().replace(/[_\s]+/g, '-').trim()
  }

  return base.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

// Parse all files
const allProcesses: ProcessRow[] = []
for (const file of files) {
  const industryName = getIndustryName(file)
  const processes = parseExcelFile(file, industryName)
  allProcesses.push(...processes)
}

console.log(`\n✅ Total processes extracted: ${allProcesses.length}`)

// Write combined output
const tsvHeaders = ['pcfId', 'hierarchyId', 'name', 'elementDescription', 'industry', 'metricsAvailable', 'differenceIndex', 'changeDetails']
const tsvRows = allProcesses.map(p =>
  tsvHeaders.map(h => (p as any)[h] || '').join('\t')
)

const tsv = [tsvHeaders.join('\t'), ...tsvRows].join('\n')
const outputPath = path.join(outputDir, 'APQC.Processes.tsv')
fs.writeFileSync(outputPath, tsv)

console.log(`\n✅ Wrote ${outputPath} with ${allProcesses.length} processes`)

// Write industry breakdown
const byIndustry = new Map<string, number>()
for (const p of allProcesses) {
  byIndustry.set(p.industry, (byIndustry.get(p.industry) || 0) + 1)
}

console.log('\nProcesses by industry:')
for (const [industry, count] of Array.from(byIndustry.entries()).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${industry}: ${count}`)
}

#!/usr/bin/env tsx
import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

const excelPath = '.source/NAICS/2022_NAICS_Structure.xlsx'
const outputPath = '.source/NAICS/NAICS.Industries.tsv'

console.log('Reading NAICS Excel file...')
const workbook = XLSX.readFile(excelPath)
const sheetName = workbook.SheetNames[0]
const worksheet = workbook.Sheets[sheetName]

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

console.log(`Found ${data.length} rows`)

// Find header row (should be around row 9)
let headerRowIndex = -1
for (let i = 0; i < Math.min(20, data.length); i++) {
  const row = data[i] as any[]
  if (row && row.some(cell => cell?.toString().includes('NAICS Code'))) {
    headerRowIndex = i
    break
  }
}

if (headerRowIndex === -1) {
  throw new Error('Could not find header row')
}

const headers = data[headerRowIndex] as string[]
const rows = data.slice(headerRowIndex + 1)

console.log(`Header row at index ${headerRowIndex}`)
console.log('Headers:', headers)
console.log('Sample row:', rows[0])

// Convert to TSV with camelCase headers
const camelCase = (str: string) => {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase())
}

const tsvHeaders = headers.map(h => camelCase(h.toString()))
const tsvRows = rows
  .filter(row => row && row.length > 0)
  .map(row => row.map(cell => cell?.toString() || '').join('\t'))

const tsv = [tsvHeaders.join('\t'), ...tsvRows].join('\n')

fs.writeFileSync(outputPath, tsv)
console.log(`✅ Wrote ${outputPath} with ${rows.length} rows`)

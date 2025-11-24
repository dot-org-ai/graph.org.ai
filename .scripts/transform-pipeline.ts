#!/usr/bin/env tsx

/**
 * Data Transformation Pipeline
 *
 * Transforms raw source data into standardized [Source].[Type].tsv format
 * with consistent camelCase column names.
 *
 * Directory Structure:
 *   .source/[Source]/           - Source directory
 *   .source/[Source]/raw/*      - Raw data files (txt, csv, xlsx, json, etc.)
 *   .source/[Source]/[Source].[Type].tsv - Transformed output
 *
 * Transformation Rules:
 *   1. Column headers: Convert to camelCase (O*NET-SOC Code -> oNETSOCCode)
 *   2. Filenames: Convert to PascalCase ([Source].[Type].tsv)
 *   3. Delimiters: Always use tabs (\t)
 *   4. Encoding: UTF-8
 *   5. Line endings: LF (\n)
 */

import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

const SOURCE_DIR = '.source'

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert string to camelCase for column headers
 */
function toCamelCase(str: string): string {
  return str
    .replace(/O\*NET/g, 'ONET')
    .replace(/%2C/g, '')
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase())
}

/**
 * Convert string to PascalCase for filenames
 */
function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[a-z]/, (chr) => chr.toUpperCase())
}

/**
 * Parse TSV/CSV content
 */
function parseTSV(content: string, delimiter: string = '\t'): any[] {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split(delimiter)
  const camelHeaders = headers.map(h => toCamelCase(h))

  return lines.slice(1).map(line => {
    const values = line.split(delimiter)
    const row: any = {}
    camelHeaders.forEach((header, i) => {
      row[header] = values[i] || ''
    })
    return row
  })
}

/**
 * Write data as TSV with camelCase headers
 */
function writeTSV(filePath: string, data: any[]): void {
  if (data.length === 0) {
    console.warn(`  ⚠️  No data to write for ${path.basename(filePath)}`)
    return
  }

  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(h => row[h] || '').join('\t'))
  const content = [headers.join('\t'), ...rows].join('\n')

  fs.writeFileSync(filePath, content, 'utf-8')
  console.log(`  ✅ ${path.basename(filePath)} (${data.length} rows)`)
}

/**
 * Transform text file with headers (txt, csv, tsv)
 */
function transformTextFile(
  sourcePath: string,
  targetPath: string,
  delimiter: string = '\t'
): void {
  const content = fs.readFileSync(sourcePath, 'utf-8')
  const data = parseTSV(content, delimiter)
  writeTSV(targetPath, data)
}

/**
 * Transform Excel file
 */
function transformExcelFile(
  sourcePath: string,
  targetDir: string,
  sourcePrefix: string
): void {
  const workbook = XLSX.readFile(sourcePath)

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet)

    if (data.length === 0) continue

    // Convert keys to camelCase
    const camelData = data.map((row: any) => {
      const camelRow: any = {}
      for (const key in row) {
        camelRow[toCamelCase(key)] = row[key]
      }
      return camelRow
    })

    const typeName = toPascalCase(sheetName)
    const targetPath = path.join(targetDir, `${sourcePrefix}.${typeName}.tsv`)
    writeTSV(targetPath, camelData)
  }
}

// ============================================================================
// Source-Specific Transformers
// ============================================================================

/**
 * Transform ONET data
 */
function transformONET(): void {
  console.log('\n📊 Transforming O*NET...')

  const rawDir = path.join(SOURCE_DIR, 'ONET/db_30_0_text')
  const targetDir = path.join(SOURCE_DIR, 'ONET')

  if (!fs.existsSync(rawDir)) {
    console.log('  ⚠️  Raw directory not found, skipping')
    return
  }

  const txtFiles = fs.readdirSync(rawDir).filter(f => f.endsWith('.txt'))

  for (const txtFile of txtFiles) {
    const sourcePath = path.join(rawDir, txtFile)
    const typeName = toPascalCase(txtFile.replace('.txt', ''))
    const targetPath = path.join(targetDir, `ONET.${typeName}.tsv`)

    try {
      transformTextFile(sourcePath, targetPath, '\t')
    } catch (error) {
      console.error(`  ❌ Error transforming ${txtFile}:`, error)
    }
  }
}

/**
 * Transform APQC data
 */
function transformAPQC(): void {
  console.log('\n📊 Transforming APQC...')

  const sourceDir = path.join(SOURCE_DIR, 'APQC')

  if (!fs.existsSync(sourceDir)) {
    console.log('  ⚠️  Directory not found, skipping')
    return
  }

  const xlsxFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.xlsx'))

  for (const xlsxFile of xlsxFiles) {
    const sourcePath = path.join(sourceDir, xlsxFile)

    try {
      transformExcelFile(sourcePath, sourceDir, 'APQC')
    } catch (error) {
      console.error(`  ❌ Error transforming ${xlsxFile}:`, error)
    }
  }
}

/**
 * Transform GS1 data
 */
function transformGS1(): void {
  console.log('\n📊 Transforming GS1...')

  const sourceDir = path.join(SOURCE_DIR, 'GS1')

  if (!fs.existsSync(sourceDir)) {
    console.log('  ⚠️  Directory not found, skipping')
    return
  }

  const xlsxFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.xlsx'))

  for (const xlsxFile of xlsxFiles) {
    const sourcePath = path.join(sourceDir, xlsxFile)

    try {
      transformExcelFile(sourcePath, sourceDir, 'GS1')
    } catch (error) {
      console.error(`  ❌ Error transforming ${xlsxFile}:`, error)
    }
  }
}

/**
 * Transform BLS data
 */
function transformBLS(): void {
  console.log('\n📊 Transforming BLS...')

  const sourceDir = path.join(SOURCE_DIR, 'BLS')
  const rawDir = path.join(sourceDir, 'oesm24all')

  if (!fs.existsSync(rawDir)) {
    console.log('  ⚠️  Raw directory not found, skipping')
    return
  }

  const xlsxFiles = fs.readdirSync(rawDir).filter(f => f.endsWith('.xlsx'))

  for (const xlsxFile of xlsxFiles) {
    const sourcePath = path.join(rawDir, xlsxFile)

    try {
      transformExcelFile(sourcePath, sourceDir, 'BLS')
    } catch (error) {
      console.error(`  ❌ Error transforming ${xlsxFile}:`, error)
    }
  }
}

/**
 * Transform GeoNames data
 */
function transformGeoNames(): void {
  console.log('\n📊 Transforming GeoNames...')

  const sourceDir = path.join(SOURCE_DIR, 'GeoNames')

  if (!fs.existsSync(sourceDir)) {
    console.log('  ⚠️  Directory not found, skipping')
    return
  }

  // allCountries.txt - tab-delimited, custom headers
  const allCountriesPath = path.join(sourceDir, 'allCountries.txt')
  if (fs.existsSync(allCountriesPath)) {
    // GeoNames has a specific format without headers
    // We'll need to add headers based on their documentation
    console.log('  ⚠️  allCountries.txt requires custom header mapping')
  }

  // countryInfo.txt - tab-delimited with headers
  const countryInfoPath = path.join(sourceDir, 'countryInfo.txt')
  if (fs.existsSync(countryInfoPath)) {
    try {
      const targetPath = path.join(sourceDir, 'GeoNames.CountryInfo.tsv')
      transformTextFile(countryInfoPath, targetPath, '\t')
    } catch (error) {
      console.error(`  ❌ Error transforming countryInfo.txt:`, error)
    }
  }
}

/**
 * Transform NAICS data
 */
function transformNAICS(): void {
  console.log('\n📊 Transforming NAICS...')

  const sourceDir = path.join(SOURCE_DIR, 'NAICS')

  if (!fs.existsSync(sourceDir)) {
    console.log('  ⚠️  Directory not found, skipping')
    return
  }

  const xlsxFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.xlsx'))

  for (const xlsxFile of xlsxFiles) {
    const sourcePath = path.join(sourceDir, xlsxFile)

    try {
      transformExcelFile(sourcePath, sourceDir, 'NAICS')
    } catch (error) {
      console.error(`  ❌ Error transforming ${xlsxFile}:`, error)
    }
  }
}

/**
 * Transform UNSPSC data
 */
function transformUNSPSC(): void {
  console.log('\n📊 Transforming UNSPSC...')

  const sourceDir = path.join(SOURCE_DIR, 'UNSPSC')

  if (!fs.existsSync(sourceDir)) {
    console.log('  ⚠️  Directory not found, skipping')
    return
  }

  // Check for any xlsx, csv, or txt files
  const files = fs.readdirSync(sourceDir)

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file)

    if (file.endsWith('.xlsx')) {
      try {
        transformExcelFile(sourcePath, sourceDir, 'UNSPSC')
      } catch (error) {
        console.error(`  ❌ Error transforming ${file}:`, error)
      }
    } else if (file.endsWith('.csv')) {
      try {
        const typeName = toPascalCase(file.replace('.csv', ''))
        const targetPath = path.join(sourceDir, `UNSPSC.${typeName}.tsv`)
        transformTextFile(sourcePath, targetPath, ',')
      } catch (error) {
        console.error(`  ❌ Error transforming ${file}:`, error)
      }
    }
  }
}

/**
 * Transform AdvanceCTE data
 */
function transformAdvanceCTE(): void {
  console.log('\n📊 Transforming AdvanceCTE...')

  const sourceDir = path.join(SOURCE_DIR, 'AdvanceCTE')

  if (!fs.existsSync(sourceDir)) {
    console.log('  ⚠️  Directory not found, skipping')
    return
  }

  const xlsxFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.xlsx'))

  for (const xlsxFile of xlsxFiles) {
    const sourcePath = path.join(sourceDir, xlsxFile)

    try {
      transformExcelFile(sourcePath, sourceDir, 'AdvanceCTE')
    } catch (error) {
      console.error(`  ❌ Error transforming ${xlsxFile}:`, error)
    }
  }
}

/**
 * Transform Schema.org data
 */
function transformSchemaOrg(): void {
  console.log('\n📊 Transforming Schema.org...')

  const sourceDir = path.join(SOURCE_DIR, 'Schema.org')

  if (!fs.existsSync(sourceDir)) {
    console.log('  ⚠️  Directory not found, skipping')
    return
  }

  // Check for any source files that aren't already TSV
  const files = fs.readdirSync(sourceDir)

  for (const file of files) {
    if (file.startsWith('Schema.org.') && file.endsWith('.tsv')) {
      console.log(`  ✓ ${file} already exists`)
      continue
    }

    const sourcePath = path.join(sourceDir, file)

    if (file.endsWith('.json') || file.endsWith('.jsonld')) {
      console.log('  ⚠️  JSON-LD files require custom parsing')
    }
  }
}

/**
 * Transform NAPCS data
 */
function transformNAPCS(): void {
  console.log('\n📊 Transforming NAPCS...')

  const sourceDir = path.join(SOURCE_DIR, 'NAPCS')

  if (!fs.existsSync(sourceDir)) {
    console.log('  ⚠️  Directory not found, skipping')
    return
  }

  const files = fs.readdirSync(sourceDir)

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file)

    if (file.endsWith('.xlsx')) {
      try {
        transformExcelFile(sourcePath, sourceDir, 'NAPCS')
      } catch (error) {
        console.error(`  ❌ Error transforming ${file}:`, error)
      }
    } else if (file.endsWith('.csv')) {
      try {
        const typeName = toPascalCase(file.replace('.csv', ''))
        const targetPath = path.join(sourceDir, `NAPCS.${typeName}.tsv`)
        transformTextFile(sourcePath, targetPath, ',')
      } catch (error) {
        console.error(`  ❌ Error transforming ${file}:`, error)
      }
    }
  }
}

// ============================================================================
// Main Pipeline
// ============================================================================

async function main(): Promise<void> {
  console.log('🔄 Starting Data Transformation Pipeline...')
  console.log('=' .repeat(80))

  // Transform each source
  transformONET()
  transformNAICS()
  transformNAPCS()
  transformUNSPSC()
  transformAdvanceCTE()
  transformGeoNames()
  transformSchemaOrg()
  transformGS1()
  transformAPQC()
  // transformBLS() // Skip for now - 78MB file takes too long

  console.log('\n' + '='.repeat(80))
  console.log('✅ Transformation pipeline complete!')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export {
  toCamelCase,
  toPascalCase,
  parseTSV,
  writeTSV,
  transformTextFile,
  transformExcelFile,
  transformONET,
  transformAPQC,
  transformGS1,
  transformBLS,
  transformGeoNames,
  transformNAICS,
  transformNAPCS,
  transformUNSPSC,
  transformAdvanceCTE,
  transformSchemaOrg,
}

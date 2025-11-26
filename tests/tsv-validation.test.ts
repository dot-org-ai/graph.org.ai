/**
 * TSV Validation Tests
 *
 * Ensures all TSV files have consistent field counts to prevent
 * ClickHouse ingestion failures.
 */

import * as fs from 'fs'
import * as readline from 'readline'
import { describe, it, expect } from 'vitest'
import * as path from 'path'

const DATA_DIR = path.join(__dirname, '../.data')

// Critical files for ClickHouse ingestion
const CRITICAL_FILES = [
  'Products.tsv',
  'Services.tsv',
  'Products.Relationships.tsv',
  'Services.Relationships.tsv',
]

async function validateTSVFieldCounts(filePath: string): Promise<{
  valid: boolean
  headerFields: number
  issues: Array<{ line: number; fields: number }>
}> {
  const fileStream = fs.createReadStream(filePath)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })

  let lineNum = 0
  let headerFields = 0
  const issues: Array<{ line: number; fields: number }> = []

  for await (const line of rl) {
    lineNum++

    const fields = line.split('\t')

    if (lineNum === 1) {
      headerFields = fields.length
    } else {
      if (fields.length !== headerFields) {
        issues.push({ line: lineNum, fields: fields.length })

        // Only collect first 10 issues for performance
        if (issues.length >= 10) break
      }
    }

    // Only check first 1000 lines for quick validation
    if (lineNum > 1000) break
  }

  return {
    valid: issues.length === 0,
    headerFields,
    issues,
  }
}

describe('TSV Field Count Validation', () => {
  describe('Critical Files for ClickHouse Ingestion', () => {
    for (const filename of CRITICAL_FILES) {
      it(`${filename} should have consistent field counts`, async () => {
        const filePath = path.join(DATA_DIR, filename)

        if (!fs.existsSync(filePath)) {
          console.warn(`⚠️  File not found: ${filePath}`)
          return
        }

        const result = await validateTSVFieldCounts(filePath)

        if (!result.valid) {
          console.error(`\n❌ ${filename} has field count mismatches:`)
          console.error(`   Header: ${result.headerFields} fields`)
          console.error(`   Issues (first 10):`)
          result.issues.forEach(issue => {
            console.error(`     Line ${issue.line}: ${issue.fields} fields (expected ${result.headerFields})`)
          })
        }

        expect(result.valid).toBe(true)
      }, { timeout: 60000 })
    }
  })

  describe('All TSV Files', () => {
    it('should have .tsv extension only for TSV files', () => {
      const files = fs.readdirSync(DATA_DIR)
      const tsvFiles = files.filter(f => f.endsWith('.tsv'))

      tsvFiles.forEach(file => {
        const filePath = path.join(DATA_DIR, file)
        const content = fs.readFileSync(filePath, 'utf-8')
        const firstLine = content.split('\n')[0]

        // TSV files should use tabs, not other delimiters
        const hasTabs = firstLine.includes('\t')
        const hasCommas = firstLine.includes(',')
        const hasPipes = firstLine.includes('|')

        if (!hasTabs) {
          console.warn(`⚠️  ${file}: No tabs found in header, may not be TSV format`)
        }

        if (hasTabs && (hasCommas || hasPipes)) {
          console.warn(`⚠️  ${file}: Mixed delimiters detected`)
        }

        expect(hasTabs).toBe(true)
      })
    })
  })
})

describe('TSV Header Validation', () => {
  const EXPECTED_ENTITY_HEADERS = ['url', 'ns', 'type', 'id', 'code', 'name', 'description']

  // Two relationship schemas are in use:
  const STANDARD_RELATIONSHIP_HEADERS = ['ns', 'from', 'to', 'predicate', 'reverse']
  const EXTRACTED_RELATIONSHIP_HEADERS = ['sourceUrl', 'relationshipType', 'targetUrl', 'targetType', 'confidence', 'extractionMethod']

  describe('Entity Files', () => {
    const entityFiles = ['Products.tsv', 'Services.tsv']

    for (const filename of entityFiles) {
      it(`${filename} should have standard entity headers`, () => {
        const filePath = path.join(DATA_DIR, filename)

        if (!fs.existsSync(filePath)) {
          console.warn(`⚠️  File not found: ${filePath}`)
          return
        }

        const content = fs.readFileSync(filePath, 'utf-8')
        const headers = content.split('\n')[0].split('\t')

        // Check that standard headers are present (but allow additional columns)
        const missingHeaders = EXPECTED_ENTITY_HEADERS.filter(h => !headers.includes(h))

        if (missingHeaders.length > 0) {
          console.error(`\n❌ ${filename} missing headers: ${missingHeaders.join(', ')}`)
          console.error(`   Current headers: ${headers.join(', ')}`)
        }

        expect(missingHeaders).toEqual([])
      })
    }
  })

  describe('Relationship Files', () => {
    it('Products.Relationships.tsv should use standard schema', () => {
      const filePath = path.join(DATA_DIR, 'Products.Relationships.tsv')

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filePath}`)
        return
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      const headers = content.split('\n')[0].split('\t')

      // Check for standard schema
      const missingHeaders = STANDARD_RELATIONSHIP_HEADERS.filter(h => !headers.includes(h))

      if (missingHeaders.length > 0) {
        console.error(`\n❌ Products.Relationships.tsv missing headers: ${missingHeaders.join(', ')}`)
        console.error(`   Current headers: ${headers.join(', ')}`)
      }

      expect(missingHeaders).toEqual([])
    })

    it('Services.Relationships.tsv should use extracted schema', () => {
      const filePath = path.join(DATA_DIR, 'Services.Relationships.tsv')

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filePath}`)
        return
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      const headers = content.split('\n')[0].split('\t')

      // Check for extracted schema
      const missingHeaders = EXTRACTED_RELATIONSHIP_HEADERS.filter(h => !headers.includes(h))

      if (missingHeaders.length > 0) {
        console.error(`\n❌ Services.Relationships.tsv missing headers: ${missingHeaders.join(', ')}`)
        console.error(`   Current headers: ${headers.join(', ')}`)
      }

      expect(missingHeaders).toEqual([])
    })
  })
})

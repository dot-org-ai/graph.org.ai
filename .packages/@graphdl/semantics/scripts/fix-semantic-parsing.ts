#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Fix semantic parsing issues:
 * 1. Add 'name' column to all generated TSV files for debugging
 * 2. Use short aliases from existing Occupations.tsv where available
 * 3. Fix toPascalCase to handle comma-separated lists properly
 *
 * Issues found:
 * - AdultBasicEducationAdultSecondaryEducationEnglishAsSecondLanguageInstructors
 *   Should be: ESLInstructors with name "Adult Basic Education, Adult Secondary Education, and English as a Second Language Instructors"
 */

const repoRoot = path.resolve(import.meta.dirname, '../../../..')
const dataDir = path.join(repoRoot, '.data')

// Load short aliases from Occupations.tsv
function loadOccupationAliases(): Map<string, string> {
  const aliasMap = new Map<string, string>()
  const occupationsPath = path.join(dataDir, 'Occupations.tsv')

  if (fs.existsSync(occupationsPath)) {
    const content = fs.readFileSync(occupationsPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')
    const idIdx = headers.indexOf('id')
    const nameIdx = headers.indexOf('name')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const cols = line.split('\t')
      const id = cols[idIdx]
      const name = cols[nameIdx]

      if (id && name) {
        aliasMap.set(name, id)
      }
    }
  }

  console.log(`Loaded ${aliasMap.size} occupation aliases`)
  return aliasMap
}

// Improved toPascalCase that handles comma-separated lists
function smartPascalCase(text: string, occupationAliases: Map<string, string>): string {
  // First check if we have a short alias
  if (occupationAliases.has(text)) {
    return occupationAliases.get(text)!
  }

  // For comma-separated lists, take only the last significant part or create acronym
  if (text.includes(',')) {
    const parts = text.split(',').map(p => p.trim())

    // Try to find a dominant term or acronym
    // Example: "Adult Basic Education, Adult Secondary Education, and English as a Second Language Instructors"
    // Should become: "ESLInstructors" or take last part "English as a Second Language Instructors"

    // If last part contains "and", split on "and" and use that
    const lastPart = parts[parts.length - 1]
    if (lastPart.toLowerCase().includes(' and ')) {
      const andParts = lastPart.split(/\s+and\s+/i)
      const mainTerm = andParts[andParts.length - 1].trim()
      return toPascalCase(mainTerm)
    }

    // Otherwise use last comma-separated part
    return toPascalCase(lastPart)
  }

  return toPascalCase(text)
}

function toPascalCase(text: string): string {
  const articles = new Set(['the', 'a', 'an'])
  const conjunctions = new Set(['and', 'or', 'but', 'nor', 'so', 'yet'])
  const prepositions = new Set(['in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by', 'as'])

  const tokens = text.split(/[\s\-\/,;:()]+/).filter(t => t.trim())

  const result = tokens
    .filter(t => {
      const lower = t.toLowerCase()
      return !articles.has(lower) && !conjunctions.has(lower) && !prepositions.has(lower)
    })
    .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join('')

  return result || text.replace(/\s+/g, '')
}

// Fix Roles.tsv
function fixRolesTsv(occupationAliases: Map<string, string>) {
  console.log('\n🔧 Fixing Roles.tsv...')

  const rolesPath = path.join(dataDir, 'Roles.tsv')
  if (!fs.existsSync(rolesPath)) {
    console.log('  ⚠️  Roles.tsv not found')
    return
  }

  const content = fs.readFileSync(rolesPath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split('\t')

  // Check if 'name' column already exists
  if (headers.includes('name')) {
    console.log('  ✓ Roles.tsv already has name column')
    return
  }

  // Read ONET.Occupation.tsv to get original names
  const onetPath = path.join(dataDir, 'ONET.Occupation.tsv')
  const onetContent = fs.readFileSync(onetPath, 'utf-8')
  const onetLines = onetContent.split('\n')
  const onetHeaders = onetLines[0].split('\t')
  const onetNameIdx = onetHeaders.findIndex(h => h === 'name' || h === 'title')
  const onetCodeIdx = onetHeaders.findIndex(h => h === 'code')

  const onetNameMap = new Map<string, string>()
  for (let i = 1; i < onetLines.length; i++) {
    const line = onetLines[i]
    if (!line.trim()) continue
    const cols = line.split('\t')
    const code = cols[onetCodeIdx]
    const name = cols[onetNameIdx]
    if (code && name) {
      onetNameMap.set(code, name)
    }
  }

  console.log(`  Loaded ${onetNameMap.size} ONET occupation names`)

  // Rebuild Roles.tsv with proper IDs and name column
  const newRows: string[] = []
  newRows.push('id\tname\tdescription\tlevel')

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const oldId = cols[0]
    const description = cols[1] || ''
    const level = cols[2] || ''

    // Find original name - check description first, then try to match by ID
    let originalName = description

    // Try to find in ONET by matching
    if (!originalName) {
      // This is tricky - we'd need to reverse engineer from the broken ID
      // For now, keep the old ID and add empty name
      newRows.push(`${oldId}\t\t${description}\t${level}`)
      continue
    }

    // Get proper short alias
    const newId = smartPascalCase(originalName, occupationAliases)
    newRows.push(`${newId}\t${originalName}\t${description}\t${level}`)
  }

  // Write fixed file
  fs.writeFileSync(rolesPath, newRows.join('\n'))
  console.log(`  ✓ Fixed Roles.tsv (${newRows.length - 1} roles)`)
}

// Fix Jobs.tsv (add name column)
function fixJobsTsv(occupationAliases: Map<string, string>) {
  console.log('\n🔧 Fixing Jobs.tsv...')

  const jobsPath = path.join(dataDir, 'Jobs.tsv')
  if (!fs.existsSync(jobsPath)) {
    console.log('  ⚠️  Jobs.tsv not found')
    return
  }

  const content = fs.readFileSync(jobsPath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split('\t')

  // Check current structure
  const idIdx = headers.indexOf('id')
  const nameIdx = headers.indexOf('name')
  const descIdx = headers.indexOf('description')
  const occIdx = headers.indexOf('occupation')
  const levelIdx = headers.indexOf('level')

  if (nameIdx >= 0) {
    console.log('  ✓ Jobs.tsv already has name column')
    return
  }

  // Need to regenerate with proper structure
  console.log('  ⚠️  Jobs.tsv needs regeneration with name column')
}

async function main() {
  console.log('='.repeat(100))
  console.log('SEMANTIC PARSING FIX')
  console.log('='.repeat(100))

  const occupationAliases = loadOccupationAliases()

  // Test the smart PascalCase
  const testName = 'Adult Basic Education, Adult Secondary Education, and English as a Second Language Instructors'
  const result = smartPascalCase(testName, occupationAliases)
  console.log(`\nTest: "${testName}"`)
  console.log(`Result: ${result}`)
  console.log(`Expected: ESLInstructors`)
  console.log(`Match: ${result === 'ESLInstructors' ? '✓' : '✗'}`)

  // Fix files
  // fixRolesTsv(occupationAliases)
  // fixJobsTsv(occupationAliases)

  console.log('\n' + '='.repeat(100))
  console.log('✅ Analysis complete!')
  console.log('='.repeat(100))
}

main().catch(console.error)

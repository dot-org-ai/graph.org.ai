#!/usr/bin/env tsx

/**
 * Data Generation Script
 *
 * Generates clean .data/[Subdomain].[TypeName].tsv files from .source/ data
 * with standardized fields: $id, $type, $context, name, description, code, + source fields
 *
 * Output pattern:
 *   .data/Schema.[TypeName].tsv
 *   .data/Schema.[TypeName].Relationships.tsv
 *   .data/ONET.[TypeName].tsv
 *   .data/ONET.[TypeName].Relationships.tsv
 *   .data/NAICS.[TypeName].tsv
 *   .data/APQC.[TypeName].tsv
 *   .data/Standards.[StandardName].[TypeName].tsv
 */

import fs from 'fs'
import path from 'path'

const SOURCE_DIR = '.source'
const DATA_DIR = '.data'

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse TSV file into array of objects
 */
function parseTSV(filePath: string): any[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())

  if (lines.length === 0) return []

  const headers = lines[0].split('\t')

  return lines.slice(1).map(line => {
    const values = line.split('\t')
    const row: any = {}
    headers.forEach((header, i) => {
      row[header] = values[i] || ''
    })
    return row
  })
}

/**
 * Write TSV file from array of objects
 */
function writeTSV(filePath: string, data: any[]): void {
  if (data.length === 0) {
    console.warn(`  ⚠️  No data to write for ${path.basename(filePath)}`)
    return
  }

  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(h => (row[h] ?? '').toString()).join('\t'))
  const content = [headers.join('\t'), ...rows].join('\n')

  fs.writeFileSync(filePath, content, 'utf-8')
  console.log(`  ✅ ${path.basename(filePath)} (${data.length} rows)`)
}

/**
 * Write relationships TSV
 * Format: ns, from, predicate, reverse, to
 */
function writeRelationshipsTSV(filePath: string, relationships: any[]): void {
  if (relationships.length === 0) {
    return
  }

  writeTSV(filePath, relationships)
}

/**
 * Create URL-safe identifier from name
 */
function createId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ============================================================================
// Data Generators
// ============================================================================

/**
 * Generate Schema.org.ai data
 */
function generateSchemaOrgData(): void {
  console.log('\n📊 Generating Schema.org.ai data...')

  const domain = 'https://schema.org.ai'

  // Types
  const typesSource = parseTSV(path.join(SOURCE_DIR, 'Schema.org/Schema.org.Types.tsv'))
  const typesData = typesSource.map(row => ({
    $id: `${domain}/${row.label || row.name}`,
    $type: 'https://schema.org.ai/Class',
    $context: domain,
    name: row.label || row.name,
    description: row.comment || row.description || '',
    code: row.id || '',
    subClassOf: row.subClassOf || '',
    url: row.url || row.id || '',
  }))
  writeTSV(path.join(DATA_DIR, 'Schema.Class.tsv'), typesData)

  // Properties
  const propsSource = parseTSV(path.join(SOURCE_DIR, 'Schema.org/Schema.org.Properties.tsv'))
  const propsData = propsSource.map(row => ({
    $id: `${domain}/${row.label || row.name}`,
    $type: 'https://schema.org.ai/Property',
    $context: domain,
    name: row.label || row.name,
    description: row.comment || row.description || '',
    code: row.id || '',
    domainIncludes: row.domainIncludes || '',
    rangeIncludes: row.rangeIncludes || '',
    url: row.url || row.id || '',
  }))
  writeTSV(path.join(DATA_DIR, 'Schema.Property.tsv'), propsData)

  // Generate Schema relationships
  const relationships: any[] = []

  // Class -> subClassOf relationships
  typesSource.forEach(row => {
    if (row.subClassOf) {
      const fromClass = typesData.find(t => t.code === row.id)
      if (fromClass) {
        relationships.push({
          ns: 'schema',
          from: fromClass.$id,
          predicate: 'subClassOf',
          reverse: 'superClassOf',
          to: `${domain}/${row.subClassOf.split('/').pop()}`,
        })
      }
    }
  })

  // Property -> domainIncludes relationships
  propsSource.forEach(row => {
    if (row.domainIncludes) {
      const prop = propsData.find(p => p.code === row.id)
      if (prop) {
        const domains = row.domainIncludes.split(',').map((d: string) => d.trim())
        domains.forEach((domain: string) => {
          relationships.push({
            ns: 'schema',
            from: prop.$id,
            predicate: 'domainIncludes',
            reverse: 'hasProperty',
            to: `${domain}/${domain.split('/').pop()}`,
          })
        })
      }
    }
  })

  writeRelationshipsTSV(path.join(DATA_DIR, 'Schema.Class.Relationships.tsv'), relationships)
}

/**
 * Generate ONET.org.ai data
 */
function generateONETData(): void {
  console.log('\n📊 Generating ONET.org.ai data...')

  const domain = 'https://onet.org.ai'

  // Occupations
  const occupationsSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.OccupationData.tsv'))
  const occupationsData = occupationsSource.map(row => ({
    $id: `${domain}/Occupation/${createId(row.title)}`,
    $type: 'https://onet.org.ai/Occupation',
    $context: domain,
    name: row.title,
    description: row.description || '',
    code: row.oNETSOCCode,
    url: `https://www.onetonline.org/link/summary/${row.oNETSOCCode}`,
  }))
  writeTSV(path.join(DATA_DIR, 'ONET.Occupation.tsv'), occupationsData)

  // Skills
  const skillsSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.Skills.tsv'))
  const uniqueSkills = new Map<string, any>()

  skillsSource.forEach(row => {
    const id = row.elementID
    if (!uniqueSkills.has(id)) {
      uniqueSkills.set(id, {
        $id: `${domain}/Skill/${createId(row.elementName)}`,
        $type: 'https://onet.org.ai/Skill',
        $context: domain,
        name: row.elementName,
        description: row.elementName,
        code: row.elementID,
      })
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.Skill.tsv'), Array.from(uniqueSkills.values()))

  // Knowledge
  const knowledgeSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.Knowledge.tsv'))
  const uniqueKnowledge = new Map<string, any>()

  knowledgeSource.forEach(row => {
    const id = row.elementID
    if (!uniqueKnowledge.has(id)) {
      uniqueKnowledge.set(id, {
        $id: `${domain}/Knowledge/${createId(row.elementName)}`,
        $type: 'https://onet.org.ai/Knowledge',
        $context: domain,
        name: row.elementName,
        description: row.elementName,
        code: row.elementID,
      })
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.Knowledge.tsv'), Array.from(uniqueKnowledge.values()))

  // Abilities
  const abilitiesSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.Abilities.tsv'))
  const uniqueAbilities = new Map<string, any>()

  abilitiesSource.forEach(row => {
    const id = row.elementID
    if (!uniqueAbilities.has(id)) {
      uniqueAbilities.set(id, {
        $id: `${domain}/Ability/${createId(row.elementName)}`,
        $type: 'https://onet.org.ai/Ability',
        $context: domain,
        name: row.elementName,
        description: row.elementName,
        code: row.elementID,
      })
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.Ability.tsv'), Array.from(uniqueAbilities.values()))

  // Work Activities
  const activitiesSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.WorkActivities.tsv'))
  const uniqueActivities = new Map<string, any>()

  activitiesSource.forEach(row => {
    const id = row.elementID
    if (!uniqueActivities.has(id)) {
      uniqueActivities.set(id, {
        $id: `${domain}/WorkActivity/${createId(row.elementName)}`,
        $type: 'https://onet.org.ai/WorkActivity',
        $context: domain,
        name: row.elementName,
        description: row.elementName,
        code: row.elementID,
      })
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.WorkActivity.tsv'), Array.from(uniqueActivities.values()))

  // Generate relationships
  const relationships: any[] = []

  // Occupation -> Skill relationships
  skillsSource.forEach(row => {
    if (row.oNETSOCCode && row.elementID) {
      const occupation = occupationsData.find(o => o.code === row.oNETSOCCode)
      if (occupation) {
        relationships.push({
          ns: 'onet',
          from: occupation.$id,
          predicate: 'requiresSkill',
          reverse: 'skillFor',
          to: `${domain}/Skill/${createId(row.elementName)}`,
        })
      }
    }
  })

  // Occupation -> Knowledge relationships
  knowledgeSource.forEach(row => {
    if (row.oNETSOCCode && row.elementID) {
      const occupation = occupationsData.find(o => o.code === row.oNETSOCCode)
      if (occupation) {
        relationships.push({
          ns: 'onet',
          from: occupation.$id,
          predicate: 'requiresKnowledge',
          reverse: 'knowledgeFor',
          to: `${domain}/Knowledge/${createId(row.elementName)}`,
        })
      }
    }
  })

  // Occupation -> Ability relationships
  abilitiesSource.forEach(row => {
    if (row.oNETSOCCode && row.elementID) {
      const occupation = occupationsData.find(o => o.code === row.oNETSOCCode)
      if (occupation) {
        relationships.push({
          ns: 'onet',
          from: occupation.$id,
          predicate: 'requiresAbility',
          reverse: 'abilityFor',
          to: `${domain}/Ability/${createId(row.elementName)}`,
        })
      }
    }
  })

  // Occupation -> WorkActivity relationships
  activitiesSource.forEach(row => {
    if (row.oNETSOCCode && row.elementID) {
      const occupation = occupationsData.find(o => o.code === row.oNETSOCCode)
      if (occupation) {
        relationships.push({
          ns: 'onet',
          from: occupation.$id,
          predicate: 'involvesActivity',
          reverse: 'activityOf',
          to: `${domain}/WorkActivity/${createId(row.elementName)}`,
        })
      }
    }
  })

  writeRelationshipsTSV(path.join(DATA_DIR, 'ONET.Occupation.Relationships.tsv'), relationships)
}

/**
 * Generate NAICS.org.ai data
 */
function generateNAICSData(): void {
  console.log('\n📊 Generating NAICS.org.ai data...')

  const domain = 'https://naics.org.ai'

  const industriesFile = path.join(SOURCE_DIR, 'NAICS/NAICS.Industries.tsv')

  if (!fs.existsSync(industriesFile)) {
    console.log('  ⚠️  NAICS.Industries.tsv not found')
    return
  }

  const source = parseTSV(industriesFile)

  const data = source
    .filter(row => row['2022NAICSCode'] && row['2022NAICSTitle'])
    .map(row => ({
      $id: `${domain}/Industry/${row['2022NAICSCode']}`,
      $type: 'https://naics.org.ai/Industry',
      $context: domain,
      name: row['2022NAICSTitle'].trim(),
      description: row['2022NAICSTitle'].trim(),
      code: row['2022NAICSCode'],
    }))

  writeTSV(path.join(DATA_DIR, 'NAICS.Industry.tsv'), data)
}

/**
 * Generate NAPCS.org.ai data
 */
function generateNAPCSData(): void {
  console.log('\n📊 Generating NAPCS.org.ai data...')

  const domain = 'https://napcs.org.ai'

  const source = parseTSV(path.join(SOURCE_DIR, 'NAPCS/NAPCS.NAPCS2022Structure.tsv'))

  const data = source
    .filter(row => row.code && row.hierarchicalStructure)
    .map(row => ({
      $id: `${domain}/Product/${row.code}`,
      $type: 'https://napcs.org.ai/Product',
      $context: domain,
      name: row.hierarchicalStructure,
      description: row.hierarchicalStructure,
      code: row.code,
      level: row.level || '',
      parent: row.parent || '',
    }))

  writeTSV(path.join(DATA_DIR, 'NAPCS.Product.tsv'), data)
}

/**
 * Generate APQC.org.ai data
 */
function generateAPQCData(): void {
  console.log('\n📊 Generating APQC.org.ai data...')

  const domain = 'https://apqc.org.ai'

  // Find a Combined TSV file
  const combinedFile = path.join(SOURCE_DIR, 'APQC/APQC.Combined.tsv')

  if (!fs.existsSync(combinedFile)) {
    console.log('  ⚠️  APQC.Combined.tsv not found')
    return
  }

  const source = parseTSV(combinedFile)

  const data = source
    .filter(row => row.pCFID && row.name)
    .map(row => ({
      $id: `${domain}/Process/${row.pCFID}`,
      $type: 'https://apqc.org.ai/Process',
      $context: domain,
      name: row.name,
      description: row.elementDescription || row.name,
      code: row.pCFID,
      hierarchyID: row.hierarchyID || '',
    }))

  writeTSV(path.join(DATA_DIR, 'APQC.Process.tsv'), data)
}

/**
 * Generate UNSPSC Standards.org.ai data
 */
function generateUNSPSCData(): void {
  console.log('\n📊 Generating Standards.org.ai UNSPSC data...')

  const domain = 'https://standards.org.ai'

  const source = parseTSV(path.join(SOURCE_DIR, 'UNSPSC/UNSPSC.Codes.tsv'))

  const data = source
    .filter(row => row.commodityCode && row.commodityTitle)
    .map(row => ({
      $id: `${domain}/UNSPSC/${row.commodityCode}`,
      $type: 'https://standards.org.ai/UNSPSC/Product',
      $context: `${domain}/UNSPSC`,
      name: row.commodityTitle,
      description: row.definition || row.commodityTitle,
      code: row.commodityCode,
      segment: row.segmentCode || '',
      family: row.familyCode || '',
      class: row.classCode || '',
    }))

  writeTSV(path.join(DATA_DIR, 'Standards.UNSPSC.Product.tsv'), data)
}

/**
 * Generate GS1 Standards.org.ai data
 */
function generateGS1Data(): void {
  console.log('\n📊 Generating Standards.org.ai GS1 data...')

  const domain = 'https://standards.org.ai'

  const schemaFile = path.join(SOURCE_DIR, 'GS1/GS1.Schema.tsv')

  if (!fs.existsSync(schemaFile)) {
    console.log('  ⚠️  GS1.Schema.tsv not found')
    return
  }

  const source = parseTSV(schemaFile)

  // GS1 Schema has: segmentCode, segmentTitle, segmentDefinition, familyCode, familyTitle, etc.
  // We'll use the brick level (most specific)
  const data = source
    .filter(row => row.brickCode && row.brickTitle)
    .map(row => ({
      $id: `${domain}/GS1/${row.brickCode}`,
      $type: 'https://standards.org.ai/GS1/Product',
      $context: `${domain}/GS1`,
      name: row.brickTitle,
      description: row.brickDefinition || row.brickTitle || '',
      code: row.brickCode,
      segment: row.segmentCode || '',
      family: row.familyCode || '',
      class: row.classCode || '',
    }))

  writeTSV(path.join(DATA_DIR, 'Standards.GS1.Product.tsv'), data)
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  console.log('🔄 Starting Data Generation...')
  console.log('=' .repeat(80))

  generateSchemaOrgData()
  generateONETData()
  generateNAICSData()
  generateNAPCSData()
  generateAPQCData()
  generateUNSPSCData()
  generateGS1Data()

  console.log('\n' + '='.repeat(80))
  console.log('✅ Data generation complete!')
  console.log(`\n📁 Output: ${DATA_DIR}/`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export {
  generateSchemaOrgData,
  generateONETData,
  generateNAICSData,
  generateNAPCSData,
  generateAPQCData,
  generateUNSPSCData,
  generateGS1Data,
}

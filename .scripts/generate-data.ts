#!/usr/bin/env tsx

/**
 * Data Generation Script
 *
 * Generates clean .data/[Subdomain].[TypeName].tsv files from .source/ data
 * with standardized fields: url, ns, type, id, name, description, code, + source fields
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
 * Create Wikipedia-style identifier from name (replace spaces with underscores)
 */
function createId(name: string): string {
  return name
    .replace(/ /g, '_')
    .replace(/\//g, '_')
    .replace(/\?/g, '')
    .replace(/"/g, '')  // Remove quotes
    .replace(/'/g, '')  // Remove single quotes
}

/**
 * Get code field only if different from name (otherwise empty for null in DB)
 */
function getCode(code: string, name: string): string {
  return code && code !== name ? code : ''
}

/**
 * Create entity object with simplified column structure
 */
function createEntity(domain: string, typeName: string, id: string, data: any) {
  return {
    url: `${domain}/${typeName}/${id}`,
    ns: domain.replace('https://', ''),
    type: typeName,
    id: id,
    ...data,
    sourceUrl: data.sourceUrl || ''
  }
}

// Special helper for Schema.org entities that don't have type in URL
function createSchemaEntity(domain: string, typeName: string, id: string, data: any) {
  return {
    url: `${domain}/${id}`,
    ns: domain.replace('https://', ''),
    type: typeName,
    id: id,
    ...data
  }
}

// Helper to clean schema: prefix from values
function cleanSchemaPrefix(value: string): string {
  if (!value) return ''
  return value.replace(/schema:/g, '')
}

// Helper to convert to camelCase (lowercase first letter)
function toCamelCase(value: string): string {
  if (!value) return ''
  return value.charAt(0).toLowerCase() + value.slice(1)
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
  const typesData = typesSource.map(row => {
    const id = row.label || row.name
    return createSchemaEntity(domain, 'Class', id, {
      name: row.label || row.name,
      description: row.comment || row.description || '',
      code: cleanSchemaPrefix(row.id || ''),
      subClassOf: cleanSchemaPrefix(row.subClassOf || ''),
      sourceUrl: cleanSchemaPrefix(row.url || row.id || ''),
    })
  })
  writeTSV(path.join(DATA_DIR, 'Schema.Class.tsv'), typesData)

  // Properties
  const propsSource = parseTSV(path.join(SOURCE_DIR, 'Schema.org/Schema.org.Properties.tsv'))
  const propsData = propsSource.map(row => {
    const id = row.label || row.name
    return createSchemaEntity(domain, 'Property', id, {
      name: row.label || row.name,
      description: row.comment || row.description || '',
      code: cleanSchemaPrefix(row.id || ''),
      domainIncludes: cleanSchemaPrefix(row.domainIncludes || ''),
      rangeIncludes: cleanSchemaPrefix(row.rangeIncludes || ''),
      sourceUrl: cleanSchemaPrefix(row.url || row.id || ''),
    })
  })
  writeTSV(path.join(DATA_DIR, 'Schema.Property.tsv'), propsData)

  // Generate Schema relationships
  const relationships: any[] = []

  // Class -> subClassOf relationships
  typesSource.forEach(row => {
    if (row.subClassOf) {
      const fromClass = typesData.find(t => t.code === cleanSchemaPrefix(row.id))
      if (fromClass) {
        // Extract the class name and remove schema: prefix if present
        const className = row.subClassOf.split('/').pop().replace('schema:', '')
        relationships.push({
          ns: 'schema.org.ai',
          from: fromClass.url,
          predicate: 'subClassOf',
          reverse: 'superClassOf',
          to: `${domain}/${className}`,
        })
      }
    }
  })

  // Property -> domainIncludes relationships
  propsSource.forEach(row => {
    if (row.domainIncludes) {
      const prop = propsData.find(p => p.code === cleanSchemaPrefix(row.id))
      if (prop) {
        const domains = row.domainIncludes.split(',').map((d: string) => d.trim())
        domains.forEach((domainUrl: string) => {
          // Extract the class name and remove schema: prefix if present
          const className = domainUrl.split('/').pop().replace('schema:', '')
          relationships.push({
            ns: 'schema.org.ai',
            from: prop.url,
            predicate: 'domainIncludes',
            reverse: 'hasProperty',
            to: `${domain}/${className}`,
          })
        })
      }
    }
  })

  // Property -> rangeIncludes relationships
  propsSource.forEach(row => {
    if (row.rangeIncludes) {
      const prop = propsData.find(p => p.code === cleanSchemaPrefix(row.id))
      if (prop) {
        const ranges = row.rangeIncludes.split(',').map((r: string) => r.trim())
        ranges.forEach((rangeUrl: string) => {
          // Extract the class name and remove schema: prefix if present
          const className = rangeUrl.split('/').pop().replace('schema:', '')
          relationships.push({
            ns: 'schema.org.ai',
            from: prop.url,
            predicate: 'rangeIncludes',
            reverse: 'rangeOf',
            to: `${domain}/${className}`,
          })
        })
      }
    }
  })

  console.log(`  ✅ Schema.Class.Relationships.tsv (${relationships.length} rows)`)

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
  const occupationsData = occupationsSource.map(row => {
    const id = createId(row.title)
    return createEntity(domain, 'Occupation', id, {
      name: row.title,
      description: row.description || '',
      code: row.oNETSOCCode,
      sourceUrl: `https://www.onetonline.org/link/summary/${row.oNETSOCCode}`,
    })
  })
  writeTSV(path.join(DATA_DIR, 'ONET.Occupation.tsv'), occupationsData)

  // Skills
  const skillsSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.Skills.tsv'))
  const uniqueSkills = new Map<string, any>()

  skillsSource.forEach(row => {
    const id = createId(row.elementName)
    if (!uniqueSkills.has(id)) {
      uniqueSkills.set(id, createEntity(domain, 'Skill', id, {
        name: row.elementName,
        description: row.elementName,
        code: row.elementID,
      }))
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.Skill.tsv'), Array.from(uniqueSkills.values()))

  // Knowledge
  const knowledgeSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.Knowledge.tsv'))
  const uniqueKnowledge = new Map<string, any>()

  knowledgeSource.forEach(row => {
    const id = createId(row.elementName)
    if (!uniqueKnowledge.has(id)) {
      uniqueKnowledge.set(id, createEntity(domain, 'Knowledge', id, {
        name: row.elementName,
        description: row.elementName,
        code: row.elementID,
      }))
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.Knowledge.tsv'), Array.from(uniqueKnowledge.values()))

  // Abilities
  const abilitiesSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.Abilities.tsv'))
  const uniqueAbilities = new Map<string, any>()

  abilitiesSource.forEach(row => {
    const id = createId(row.elementName)
    if (!uniqueAbilities.has(id)) {
      uniqueAbilities.set(id, createEntity(domain, 'Ability', id, {
        name: row.elementName,
        description: row.elementName,
        code: row.elementID,
      }))
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.Ability.tsv'), Array.from(uniqueAbilities.values()))

  // Work Activities
  const activitiesSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.WorkActivities.tsv'))
  const uniqueActivities = new Map<string, any>()

  activitiesSource.forEach(row => {
    const id = createId(row.elementName)
    if (!uniqueActivities.has(id)) {
      uniqueActivities.set(id, createEntity(domain, 'WorkActivity', id, {
        name: row.elementName,
        description: row.elementName,
        code: row.elementID,
      }))
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.WorkActivity.tsv'), Array.from(uniqueActivities.values()))

  // Tasks
  const tasksSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.TaskStatements.tsv'))
  const uniqueTasks = new Map<string, any>()

  tasksSource.forEach(row => {
    const name = row.task
    const id = createId(name)
    if (!uniqueTasks.has(id)) {
      uniqueTasks.set(id, createEntity(domain, 'Task', id, {
        name: name,
        description: name,
        code: getCode(row.taskID, name),
        taskType: row.taskType || '',
      }))
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.Task.tsv'), Array.from(uniqueTasks.values()))

  // Technology Skills
  const technologySource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.TechnologySkills.tsv'))
  const uniqueTechnology = new Map<string, any>()

  technologySource.forEach(row => {
    const name = row.example
    const id = createId(name)
    if (!uniqueTechnology.has(id)) {
      uniqueTechnology.set(id, createEntity(domain, 'Technology', id, {
        name: name,
        description: row.commodityTitle || name,
        code: getCode(row.commodityCode, name),
        commodityTitle: row.commodityTitle || '',
        hotTechnology: row.hotTechnology === 'Y',
        inDemand: row.inDemand === 'Y',
      }))
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.Technology.tsv'), Array.from(uniqueTechnology.values()))

  // Tools Used
  const toolsSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.ToolsUsed.tsv'))
  const uniqueTools = new Map<string, any>()

  toolsSource.forEach(row => {
    const name = row.example
    const id = createId(name)
    if (!uniqueTools.has(id)) {
      uniqueTools.set(id, createEntity(domain, 'Tool', id, {
        name: name,
        description: row.commodityTitle || name,
        code: getCode(row.commodityCode, name),
        commodityTitle: row.commodityTitle || '',
      }))
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.Tool.tsv'), Array.from(uniqueTools.values()))

  // Work Styles
  const workStylesSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.WorkStyles.tsv'))
  const uniqueWorkStyles = new Map<string, any>()

  workStylesSource.forEach(row => {
    const id = createId(row.elementName)
    if (!uniqueWorkStyles.has(id)) {
      uniqueWorkStyles.set(id, createEntity(domain, 'WorkStyle', id, {
        name: row.elementName,
        description: row.elementName,
        code: row.elementID,
      }))
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.WorkStyle.tsv'), Array.from(uniqueWorkStyles.values()))

  // Work Values
  const workValuesSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.WorkValues.tsv'))
  const uniqueWorkValues = new Map<string, any>()

  workValuesSource.forEach(row => {
    const id = createId(row.elementName)
    if (!uniqueWorkValues.has(id)) {
      uniqueWorkValues.set(id, createEntity(domain, 'WorkValue', id, {
        name: row.elementName,
        description: row.elementName,
        code: row.elementID,
      }))
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.WorkValue.tsv'), Array.from(uniqueWorkValues.values()))

  // Interests
  const interestsSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.Interests.tsv'))
  const uniqueInterests = new Map<string, any>()

  interestsSource.forEach(row => {
    const id = createId(row.elementName)
    if (!uniqueInterests.has(id)) {
      uniqueInterests.set(id, createEntity(domain, 'Interest', id, {
        name: row.elementName,
        description: row.elementName,
        code: row.elementID,
      }))
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.Interest.tsv'), Array.from(uniqueInterests.values()))

  // Work Context
  const workContextSource = parseTSV(path.join(SOURCE_DIR, 'ONET/ONET.WorkContext.tsv'))
  const uniqueWorkContext = new Map<string, any>()

  workContextSource.forEach(row => {
    const id = createId(row.elementName)
    if (!uniqueWorkContext.has(id)) {
      uniqueWorkContext.set(id, createEntity(domain, 'WorkContext', id, {
        name: row.elementName,
        description: row.elementName,
        code: row.elementID,
      }))
    }
  })
  writeTSV(path.join(DATA_DIR, 'ONET.WorkContext.tsv'), Array.from(uniqueWorkContext.values()))

  // Generate relationships
  const relationships: any[] = []

  // Occupation -> Skill relationships
  skillsSource.forEach(row => {
    if (row.oNETSOCCode && row.elementID) {
      const occupation = occupationsData.find(o => o.code === row.oNETSOCCode)
      if (occupation) {
        relationships.push({
          ns: 'onet.org.ai',
          from: occupation.url,
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
          ns: 'onet.org.ai',
          from: occupation.url,
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
          ns: 'onet.org.ai',
          from: occupation.url,
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
          ns: 'onet.org.ai',
          from: occupation.url,
          predicate: 'involvesActivity',
          reverse: 'activityOf',
          to: `${domain}/WorkActivity/${createId(row.elementName)}`,
        })
      }
    }
  })

  // Occupation -> Task relationships
  tasksSource.forEach(row => {
    if (row.oNETSOCCode && row.taskID) {
      const occupation = occupationsData.find(o => o.code === row.oNETSOCCode)
      if (occupation) {
        relationships.push({
          ns: 'onet.org.ai',
          from: occupation.url,
          predicate: 'hasTask',
          reverse: 'taskOf',
          to: `${domain}/Task/${row.taskID}`,
        })
      }
    }
  })

  // Occupation -> Technology relationships
  technologySource.forEach(row => {
    if (row.oNETSOCCode) {
      const occupation = occupationsData.find(o => o.code === row.oNETSOCCode)
      if (occupation) {
        const urlId = createId(row.example)
        relationships.push({
          ns: 'onet.org.ai',
          from: occupation.url,
          predicate: 'usesTechnology',
          reverse: 'technologyFor',
          to: `${domain}/Technology/${urlId}`,
        })
      }
    }
  })

  // Occupation -> Tool relationships
  toolsSource.forEach(row => {
    if (row.oNETSOCCode) {
      const occupation = occupationsData.find(o => o.code === row.oNETSOCCode)
      if (occupation) {
        const urlId = createId(row.example)
        relationships.push({
          ns: 'onet.org.ai',
          from: occupation.url,
          predicate: 'usesTool',
          reverse: 'toolFor',
          to: `${domain}/Tool/${urlId}`,
        })
      }
    }
  })

  // Occupation -> WorkStyle relationships
  workStylesSource.forEach(row => {
    if (row.oNETSOCCode && row.elementID) {
      const occupation = occupationsData.find(o => o.code === row.oNETSOCCode)
      if (occupation) {
        relationships.push({
          ns: 'onet.org.ai',
          from: occupation.url,
          predicate: 'requiresWorkStyle',
          reverse: 'workStyleFor',
          to: `${domain}/WorkStyle/${createId(row.elementName)}`,
        })
      }
    }
  })

  // Occupation -> WorkValue relationships
  workValuesSource.forEach(row => {
    if (row.oNETSOCCode && row.elementID) {
      const occupation = occupationsData.find(o => o.code === row.oNETSOCCode)
      if (occupation) {
        relationships.push({
          ns: 'onet.org.ai',
          from: occupation.url,
          predicate: 'alignsWithValue',
          reverse: 'valueOf',
          to: `${domain}/WorkValue/${createId(row.elementName)}`,
        })
      }
    }
  })

  // Occupation -> Interest relationships
  interestsSource.forEach(row => {
    if (row.oNETSOCCode && row.elementID) {
      const occupation = occupationsData.find(o => o.code === row.oNETSOCCode)
      if (occupation) {
        relationships.push({
          ns: 'onet.org.ai',
          from: occupation.url,
          predicate: 'matchesInterest',
          reverse: 'interestOf',
          to: `${domain}/Interest/${createId(row.elementName)}`,
        })
      }
    }
  })

  // Occupation -> WorkContext relationships
  workContextSource.forEach(row => {
    if (row.oNETSOCCode && row.elementID) {
      const occupation = occupationsData.find(o => o.code === row.oNETSOCCode)
      if (occupation) {
        relationships.push({
          ns: 'onet.org.ai',
          from: occupation.url,
          predicate: 'hasContext',
          reverse: 'contextOf',
          to: `${domain}/WorkContext/${createId(row.elementName)}`,
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
    .map(row => {
      const id = row['2022NAICSCode']
      return createEntity(domain, 'Industry', id, {
        name: row['2022NAICSTitle'].trim(),
        description: row['2022NAICSTitle'].trim(),
        code: row['2022NAICSCode'],
      })
    })

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
    .map(row => {
      const id = row.code
      return createEntity(domain, 'Product', id, {
        name: row.hierarchicalStructure,
        description: row.hierarchicalStructure,
        code: row.code,
        level: row.level || '',
        parent: row.parent || '',
      })
    })

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
    .map(row => {
      const id = createId(row.name)
      return createEntity(domain, 'Process', id, {
        name: row.name,
        description: row.elementDescription || row.name,
        code: row.hierarchyID || '',
      })
    })

  writeTSV(path.join(DATA_DIR, 'APQC.Process.tsv'), data)
}

/**
 * Generate UNSPSC Standards.org.ai data
 */
function generateUNSPSCData(): void {
  console.log('\n📊 Generating Standards.org.ai UNSPSC data...')

  const domain = 'https://standards.org.ai'

  const source = parseTSV(path.join(SOURCE_DIR, 'UNSPSC/UNSPSC.Codes.tsv'))

  const unspscDomain = `${domain}/UNSPSC`

  const data = source
    .filter(row => row.commodityCode && row.commodityTitle)
    .map(row => {
      const id = row.commodityCode
      return createEntity(unspscDomain, 'Product', id, {
        name: row.commodityTitle,
        description: row.definition || row.commodityTitle,
        code: row.commodityCode,
        segment: row.segmentCode || '',
        family: row.familyCode || '',
        class: row.classCode || '',
      })
    })

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

  const gs1Domain = `${domain}/GS1`

  // GS1 Schema has: segmentCode, segmentTitle, segmentDefinition, familyCode, familyTitle, etc.
  // We'll use the brick level (most specific)
  const data = source
    .filter(row => row.brickCode && row.brickTitle)
    .map(row => {
      const id = row.brickCode
      return createEntity(gs1Domain, 'Product', id, {
        name: row.brickTitle,
        description: row.brickDefinition || row.brickTitle || '',
        code: row.brickCode,
        segment: row.segmentCode || '',
        family: row.familyCode || '',
        class: row.classCode || '',
      })
    })

  writeTSV(path.join(DATA_DIR, 'Standards.GS1.Product.tsv'), data)
}

/**
 * Generate Language.org.ai data
 */
function generateLanguageData(): void {
  console.log('\n📊 Generating Language.org.ai data...')

  const domain = 'https://language.org.ai'

  // Verbs
  const verbsSource = parseTSV(path.join(SOURCE_DIR, 'Language/Language.Verbs.tsv'))
  const verbsData = verbsSource.map(row => {
    const id = toCamelCase(row.canonicalForm)
    return createEntity(domain, 'Verb', id, {
      name: row.canonicalForm,
      description: row.description || row.canonicalForm,
      code: getCode(row.canonicalForm, row.canonicalForm),
      predicate: row.predicate || '',
      event: row.event || '',
      activity: row.activity || '',
      actor: row.actor || '',
      object: row.object || '',
      inverse: row.inverse || '',
      source: row.source || '',
      vocabulary: row.vocabulary || '',
    })
  })
  writeTSV(path.join(DATA_DIR, 'Language.Verb.tsv'), verbsData)

  // Concepts
  const conceptsSource = parseTSV(path.join(SOURCE_DIR, 'Language/Language.Concepts.tsv'))
  const conceptsData = conceptsSource.map(row => {
    const id = row.id
    return createEntity(domain, 'Concept', id, {
      name: row.id,
      description: row.description || row.id,
      code: getCode(row.id, row.id),
      baseNoun: row.baseNoun || '',
      modifiers: row.modifiers || '',
      category: row.category || '',
      source: row.source || '',
      examples: row.examples || '',
    })
  })
  writeTSV(path.join(DATA_DIR, 'Language.Concept.tsv'), conceptsData)

  // Prepositions
  const prepsSource = parseTSV(path.join(SOURCE_DIR, 'Language/Language.Prepositions.tsv'))
  const prepsData = prepsSource.map(row => {
    const id = createId(row.id)
    return createEntity(domain, 'Preposition', id, {
      name: row.id,
      description: row.description || row.id,
      code: getCode(row.id, row.id),
      category: row.category || '',
      usage: row.usage || '',
    })
  })
  writeTSV(path.join(DATA_DIR, 'Language.Preposition.tsv'), prepsData)

  // Adverbs
  const adverbsSource = parseTSV(path.join(SOURCE_DIR, 'Language/Language.Adverbs.tsv'))
  const adverbsData = adverbsSource.map(row => {
    const id = createId(row.id)
    return createEntity(domain, 'Adverb', id, {
      name: row.id,
      description: row.description || row.id,
      code: getCode(row.id, row.id),
      category: row.category || '',
      usage: row.usage || '',
    })
  })
  writeTSV(path.join(DATA_DIR, 'Language.Adverb.tsv'), adverbsData)

  // Pronouns
  const pronounsSource = parseTSV(path.join(SOURCE_DIR, 'Language/Language.Pronouns.tsv'))
  const pronounsData = pronounsSource.map(row => {
    const id = createId(row.id)
    return createEntity(domain, 'Pronoun', id, {
      name: row.id,
      description: row.description || row.id,
      code: getCode(row.id, row.id),
      category: row.category || '',
      usage: row.usage || '',
    })
  })
  writeTSV(path.join(DATA_DIR, 'Language.Pronoun.tsv'), pronounsData)

  // Conjunctions
  const conjsSource = parseTSV(path.join(SOURCE_DIR, 'Language/Language.Conjunctions.tsv'))
  const conjsData = conjsSource.map(row => {
    const id = createId(row.id)
    return createEntity(domain, 'Conjunction', id, {
      name: row.id,
      description: row.description || row.id,
      code: getCode(row.id, row.id),
      category: row.category || '',
      usage: row.usage || '',
    })
  })
  writeTSV(path.join(DATA_DIR, 'Language.Conjunction.tsv'), conjsData)

  // Determiners
  const detsSource = parseTSV(path.join(SOURCE_DIR, 'Language/Language.Determiners.tsv'))
  const detsData = detsSource.map(row => {
    const id = createId(row.id)
    return createEntity(domain, 'Determiner', id, {
      name: row.id,
      description: row.description || row.id,
      code: getCode(row.id, row.id),
      category: row.category || '',
      usage: row.usage || '',
    })
  })
  writeTSV(path.join(DATA_DIR, 'Language.Determiner.tsv'), detsData)
}

/**
 * Generate Places.org.ai data (from GeoNames source)
 */
function generatePlacesData(): void {
  console.log('\n📊 Generating Places.org.ai data...')

  const domain = 'https://places.org.ai'

  // US States
  const statesFile = path.join(SOURCE_DIR, 'GeoNames/GeoNames.US.States.tsv')
  if (fs.existsSync(statesFile)) {
    const statesSource = parseTSV(statesFile)
    const statesData = statesSource.map(row => {
      const id = row.code
      return createEntity(domain, 'State', id, {
        name: row.name,
        description: row.nameAscii || row.name,
        code: row.code,
        country: row.country || '',
        admin1Code: row.admin1Code || '',
        geonameId: row.geonameId || '',
      })
    })
    writeTSV(path.join(DATA_DIR, 'Places.State.tsv'), statesData)
  }

  // Country Info
  const countryFile = path.join(SOURCE_DIR, 'GeoNames/GeoNames.CountryInfo.tsv')
  if (fs.existsSync(countryFile)) {
    const countrySource = parseTSV(countryFile)
    const countryData = countrySource
      .filter(row => row.iSO && row.country)
      .map(row => {
        const id = row.iSO
        return createEntity(domain, 'Country', id, {
          name: row.country,
          description: row.country,
          code: row.iSO,
          iso3: row.iSO3 || '',
          isoNumeric: row.iSONumeric || '',
          fips: row.fIPS || '',
          continent: row.continent || '',
          capital: row.capital || '',
          geonameId: row.geonameid || '',
        })
      })
    writeTSV(path.join(DATA_DIR, 'Places.Country.tsv'), countryData)
  }
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
  generateLanguageData()
  generatePlacesData()

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
  generateLanguageData,
  generatePlacesData,
}

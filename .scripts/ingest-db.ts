#!/usr/bin/env tsx

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { db, schema } from '../.mdxdb/db.js'
import type { NewThing, NewRelationship } from '../.mdxdb/schema.js'

const SOURCE_DIR = '.source'

/**
 * Parse TSV file into array of objects
 */
function parseTSV(filepath: string): Record<string, string>[] {
  const content = readFileSync(filepath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())

  if (lines.length === 0) return []

  const headers = lines[0].split('\t')
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t')
    const row: Record<string, string> = {}

    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || ''
    }

    rows.push(row)
  }

  return rows
}

/**
 * Create URL from namespace, type, and ID
 */
function createURL(ns: string, type: string, id: string): string {
  // URL-encode components to handle special characters
  const encodedNs = encodeURIComponent(ns)
  const encodedType = encodeURIComponent(type)
  const encodedId = encodeURIComponent(id)

  return `${encodedNs}/${encodedType}/${encodedId}`
}

/**
 * Ingest Schema.org data
 */
async function ingestSchemaOrg() {
  console.log('\n📦 Ingesting Schema.org...')

  const things: NewThing[] = []
  const relationships: NewRelationship[] = []

  // Ingest Types
  const types = parseTSV(join(SOURCE_DIR, 'Schema.org/Schema.org.Types.tsv'))
  console.log(`  Found ${types.length} types`)

  for (const row of types) {
    // Keep original ID for source.db
    const id = row.id

    // For source.db, store with original schema.org namespace structure
    const url = createURL('schema.org', 'Type', id)

    things.push({
      ns: 'schema.org',
      type: 'Type',
      id,
      url,
      data: {
        label: row.label,
        comment: row.comment,
        layer: row.layer,
      },
      content: row.comment,
      meta: { source: 'Schema.org.Types' },
    })

    // Add subClassOf relationships
    if (row.subClassOf) {
      const parents = row.subClassOf.split(',').map(p => p.trim())
      for (const parent of parents) {
        relationships.push({
          from: url,
          predicate: 'subClassOf',
          reverse: 'superClassOf',
          to: createURL('schema.org', 'Type', parent),
        })
      }
    }
  }

  // Ingest Properties
  const properties = parseTSV(join(SOURCE_DIR, 'Schema.org/Schema.org.Properties.tsv'))
  console.log(`  Found ${properties.length} properties`)

  for (const row of properties) {
    const url = createURL('schema.org', 'Property', row.id)

    things.push({
      ns: 'schema.org',
      type: 'Property',
      id: row.id,
      url,
      data: {
        label: row.label,
        comment: row.comment,
        rangeIncludes: row.rangeIncludes,
      },
      content: row.comment,
      meta: { source: 'Schema.org.Properties' },
    })

    // Add domainIncludes relationships
    if (row.domainIncludes) {
      const domains = row.domainIncludes.split(',').map(d => d.trim())
      for (const domain of domains) {
        relationships.push({
          from: url,
          predicate: 'domainIncludes',
          to: createURL('schema.org', 'Type', domain),
        })
      }
    }
  }

  // Batch insert
  if (things.length > 0) {
    console.log(`  Inserting ${things.length} things...`)
    await db.insert(schema.things).values(things)
  }

  if (relationships.length > 0) {
    console.log(`  Inserting ${relationships.length} relationships...`)
    await db.insert(schema.relationships).values(relationships)
  }
}

/**
 * Ingest O*NET data
 */
async function ingestONET() {
  console.log('\n📦 Ingesting O*NET...')

  const things: NewThing[] = []
  const relationships: NewRelationship[] = []

  // Ingest Occupations
  const occupations = parseTSV(join(SOURCE_DIR, 'ONET/ONET.OccupationData.tsv'))
  console.log(`  Found ${occupations.length} occupations`)

  for (const row of occupations) {
    const socCode = row.oNETSOCCode || row['O*NET-SOC Code']
    const title = row.title || row.Title
    const description = row.description || row.Description

    if (!socCode) continue

    const url = createURL('onet', 'Occupation', socCode)

    things.push({
      ns: 'onet',
      type: 'Occupation',
      id: socCode,
      url,
      data: {
        title,
        description,
      },
      content: description,
      meta: { source: 'ONET.OccupationData' },
    })
  }

  // Ingest Skills
  const skills = parseTSV(join(SOURCE_DIR, 'ONET/ONET.Skills.tsv'))
  console.log(`  Found ${skills.length} skill entries`)

  const uniqueSkills = new Map<string, any>()

  for (const row of skills) {
    const skillId = row.elementID || row['Element ID']
    const skillName = row.elementName || row['Element Name']
    const socCode = row.oNETSOCCode || row['O*NET-SOC Code']
    const dataValue = row.dataValue || row['Data Value']
    const scaleId = row.scaleID || row['Scale ID']

    if (!skillId || !socCode) continue

    // Create skill thing if not already created
    if (!uniqueSkills.has(skillId)) {
      uniqueSkills.set(skillId, {
        ns: 'onet',
        type: 'Skill',
        id: skillId,
        url: createURL('onet', 'Skill', skillId),
        data: {
          name: skillName,
        },
        content: skillName,
        meta: { source: 'ONET.Skills' },
      })
    }

    // Create relationship from occupation to skill
    relationships.push({
      from: createURL('onet', 'Occupation', socCode),
      predicate: 'requiresSkill',
      to: createURL('onet', 'Skill', skillId),
      meta: {
        dataValue,
        scaleId,
      },
    })
  }

  things.push(...Array.from(uniqueSkills.values()))

  // Ingest Knowledge
  const knowledge = parseTSV(join(SOURCE_DIR, 'ONET/ONET.Knowledge.tsv'))
  console.log(`  Found ${knowledge.length} knowledge entries`)

  const uniqueKnowledge = new Map<string, any>()

  for (const row of knowledge) {
    const knowledgeId = row.elementID || row['Element ID']
    const knowledgeName = row.elementName || row['Element Name']
    const socCode = row.oNETSOCCode || row['O*NET-SOC Code']
    const dataValue = row.dataValue || row['Data Value']
    const scaleId = row.scaleID || row['Scale ID']

    if (!knowledgeId || !socCode) continue

    if (!uniqueKnowledge.has(knowledgeId)) {
      uniqueKnowledge.set(knowledgeId, {
        ns: 'onet',
        type: 'Knowledge',
        id: knowledgeId,
        url: createURL('onet', 'Knowledge', knowledgeId),
        data: {
          name: knowledgeName,
        },
        content: knowledgeName,
        meta: { source: 'ONET.Knowledge' },
      })
    }

    relationships.push({
      from: createURL('onet', 'Occupation', socCode),
      predicate: 'requiresKnowledge',
      to: createURL('onet', 'Knowledge', knowledgeId),
      meta: {
        dataValue,
        scaleId,
      },
    })
  }

  things.push(...Array.from(uniqueKnowledge.values()))

  // Batch insert in chunks to avoid memory issues
  const CHUNK_SIZE = 1000

  for (let i = 0; i < things.length; i += CHUNK_SIZE) {
    const chunk = things.slice(i, i + CHUNK_SIZE)
    console.log(`  Inserting things ${i + 1}-${Math.min(i + CHUNK_SIZE, things.length)}...`)
    await db.insert(schema.things).values(chunk)
  }

  for (let i = 0; i < relationships.length; i += CHUNK_SIZE) {
    const chunk = relationships.slice(i, i + CHUNK_SIZE)
    console.log(`  Inserting relationships ${i + 1}-${Math.min(i + CHUNK_SIZE, relationships.length)}...`)
    await db.insert(schema.relationships).values(chunk)
  }
}

/**
 * Ingest UNSPSC data
 */
async function ingestUNSPSC() {
  console.log('\n📦 Ingesting UNSPSC...')

  const things: NewThing[] = []
  const relationships: NewRelationship[] = []

  const codes = parseTSV(join(SOURCE_DIR, 'UNSPSC/UNSPSC.Codes.tsv'))
  console.log(`  Found ${codes.length} codes`)

  const codeMap = new Map<string, any>()

  for (const row of codes) {
    const segmentCode = row.segmentCode
    const segmentTitle = row.segmentTitle
    const familyCode = row.familyCode
    const familyTitle = row.familyTitle
    const classCode = row.classCode
    const classTitle = row.classTitle
    const commodityCode = row.commodityCode
    const commodityTitle = row.commodityTitle
    const definition = row.definition

    // Add segment
    if (segmentCode && segmentTitle && !codeMap.has(segmentCode)) {
      codeMap.set(segmentCode, {
        ns: 'unspsc',
        type: 'Segment',
        id: segmentCode,
        url: createURL('unspsc', 'Segment', segmentCode),
        data: { title: segmentTitle },
        content: segmentTitle,
        meta: { source: 'UNSPSC.Codes', level: 'segment' },
      })
    }

    // Add family
    if (familyCode && familyTitle && !codeMap.has(familyCode)) {
      codeMap.set(familyCode, {
        ns: 'unspsc',
        type: 'Family',
        id: familyCode,
        url: createURL('unspsc', 'Family', familyCode),
        data: { title: familyTitle },
        content: familyTitle,
        meta: { source: 'UNSPSC.Codes', level: 'family' },
      })

      // Create family -> segment relationship
      if (segmentCode) {
        relationships.push({
          from: createURL('unspsc', 'Family', familyCode),
          predicate: 'partOf',
          reverse: 'contains',
          to: createURL('unspsc', 'Segment', segmentCode),
        })
      }
    }

    // Add class
    if (classCode && classTitle && !codeMap.has(classCode)) {
      codeMap.set(classCode, {
        ns: 'unspsc',
        type: 'Class',
        id: classCode,
        url: createURL('unspsc', 'Class', classCode),
        data: { title: classTitle },
        content: classTitle,
        meta: { source: 'UNSPSC.Codes', level: 'class' },
      })

      // Create class -> family relationship
      if (familyCode) {
        relationships.push({
          from: createURL('unspsc', 'Class', classCode),
          predicate: 'partOf',
          reverse: 'contains',
          to: createURL('unspsc', 'Family', familyCode),
        })
      }
    }

    // Add commodity
    if (commodityCode && commodityTitle) {
      const commodityId = `${commodityCode}`

      if (!codeMap.has(commodityId)) {
        codeMap.set(commodityId, {
          ns: 'unspsc',
          type: 'Commodity',
          id: commodityCode,
          url: createURL('unspsc', 'Commodity', commodityCode),
          data: { title: commodityTitle, definition },
          content: definition ? `${commodityTitle}\n${definition}` : commodityTitle,
          meta: { source: 'UNSPSC.Codes', level: 'commodity' },
        })

        // Create commodity -> class relationship
        if (classCode) {
          relationships.push({
            from: createURL('unspsc', 'Commodity', commodityCode),
            predicate: 'partOf',
            reverse: 'contains',
            to: createURL('unspsc', 'Class', classCode),
          })
        }
      }
    }
  }

  // Add all codes to things array (avoid spread operator for large arrays)
  for (const thing of codeMap.values()) {
    things.push(thing)
  }

  // Batch insert
  const CHUNK_SIZE = 1000

  for (let i = 0; i < things.length; i += CHUNK_SIZE) {
    const chunk = things.slice(i, i + CHUNK_SIZE)
    console.log(`  Inserting things ${i + 1}-${Math.min(i + CHUNK_SIZE, things.length)}...`)
    await db.insert(schema.things).values(chunk)
  }

  for (let i = 0; i < relationships.length; i += CHUNK_SIZE) {
    const chunk = relationships.slice(i, i + CHUNK_SIZE)
    console.log(`  Inserting relationships ${i + 1}-${Math.min(i + CHUNK_SIZE, relationships.length)}...`)
    await db.insert(schema.relationships).values(chunk)
  }
}

/**
 * Ingest APQC data
 */
async function ingestAPQC() {
  console.log('\n📦 Ingesting APQC...')

  const things: NewThing[] = []
  const relationships: NewRelationship[] = []

  // Ingest Processes
  const processes = parseTSV(join(SOURCE_DIR, 'APQC/APQC.Processes.tsv'))
  console.log(`  Found ${processes.length} processes`)

  for (const row of processes) {
    const pcfId = row.pcfId || row.ID
    const hierarchyId = row.hierarchyId || row['Hierarchy ID']
    const name = row.name || row.Name
    const description = row.description || row.Description
    const level = row.level || row.Level
    const category = row.category || row.Category
    const parent = row.parent || row['Parent ID']

    if (!pcfId) continue

    const url = createURL('apqc', 'Process', pcfId)

    things.push({
      ns: 'apqc',
      type: 'Process',
      id: pcfId,
      url,
      data: {
        hierarchyId,
        name,
        description,
        level,
        category,
      },
      content: description || name,
      meta: { source: 'APQC.Processes' },
    })

    // Create parent-child relationships
    if (parent) {
      relationships.push({
        from: url,
        predicate: 'childOf',
        reverse: 'parentOf',
        to: createURL('apqc', 'Process', parent),
      })
    }
  }

  // Batch insert
  if (things.length > 0) {
    console.log(`  Inserting ${things.length} things...`)
    await db.insert(schema.things).values(things)
  }

  if (relationships.length > 0) {
    console.log(`  Inserting ${relationships.length} relationships...`)
    await db.insert(schema.relationships).values(relationships)
  }
}

/**
 * Ingest Models data
 */
async function ingestModels() {
  console.log('\n📦 Ingesting Models...')

  const things: NewThing[] = []

  const models = parseTSV(join(SOURCE_DIR, 'Models/Models.tsv'))
  console.log(`  Found ${models.length} models`)

  for (const row of models) {
    const url = createURL('model', 'LLM', row.id)

    things.push({
      ns: 'model',
      type: 'LLM',
      id: row.id,
      url,
      data: {
        name: row.name,
        created: row.created,
        description: row.description,
        contextLength: row.context_length,
        pricing: {
          prompt: row.pricing_prompt,
          completion: row.pricing_completion,
        },
      },
      content: row.description,
      meta: { source: 'Models' },
    })
  }

  if (things.length > 0) {
    console.log(`  Inserting ${things.length} things...`)
    await db.insert(schema.things).values(things)
  }
}

/**
 * Main ingestion function
 */
async function main() {
  console.log('🚀 Starting database ingestion...')

  const startTime = Date.now()

  try {
    await ingestSchemaOrg()
    await ingestONET()
    await ingestUNSPSC()
    await ingestAPQC()
    await ingestModels()

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`\n✅ Database ingestion complete in ${duration}s!`)

    // Show statistics
    const thingsCount = db.select().from(schema.things).all().length
    const relationshipsCount = db.select().from(schema.relationships).all().length

    console.log(`\n📊 Statistics:`)
    console.log(`   Things: ${thingsCount.toLocaleString()}`)
    console.log(`   Relationships: ${relationshipsCount.toLocaleString()}`)

  } catch (error) {
    console.error('❌ Error during ingestion:', error)
    process.exit(1)
  }
}

main()

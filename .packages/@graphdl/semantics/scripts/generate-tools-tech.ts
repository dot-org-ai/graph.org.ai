#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Generate Tools.tsv and Tech.tsv by semantically expanding tool and technology names
 * Similar to how we expanded Products/Services
 */

function toEntityTypes(text: string): string[] {
  // Remove parentheticals and version numbers
  let cleaned = text.replace(/\s*\([^)]*\)/g, '').trim()
  cleaned = cleaned.replace(/\s+v?\d+(\.\d+)*\s*$/i, '').trim()

  // Check for slash-separated alternatives
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/').map(p => p.trim()).filter(p => p)
    if (parts.length > 1) {
      return parts.flatMap(part => toEntityTypes(part))
    }
  }

  // Check for " and " or " or " conjunctions
  const conjMatch = cleaned.match(/^(.+?)\s+(and|or)\s+(.+)$/i)
  if (conjMatch) {
    const [, left, conj, right] = conjMatch
    const leftEntities = toEntityTypes(left.trim())
    const rightEntities = toEntityTypes(right.trim())
    return [...leftEntities, ...rightEntities]
  }

  // Convert to PascalCase
  return [toPascalCase(cleaned)]
}

function toPascalCase(text: string): string {
  // Filter out articles, conjunctions
  const articles = new Set(['the', 'a', 'an'])
  const conjunctions = new Set(['and', 'or', 'but', 'nor', 'so', 'yet'])

  const tokens = text.split(/[\s\-\/,;:()]+/).filter(t => t.trim())

  const result = tokens
    .filter(t => {
      const lower = t.toLowerCase()
      return !articles.has(lower) && !conjunctions.has(lower)
    })
    .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join('')

  return result || text.replace(/\s+/g, '')
}

async function generateTools() {
  console.log('\n🔧 Generating Tools.tsv...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Read ONET.Tool.tsv
  const onetToolPath = path.join(dataDir, 'ONET.Tool.tsv')
  const content = fs.readFileSync(onetToolPath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split('\t')

  const nameIdx = headers.indexOf('name')
  const descIdx = headers.indexOf('description')
  const codeIdx = headers.indexOf('code')

  const expandedTools: Array<{
    id: string
    name: string
    description: string
    code: string
  }> = []

  const seen = new Set<string>()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const name = cols[nameIdx]
    const description = cols[descIdx] || name
    const code = cols[codeIdx] || ''

    if (!name) continue

    // Expand the tool name into entity types
    const entityTypes = toEntityTypes(name)

    for (const entityType of entityTypes) {
      if (!seen.has(entityType)) {
        seen.add(entityType)
        expandedTools.push({
          id: entityType,
          name: name,
          description: description,
          code: code
        })
      }
    }
  }

  // Sort by id
  expandedTools.sort((a, b) => a.id.localeCompare(b.id))

  // Write Tools.tsv
  const toolsPath = path.join(dataDir, 'Tools.tsv')
  const toolsHeaders = ['id', 'name', 'description', 'code']
  const toolsRows = expandedTools.map(t =>
    `${t.id}\t${t.name}\t${t.description}\t${t.code}`
  )

  fs.writeFileSync(toolsPath, toolsHeaders.join('\t') + '\n' + toolsRows.join('\n'))
  console.log(`  ✓ Tools.tsv (${expandedTools.length} tools from ${lines.length - 1} ONET tools)`)
}

async function generateTech() {
  console.log('\n💻 Generating Tech.tsv...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Read ONET.Technology.tsv
  const onetTechPath = path.join(dataDir, 'ONET.Technology.tsv')
  const content = fs.readFileSync(onetTechPath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split('\t')

  const nameIdx = headers.indexOf('name')
  const descIdx = headers.indexOf('description')
  const codeIdx = headers.indexOf('code')
  const hotIdx = headers.indexOf('hotTechnology')
  const demandIdx = headers.indexOf('inDemand')

  const expandedTech: Array<{
    id: string
    name: string
    description: string
    code: string
    hotTechnology: string
    inDemand: string
  }> = []

  const seen = new Set<string>()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const name = cols[nameIdx]
    const description = cols[descIdx] || name
    const code = cols[codeIdx] || ''
    const hotTechnology = cols[hotIdx] || 'false'
    const inDemand = cols[demandIdx] || 'false'

    if (!name) continue

    // Expand the technology name into entity types
    const entityTypes = toEntityTypes(name)

    for (const entityType of entityTypes) {
      if (!seen.has(entityType)) {
        seen.add(entityType)
        expandedTech.push({
          id: entityType,
          name: name,
          description: description,
          code: code,
          hotTechnology,
          inDemand
        })
      }
    }
  }

  // Sort by id
  expandedTech.sort((a, b) => a.id.localeCompare(b.id))

  // Write Tech.tsv
  const techPath = path.join(dataDir, 'Tech.tsv')
  const techHeaders = ['id', 'name', 'description', 'code', 'hotTechnology', 'inDemand']
  const techRows = expandedTech.map(t =>
    `${t.id}\t${t.name}\t${t.description}\t${t.code}\t${t.hotTechnology}\t${t.inDemand}`
  )

  fs.writeFileSync(techPath, techHeaders.join('\t') + '\n' + techRows.join('\n'))
  console.log(`  ✓ Tech.tsv (${expandedTech.length} technologies from ${lines.length - 1} ONET technologies)`)
}

async function main() {
  console.log('='.repeat(100))
  console.log('TOOLS & TECHNOLOGY GENERATION')
  console.log('='.repeat(100))

  await generateTools()
  await generateTech()

  console.log('\n' + '='.repeat(100))
  console.log('✅ Tools and Tech files generated!')
  console.log('='.repeat(100))
}

main().catch(console.error)

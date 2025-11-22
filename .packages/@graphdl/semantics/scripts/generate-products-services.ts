#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import { GraphDLParser } from '../dist/parser.js'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Convert product/service name to entity type
 * Uses same logic as toEntityTypes from generate-comprehensive-outputs-v2.ts
 */
function toEntityTypes(text: string, parser: GraphDLParser, shortNames?: Map<string, string>): string[] {
  // Check shortNames first for exact match
  if (shortNames) {
    const shortName = shortNames.get(text)
    if (shortName) {
      return [shortName]
    }
  }

  // Check for "including X" or "except X" clauses - handle separately
  const includingMatch = text.match(/^(.+?),?\s+(including|except)\s+(.+)$/i)
  if (includingMatch) {
    const [, main, modifier, addendum] = includingMatch
    const mainEntities = toEntityTypes(main.trim(), parser, shortNames)
    const addendumEntities = toEntityTypes(addendum.trim(), parser, shortNames)
    return [...mainEntities, ...addendumEntities]
  }

  // Check for comma-separated lists: "A, B, and C Suffix"
  const commaListMatch = text.match(/^(.+),\s*(.+?),?\s+(and|or)\s+(.+)$/i)
  if (commaListMatch) {
    const [, first, middle, conj, last] = commaListMatch
    const lastWords = last.trim().split(/\s+/)
    if (lastWords.length > 1) {
      const suffix = lastWords.slice(1).join(' ')
      const firstEntities = toEntityTypes(`${first.trim()} ${suffix}`.trim(), parser, shortNames)
      const middleItems = middle.split(',').map(m => m.trim()).filter(m => m)
      const middleEntities = middleItems.flatMap(m => toEntityTypes(`${m} ${suffix}`.trim(), parser, shortNames))
      const lastEntities = toEntityTypes(last.trim(), parser, shortNames)
      return [...firstEntities, ...middleEntities, ...lastEntities]
    }
  }

  // Check for " and " or " or " conjunctions
  const conjMatch = text.match(/^(.+?)\s+(and|or)\s+(.+)$/i)
  if (conjMatch) {
    const [, left, conj, right] = conjMatch
    const leftWords = left.trim().split(/\s+/)
    const rightWords = right.trim().split(/\s+/)

    // Special case: "Category A or B C" where Category should apply to both AND last word of right should apply to left
    // Example: "Fishery information or documentation services"
    // Should become: "Fishery information services" and "Fishery documentation services"
    if (leftWords.length === 2 && rightWords.length === 2 && /^[A-Z]/.test(leftWords[0])) {
      // Try distributing the first word of left to both sides AND last word of right to both sides
      const category = leftWords[0]
      const leftMiddle = leftWords[1]
      const rightMiddle = rightWords[0]
      const suffix = rightWords[1]

      const leftFull = `${category} ${leftMiddle} ${suffix}`
      const rightFull = `${category} ${rightMiddle} ${suffix}`

      const leftEntities = toEntityTypes(leftFull, parser, shortNames)
      const rightEntities = toEntityTypes(rightFull, parser, shortNames)
      return [...leftEntities, ...rightEntities]
    }

    // Check for shared suffix: "A B and C B" → "A B" and "C B"
    const sharedSuffixMatch = text.match(/^(.+?)\s+(and|or)\s+([^\s,]+)\s+(.+)$/i)
    if (sharedSuffixMatch) {
      const [, leftPart, conj2, middle, suffix] = sharedSuffixMatch

      // Only treat as shared suffix if the last word of leftPart doesn't match suffix
      const leftLastWord = leftPart.trim().split(/\s+/).pop()?.toLowerCase()
      if (leftLastWord !== suffix.toLowerCase()) {
        const leftEntities = toEntityTypes(`${leftPart} ${suffix}`.trim(), parser, shortNames)
        const middleEntities = toEntityTypes(`${middle} ${suffix}`.trim(), parser, shortNames)
        return [...leftEntities, ...middleEntities]
      }
    }

    // No shared prefix or suffix - treat as simple conjunction
    const leftEntities = toEntityTypes(left.trim(), parser, shortNames)
    const rightEntities = toEntityTypes(right.trim(), parser, shortNames)
    return [...leftEntities, ...rightEntities]
  }

  // Simple conversion for non-conjunction cases
  const tokens = text.replace(/,/g, '').split(/[\s\-\/;:()]+/).filter(t => t.trim())
  const processed = tokens.map(t => {
    if (/^[A-Z][a-z]+[A-Z]/.test(t)) {
      return t
    }
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
  })

  return [processed.join('')]
}

async function main() {
  const parser = new GraphDLParser()
  await parser.initialize()

  const repoRoot = path.resolve(__dirname, '../../../..')
  const outputDir = path.join(repoRoot, '.data')
  const unspscPath = path.join(repoRoot, '.source/UNSPSC/UNSPSC.Codes.tsv')
  const napcsPath = path.join(repoRoot, '.source/NAPCS/NAPCS.2022.Structure.csv')
  const gpcDir = path.join(repoRoot, '.source/GS1')

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log('='.repeat(100))
  console.log('PRODUCTS AND SERVICES GENERATION')
  console.log('='.repeat(100))
  console.log()

  // Load UNSPSC data
  console.log('Loading UNSPSC data...')
  const unspscContent = fs.readFileSync(unspscPath, 'utf-8')
  const unspscLines = unspscContent.split('\n').slice(1) // Skip header

  const expandedProducts: Array<{
    id: string
    name: string
    description: string
    code: string
    type: string
  }> = []

  for (const line of unspscLines) {
    if (!line.trim()) continue
    const cols = line.split('\t')
    const [segmentCode, segmentTitle, familyCode, familyTitle, classCode, classTitle, commodityCode, commodityTitle, definition] = cols

    if (!commodityCode || !commodityTitle) continue

    // Determine if this is a Product or Service based on segment code
    // UNSPSC segments 70-94 are services, 10-64 and 95 are products
    const segmentNum = parseInt(segmentCode.substring(0, 2))
    const type = (segmentNum >= 70 && segmentNum <= 94) ? 'Service' : 'Product'

    // Expand the commodity title into entity types
    const entityTypes = toEntityTypes(commodityTitle, parser)

    for (const entityType of entityTypes) {
      expandedProducts.push({
        id: entityType,
        name: commodityTitle,
        description: definition || commodityTitle,
        code: commodityCode,
        type: type
      })
    }
  }

  console.log(`  ✓ Loaded ${unspscLines.filter(l => l.trim()).length} UNSPSC commodities`)
  console.log(`  ✓ Expanded to ${expandedProducts.length} product/service entities`)
  console.log()

  // Load NAPCS data
  console.log('Loading NAPCS data...')
  if (fs.existsSync(napcsPath)) {
    const napcsContent = fs.readFileSync(napcsPath, 'utf-8')

    // Parse CSV - handle quoted fields with commas
    const napcsLines = napcsContent.split('\n').slice(1) // Skip header
    let napcsCount = 0

    for (const line of napcsLines) {
      if (!line.trim()) continue

      // Simple CSV parser for quoted fields
      const matches = line.match(/(?:^|,)(?:"([^"]*)"|([^,]*))/g)
      if (!matches || matches.length < 7) continue

      const cols = matches.map(m => m.replace(/^,?"?|"?$/g, ''))
      const [level, hierarchicalStructure, code, parent, codeTitle, superscript, codeDefinition] = cols

      // Only process Detail level (level 4) to match UNSPSC commodity level
      if (level !== '4') continue
      if (!code || !codeTitle) continue

      napcsCount++

      // NAPCS code classification: 1xx = goods/products, 2xx-8xx = services
      const firstDigit = parseInt(code.charAt(0))
      const type = firstDigit === 1 ? 'Product' : 'Service'

      // Expand the code title into entity types
      const entityTypes = toEntityTypes(codeTitle, parser)

      for (const entityType of entityTypes) {
        expandedProducts.push({
          id: entityType,
          name: codeTitle,
          description: codeDefinition || codeTitle,
          code: `NAPCS-${code}`,
          type: type
        })
      }
    }

    console.log(`  ✓ Loaded ${napcsCount} NAPCS detail entries`)
    console.log(`  ✓ Total entities: ${expandedProducts.length}`)
  } else {
    console.log(`  ⚠ NAPCS file not found at ${napcsPath}`)
  }
  console.log()

  // Load GS1 GPC data
  console.log('Loading GS1 GPC data...')
  const gpcFiles = fs.readdirSync(gpcDir).filter(f => f.endsWith('.xlsx') && f.includes('GPC'))

  if (gpcFiles.length > 0) {
    // Use the most recent GPC file
    const gpcFile = gpcFiles.sort().pop()!
    const gpcPath = path.join(gpcDir, gpcFile)
    console.log(`  Reading: ${gpcFile}`)

    try {
      const workbook = XLSX.readFile(gpcPath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data: any[] = XLSX.utils.sheet_to_json(worksheet)

      console.log(`  ✓ Loaded ${data.length} GPC rows`)

      // Process unique Bricks (finest level of GPC hierarchy)
      const bricks = new Map<string, any>()
      for (const row of data) {
        const brickCode = row.BrickCode
        const brickTitle = row.BrickTitle
        const brickIncludes = row.BrickDefinition_Includes || ''
        const brickExcludes = row.BrickDefinition_Excludes || ''

        if (brickCode && brickTitle && !bricks.has(brickCode)) {
          bricks.set(brickCode, {
            code: brickCode,
            title: brickTitle,
            includes: brickIncludes,
            excludes: brickExcludes,
            segment: row.SegmentTitle || '',
          })
        }
      }

      console.log(`  ✓ Processing ${bricks.size} unique GPC Bricks`)

      // GPC segments: All are products (no service categories in GPC)
      let gpcCount = 0
      for (const [code, brick] of bricks) {
        const description = [
          brick.includes ? `Includes: ${brick.includes}` : '',
          brick.excludes ? `Excludes: ${brick.excludes}` : ''
        ].filter(s => s).join(' ') || brick.title

        // Expand the brick title into entity types
        const entityTypes = toEntityTypes(brick.title, parser)

        for (const entityType of entityTypes) {
          expandedProducts.push({
            id: entityType,
            name: brick.title,
            description: description,
            code: `GPC-${code}`,
            type: 'Product' // GPC is all products
          })
          gpcCount++
        }
      }

      console.log(`  ✓ Added ${gpcCount} GPC product entities`)
      console.log(`  ✓ Total entities: ${expandedProducts.length}`)
    } catch (error) {
      console.log(`  ⚠ Error reading GPC file: ${error}`)
    }
  } else {
    console.log(`  ⚠ No GPC Excel files found in ${gpcDir}`)
  }
  console.log()

  // Separate products and services
  const products = expandedProducts.filter(p => p.type === 'Product')
  const services = expandedProducts.filter(p => p.type === 'Service')

  console.log(`  ✓ Products: ${products.length}`)
  console.log(`  ✓ Services: ${services.length}`)

  // Write Products.tsv
  const productsPath = path.join(outputDir, 'Products.tsv')
  const productsHeader = 'id\tname\tdescription\tcode\n'
  const productsRows = products.map(p =>
    `${p.id}\t${p.name}\t${p.description}\t${p.code}`
  ).join('\n')
  fs.writeFileSync(productsPath, productsHeader + productsRows)
  console.log(`  ✓ Wrote ${productsPath}`)

  // Write Services.tsv
  const servicesPath = path.join(outputDir, 'Services.tsv')
  const servicesHeader = 'id\tname\tdescription\tcode\n'
  const servicesRows = services.map(p =>
    `${p.id}\t${p.name}\t${p.description}\t${p.code}`
  ).join('\n')
  fs.writeFileSync(servicesPath, servicesHeader + servicesRows)
  console.log(`  ✓ Wrote ${servicesPath}`)

  console.log()
  console.log('='.repeat(100))
  console.log('GENERATION COMPLETE')
  console.log('='.repeat(100))
  console.log(`Products: ${products.length}`)
  console.log(`Services: ${services.length}`)
  console.log(`Total: ${expandedProducts.length}`)
  console.log()
  console.log(`Output directory: ${outputDir}`)
}

main().catch(console.error)

#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Generate cross-domain relationships between:
 * - Products <-> Tools/Technology (via UNSPSC commodity codes)
 * - Processes <-> Industries
 * - Tasks <-> Occupations
 */

async function generateToolProductRelationships() {
  console.log('\n🔧 Generating Tool/Technology → Product Relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  const relationships: Array<{
    toolId: string
    toolType: string
    productId: string
    commodityCode: string
  }> = []

  // Load Products with UNSPSC codes
  const productsMap = new Map<string, string>() // commodityCode -> productId
  const productsPath = path.join(dataDir, 'Products.tsv')
  if (fs.existsSync(productsPath)) {
    const content = fs.readFileSync(productsPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')
    const codeIdx = headers.indexOf('code')
    const idIdx = headers.indexOf('id')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      const cols = line.split('\t')
      const code = cols[codeIdx]
      const productId = cols[idIdx]

      // Only UNSPSC codes (8 digits)
      if (code && /^\d{8}$/.test(code)) {
        productsMap.set(code, productId)
      }
    }
  }

  console.log(`  Loaded ${productsMap.size} UNSPSC products`)

  // Process Tools
  const toolsPath = path.join(dataDir, 'ONET.Tool.tsv')
  if (fs.existsSync(toolsPath)) {
    const content = fs.readFileSync(toolsPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')
    const idIdx = headers.indexOf('id')
    const codeIdx = headers.indexOf('code')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      const cols = line.split('\t')
      const toolId = cols[idIdx]
      const commodityCode = cols[codeIdx]

      if (commodityCode && productsMap.has(commodityCode)) {
        relationships.push({
          toolId,
          toolType: 'Tool',
          productId: productsMap.get(commodityCode)!,
          commodityCode
        })
      }
    }
  }

  // Process Technology
  const techPath = path.join(dataDir, 'ONET.Technology.tsv')
  if (fs.existsSync(techPath)) {
    const content = fs.readFileSync(techPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')
    const idIdx = headers.indexOf('id')
    const codeIdx = headers.indexOf('code')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      const cols = line.split('\t')
      const techId = cols[idIdx]
      const commodityCode = cols[codeIdx]

      if (commodityCode && productsMap.has(commodityCode)) {
        relationships.push({
          toolId: techId,
          toolType: 'Technology',
          productId: productsMap.get(commodityCode)!,
          commodityCode
        })
      }
    }
  }

  // Write relationships file
  const relationshipsPath = path.join(dataDir, 'ONET.Tools.Products.tsv')
  const outputHeaders = ['toolId', 'toolType', 'productId', 'commodityCode']
  const rows = relationships.map(r =>
    `${r.toolId}\t${r.toolType}\t${r.productId}\t${r.commodityCode}`
  )

  fs.writeFileSync(relationshipsPath, outputHeaders.join('\t') + '\n' + rows.join('\n'))
  console.log(`  ✓ ONET.Tools.Products.tsv (${relationships.length} relationships)`)
}

async function generateProcessIndustryRelationships() {
  console.log('\n🏭 Generating Process → Industry Relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  const relationships: Array<{
    processId: string
    industry: string
  }> = []

  // Read Processes.tsv
  const processesPath = path.join(dataDir, 'Processes.tsv')
  if (fs.existsSync(processesPath)) {
    const content = fs.readFileSync(processesPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')
    const idIdx = headers.indexOf('id')
    const industryIdx = headers.indexOf('industry')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      const cols = line.split('\t')
      const processId = cols[idIdx]
      const industry = cols[industryIdx]

      if (industry && industry.trim()) {
        relationships.push({
          processId,
          industry
        })
      }
    }
  }

  // Write relationships file
  const relationshipsPath = path.join(dataDir, 'Processes.Industries.tsv')
  const outputHeaders = ['processId', 'industry']
  const rows = relationships.map(r =>
    `${r.processId}\t${r.industry}`
  )

  fs.writeFileSync(relationshipsPath, outputHeaders.join('\t') + '\n' + rows.join('\n'))
  console.log(`  ✓ Processes.Industries.tsv (${relationships.length} relationships)`)
}

async function generateTaskOccupationRelationships() {
  console.log('\n👔 Generating Task → Occupation Relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  const relationships: Array<{
    taskId: string
    occupation: string
  }> = []

  // Read Tasks.tsv
  const tasksPath = path.join(dataDir, 'Tasks.tsv')
  if (fs.existsSync(tasksPath)) {
    const content = fs.readFileSync(tasksPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')
    const idIdx = headers.indexOf('id')
    const occupationIdx = headers.indexOf('occupationTitle')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      const cols = line.split('\t')
      const taskId = cols[idIdx]
      const occupation = cols[occupationIdx]

      if (occupation && occupation.trim()) {
        relationships.push({
          taskId,
          occupation
        })
      }
    }
  }

  // Write relationships file
  const relationshipsPath = path.join(dataDir, 'Tasks.Occupations.tsv')
  const outputHeaders = ['taskId', 'occupation']
  const rows = relationships.map(r =>
    `${r.taskId}\t${r.occupation}`
  )

  fs.writeFileSync(relationshipsPath, outputHeaders.join('\t') + '\n' + rows.join('\n'))
  console.log(`  ✓ Tasks.Occupations.tsv (${relationships.length} relationships)`)
}

async function main() {
  console.log('='.repeat(100))
  console.log('DOMAIN RELATIONSHIPS GENERATION')
  console.log('='.repeat(100))

  await generateToolProductRelationships()
  await generateProcessIndustryRelationships()
  await generateTaskOccupationRelationships()

  console.log('\n' + '='.repeat(100))
  console.log('✅ All domain relationships generated!')
  console.log('='.repeat(100))
}

main().catch(console.error)

#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

interface Relationship {
  child: string
  childCode: string
  parent: string
  parentCode: string
  level: string
}

async function generateUNSPSCRelationships() {
  console.log('\n📦 Generating UNSPSC Relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  const relationships: Relationship[] = []

  // Read all hierarchy levels
  const commodities = new Map()
  const classes = new Map()
  const families = new Map()
  const segments = new Map()

  // Load Commodities
  const commoditiesPath = path.join(dataDir, 'UNSPSC.Commodities.tsv')
  if (fs.existsSync(commoditiesPath)) {
    const content = fs.readFileSync(commoditiesPath, 'utf-8')
    const lines = content.split('\n').slice(1) // Skip header
    for (const line of lines) {
      if (!line.trim()) continue
      const [id, code, name, description, classCode] = line.split('\t')
      commodities.set(code, { id, code, name, classCode })
    }
  }

  // Load Classes
  const classesPath = path.join(dataDir, 'UNSPSC.Classes.tsv')
  if (fs.existsSync(classesPath)) {
    const content = fs.readFileSync(classesPath, 'utf-8')
    const lines = content.split('\n').slice(1)
    for (const line of lines) {
      if (!line.trim()) continue
      const [id, code, name, familyCode] = line.split('\t')
      classes.set(code, { id, code, name, familyCode })
    }
  }

  // Load Families
  const familiesPath = path.join(dataDir, 'UNSPSC.Families.tsv')
  if (fs.existsSync(familiesPath)) {
    const content = fs.readFileSync(familiesPath, 'utf-8')
    const lines = content.split('\n').slice(1)
    for (const line of lines) {
      if (!line.trim()) continue
      const [id, code, name, segmentCode] = line.split('\t')
      families.set(code, { id, code, name, segmentCode })
    }
  }

  // Load Segments
  const segmentsPath = path.join(dataDir, 'UNSPSC.Segments.tsv')
  if (fs.existsSync(segmentsPath)) {
    const content = fs.readFileSync(segmentsPath, 'utf-8')
    const lines = content.split('\n').slice(1)
    for (const line of lines) {
      if (!line.trim()) continue
      const [id, code, name] = line.split('\t')
      segments.set(code, { id, code, name })
    }
  }

  // Create Commodity → Class relationships
  for (const commodity of commodities.values()) {
    const classObj = classes.get(commodity.classCode)
    if (classObj) {
      relationships.push({
        child: commodity.id,
        childCode: commodity.code,
        parent: classObj.id,
        parentCode: classObj.code,
        level: 'Commodity→Class'
      })
    }
  }

  // Create Class → Family relationships
  for (const classObj of classes.values()) {
    const family = families.get(classObj.familyCode)
    if (family) {
      relationships.push({
        child: classObj.id,
        childCode: classObj.code,
        parent: family.id,
        parentCode: family.code,
        level: 'Class→Family'
      })
    }
  }

  // Create Family → Segment relationships
  for (const family of families.values()) {
    const segment = segments.get(family.segmentCode)
    if (segment) {
      relationships.push({
        child: family.id,
        childCode: family.code,
        parent: segment.id,
        parentCode: segment.code,
        level: 'Family→Segment'
      })
    }
  }

  // Write relationships file
  const relationshipsPath = path.join(dataDir, 'UNSPSC.Relationships.tsv')
  const headers = ['child', 'childCode', 'parent', 'parentCode', 'level']
  const rows = relationships.map(r =>
    `${r.child}\t${r.childCode}\t${r.parent}\t${r.parentCode}\t${r.level}`
  )

  fs.writeFileSync(relationshipsPath, headers.join('\t') + '\n' + rows.join('\n'))
  console.log(`  ✓ UNSPSC.Relationships.tsv (${relationships.length} relationships)`)
}

async function generateNAPCSRelationships() {
  console.log('\n🔧 Generating NAPCS Relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  const relationships: Relationship[] = []

  // Read all hierarchy levels
  const details = new Map()
  const subclasses = new Map()
  const classes = new Map()
  const groups = new Map()

  // Load Details
  const detailsPath = path.join(dataDir, 'NAPCS.Details.tsv')
  if (fs.existsSync(detailsPath)) {
    const content = fs.readFileSync(detailsPath, 'utf-8')
    const lines = content.split('\n').slice(1)
    for (const line of lines) {
      if (!line.trim()) continue
      const [id, code, name, description, parent] = line.split('\t')
      details.set(code, { id, code, name, parent })
    }
  }

  // Load Subclasses
  const subclassesPath = path.join(dataDir, 'NAPCS.Subclasses.tsv')
  if (fs.existsSync(subclassesPath)) {
    const content = fs.readFileSync(subclassesPath, 'utf-8')
    const lines = content.split('\n').slice(1)
    for (const line of lines) {
      if (!line.trim()) continue
      const [id, code, name, description, parent] = line.split('\t')
      subclasses.set(code, { id, code, name, parent })
    }
  }

  // Load Classes
  const classesPath = path.join(dataDir, 'NAPCS.Classes.tsv')
  if (fs.existsSync(classesPath)) {
    const content = fs.readFileSync(classesPath, 'utf-8')
    const lines = content.split('\n').slice(1)
    for (const line of lines) {
      if (!line.trim()) continue
      const [id, code, name, description, parent] = line.split('\t')
      classes.set(code, { id, code, name, parent })
    }
  }

  // Load Groups
  const groupsPath = path.join(dataDir, 'NAPCS.Groups.tsv')
  if (fs.existsSync(groupsPath)) {
    const content = fs.readFileSync(groupsPath, 'utf-8')
    const lines = content.split('\n').slice(1)
    for (const line of lines) {
      if (!line.trim()) continue
      const [id, code, name, description] = line.split('\t')
      groups.set(code, { id, code, name })
    }
  }

  // Create Detail → Subclass relationships
  for (const detail of details.values()) {
    const subclass = subclasses.get(detail.parent)
    if (subclass) {
      relationships.push({
        child: detail.id,
        childCode: detail.code,
        parent: subclass.id,
        parentCode: subclass.code,
        level: 'Detail→Subclass'
      })
    }
  }

  // Create Subclass → Class relationships
  for (const subclass of subclasses.values()) {
    const classObj = classes.get(subclass.parent)
    if (classObj) {
      relationships.push({
        child: subclass.id,
        childCode: subclass.code,
        parent: classObj.id,
        parentCode: classObj.code,
        level: 'Subclass→Class'
      })
    }
  }

  // Create Class → Group relationships
  for (const classObj of classes.values()) {
    const group = groups.get(classObj.parent)
    if (group) {
      relationships.push({
        child: classObj.id,
        childCode: classObj.code,
        parent: group.id,
        parentCode: group.code,
        level: 'Class→Group'
      })
    }
  }

  // Write relationships file
  const relationshipsPath = path.join(dataDir, 'NAPCS.Relationships.tsv')
  const headers = ['child', 'childCode', 'parent', 'parentCode', 'level']
  const rows = relationships.map(r =>
    `${r.child}\t${r.childCode}\t${r.parent}\t${r.parentCode}\t${r.level}`
  )

  fs.writeFileSync(relationshipsPath, headers.join('\t') + '\n' + rows.join('\n'))
  console.log(`  ✓ NAPCS.Relationships.tsv (${relationships.length} relationships)`)
}

async function generateGS1Relationships() {
  console.log('\n🏷️  Generating GS1 GPC Relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  const relationships: Relationship[] = []

  // Read all hierarchy levels
  const bricks = new Map()
  const classes = new Map()
  const families = new Map()
  const segments = new Map()

  // Load Bricks
  const bricksPath = path.join(dataDir, 'GS1.Bricks.tsv')
  if (fs.existsSync(bricksPath)) {
    const content = fs.readFileSync(bricksPath, 'utf-8')
    const lines = content.split('\n').slice(1)
    for (const line of lines) {
      if (!line.trim()) continue
      const [id, code, name, description, classCode] = line.split('\t')
      bricks.set(code, { id, code, name, classCode })
    }
  }

  // Load Classes
  const classesPath = path.join(dataDir, 'GS1.Classes.tsv')
  if (fs.existsSync(classesPath)) {
    const content = fs.readFileSync(classesPath, 'utf-8')
    const lines = content.split('\n').slice(1)
    for (const line of lines) {
      if (!line.trim()) continue
      const [id, code, name, familyCode] = line.split('\t')
      classes.set(code, { id, code, name, familyCode })
    }
  }

  // Load Families
  const familiesPath = path.join(dataDir, 'GS1.Families.tsv')
  if (fs.existsSync(familiesPath)) {
    const content = fs.readFileSync(familiesPath, 'utf-8')
    const lines = content.split('\n').slice(1)
    for (const line of lines) {
      if (!line.trim()) continue
      const [id, code, name, segmentCode] = line.split('\t')
      families.set(code, { id, code, name, segmentCode })
    }
  }

  // Load Segments
  const segmentsPath = path.join(dataDir, 'GS1.Segments.tsv')
  if (fs.existsSync(segmentsPath)) {
    const content = fs.readFileSync(segmentsPath, 'utf-8')
    const lines = content.split('\n').slice(1)
    for (const line of lines) {
      if (!line.trim()) continue
      const [id, code, name] = line.split('\t')
      segments.set(code, { id, code, name })
    }
  }

  // Create Brick → Class relationships
  for (const brick of bricks.values()) {
    const classObj = classes.get(brick.classCode)
    if (classObj) {
      relationships.push({
        child: brick.id,
        childCode: brick.code,
        parent: classObj.id,
        parentCode: classObj.code,
        level: 'Brick→Class'
      })
    }
  }

  // Create Class → Family relationships
  for (const classObj of classes.values()) {
    const family = families.get(classObj.familyCode)
    if (family) {
      relationships.push({
        child: classObj.id,
        childCode: classObj.code,
        parent: family.id,
        parentCode: family.code,
        level: 'Class→Family'
      })
    }
  }

  // Create Family → Segment relationships
  for (const family of families.values()) {
    const segment = segments.get(family.segmentCode)
    if (segment) {
      relationships.push({
        child: family.id,
        childCode: family.code,
        parent: segment.id,
        parentCode: segment.code,
        level: 'Family→Segment'
      })
    }
  }

  // Write relationships file
  const relationshipsPath = path.join(dataDir, 'GS1.Relationships.tsv')
  const headers = ['child', 'childCode', 'parent', 'parentCode', 'level']
  const rows = relationships.map(r =>
    `${r.child}\t${r.childCode}\t${r.parent}\t${r.parentCode}\t${r.level}`
  )

  fs.writeFileSync(relationshipsPath, headers.join('\t') + '\n' + rows.join('\n'))
  console.log(`  ✓ GS1.Relationships.tsv (${relationships.length} relationships)`)
}

async function generateProductsStandardsRelationships() {
  console.log('\n🔗 Generating Products → Standards Relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  const relationships: Array<{
    productId: string
    standard: string
    standardCode: string
  }> = []

  // Read Products.tsv
  const productsPath = path.join(dataDir, 'Products.tsv')
  if (fs.existsSync(productsPath)) {
    const content = fs.readFileSync(productsPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')

    // Find columns
    const codeIdx = headers.indexOf('code')
    const idIdx = headers.indexOf('id')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const cols = line.split('\t')
      const productId = cols[idIdx]
      const code = cols[codeIdx]

      if (!code) continue

      // Determine standard from code format
      let standard: string
      let standardCode: string

      if (code.startsWith('NAPCS-')) {
        standard = 'NAPCS'
        standardCode = code.substring(6) // Remove 'NAPCS-' prefix
      } else if (code.startsWith('GPC-')) {
        standard = 'GS1'
        standardCode = code.substring(4) // Remove 'GPC-' prefix
      } else if (/^\d{8}$/.test(code)) {
        standard = 'UNSPSC'
        standardCode = code
      } else {
        continue // Unknown code format
      }

      relationships.push({
        productId,
        standard,
        standardCode
      })
    }
  }

  // Write relationships file
  const relationshipsPath = path.join(dataDir, 'Products.Standards.tsv')
  const outputHeaders = ['productId', 'standard', 'standardCode']
  const rows = relationships.map(r =>
    `${r.productId}\t${r.standard}\t${r.standardCode}`
  )

  fs.writeFileSync(relationshipsPath, outputHeaders.join('\t') + '\n' + rows.join('\n'))
  console.log(`  ✓ Products.Standards.tsv (${relationships.length} relationships)`)
}

async function generateServicesStandardsRelationships() {
  console.log('\n🔗 Generating Services → Standards Relationships...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  const relationships: Array<{
    serviceId: string
    standard: string
    standardCode: string
  }> = []

  // Read Services.tsv
  const servicesPath = path.join(dataDir, 'Services.tsv')
  if (fs.existsSync(servicesPath)) {
    const content = fs.readFileSync(servicesPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')

    // Find columns
    const codeIdx = headers.indexOf('code')
    const idIdx = headers.indexOf('id')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const cols = line.split('\t')
      const serviceId = cols[idIdx]
      const code = cols[codeIdx]

      if (!code) continue

      // Determine standard from code format
      let standard: string
      let standardCode: string

      if (code.startsWith('NAPCS-')) {
        standard = 'NAPCS'
        standardCode = code.substring(6) // Remove 'NAPCS-' prefix
      } else if (code.startsWith('GPC-')) {
        standard = 'GS1'
        standardCode = code.substring(4) // Remove 'GPC-' prefix
      } else if (/^\d{8}$/.test(code)) {
        standard = 'UNSPSC'
        standardCode = code
      } else {
        continue // Unknown code format
      }

      relationships.push({
        serviceId,
        standard,
        standardCode
      })
    }
  }

  // Write relationships file
  const relationshipsPath = path.join(dataDir, 'Services.Standards.tsv')
  const outputHeaders = ['serviceId', 'standard', 'standardCode']
  const rows = relationships.map(r =>
    `${r.serviceId}\t${r.standard}\t${r.standardCode}`
  )

  fs.writeFileSync(relationshipsPath, outputHeaders.join('\t') + '\n' + rows.join('\n'))
  console.log(`  ✓ Services.Standards.tsv (${relationships.length} relationships)`)
}

async function main() {
  console.log('='.repeat(100))
  console.log('STANDARDS RELATIONSHIPS GENERATION')
  console.log('='.repeat(100))

  await generateUNSPSCRelationships()
  await generateNAPCSRelationships()
  await generateGS1Relationships()
  await generateProductsStandardsRelationships()
  await generateServicesStandardsRelationships()

  console.log('\n' + '='.repeat(100))
  console.log('✅ All standards relationships generated!')
  console.log('='.repeat(100))
}

main().catch(console.error)

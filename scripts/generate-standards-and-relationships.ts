#!/usr/bin/env tsx
/**
 * Generate Standards.tsv and Standards.Relationships.tsv
 *
 * This script:
 * 1. Creates Standards.tsv with entries for NAPCS, UNSPSC, GPC, GS1, Schema.org, etc.
 * 2. Generates Standards.Relationships.tsv connecting Services/Products to their standards
 * 3. Updates Services.Relationships.tsv and Products.Relationships.tsv with conformsTo relationships
 */

import { readFileSync, writeFileSync } from 'fs'

interface Standard {
  url: string
  ns: string
  type: string
  id: string
  name: string
  fullName: string
  description: string
  maintainer: string
  website: string
  category: string
}

interface Entity {
  url: string
  ns: string
  source: string
  code: string
  unspsc?: string
  gpc?: string
  napcs?: string
}

interface Relationship {
  sourceUrl: string
  relationshipType: string
  targetUrl: string
  targetType: string
  confidence: string
  extractionMethod: string
}

/**
 * Standards definitions
 */
const STANDARDS: Standard[] = [
  {
    url: 'https://standards.org.ai/NAPCS',
    ns: 'standards.org.ai',
    type: 'Standard',
    id: 'NAPCS',
    name: 'NAPCS',
    fullName: 'North American Product Classification System',
    description: 'A comprehensive, market-oriented, industry-neutral system for classifying products (goods and services)',
    maintainer: 'U.S. Census Bureau, Statistics Canada, INEGI',
    website: 'https://www.census.gov/naics/',
    category: 'Product & Service Classification'
  },
  {
    url: 'https://standards.org.ai/UNSPSC',
    ns: 'standards.org.ai',
    type: 'Standard',
    id: 'UNSPSC',
    name: 'UNSPSC',
    fullName: 'United Nations Standard Products and Services Code',
    description: 'An open, global, multi-sector standard for efficient, accurate classification of products and services',
    maintainer: 'GS1 US',
    website: 'https://www.unspsc.org/',
    category: 'Product & Service Classification'
  },
  {
    url: 'https://standards.org.ai/GPC',
    ns: 'standards.org.ai',
    type: 'Standard',
    id: 'GPC',
    name: 'GPC',
    fullName: 'Global Product Classification',
    description: 'GS1 Global Product Classification system for products',
    maintainer: 'GS1',
    website: 'https://www.gs1.org/standards/gpc',
    category: 'Product Classification'
  },
  {
    url: 'https://standards.org.ai/GS1',
    ns: 'standards.org.ai',
    type: 'Standard',
    id: 'GS1',
    name: 'GS1',
    fullName: 'GS1 Standards',
    description: 'Global standards organization for supply chain, retail, and healthcare product identification',
    maintainer: 'GS1',
    website: 'https://www.gs1.org/',
    category: 'Supply Chain Standards'
  },
  {
    url: 'https://standards.org.ai/Schema',
    ns: 'standards.org.ai',
    type: 'Standard',
    id: 'Schema',
    name: 'Schema.org',
    fullName: 'Schema.org Structured Data Vocabulary',
    description: 'A collaborative, community activity with a mission to create, maintain, and promote schemas for structured data on the Internet',
    maintainer: 'Schema.org Community',
    website: 'https://schema.org/',
    category: 'Semantic Web'
  },
  {
    url: 'https://standards.org.ai/ONET',
    ns: 'standards.org.ai',
    type: 'Standard',
    id: 'ONET',
    name: 'O*NET',
    fullName: 'Occupational Information Network',
    description: 'The nation\'s primary source of occupational information with hundreds of standardized and occupation-specific descriptors',
    maintainer: 'U.S. Department of Labor',
    website: 'https://www.onetonline.org/',
    category: 'Occupational Information'
  },
  {
    url: 'https://standards.org.ai/SOC',
    ns: 'standards.org.ai',
    type: 'Standard',
    id: 'SOC',
    name: 'SOC',
    fullName: 'Standard Occupational Classification',
    description: 'A federal statistical standard used by federal agencies to classify workers into occupational categories',
    maintainer: 'U.S. Bureau of Labor Statistics',
    website: 'https://www.bls.gov/soc/',
    category: 'Occupational Classification'
  },
  {
    url: 'https://standards.org.ai/NAICS',
    ns: 'standards.org.ai',
    type: 'Standard',
    id: 'NAICS',
    name: 'NAICS',
    fullName: 'North American Industry Classification System',
    description: 'The standard used by federal statistical agencies in classifying business establishments',
    maintainer: 'U.S. Census Bureau, Statistics Canada, INEGI',
    website: 'https://www.census.gov/naics/',
    category: 'Industry Classification'
  },
  {
    url: 'https://standards.org.ai/APQC',
    ns: 'standards.org.ai',
    type: 'Standard',
    id: 'APQC',
    name: 'APQC',
    fullName: 'APQC Process Classification Framework',
    description: 'A taxonomy of business processes that allows organizations to objectively track and compare their performance',
    maintainer: 'American Productivity & Quality Center',
    website: 'https://www.apqc.org/resource-library/resource-listing/apqc-process-classification-framework-pcf',
    category: 'Business Process Framework'
  }
]

/**
 * Main execution
 */
function main() {
  console.log('📊 GENERATING STANDARDS AND RELATIONSHIPS\n')
  console.log('='.repeat(100) + '\n')

  // Create Standards.tsv
  console.log('📝 Creating Standards.tsv...')
  const standardsPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Standards.tsv'
  const standardsLines = [
    'url\tns\ttype\tid\tname\tfullName\tdescription\tmaintainer\twebsite\tcategory'
  ]

  for (const standard of STANDARDS) {
    standardsLines.push([
      standard.url,
      standard.ns,
      standard.type,
      standard.id,
      standard.name,
      standard.fullName,
      standard.description,
      standard.maintainer,
      standard.website,
      standard.category
    ].join('\t'))
  }

  writeFileSync(standardsPath, standardsLines.join('\n'))
  console.log(`  Saved ${STANDARDS.length} standards to: ${standardsPath}\n`)

  // Read Services.tsv
  console.log('📖 Reading Services.tsv...')
  const servicesPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services.tsv'
  const servicesContent = readFileSync(servicesPath, 'utf-8')
  const servicesLines = servicesContent.trim().split('\n')

  const services: Entity[] = servicesLines.slice(1).map(line => {
    const fields = line.split('\t')
    return {
      url: fields[0] || '',
      ns: fields[1] || '',
      source: fields[10] || '',
      code: fields[4] || '',
      unspsc: fields[5] || undefined,
      gpc: fields[6] || undefined,
      napcs: fields[7] || undefined
    }
  }).filter(s => s.url)

  console.log(`  Loaded ${services.length.toLocaleString()} services\n`)

  // Read Products.tsv
  console.log('📖 Reading Products.tsv...')
  const productsPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Products.tsv'
  const productsContent = readFileSync(productsPath, 'utf-8')
  const productsLines = productsContent.trim().split('\n')

  const products: Entity[] = productsLines.slice(1).map(line => {
    const fields = line.split('\t')
    return {
      url: fields[0] || '',
      ns: fields[1] || '',
      source: fields[10] || 'UNSPSC',
      code: fields[4] || '',
      unspsc: fields[5] || fields[4] || undefined,
      gpc: fields[6] || undefined,
      napcs: fields[7] || undefined
    }
  }).filter(p => p.url)

  console.log(`  Loaded ${products.length.toLocaleString()} products\n`)

  // Generate conformsTo relationships
  console.log('🔗 Generating conformsTo relationships...')
  const relationships: Relationship[] = []

  // Services → Standards
  for (const service of services) {
    // Determine which standards this service conforms to
    const standards: string[] = []

    // Check NAPCS
    if (service.napcs || service.ns === 'napcs.org.ai') {
      standards.push('https://standards.org.ai/NAPCS')
    }

    // Check UNSPSC
    if (service.unspsc || service.ns === 'unspsc.org.ai') {
      standards.push('https://standards.org.ai/UNSPSC')
    }

    // Check GPC
    if (service.gpc) {
      standards.push('https://standards.org.ai/GPC')
      standards.push('https://standards.org.ai/GS1') // GPC is part of GS1
    }

    // Create relationships
    for (const standardUrl of standards) {
      relationships.push({
        sourceUrl: service.url,
        relationshipType: 'conformsTo',
        targetUrl: standardUrl,
        targetType: 'Standard',
        confidence: 'high',
        extractionMethod: 'standard_code_mapping'
      })
    }
  }

  const serviceRelCount = relationships.length
  console.log(`  Created ${serviceRelCount.toLocaleString()} service→standard relationships`)

  // Products → Standards
  for (const product of products) {
    const standards: string[] = []

    // Check NAPCS
    if (product.napcs) {
      standards.push('https://standards.org.ai/NAPCS')
    }

    // Check UNSPSC
    if (product.unspsc || product.ns === 'unspsc.org.ai') {
      standards.push('https://standards.org.ai/UNSPSC')
    }

    // Check GPC
    if (product.gpc) {
      standards.push('https://standards.org.ai/GPC')
      standards.push('https://standards.org.ai/GS1')
    }

    // Create relationships
    for (const standardUrl of standards) {
      relationships.push({
        sourceUrl: product.url,
        relationshipType: 'conformsTo',
        targetUrl: standardUrl,
        targetType: 'Standard',
        confidence: 'high',
        extractionMethod: 'standard_code_mapping'
      })
    }
  }

  const productRelCount = relationships.length - serviceRelCount
  console.log(`  Created ${productRelCount.toLocaleString()} product→standard relationships`)
  console.log(`  Total: ${relationships.length.toLocaleString()} conformsTo relationships\n`)

  // Save Standards.Relationships.tsv
  console.log('💾 Saving Standards.Relationships.tsv...')
  const standardsRelPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Standards.Relationships.tsv'
  const standardsRelLines = [
    'sourceUrl\trelationshipType\ttargetUrl\ttargetType\tconfidence\textractionMethod'
  ]

  for (const rel of relationships) {
    standardsRelLines.push([
      rel.sourceUrl,
      rel.relationshipType,
      rel.targetUrl,
      rel.targetType,
      rel.confidence,
      rel.extractionMethod
    ].join('\t'))
  }

  writeFileSync(standardsRelPath, standardsRelLines.join('\n'))
  console.log(`  Saved ${relationships.length.toLocaleString()} relationships to: ${standardsRelPath}\n`)

  // Update Services.Relationships.tsv
  console.log('📝 Updating Services.Relationships.tsv...')
  const servicesRelPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services.Relationships.tsv'
  const servicesRelContent = readFileSync(servicesRelPath, 'utf-8')
  const servicesRelLines = servicesRelContent.trim().split('\n')
  const servicesRelHeader = servicesRelLines[0]

  // Add new conformsTo relationships
  const serviceConformsTo = relationships.filter(r =>
    services.some(s => s.url === r.sourceUrl)
  )

  for (const rel of serviceConformsTo) {
    servicesRelLines.push([
      rel.sourceUrl,
      rel.relationshipType,
      rel.targetUrl,
      rel.targetType,
      rel.confidence,
      rel.extractionMethod
    ].join('\t'))
  }

  writeFileSync(servicesRelPath, servicesRelLines.join('\n'))
  console.log(`  Added ${serviceConformsTo.length.toLocaleString()} conformsTo relationships`)
  console.log(`  Total: ${servicesRelLines.length - 1} relationships\n`)

  // Update Products.Relationships.tsv
  console.log('📝 Updating Products.Relationships.tsv...')
  const productsRelPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Products.Relationships.tsv'
  const productsRelContent = readFileSync(productsRelPath, 'utf-8')
  const productsRelLines = productsRelContent.trim().split('\n')
  const productsRelHeader = productsRelLines[0]

  // Add new conformsTo relationships
  const productConformsTo = relationships.filter(r =>
    products.some(p => p.url === r.sourceUrl)
  )

  for (const rel of productConformsTo) {
    productsRelLines.push([
      rel.sourceUrl,
      rel.relationshipType,
      rel.targetUrl,
      rel.targetType,
      rel.confidence,
      rel.extractionMethod
    ].join('\t'))
  }

  writeFileSync(productsRelPath, productsRelLines.join('\n'))
  console.log(`  Added ${productConformsTo.length.toLocaleString()} conformsTo relationships`)
  console.log(`  Total: ${productsRelLines.length - 1} relationships\n`)

  // Statistics
  console.log('📊 STATISTICS\n')

  const byStandard = new Map<string, { services: number; products: number }>()
  for (const rel of relationships) {
    if (!byStandard.has(rel.targetUrl)) {
      byStandard.set(rel.targetUrl, { services: 0, products: 0 })
    }
    const stats = byStandard.get(rel.targetUrl)!
    if (services.some(s => s.url === rel.sourceUrl)) {
      stats.services++
    } else {
      stats.products++
    }
  }

  console.log('Entities by Standard:')
  console.log('Standard          | Services  | Products  | Total')
  console.log('-'.repeat(60))

  for (const standard of STANDARDS) {
    const stats = byStandard.get(standard.url) || { services: 0, products: 0 }
    const total = stats.services + stats.products
    if (total > 0) {
      console.log(`${standard.name.padEnd(17)} | ${stats.services.toLocaleString().padStart(9)} | ${stats.products.toLocaleString().padStart(9)} | ${total.toLocaleString().padStart(9)}`)
    }
  }

  console.log('\n✅ STANDARDS AND RELATIONSHIPS GENERATION COMPLETE\n')
  console.log('Files generated:')
  console.log(`  - Standards.tsv: ${STANDARDS.length} standards`)
  console.log(`  - Standards.Relationships.tsv: ${relationships.length.toLocaleString()} conformsTo relationships`)
  console.log(`  - Services.Relationships.tsv: updated (+${serviceConformsTo.length.toLocaleString()} relationships)`)
  console.log(`  - Products.Relationships.tsv: updated (+${productConformsTo.length.toLocaleString()} relationships)\n`)
}

main()

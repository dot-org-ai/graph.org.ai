#!/usr/bin/env tsx
/**
 * Create service-product relationship mappings
 *
 * Analyzes expanded services to find product references
 * and create semantic relationships between services and products
 */

import { readFileSync, writeFileSync } from 'fs'

interface Service {
  url: string
  name: string
  activity?: string
  object?: string
  preposition?: string
}

interface Product {
  url: string
  name: string
}

interface Relationship {
  serviceUrl: string
  serviceName: string
  productUrl: string
  productName: string
  relationshipType: string
  confidence: 'high' | 'medium' | 'low'
  matchType: 'exact' | 'partial' | 'fuzzy'
}

/**
 * Main execution
 */
function main() {
  console.log('🔗 CREATING SERVICE-PRODUCT RELATIONSHIPS\n')
  console.log('='.repeat(100) + '\n')

  // Read Services-Expanded.tsv
  console.log('📖 Reading Services-Expanded.tsv...')
  const servicesPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services-Expanded.tsv'
  const servicesContent = readFileSync(servicesPath, 'utf-8')
  const servicesLines = servicesContent.trim().split('\n')
  const servicesHeaders = servicesLines[0].split('\t')

  const services: Service[] = servicesLines.slice(1).map(line => {
    const fields = line.split('\t')
    return {
      url: fields[0] || '',
      name: fields[5] || '',
      activity: fields[8] || undefined,
      object: fields[10] || undefined,
      preposition: fields[9] || undefined
    }
  }).filter(s => s.name)

  console.log(`  Loaded ${services.length.toLocaleString()} services\n`)

  // Read Products.tsv
  console.log('📖 Reading Products.tsv...')
  const productsPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Products.tsv'
  const productsContent = readFileSync(productsPath, 'utf-8')
  const productsLines = productsContent.trim().split('\n')

  const products: Product[] = productsLines.slice(1).map(line => {
    const fields = line.split('\t')
    return {
      url: fields[0] || '',
      name: fields[7] || '' // Column 8 is name
    }
  }).filter(p => p.name)

  console.log(`  Loaded ${products.length.toLocaleString()} products\n`)

  // Create product lookup by normalized name
  console.log('🔍 Building product lookup index...')
  const productByName = new Map<string, Product>()

  for (const product of products) {
    const normalized = product.name.toLowerCase().trim()
    // Store first occurrence (in case of duplicates)
    if (!productByName.has(normalized)) {
      productByName.set(normalized, product)
    }
  }

  console.log(`  Indexed ${productByName.size.toLocaleString()} unique product names\n`)

  // Find relationships
  console.log('🔗 Finding service-product relationships...\n')
  const relationships: Relationship[] = []

  for (const service of services) {
    // Strategy 1: Direct object match
    if (service.object) {
      const objectLower = service.object.toLowerCase().trim()

      // Exact match
      if (productByName.has(objectLower)) {
        const product = productByName.get(objectLower)!
        relationships.push({
          serviceUrl: service.url,
          serviceName: service.name,
          productUrl: product.url,
          productName: product.name,
          relationshipType: determineRelationship(service.activity, service.preposition),
          confidence: 'high',
          matchType: 'exact'
        })
        continue
      }

      // Partial match (singular/plural variants)
      const singularObj = objectLower.replace(/s$/, '')
      const pluralObj = objectLower + 's'

      if (productByName.has(singularObj)) {
        const product = productByName.get(singularObj)!
        relationships.push({
          serviceUrl: service.url,
          serviceName: service.name,
          productUrl: product.url,
          productName: product.name,
          relationshipType: determineRelationship(service.activity, service.preposition),
          confidence: 'high',
          matchType: 'partial'
        })
        continue
      }

      if (productByName.has(pluralObj)) {
        const product = productByName.get(pluralObj)!
        relationships.push({
          serviceUrl: service.url,
          serviceName: service.name,
          productUrl: product.url,
          productName: product.name,
          relationshipType: determineRelationship(service.activity, service.preposition),
          confidence: 'high',
          matchType: 'partial'
        })
      }
    }
  }

  console.log(`✅ Found ${relationships.length.toLocaleString()} service-product relationships\n`)

  // Analyze relationship types
  const byType = new Map<string, number>()
  const byConfidence = new Map<string, number>()
  const byMatchType = new Map<string, number>()

  for (const rel of relationships) {
    byType.set(rel.relationshipType, (byType.get(rel.relationshipType) || 0) + 1)
    byConfidence.set(rel.confidence, (byConfidence.get(rel.confidence) || 0) + 1)
    byMatchType.set(rel.matchType, (byMatchType.get(rel.matchType) || 0) + 1)
  }

  console.log('📊 RELATIONSHIP STATISTICS\n')
  console.log('By Type:')
  for (const [type, count] of Array.from(byType.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count.toLocaleString()}`)
  }

  console.log('\nBy Confidence:')
  for (const [conf, count] of byConfidence.entries()) {
    console.log(`  ${conf}: ${count.toLocaleString()}`)
  }

  console.log('\nBy Match Type:')
  for (const [match, count] of byMatchType.entries()) {
    console.log(`  ${match}: ${count.toLocaleString()}`)
  }

  // Show examples
  console.log('\n📋 EXAMPLE RELATIONSHIPS\n')
  const examples = relationships.slice(0, 30)
  for (const rel of examples) {
    console.log(`${rel.relationshipType}: "${rel.serviceName}" → "${rel.productName}"`)
    console.log(`  Confidence: ${rel.confidence}, Match: ${rel.matchType}`)
    console.log()
  }

  // Save relationships
  const outputPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Service-Product-Relationships.tsv'
  const outputLines = [
    'serviceUrl\tserviceName\tproductUrl\tproductName\trelationshipType\tconfidence\tmatchType'
  ]

  for (const rel of relationships) {
    outputLines.push([
      rel.serviceUrl,
      rel.serviceName,
      rel.productUrl,
      rel.productName,
      rel.relationshipType,
      rel.confidence,
      rel.matchType
    ].join('\t'))
  }

  writeFileSync(outputPath, outputLines.join('\n'))
  console.log(`\n💾 Saved relationships to: ${outputPath}`)
  console.log(`   ${relationships.length.toLocaleString()} relationships`)
}

/**
 * Determine relationship type based on activity and preposition
 */
function determineRelationship(activity?: string, preposition?: string): string {
  if (!activity && !preposition) return 'relatedTo'

  const activityLower = (activity || '').toLowerCase()
  const prep = (preposition || '').toLowerCase()

  // Maintenance/repair services
  if (activityLower.match(/maintenance|repair|servicing/)) {
    return prep === 'for' ? 'maintains' : 'relatedTo'
  }

  // Installation/removal services
  if (activityLower.match(/installation|install|removal|remove/)) {
    return prep === 'for' || prep === 'of' ? 'installs' : 'relatedTo'
  }

  // Rental/leasing services
  if (activityLower.match(/rental|leasing|lease|rent/)) {
    return prep === 'of' ? 'rents' : 'relatedTo'
  }

  // Transportation services
  if (activityLower.match(/transportation|transport|shipping|delivery/)) {
    return prep === 'of' ? 'transports' : 'relatedTo'
  }

  // Manufacturing/production services
  if (activityLower.match(/manufacturing|production|fabrication/)) {
    return prep === 'of' ? 'produces' : 'relatedTo'
  }

  // Design/engineering services
  if (activityLower.match(/design|engineering|development/)) {
    return prep === 'for' || prep === 'of' ? 'designs' : 'relatedTo'
  }

  // Storage/warehousing services
  if (activityLower.match(/storage|warehousing|storing/)) {
    return prep === 'of' ? 'stores' : 'relatedTo'
  }

  // Default
  return 'relatedTo'
}

main()

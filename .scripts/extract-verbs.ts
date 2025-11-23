#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Extract semantic relationships from product/service descriptions
 *
 * Patterns to extract:
 * 1. Synonyms: "X or Y", "X, or Y"
 * 2. Related entities: Capitalized terms that match other product IDs
 * 3. Verbs and relationships: "derived from", "member of", "lives in"
 * 4. Classifications: "type of", "species of", "family"
 * 5. Properties: adjectives and descriptive phrases
 */

interface Product {
  id: string
  name: string
  description: string
  code: string
}

interface Relationship {
  subject: string
  predicate: string
  object: string
  source: string
}

interface Synonym {
  primary: string
  synonym: string
  context: string
}

function parseProducts(tsvPath: string): Product[] {
  const content = fs.readFileSync(tsvPath, 'utf-8')
  const lines = content.split('\n').slice(1) // Skip header

  const products: Product[] = []
  for (const line of lines) {
    if (!line.trim()) continue
    const [id, name, description, code] = line.split('\t')
    if (id && name && description && code) {
      products.push({ id, name, description, code })
    }
  }

  return products
}

function extractSynonyms(product: Product): Synonym[] {
  const synonyms: Synonym[] = []
  const desc = product.description

  // Pattern 1: "X or Y" in the name itself
  const nameOrMatch = product.name.match(/^(.+?)\s+or\s+(.+)$/i)
  if (nameOrMatch) {
    const [, term1, term2] = nameOrMatch
    synonyms.push({
      primary: product.id,
      synonym: term2.trim().replace(/\s+/g, ''),
      context: product.name
    })
  }

  // Pattern 2: "X, or Y (details)" at the start
  const descOrMatch = desc.match(/^(.+?),\s*or\s+([^(,]+)/i)
  if (descOrMatch) {
    const [, term1, term2] = descOrMatch
    synonyms.push({
      primary: product.id,
      synonym: term2.trim().replace(/\s+/g, ''),
      context: `${term1} = ${term2}`
    })
  }

  // Pattern 3: "Synonym is X"
  const synonymIsMatch = desc.match(/Synonym is\s+([A-Z][a-z]+)/i)
  if (synonymIsMatch) {
    synonyms.push({
      primary: product.id,
      synonym: synonymIsMatch[1],
      context: 'Synonym is'
    })
  }

  return synonyms
}

function extractRelationships(product: Product, allProductIds: Set<string>): Relationship[] {
  const relationships: Relationship[] = []
  const desc = product.description

  // Pattern 1: "derived from X"
  const derivedMatch = desc.match(/derived from\s+(?:the\s+)?(?:wild\s+)?([A-Z][a-z]+)/i)
  if (derivedMatch) {
    relationships.push({
      subject: product.id,
      predicate: 'derivedFrom',
      object: derivedMatch[1],
      source: product.code
    })
  }

  // Pattern 2: "member of X", "species of X"
  const memberMatch = desc.match(/(?:member|species)\s+of\s+(?:the\s+)?(.+?)(?:\.|,|$)/i)
  if (memberMatch) {
    relationships.push({
      subject: product.id,
      predicate: 'memberOf',
      object: memberMatch[1].trim(),
      source: product.code
    })
  }

  // Pattern 3: "type of X"
  const typeMatch = desc.match(/type\s+of\s+(.+?)(?:\.|,|$)/i)
  if (typeMatch) {
    relationships.push({
      subject: product.id,
      predicate: 'typeOf',
      object: typeMatch[1].trim(),
      source: product.code
    })
  }

  // Pattern 4: "lives in X", "found in X"
  const livesMatch = desc.match(/(?:lives?|found)\s+in\s+([^.]+)/i)
  if (livesMatch) {
    relationships.push({
      subject: product.id,
      predicate: 'livesIn',
      object: livesMatch[1].trim(),
      source: product.code
    })
  }

  // Pattern 5: Capitalized words that match other product IDs (cross-references)
  const capitalizedWords = desc.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g) || []
  for (const word of capitalizedWords) {
    const entityId = word.replace(/\s+/g, '')
    if (allProductIds.has(entityId) && entityId !== product.id) {
      relationships.push({
        subject: product.id,
        predicate: 'relatedTo',
        object: entityId,
        source: product.code
      })
    }
  }

  return relationships
}

function extractVerbs(product: Product): string[] {
  const desc = product.description
  const verbs = new Set<string>()

  // Extract -ing forms (present participles)
  const ingMatch = desc.match(/\b(\w+ing)\b/g)
  if (ingMatch) {
    for (const word of ingMatch) {
      if (word.length > 4) { // Avoid short words like "ing", "ring"
        verbs.add(word.toLowerCase())
      }
    }
  }

  // Extract -ed forms (past participles)
  const edMatch = desc.match(/\b(\w+ed)\b/g)
  if (edMatch) {
    for (const word of edMatch) {
      if (word.length > 3) {
        verbs.add(word.toLowerCase())
      }
    }
  }

  return Array.from(verbs)
}

async function main() {
  const dataDir = path.resolve(__dirname, '../.data')
  const productsPath = path.join(dataDir, 'Products.tsv')
  const servicesPath = path.join(dataDir, 'Services.tsv')

  console.log('='.repeat(80))
  console.log('SEMANTIC RELATIONSHIP EXTRACTION')
  console.log('='.repeat(80))
  console.log()

  // Load all products and services
  console.log('Loading products and services...')
  const products = parseProducts(productsPath)
  const services = parseProducts(servicesPath)
  const allItems = [...products, ...services]

  console.log(`  ✓ Loaded ${products.length} products`)
  console.log(`  ✓ Loaded ${services.length} services`)
  console.log(`  ✓ Total: ${allItems.length} items`)
  console.log()

  // Build set of all product/service IDs for cross-reference detection
  const allIds = new Set(allItems.map(p => p.id))
  console.log(`  ✓ Built index of ${allIds.size} unique IDs`)
  console.log()

  // Extract synonyms
  console.log('Extracting synonyms...')
  const allSynonyms: Synonym[] = []
  for (const item of allItems) {
    const synonyms = extractSynonyms(item)
    allSynonyms.push(...synonyms)
  }
  console.log(`  ✓ Found ${allSynonyms.length} synonym relationships`)
  console.log()

  // Show sample synonyms
  console.log('Sample synonyms:')
  allSynonyms.slice(0, 10).forEach(s => {
    console.log(`  ${s.primary} = ${s.synonym} (${s.context})`)
  })
  console.log()

  // Extract relationships
  console.log('Extracting relationships...')
  const allRelationships: Relationship[] = []
  for (const item of allItems) {
    const relationships = extractRelationships(item, allIds)
    allRelationships.push(...relationships)
  }
  console.log(`  ✓ Found ${allRelationships.length} relationships`)
  console.log()

  // Group relationships by predicate
  const byPredicate = new Map<string, Relationship[]>()
  for (const rel of allRelationships) {
    if (!byPredicate.has(rel.predicate)) {
      byPredicate.set(rel.predicate, [])
    }
    byPredicate.get(rel.predicate)!.push(rel)
  }

  console.log('Relationships by type:')
  for (const [predicate, rels] of byPredicate) {
    console.log(`  ${predicate}: ${rels.length}`)
  }
  console.log()

  // Show sample relationships
  console.log('Sample relationships:')
  allRelationships.slice(0, 15).forEach(r => {
    console.log(`  ${r.subject} ${r.predicate} ${r.object}`)
  })
  console.log()

  // Extract verbs
  console.log('Extracting verbs from descriptions...')
  const verbCounts = new Map<string, number>()
  for (const item of allItems) {
    const verbs = extractVerbs(item)
    for (const verb of verbs) {
      verbCounts.set(verb, (verbCounts.get(verb) || 0) + 1)
    }
  }

  const topVerbs = Array.from(verbCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)

  console.log(`  ✓ Found ${verbCounts.size} unique verb forms`)
  console.log()
  console.log('Top 50 verbs by frequency:')
  topVerbs.forEach(([verb, count]) => {
    console.log(`  ${verb}: ${count}`)
  })
  console.log()

  // Write outputs
  const outputDir = path.join(dataDir, 'extracted')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Write synonyms
  const synonymsPath = path.join(outputDir, 'Synonyms.tsv')
  const synonymsHeader = 'primary\tsynonym\tcontext\n'
  const synonymsRows = allSynonyms.map(s =>
    `${s.primary}\t${s.synonym}\t${s.context}`
  ).join('\n')
  fs.writeFileSync(synonymsPath, synonymsHeader + synonymsRows)
  console.log(`  ✓ Wrote ${synonymsPath}`)

  // Write relationships
  const relationshipsPath = path.join(outputDir, 'Relationships.tsv')
  const relationshipsHeader = 'subject\tpredicate\tobject\tsource\n'
  const relationshipsRows = allRelationships.map(r =>
    `${r.subject}\t${r.predicate}\t${r.object}\t${r.source}`
  ).join('\n')
  fs.writeFileSync(relationshipsPath, relationshipsHeader + relationshipsRows)
  console.log(`  ✓ Wrote ${relationshipsPath}`)

  // Write verbs
  const verbsPath = path.join(outputDir, 'ExtractedVerbs.tsv')
  const verbsHeader = 'verb\tfrequency\n'
  const verbsRows = topVerbs.map(([verb, count]) =>
    `${verb}\t${count}`
  ).join('\n')
  fs.writeFileSync(verbsPath, verbsHeader + verbsRows)
  console.log(`  ✓ Wrote ${verbsPath}`)

  console.log()
  console.log('='.repeat(80))
  console.log('EXTRACTION COMPLETE')
  console.log('='.repeat(80))
  console.log(`Synonyms: ${allSynonyms.length}`)
  console.log(`Relationships: ${allRelationships.length}`)
  console.log(`Unique verbs: ${verbCounts.size}`)
  console.log()
}

main().catch(console.error)

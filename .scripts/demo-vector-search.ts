#!/usr/bin/env tsx

/**
 * Demo: Vector search using embeddings
 *
 * Shows semantic search capabilities
 */

import { semanticSearch, findSimilar, closeVectorSearch } from '../.mdxdb/vector-search.js'

async function demo() {
  console.log('🔍 Vector Search Demo\n')
  console.log('=' .repeat(80))

  // Example 1: Search for occupations related to leadership
  console.log('\n1. Semantic Search: "leadership and strategy"')
  console.log('='.repeat(80))

  const leadershipResults = await semanticSearch('leadership and strategy', {
    limit: 5,
    threshold: 0.6,
    namespace: 'onet',
  })

  console.log(`\nFound ${leadershipResults.length} results:\n`)
  leadershipResults.forEach((result, i) => {
    console.log(`${i + 1}. ${result.thing.url}`)
    console.log(`   Score: ${result.score.toFixed(4)}`)
    console.log(`   Text: ${result.text.substring(0, 100)}...`)
    console.log()
  })

  // Example 2: Search for products related to pets
  console.log('='.repeat(80))
  console.log('\n2. Semantic Search: "pets and animals"')
  console.log('='.repeat(80))

  const petsResults = await semanticSearch('pets and animals', {
    limit: 5,
    threshold: 0.5,
    namespace: 'unspsc',
    type: 'Commodity',
  })

  console.log(`\nFound ${petsResults.length} results:\n`)
  petsResults.forEach((result, i) => {
    console.log(`${i + 1}. ${result.thing.url}`)
    console.log(`   Score: ${result.score.toFixed(4)}`)
    console.log(`   Text: ${result.text.substring(0, 100)}...`)
    console.log()
  })

  // Example 3: Find similar things
  console.log('='.repeat(80))
  console.log('\n3. Find Similar: Chief Executives')
  console.log('='.repeat(80))

  const ceoUrl = 'https://occupations.org.ai/ChiefExecutives'
  const similarToCEO = await findSimilar(ceoUrl, {
    limit: 5,
    threshold: 0.7,
  })

  console.log(`\nSimilar to ${ceoUrl}:\n`)
  similarToCEO.forEach((result, i) => {
    console.log(`${i + 1}. ${result.thing.url}`)
    console.log(`   Score: ${result.score.toFixed(4)}`)
    console.log(`   Text: ${result.text.substring(0, 100)}...`)
    console.log()
  })

  // Example 4: Search across all types
  console.log('='.repeat(80))
  console.log('\n4. Cross-Domain Search: "artificial intelligence"')
  console.log('='.repeat(80))

  const aiResults = await semanticSearch('artificial intelligence and machine learning', {
    limit: 10,
    threshold: 0.5,
  })

  console.log(`\nFound ${aiResults.length} results across all domains:\n`)
  aiResults.forEach((result, i) => {
    console.log(`${i + 1}. [${result.thing.ns}/${result.thing.type}] ${result.thing.url}`)
    console.log(`   Score: ${result.score.toFixed(4)}`)
    console.log()
  })

  console.log('='.repeat(80))
  console.log('\n✅ Vector Search Demo Complete!')
  console.log('='.repeat(80))

  closeVectorSearch()
}

demo()

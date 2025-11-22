#!/usr/bin/env tsx

/**
 * Demo: Advanced similarity search functions
 *
 * Shows different ways to find similar things
 */

import {
  findSimilar,
  findSimilarByType,
  findMostSimilarOfEachType,
  closeVectorSearch
} from '../.mdxdb/vector-search.js'

async function demo() {
  console.log('🔍 Advanced Similarity Search Demo\n')
  console.log('='.repeat(80))

  const ceoUrl = 'https://occupations.org.ai/ChiefExecutives'

  // Example 1: Find similar things with type filtering
  console.log('\n1. Find similar occupations (type filter)')
  console.log('='.repeat(80))

  const similarOccupations = await findSimilar(ceoUrl, {
    limit: 5,
    threshold: 0.7,
    type: 'Occupation'
  })

  console.log(`\nSimilar to Chief Executives (Occupations only):\n`)
  similarOccupations.forEach((result, i) => {
    console.log(`${i + 1}. ${result.thing.url}`)
    console.log(`   Score: ${result.score.toFixed(4)}`)
    console.log(`   Type: ${result.thing.type}`)
    console.log()
  })

  // Example 2: Find similar things across multiple types
  console.log('='.repeat(80))
  console.log('\n2. Find similar across Skills and Knowledge')
  console.log('='.repeat(80))

  const similarSkillsKnowledge = await findSimilar(ceoUrl, {
    limit: 10,
    threshold: 0.6,
    types: ['Skill', 'Knowledge']
  })

  console.log(`\nSimilar to Chief Executives (Skills & Knowledge):\n`)
  similarSkillsKnowledge.forEach((result, i) => {
    console.log(`${i + 1}. [${result.thing.type}] ${result.thing.url}`)
    console.log(`   Score: ${result.score.toFixed(4)}`)
    console.log()
  })

  // Example 3: Find top N similar of each type
  console.log('='.repeat(80))
  console.log('\n3. Find top 3 similar for multiple types')
  console.log('='.repeat(80))

  const byType = await findSimilarByType(ceoUrl, {
    types: ['Occupation', 'Skill', 'Knowledge', 'Process'],
    limitPerType: 3,
    threshold: 0.6
  })

  console.log(`\nTop 3 similar things of each type:\n`)
  for (const [type, results] of byType.entries()) {
    console.log(`\n${type}:`)
    results.forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.thing.url}`)
      console.log(`     Score: ${result.score.toFixed(4)}`)
    })
  }

  // Example 4: Find most similar thing of each type
  console.log('\n' + '='.repeat(80))
  console.log('\n4. Find single most similar thing of each type')
  console.log('='.repeat(80))

  const bestOfEach = await findMostSimilarOfEachType(ceoUrl, {
    threshold: 0.5,
    excludeTypes: ['Type', 'Property'] // Exclude Schema.org types
  })

  console.log(`\nMost similar thing of each type:\n`)
  for (const [type, result] of bestOfEach.entries()) {
    console.log(`${type}: ${result.thing.url}`)
    console.log(`  Score: ${result.score.toFixed(4)}`)
    console.log()
  }

  console.log('='.repeat(80))
  console.log('\n✅ Similarity Search Demo Complete!')
  console.log('='.repeat(80))

  closeVectorSearch()
}

demo()

#!/usr/bin/env tsx

/**
 * Demo: Type-safe queries against things.db
 *
 * Shows how to use the typed query helpers to explore the knowledge graph
 */

import {
  getOccupationByName,
  getOccupationSkills,
  getOccupationKnowledge,
  getProductByName,
  getProcessByName,
  getChildProcesses,
  getSchemaOrgType,
  getSchemaOrgSubclasses,
  getStats,
} from '../.mdxdb/queries.js'

console.log('🔍 mdxdb Query Demo\n')

// ============================================================================
// 1. Occupations
// ============================================================================

console.log('='.repeat(80))
console.log('1. Occupation: Chief Executives')
console.log('='.repeat(80))

const ceo = getOccupationByName('ChiefExecutives')
if (ceo) {
  console.log(`\nURL: ${ceo.url}`)
  console.log(`Title: ${ceo.data.title}`)
  console.log(`Description: ${ceo.data.description?.substring(0, 200)}...`)

  const skills = getOccupationSkills(ceo.url)
  console.log(`\n✅ Skills (${skills.length} total):`)
  skills.slice(0, 5).forEach(s => {
    console.log(`   - ${s.data.name}`)
  })

  const knowledge = getOccupationKnowledge(ceo.url)
  console.log(`\n📚 Knowledge (${knowledge.length} total):`)
  knowledge.slice(0, 5).forEach(k => {
    console.log(`   - ${k.data.name}`)
  })
}

// ============================================================================
// 2. Products
// ============================================================================

console.log('\n' + '='.repeat(80))
console.log('2. Product: Cats')
console.log('='.repeat(80))

const cats = getProductByName('Cats')
if (cats) {
  console.log(`\nURL: ${cats.url}`)
  console.log(`Title: ${cats.data.title}`)
  if (cats.data.definition) {
    console.log(`Definition: ${cats.data.definition}`)
  }
}

// ============================================================================
// 3. Processes
// ============================================================================

console.log('\n' + '='.repeat(80))
console.log('3. Process: Develop Vision and Strategy')
console.log('='.repeat(80))

const vision = getProcessByName('DevelopVisionAndStrategy')
if (vision) {
  console.log(`\nURL: ${vision.url}`)
  console.log(`Name: ${vision.data.name}`)
  console.log(`Hierarchy: ${vision.data.hierarchyId}`)
  console.log(`Level: ${vision.data.level}`)
  console.log(`Description: ${vision.data.description?.substring(0, 200)}...`)

  const children = getChildProcesses(vision.url)
  console.log(`\n📋 Sub-processes (${children.length} total):`)
  children.slice(0, 5).forEach(p => {
    console.log(`   - ${p.data.hierarchyId}: ${p.data.name}`)
  })
}

// ============================================================================
// 4. Schema.org
// ============================================================================

console.log('\n' + '='.repeat(80))
console.log('4. Schema.org Type: Person')
console.log('='.repeat(80))

const person = getSchemaOrgType('Person')
if (person) {
  console.log(`\nURL: ${person.url}`)
  console.log(`Label: ${person.data.label}`)
  console.log(`Comment: ${person.data.comment?.substring(0, 200)}...`)

  const subclasses = getSchemaOrgSubclasses(person.url)
  console.log(`\n🌳 Subclasses (${subclasses.length} total):`)
  subclasses.slice(0, 10).forEach(s => {
    console.log(`   - ${s.id.replace('schema:', '')}`)
  })
}

// ============================================================================
// 5. Statistics
// ============================================================================

console.log('\n' + '='.repeat(80))
console.log('5. Knowledge Graph Statistics')
console.log('='.repeat(80) + '\n')

const stats = getStats()

console.log(`Total Things: ${stats.things.toLocaleString()}`)
console.log(`Total Relationships: ${stats.relationships.toLocaleString()}`)

console.log(`\n📊 By Namespace:`)
stats.byNamespace.forEach(({ ns, count }) => {
  console.log(`   ${ns}: ${count.toLocaleString()}`)
})

console.log(`\n📊 By Type:`)
stats.byType.forEach(({ ns, type, count }) => {
  console.log(`   ${ns}/${type}: ${count.toLocaleString()}`)
})

console.log('\n' + '='.repeat(80))
console.log('✅ Demo Complete!')
console.log('='.repeat(80))

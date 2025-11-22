#!/usr/bin/env tsx
import { GraphDLParser } from '../dist/parser.js'

async function test() {
  const parser = new GraphDLParser()
  await parser.initialize()

  console.log('Test 1: Inspect generation or mechanical equipment')
  const result1 = parser.parse('Inspect generation or mechanical equipment')
  console.log('Expansions:', result1.expansions?.length || 0)
  console.log(JSON.stringify(result1.expansions?.map(e => ({
    predicate: e.predicate,
    object: e.object,
    original: e.original
  })), null, 2))

  console.log('\n\nTest 1b: Inspect generation equipment')
  const result1b = parser.parse('Inspect generation equipment')
  console.log('Object:', result1b.object)

  console.log('\n\nTest 2: Conform to regulations or standards')
  const result2 = parser.parse('Ensure equipment conforms to applicable regulations or standards')
  console.log('Expansions:', result2.expansions?.length || 0)
  console.log(JSON.stringify(result2.expansions?.map(e => ({
    predicate: e.predicate,
    object: e.object,
    complement: e.complement
  })), null, 2))

  console.log('\n\nTest 3: Supervise or monitor operations')
  const result3 = parser.parse('Supervise or monitor hydroelectric facility operations')
  console.log('Expansions:', result3.expansions?.length || 0)
  console.log(JSON.stringify(result3.expansions?.map(e => ({
    predicate: e.predicate,
    object: e.object
  })), null, 2))

  console.log('\n\nTest 4: Direct activities of businesses or departments')
  const result4 = parser.parse('Direct or coordinate activities of businesses or departments concerned with production')
  console.log('Expansions:', result4.expansions?.length || 0)
  console.log(JSON.stringify(result4.expansions?.map(e => ({
    predicate: e.predicate,
    object: e.object,
    preposition: e.preposition,
    complement: e.complement
  })), null, 2))
}

test().catch(console.error)

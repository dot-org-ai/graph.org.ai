#!/usr/bin/env tsx
import { GraphDLParser } from '../dist/parser.js'

async function main() {
  const parser = new GraphDLParser()
  await parser.initialize()

  const testCases = [
    "Assess feasibility of integrating new leading technologies into product/service concepts",
    "Develop risk mitigation and management strategy and integrate with existing performance management processes",
    "Inspect, test, and maintain respiratory protection equipment",
  ]

  for (const test of testCases) {
    console.log('='.repeat(100))
    console.log(`Input: "${test}"`)
    console.log()

    const result = parser.parse(test)

    console.log('Parsed Structure:')
    console.log(`  predicate: "${result.predicate}"`)
    console.log(`  object: "${result.object}"`)
    console.log(`  preposition: "${result.preposition}"`)
    console.log(`  complement: "${result.complement}"`)
    console.log(`  hasConjunction: ${result.hasConjunction}`)
    console.log(`  expansions: ${result.expansions?.length || 0}`)

    if (result.expansions) {
      result.expansions.forEach((exp, i) => {
        console.log(`    ${i + 1}. predicate="${exp.predicate}", object="${exp.object}", prep="${exp.preposition}", comp="${exp.complement}"`)
      })
    }

    const graphdl = parser.toGraphDL(result)
    console.log()
    console.log(`GraphDL Output: ${graphdl}`)
    console.log(`Length: ${graphdl.length} chars`)
    console.log()
  }
}

main().catch(console.error)

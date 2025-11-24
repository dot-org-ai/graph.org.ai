#!/usr/bin/env tsx
import { GraphDLParser } from '../dist/parser.js'

async function main() {
  const parser = new GraphDLParser()
  await parser.initialize()

  // Sample APQC processes and ONET tasks to test
  const testCases = [
    "Develop Vision and Strategy",
    "Monitor and evaluate quality of customer interactions",
    "Define and maintain enterprise information policies",
    "Research/Resolve order exceptions",
    "Identify, deploy, and support development methodologies and tools",
    "Develop risk mitigation and management strategy and integrate with existing performance management processes",
    "Acquire, Construct, and Manage Assets",
    "Analyze and evaluate competition",
    "Compile and communicate product line sales information",
    "Review and monitor performance measures and improvement ideas for trends",
    "Select, deploy, and operate tools (ticketing, chat/email, knowledge base, IVR, call routing)",
    "Receive, inspect, and store purchased items and consumables",
    "Analyze, negotiate, resolve, and confirm workforce funding and staffing",
    "Monitor/analyze product/service lifecycle",
    "Manage product/service master data (item master, bill of materials, routings)",

    // Problem statements from TSV validation failures:
    "Coordinate and align cross-functional and process strategies",  // Currently: Companies.coordinate.Cross
    "Compute, retrace, or adjust existing surveys of features such as highway alignments, property boundaries, utilities, control and other surveys to match the ground elevation-dependent grids, geodetic grids, or property boundaries and to ensure accuracy and continuity of data used in engineering, surveying, or construction projects.",  // Currently: GeodeticSurveyors.compute
    "Determine (and develop instruments where necessary) the data to be collected, including perception and background surveys, student performance data, observation checklists, comparable schools' data, etc..",  // Currently: Schools.determine
    "Direct, plan, or implement policies, objectives, or activities of organizations or businesses to ensure continuing operations, to maximize returns on investments, or to increase productivity.",  // Currently: ChiefExecutives.direct
    "Perform job-specific roles mapping and value-added analyses",  // Currently: Companies.perform.Job
  ]

  console.log('GraphDL Parser - Comprehensive Review')
  console.log('='.repeat(100))
  console.log()

  for (const test of testCases) {
    const result = parser.parse(test)
    const graphdl = parser.toGraphDL(result)

    console.log(`Original: "${test}"`)
    console.log(`  Length: ${test.length} chars`)
    console.log(`  Has Conjunction: ${result.hasConjunction}`)
    console.log(`  Expansions: ${result.expansions ? result.expansions.length : 0}`)

    if (result.expansions) {
      console.log(`  Individual Tasks:`)
      result.expansions.forEach((exp, i) => {
        const expGraphDL = parser.toGraphDL(exp)
        console.log(`    ${i + 1}. ${exp.original}`)
        console.log(`       GraphDL: ${expGraphDL}`)
      })
    } else {
      console.log(`  Parsed: predicate="${result.predicate}", object="${result.object}"`)
    }

    console.log(`  GraphDL Output: ${graphdl}`)
    console.log(`  GraphDL Length: ${graphdl.length} chars`)
    console.log()
  }

  // Show unknown words
  const unknowns = parser.getUnknownWords(20)
  if (unknowns.length > 0) {
    console.log('Top Unknown Words:')
    for (const [word, freq] of unknowns) {
      console.log(`  ${word}: ${freq}`)
    }
  }
}

main().catch(console.error)

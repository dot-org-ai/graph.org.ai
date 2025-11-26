#!/usr/bin/env tsx
/**
 * Test cases for service semantic parsing
 * Based on validation issues found in real data
 */

import { strict as assert } from 'assert'

// Test framework
type TestCase = {
  name: string
  input: string
  expected: string[]
  issue: string
}

const tests: TestCase[] = []
let passed = 0
let failed = 0

function test(testCase: TestCase) {
  tests.push(testCase)
}

function assertEquals(actual: string[], expected: string[], testName: string) {
  try {
    assert.deepEqual(
      actual.sort(),
      expected.sort(),
      `\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`
    )
    passed++
    console.log(`✅ ${testName}`)
  } catch (e) {
    failed++
    console.log(`❌ ${testName}`)
    console.log(`   ${(e as Error).message}`)
  }
}

// ============================================================================
// ISSUE 1: Compound noun phrases split incorrectly
// ============================================================================

test({
  name: 'Compound medical term should not split',
  input: 'Range of motion and joint mobility treatment',
  expected: ['Range of motion and joint mobility treatment'],
  issue: 'Currently splits into "Range", "motion", "joint mobility treatment"'
})

test({
  name: 'Fresh tropical and semitropical fruit',
  input: 'Fresh tropical and semitropical fruit',
  expected: [
    'Fresh tropical fruit',
    'Fresh semitropical fruit'
  ],
  issue: 'Currently over-splits creating "Fresh tropical", "semitropical tropical", etc'
})

// ============================================================================
// ISSUE 2: Over-expansion with multiple "or" conjunctions
// ============================================================================

test({
  name: 'Highway and road sign or guardrail construction and repair service',
  input: 'Highway and road sign or guardrail construction and repair service',
  expected: [
    'Highway sign construction service',
    'Highway sign repair service',
    'Highway guardrail construction service',
    'Highway guardrail repair service',
    'road sign construction service',
    'road sign repair service',
    'road guardrail construction service',
    'road guardrail repair service'
  ],
  issue: 'Currently creates 12 nonsensical expansions like "Highway sign", "Highway construction"'
})

test({
  name: 'Medical or surgical equipment or implant rental and shipping fee',
  input: 'Medical or surgical equipment or implant rental and shipping fee',
  expected: [
    'Medical equipment rental fee',
    'Medical equipment shipping fee',
    'Medical implant rental fee',
    'Medical implant shipping fee',
    'surgical equipment rental fee',
    'surgical equipment shipping fee',
    'surgical implant rental fee',
    'surgical implant shipping fee'
  ],
  issue: 'Currently creates 12 expansions including nonsense like "Medical rental", "Medical fee"'
})

test({
  name: 'Data communication equipment or platform rental or leasing service',
  input: 'Data communication equipment or platform rental or leasing service',
  expected: [
    'Data communication equipment rental service',
    'Data communication equipment leasing service',
    'Data communication platform rental service',
    'Data communication platform leasing service'
  ],
  issue: 'Currently creates 9 expansions with incorrect boundaries'
})

// ============================================================================
// ISSUE 3: Exclusion clauses dropped
// ============================================================================

test({
  name: 'Exclusion clause should be preserved',
  input: 'Hardwood logs and bolts (except fuel wood and pulpwood)',
  expected: [
    'Hardwood logs (except fuel wood and pulpwood)',
    'Hardwood bolts (except fuel wood and pulpwood)'
  ],
  issue: 'Exclusion clause working but "except" contents could also expand'
})

test({
  name: 'Exclusion with compounds',
  input: 'Logs and bolts of Douglas fir and Western larch (except fuel wood and pulpwood)',
  expected: [
    'Logs of Douglas fir (except fuel wood and pulpwood)',
    'Logs of Western larch (except fuel wood and pulpwood)',
    'bolts of Douglas fir (except fuel wood and pulpwood)',
    'bolts of Western larch (except fuel wood and pulpwood)'
  ],
  issue: 'Information loss - expanded names much shorter than original'
})

// ============================================================================
// ISSUE 4: Duplicate expansions
// ============================================================================

test({
  name: 'No duplicate expansions',
  input: 'Propane and propane mixes',
  expected: [
    'Propane',
    'propane mixes'
  ],
  issue: 'Currently creates "Propane mixes" and "propane mixes" (duplicate with different case)'
})

test({
  name: 'Crude oil and bitumen',
  input: 'Crude oil and bitumen',
  expected: [
    'Crude oil',
    'Crude bitumen'  // or just "bitumen"?
  ],
  issue: 'Should "Crude" apply to both? Current: "Crude oil" and "Crude bitumen"'
})

// ============================================================================
// ISSUE 5: Missed expansions in parentheses
// ============================================================================

test({
  name: 'Expand compounds in (except ...) clauses',
  input: 'Thermal generation electricity (except nuclear and geothermal)',
  expected: [
    'Thermal generation electricity (except nuclear)',
    'Thermal generation electricity (except geothermal)'
  ],
  issue: 'Currently not expanding "(except nuclear and geothermal)"'
})

// ============================================================================
// ISSUE 6: Correct expansions (should pass)
// ============================================================================

test({
  name: 'Maintenance and repair services for automobiles and light trucks',
  input: 'Maintenance and repair services for automobiles and light trucks',
  expected: [
    'Maintenance services for automobiles',
    'Maintenance services for light trucks',
    'repair services for automobiles',
    'repair services for light trucks'
  ],
  issue: 'This should work correctly'
})

test({
  name: 'Heated or cooled air or water',
  input: 'Heated or cooled air or water',
  expected: [
    'Heated air',
    'Heated water',
    'cooled air',
    'cooled water'
  ],
  issue: 'This should work correctly'
})

test({
  name: 'Nursing and weaner hogs',
  input: 'Nursing and weaner hogs',
  expected: [
    'Nursing hogs',
    'weaner hogs'
  ],
  issue: 'Simple case - should work'
})

// ============================================================================
// RUN TESTS
// ============================================================================

console.log('🧪 SERVICE PARSING TEST SUITE\n')
console.log('='.repeat(100) + '\n')

// Import the parser
import { readFileSync } from 'fs'
const parserPath = '/Users/nathanclevenger/projects/graph.org.ai/scripts/parse-service-statements.ts'
const parserCode = readFileSync(parserPath, 'utf-8')

// Extract just the parsing and expansion functions
// (This is a simplified test harness - in production we'd properly modularize)

function parseServiceStatement(name: string): any {
  // Simplified version for testing
  // TODO: Import actual functions from parse-service-statements.ts
  return {
    activities: [],
    objects: [],
    modifiers: [],
    exclusions: [],
    scope: { activityPhrase: '', objectPhrase: '' }
  }
}

function expandServiceStatement(statement: any): Array<{ fullName: string }> {
  // Simplified version for testing
  // TODO: Import actual functions from parse-service-statements.ts
  return [{ fullName: statement.original || '' }]
}

// Run tests
for (const testCase of tests) {
  console.log(`\n📝 ${testCase.name}`)
  console.log(`   Input: "${testCase.input}"`)
  console.log(`   Issue: ${testCase.issue}`)

  const parsed = parseServiceStatement(testCase.input)
  const expanded = expandServiceStatement({ ...parsed, original: testCase.input })
  const actual = expanded.map(e => e.fullName)

  assertEquals(actual, testCase.expected, testCase.name)
}

// Summary
console.log('\n' + '='.repeat(100))
console.log(`\n📊 TEST SUMMARY\n`)
console.log(`Total: ${tests.length}`)
console.log(`✅ Passed: ${passed}`)
console.log(`❌ Failed: ${failed}`)
console.log(`Success rate: ${Math.round(passed/tests.length*100)}%\n`)

if (failed > 0) {
  console.log('⚠️  Run again after fixes to track progress\n')
  process.exit(1)
} else {
  console.log('🎉 All tests passed!\n')
  process.exit(0)
}

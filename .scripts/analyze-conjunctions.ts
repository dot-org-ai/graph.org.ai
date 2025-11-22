import fs from 'fs'

const content = fs.readFileSync('.output/Top100Longest.tsv', 'utf-8')
const lines = content.split('\n').slice(1)

console.log('=== DETAILED CONJUNCTION PATTERN ANALYSIS ===\n')

// Categories of issues
const issues = {
  oxfordComma: [] as string[],
  slashSeparated: [] as string[],
  verbAndVerb: [] as string[],
  complexAnd: [] as string[],
  parenthetical: [] as string[]
}

for (const line of lines) {
  if (!line.trim()) continue
  const [length, source, name] = line.split('\t')

  // Oxford comma: "Identify, deploy, and support"
  if (name.match(/\w+,\s+\w+,?\s+and\s+\w+/)) {
    issues.oxfordComma.push(name)
  }

  // Slash separated: "Monitor/analyze"
  if (name.match(/\w+\/\w+/)) {
    issues.slashSeparated.push(name)
  }

  // Verb and Verb: Two verbs with 'and' between them
  if (name.match(/^[A-Z][a-z]+\s+and\s+[a-z]+\s+/)) {
    issues.verbAndVerb.push(name)
  }

  // Complex multiple 'and' conjunctions
  const andCount = (name.match(/\s+and\s+/g) || []).length
  if (andCount >= 3) {
    issues.complexAnd.push(name)
  }

  // Parenthetical expressions
  if (name.includes('(')) {
    issues.parenthetical.push(name)
  }
}

console.log(`=== OXFORD COMMA (${issues.oxfordComma.length}) ===`)
for (const item of issues.oxfordComma.slice(0, 10)) {
  console.log(`  ${item.slice(0, 100)}`)
}

console.log(`\n=== SLASH-SEPARATED (${issues.slashSeparated.length}) ===`)
for (const item of issues.slashSeparated.slice(0, 10)) {
  console.log(`  ${item.slice(0, 100)}`)
}

console.log(`\n=== VERB AND VERB (${issues.verbAndVerb.length}) ===`)
for (const item of issues.verbAndVerb.slice(0, 10)) {
  console.log(`  ${item.slice(0, 100)}`)
}

console.log(`\n=== COMPLEX MULTIPLE AND (${issues.complexAnd.length}) ===`)
for (const item of issues.complexAnd.slice(0, 10)) {
  const andCount = (item.match(/\s+and\s+/g) || []).length
  console.log(`  [${andCount} ands] ${item.slice(0, 90)}`)
}

console.log(`\n=== PARENTHETICAL (${issues.parenthetical.length}) ===`)
for (const item of issues.parenthetical.slice(0, 10)) {
  console.log(`  ${item.slice(0, 100)}`)
}

// Summary
console.log('\n=== SUMMARY ===')
console.log(`Total top 100 analyzed: ${lines.length - 1}`)
console.log(`Oxford comma patterns: ${issues.oxfordComma.length}`)
console.log(`Slash-separated patterns: ${issues.slashSeparated.length}`)
console.log(`Verb-and-verb patterns: ${issues.verbAndVerb.length}`)
console.log(`Complex multiple 'and' (≥3): ${issues.complexAnd.length}`)
console.log(`Parenthetical expressions: ${issues.parenthetical.length}`)

console.log('\n=== PARSER ISSUES IDENTIFIED ===')
console.log('1. Oxford comma verbs (11 cases) - parser should split into separate tasks')
console.log('2. Slash-separated verbs (9 cases) - parser should handle "/" as "or"')
console.log('3. Complex "and" chains - parser creates overly long dot chains')
console.log('4. Parenthetical expressions - parser includes them in dot notation')
console.log('\nRecommendation: The parser is working but creating very long GraphDL')
console.log('statements because it concatenates everything. The core issue is NOT')
console.log('missing verbs (only 1 missing: Refresh), but rather the parser needs to')
console.log('better handle complex sentence structures.')

import fs from 'fs'
import path from 'path'

/**
 * Discover missing verbs from APQC and ONET data
 * Extracts first words from imperatives that aren't in our verbs lexicon
 */

// Load existing verbs
const verbsFile = '.enrichment/Language/Language.Verbs.tsv'
const verbsContent = fs.readFileSync(verbsFile, 'utf-8')
const existingVerbs = new Set<string>()

for (const line of verbsContent.split('\n').slice(1)) {
  if (!line.trim()) continue
  const [canonicalForm] = line.split('\t')
  if (canonicalForm) {
    existingVerbs.add(canonicalForm.toLowerCase())
  }
}

console.log(`Loaded ${existingVerbs.size} existing verbs`)

// Load APQC processes
const apqcFile = '.source/APQC/APQC.Processes.tsv'
const apqcContent = fs.readFileSync(apqcFile, 'utf-8')
const apqcLines = apqcContent.split('\n').slice(1)

const discoveredVerbs = new Map<string, number>() // verb -> frequency

for (const line of apqcLines) {
  if (!line.trim()) continue
  const cells = line.split('\t')
  const name = cells[2] // process name

  if (!name) continue

  // Extract first word (likely the verb in imperative)
  const firstWord = name.split(/\s+/)[0].replace(/[^a-zA-Z]/g, '')

  if (firstWord && !existingVerbs.has(firstWord.toLowerCase())) {
    const count = discoveredVerbs.get(firstWord) || 0
    discoveredVerbs.set(firstWord, count + 1)
  }
}

// Load ONET emerging tasks
const onetFile = '.source/ONET/ONET.EmergingTasks.tsv'
const onetContent = fs.readFileSync(onetFile, 'utf-8')
const onetLines = onetContent.split('\n').slice(1)

for (const line of onetLines) {
  if (!line.trim()) continue
  const cells = line.split('\t')
  const task = cells[1]

  if (!task) continue

  // Extract first word
  const firstWord = task.split(/\s+/)[0].replace(/[^a-zA-Z]/g, '')

  if (firstWord && !existingVerbs.has(firstWord.toLowerCase())) {
    const count = discoveredVerbs.get(firstWord) || 0
    discoveredVerbs.set(firstWord, count + 1)
  }
}

// Sort by frequency
const sorted = Array.from(discoveredVerbs.entries())
  .sort((a, b) => b[1] - a[1])

console.log('\nTop 50 Missing Verbs:')
console.log('='.repeat(80))
console.log('Verb'.padEnd(30) + 'Frequency')
console.log('-'.repeat(80))

for (const [verb, freq] of sorted.slice(0, 50)) {
  console.log(verb.padEnd(30) + freq.toString())
}

// Export to TSV for manual review
const outputDir = '.output'
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const outputLines = ['verb\tfrequency']
for (const [verb, freq] of sorted) {
  outputLines.push(`${verb}\t${freq}`)
}

fs.writeFileSync(
  path.join(outputDir, 'MissingVerbs.tsv'),
  outputLines.join('\n')
)

console.log(`\nExported ${sorted.length} missing verbs to .output/MissingVerbs.tsv`)

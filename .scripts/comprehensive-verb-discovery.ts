import fs from 'fs'
import path from 'path'

/**
 * Comprehensive verb discovery from ALL text fields in APQC and ONET
 * Parses full descriptions and task text, not just first words
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

console.log(`Loaded ${existingVerbs.size} existing verbs\n`)

// Common verb patterns to extract
const verbPatterns = [
  // Imperative at start: "Analyze the data"
  /^([A-Z][a-z]+)(?:\s+(?:the|a|an|and|or|all|any|each)\s+|\s+)/,

  // After "to": "designed to analyze"
  /\bto\s+([a-z]+)/g,

  // Gerunds: "analyzing data", "by reviewing"
  /\b([a-z]+ing)\b/g,

  // Past tense as adjectives: "analyzed data"
  /\b([a-z]+ed)\b/g,

  // Present tense 3rd person: "system analyzes"
  /\b([a-z]+s)\s+(?:the|a|an|all|any)/g,
]

const discoveredVerbs = new Map<string, Set<string>>() // verb -> sources

function extractVerbsFromText(text: string, source: string): void {
  if (!text) return

  // Split into sentences
  const sentences = text.split(/[.;]\s+/)

  for (const sentence of sentences) {
    if (!sentence.trim()) continue

    // Pattern 1: Imperative at start
    const imperativeMatch = sentence.match(/^([A-Z][a-z]+)(?:\s+(?:the|a|an|and|or|all|any|each)\s+|\s+)/)
    if (imperativeMatch) {
      const word = imperativeMatch[1]
      if (word && word.length >= 3 && !existingVerbs.has(word.toLowerCase())) {
        if (!discoveredVerbs.has(word)) {
          discoveredVerbs.set(word, new Set())
        }
        discoveredVerbs.get(word)!.add(source)
      }
    }

    // Pattern 2: After "to"
    const toMatches = sentence.matchAll(/\bto\s+([a-z]+)/g)
    for (const match of toMatches) {
      const word = match[1]
      if (word && word.length >= 3 && !existingVerbs.has(word.toLowerCase())) {
        const titleCase = word.charAt(0).toUpperCase() + word.slice(1)
        if (!discoveredVerbs.has(titleCase)) {
          discoveredVerbs.set(titleCase, new Set())
        }
        discoveredVerbs.get(titleCase)!.add(source)
      }
    }

    // Pattern 3: Gerunds
    const gerundMatches = sentence.matchAll(/\b([a-z]+ing)\b/g)
    for (const match of gerundMatches) {
      const word = match[1]
      if (word && word.length >= 5 && !existingVerbs.has(word.toLowerCase())) {
        const titleCase = word.charAt(0).toUpperCase() + word.slice(1)
        if (!discoveredVerbs.has(titleCase)) {
          discoveredVerbs.set(titleCase, new Set())
        }
        discoveredVerbs.get(titleCase)!.add(source)
      }
    }
  }
}

console.log('Scanning APQC Process Framework...')

// Scan APQC
const apqcFile = '.source/APQC/APQC.Processes.tsv'
const apqcContent = fs.readFileSync(apqcFile, 'utf-8')
const apqcLines = apqcContent.split('\n').slice(1)

let apqcCount = 0
for (const line of apqcLines) {
  if (!line.trim()) continue
  const cells = line.split('\t')
  const name = cells[2] // process name
  const description = cells[3] // process description

  extractVerbsFromText(name, 'APQC-name')
  extractVerbsFromText(description, 'APQC-desc')
  apqcCount++
}

console.log(`  Processed ${apqcCount} APQC processes`)

// Scan Integrations data
console.log('Scanning Integrations data...')

const integrationsFiles = [
  'Integrations.org.ai/apps.json',
  'Integrations.org.ai/services.json',
]

for (const intFile of integrationsFiles) {
  if (!fs.existsSync(intFile)) {
    console.log(`  Skipping ${path.basename(intFile)} (not found)`)
    continue
  }

  const content = fs.readFileSync(intFile, 'utf-8')
  const data = JSON.parse(content)

  let count = 0
  // Iterate through the JSON structure
  if (Array.isArray(data)) {
    for (const item of data) {
      // Extract from various fields
      if (item.description) extractVerbsFromText(item.description, 'Integrations')
      if (item.title) extractVerbsFromText(item.title, 'Integrations')
      if (item.name) extractVerbsFromText(item.name, 'Integrations')

      // If there are actions/verbs arrays
      if (item.actions && Array.isArray(item.actions)) {
        for (const action of item.actions) {
          if (typeof action === 'string') {
            extractVerbsFromText(action, 'Integrations-actions')
          } else if (action.name) {
            extractVerbsFromText(action.name, 'Integrations-actions')
          }
          if (action.description) extractVerbsFromText(action.description, 'Integrations-actions')
        }
      }

      count++
    }
  }

  console.log(`  Processed ${count} entries from ${path.basename(intFile)}`)
}

// Scan ONET files
console.log('Scanning O*NET data files...')

const onetFiles = [
  '.source/ONET/ONET.EmergingTasks.tsv',
  '.source/ONET/ONET.Tasks.tsv', // if it exists
  '.source/ONET/ONET.WorkActivities.tsv',
]

for (const onetFile of onetFiles) {
  if (!fs.existsSync(onetFile)) {
    console.log(`  Skipping ${path.basename(onetFile)} (not found)`)
    continue
  }

  const content = fs.readFileSync(onetFile, 'utf-8')
  const lines = content.split('\n').slice(1)

  let count = 0
  for (const line of lines) {
    if (!line.trim()) continue
    const cells = line.split('\t')

    // Extract from all text columns
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i]
      if (cell && cell.length > 10 && /[a-zA-Z]/.test(cell)) {
        extractVerbsFromText(cell, `ONET-${path.basename(onetFile)}`)
      }
    }
    count++
  }

  console.log(`  Processed ${count} entries from ${path.basename(onetFile)}`)
}

// Filter to likely verbs (TitleCase or common verb patterns)
const likelyVerbs = new Map<string, { count: number; sources: string[] }>()

for (const [word, sources] of discoveredVerbs.entries()) {
  // Must be TitleCase (starts with capital) or end in common verb suffixes
  if (!word.match(/^[A-Z][a-z]+$/) && !word.match(/^[a-z]+(ing|ed|ize|ate|ify)$/)) {
    continue
  }

  // Convert verb forms to canonical
  let canonical = word
  if (word.match(/^[A-Z]/)) {
    canonical = word // Keep TitleCase as-is for now
  } else if (word.endsWith('ing')) {
    canonical = word.slice(0, -3) // analyzing -> analyz (will need manual cleanup)
  } else if (word.endsWith('ed')) {
    canonical = word.slice(0, -2) // analyzed -> analyz
  } else if (word.endsWith('es')) {
    canonical = word.slice(0, -2) // analyzes -> analyz
  } else if (word.endsWith('s')) {
    canonical = word.slice(0, -1) // calls -> call
  }

  const key = canonical.charAt(0).toUpperCase() + canonical.slice(1).toLowerCase()

  if (!likelyVerbs.has(key)) {
    likelyVerbs.set(key, { count: 0, sources: [] })
  }

  const entry = likelyVerbs.get(key)!
  entry.count += sources.size
  entry.sources.push(...Array.from(sources))
}

// Sort by frequency
const sorted = Array.from(likelyVerbs.entries())
  .map(([verb, data]) => ({
    verb,
    count: data.count,
    sources: Array.from(new Set(data.sources)).join(',')
  }))
  .sort((a, b) => b.count - a.count)

console.log(`\nDiscovered ${sorted.length} potential verbs`)
console.log('\nTop 50 Most Frequent:')
console.log('='.repeat(80))
console.log('Verb'.padEnd(30) + 'Frequency'.padEnd(15) + 'Sources')
console.log('-'.repeat(80))

for (const { verb, count, sources } of sorted.slice(0, 50)) {
  console.log(
    verb.padEnd(30) +
    count.toString().padEnd(15) +
    sources.slice(0, 50)
  )
}

// Export all
const outputDir = '.output'
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const outputLines = ['verb\tfrequency\tsources']
for (const { verb, count, sources } of sorted) {
  outputLines.push(`${verb}\t${count}\t${sources}`)
}

fs.writeFileSync(
  path.join(outputDir, 'ComprehensiveVerbs.tsv'),
  outputLines.join('\n')
)

console.log(`\nExported ${sorted.length} verbs to .output/ComprehensiveVerbs.tsv`)

// Statistics
const highFreq = sorted.filter(v => v.count >= 10).length
const medFreq = sorted.filter(v => v.count >= 5 && v.count < 10).length
const lowFreq = sorted.filter(v => v.count >= 2 && v.count < 5).length
const single = sorted.filter(v => v.count === 1).length

console.log('\nFrequency Distribution:')
console.log(`  High (≥10):  ${highFreq}`)
console.log(`  Medium (5-9): ${medFreq}`)
console.log(`  Low (2-4):    ${lowFreq}`)
console.log(`  Single (1):   ${single}`)
console.log(`  TOTAL:        ${sorted.length}`)

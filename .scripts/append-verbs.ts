import fs from 'fs'
import path from 'path'

/**
 * Append new verbs from a TSV file to the main Language.Verbs.tsv
 * Handles deduplication and validation
 */

const VERBS_FILE = '.enrichment/Language/Language.Verbs.tsv'

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage: npx tsx .scripts/append-verbs.ts <new-verbs.tsv>')
    console.log('')
    console.log('Example:')
    console.log('  npx tsx .scripts/append-verbs.ts .output/NewVerbs.Conjugated.tsv')
    console.log('')
    console.log('This will append new verbs to .enrichment/Language/Language.Verbs.tsv')
    console.log('Automatically handles deduplication and validation.')
    process.exit(0)
  }

  const inputFile = args[0]

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`)
    process.exit(1)
  }

  // Load existing verbs
  const existingContent = fs.readFileSync(VERBS_FILE, 'utf-8')
  const existingLines = existingContent.split('\n')
  const existingVerbs = new Set<string>()

  for (const line of existingLines.slice(1)) {
    if (!line.trim()) continue
    const [canonicalForm] = line.split('\t')
    if (canonicalForm) {
      existingVerbs.add(canonicalForm.toLowerCase())
    }
  }

  console.log(`Loaded ${existingVerbs.size} existing verbs`)

  // Load new verbs
  const newContent = fs.readFileSync(inputFile, 'utf-8')
  const newLines = newContent.split('\n').slice(1) // Skip header

  const toAdd: string[] = []
  const skipped: string[] = []

  for (const line of newLines) {
    if (!line.trim()) continue

    const [canonicalForm] = line.split('\t')
    if (!canonicalForm) continue

    if (existingVerbs.has(canonicalForm.toLowerCase())) {
      skipped.push(canonicalForm)
    } else {
      toAdd.push(line)
      existingVerbs.add(canonicalForm.toLowerCase())
    }
  }

  if (toAdd.length === 0) {
    console.log('\nNo new verbs to add (all already exist)')
    if (skipped.length > 0) {
      console.log(`Skipped ${skipped.length} duplicates: ${skipped.slice(0, 5).join(', ')}${skipped.length > 5 ? '...' : ''}`)
    }
    return
  }

  // Append to file
  const appendContent = '\n' + toAdd.join('\n')
  fs.appendFileSync(VERBS_FILE, appendContent)

  console.log(`\n✓ Added ${toAdd.length} new verbs to ${VERBS_FILE}`)

  if (skipped.length > 0) {
    console.log(`⏭️  Skipped ${skipped.length} duplicates`)
  }

  console.log('\nNew verbs added:')
  for (const line of toAdd.slice(0, 10)) {
    const [canonicalForm, description] = line.split('\t')
    console.log(`  - ${canonicalForm}: ${description}`)
  }

  if (toAdd.length > 10) {
    console.log(`  ... and ${toAdd.length - 10} more`)
  }

  console.log('\n✓ Done! Re-run parser to see improvements.')
}

main()

import fs from 'fs'
import path from 'path'

/**
 * Remove duplicate id/name/canonicalForm columns from Language TSV files
 * Keep only the canonical identifier column
 */

const LANGUAGE_DIR = '.enrichment/Language'

interface FileConfig {
  file: string
  columnsToRemove: string[] // Column names to remove
  keepColumn: string // The column to keep as identifier
}

const configs: FileConfig[] = [
  {
    file: 'Language.Verbs.tsv',
    columnsToRemove: ['id', 'name'], // Remove id and name, keep canonicalForm
    keepColumn: 'canonicalForm',
  },
  {
    file: 'Language.Prepositions.tsv',
    columnsToRemove: ['name'], // Remove name, keep id
    keepColumn: 'id',
  },
  {
    file: 'Language.Conjunctions.tsv',
    columnsToRemove: ['name'],
    keepColumn: 'id',
  },
  {
    file: 'Language.Determiners.tsv',
    columnsToRemove: ['name'],
    keepColumn: 'id',
  },
  {
    file: 'Language.Pronouns.tsv',
    columnsToRemove: ['name'],
    keepColumn: 'id',
  },
  {
    file: 'Language.Adverbs.tsv',
    columnsToRemove: ['name'],
    keepColumn: 'id',
  },
]

function deduplicateFile(config: FileConfig): void {
  const filePath = path.join(LANGUAGE_DIR, config.file)

  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${config.file} (not found)`)
    return
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  if (lines.length === 0) return

  // Parse header
  const header = lines[0].split('\t')
  const columnsToRemoveIndices = config.columnsToRemove
    .map(col => header.indexOf(col))
    .filter(idx => idx !== -1)

  if (columnsToRemoveIndices.length === 0) {
    console.log(`✅ ${config.file} - No columns to remove`)
    return
  }

  // Filter out the columns
  const newLines: string[] = []

  for (const line of lines) {
    const cells = line.split('\t')
    const newCells = cells.filter((_, idx) => !columnsToRemoveIndices.includes(idx))
    newLines.push(newCells.join('\t'))
  }

  // Write back
  fs.writeFileSync(filePath, newLines.join('\n'))

  const removedCols = config.columnsToRemove.filter((_, idx) =>
    columnsToRemoveIndices[idx] !== undefined
  )
  console.log(`✅ ${config.file} - Removed: ${removedCols.join(', ')}`)
}

function main() {
  console.log('Deduplicating Language TSV files...\n')

  for (const config of configs) {
    deduplicateFile(config)
  }

  console.log('\nDone! 🎉')
}

main()

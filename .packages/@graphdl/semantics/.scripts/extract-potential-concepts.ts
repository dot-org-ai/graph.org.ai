#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Extract potential concepts from TSV files by finding:
 * 1. Multi-word noun phrases (2+ capitalized words together)
 * 2. Phrases appearing multiple times
 * 3. Common patterns like "X of Y", "X and Y"
 */

const repoRoot = path.resolve(import.meta.dirname, '../../../..')
const dataDir = path.join(repoRoot, '.data')

// Read Tasks.tsv
const tasksPath = path.join(dataDir, 'Tasks.tsv')
const tasksContent = fs.readFileSync(tasksPath, 'utf-8')
const tasksLines = tasksContent.split('\n').slice(1) // Skip header

// Extract all potential multi-word phrases from GraphDL IDs
const phraseFrequency = new Map<string, number>()

for (const line of tasksLines) {
  if (!line.trim()) continue
  const cols = line.split('\t')
  const id = cols[0]

  // Split by dots and look for multi-word capitalized phrases
  const parts = id.split('.')

  for (const part of parts) {
    // Look for CamelCase words (2+ words joined)
    // Match patterns like "HydroelectricFacility", "MaterialsPrices", "GenerationEquipment"
    const matches = part.match(/([A-Z][a-z]+)([A-Z][a-z]+)/g)
    if (matches) {
      for (const match of matches) {
        const count = phraseFrequency.get(match) || 0
        phraseFrequency.set(match, count + 1)
      }
    }

    // Also look for dot-separated phrases that should be concepts
    // Match patterns like "Materials.Prices" → MaterialsPrices
    if (/^[A-Z]/.test(part) && part.length > 3) {
      const count = phraseFrequency.get(part) || 0
      phraseFrequency.set(part, count + 1)
    }
  }
}

// Sort by frequency
const sorted = Array.from(phraseFrequency.entries())
  .sort((a, b) => b[1] - a[1])
  .filter(([phrase, count]) => count >= 5) // At least 5 occurrences

console.log('Top potential concepts (appearing 5+ times):')
console.log('='.repeat(80))
for (const [phrase, count] of sorted.slice(0, 100)) {
  console.log(`${count.toString().padStart(5)}  ${phrase}`)
}

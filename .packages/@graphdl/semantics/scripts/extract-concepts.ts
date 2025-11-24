#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

interface Concept {
  id: string
  frequency: number
  sources: Set<string>
  baseNoun?: string
  modifiers?: string[]
}

async function main() {
  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')
  
  // Files to extract concepts from
  const files = [
    path.join(dataDir, 'Processes.tsv'),
    path.join(dataDir, 'Tasks.tsv')
  ]

  const concepts = new Map<string, Concept>()

  console.log('Extracting concepts from GraphDL statements...\n')

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log(`  ⚠ Skipping ${path.basename(file)} (not found)`)
      continue
    }

    const content = fs.readFileSync(file, 'utf-8')
    const lines = content.split('\n').slice(1) // Skip header
    const source = path.basename(file, '.tsv')

    for (const line of lines) {
      if (!line.trim()) continue
      
      const cols = line.split('\t')
      const id = cols[0]
      
      // Parse GraphDL: Subject.predicate.Object.preposition.Complement
      const parts = id.split('.')
      
      // Skip subject and predicate, extract objects and complements
      if (parts.length >= 3) {
        for (let i = 2; i < parts.length; i++) {
          const part = parts[i]
          
          // Skip lowercase prepositions
          if (part && part[0] === part[0].toUpperCase() && part.length > 1) {
            // This is a concept (starts with uppercase, not a preposition)
            if (!concepts.has(part)) {
              concepts.set(part, {
                id: part,
                frequency: 0,
                sources: new Set()
              })
            }
            const concept = concepts.get(part)!
            concept.frequency++
            concept.sources.add(source)
          }
        }
      }
    }
    
    console.log(`  ✓ Processed ${path.basename(file)}`)
  }

  // Sort by frequency
  const sorted = Array.from(concepts.values())
    .sort((a, b) => b.frequency - a.frequency)

  console.log(`\n✅ Extracted ${sorted.length} unique concepts`)
  console.log(`\nTop 20 concepts by frequency:`)
  sorted.slice(0, 20).forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.id} (${c.frequency} occurrences)`)
  })

  // Write Business.Concepts.tsv
  const conceptsPath = path.join(dataDir, 'Business.Concepts.tsv')
  const headers = ['id', 'frequency', 'sources', 'baseNoun', 'modifiers', 'description']
  const rows = sorted.map(c => 
    `${c.id}\t${c.frequency}\t${Array.from(c.sources).join(',')}\t\t\t`
  )
  
  fs.writeFileSync(conceptsPath, headers.join('\t') + '\n' + rows.join('\n'))
  console.log(`\n✓ Wrote ${conceptsPath}`)
}

main().catch(console.error)

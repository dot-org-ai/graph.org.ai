#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface CuratedConcept {
  id: string
  description: string
  baseNoun: string
  modifiers: string
  category: string
  source: string
}

interface ExtractedConcept {
  id: string
  baseNoun: string
  modifiers: string
  frequency: number
  sources: string
  sampleContext: string
}

interface MergedConcept {
  id: string
  baseNoun: string
  modifiers: string
  frequency: number
  category: string
  description: string
  sources: string
}

function parseTSV(tsvPath: string): string[][] {
  const content = fs.readFileSync(tsvPath, 'utf-8')
  const lines = content.split('\n')
  return lines.slice(1) // Skip header
    .filter(line => line.trim())
    .map(line => line.split('\t'))
}

async function main() {
  const dataDir = path.resolve(__dirname, '../.data')
  
  console.log('='.repeat(80))
  console.log('MERGING CONCEPTS')
  console.log('='.repeat(80))
  console.log()
  
  // Load curated concepts
  console.log('Loading curated concepts...')
  const curatedRows = parseTSV(path.join(dataDir, 'Concepts.tsv'))
  const curatedConcepts = new Map<string, CuratedConcept>()
  
  for (const row of curatedRows) {
    const [id, description, baseNoun, modifiers, category, source] = row
    if (id) {
      curatedConcepts.set(id, {
        id,
        description: description || '',
        baseNoun: baseNoun || '',
        modifiers: modifiers || '',
        category: category || '',
        source: source || ''
      })
    }
  }
  
  console.log(`  ✓ Loaded ${curatedConcepts.size} curated concepts`)
  console.log()
  
  // Load extracted concepts
  console.log('Loading extracted concepts...')
  const extractedRows = parseTSV(path.join(dataDir, 'ExtractedConcepts.tsv'))
  const extractedConcepts = new Map<string, ExtractedConcept>()
  
  for (const row of extractedRows) {
    const [id, baseNoun, modifiers, frequency, sources, sampleContext] = row
    if (id) {
      extractedConcepts.set(id, {
        id,
        baseNoun: baseNoun || '',
        modifiers: modifiers || '',
        frequency: parseInt(frequency) || 0,
        sources: sources || '',
        sampleContext: sampleContext || ''
      })
    }
  }
  
  console.log(`  ✓ Loaded ${extractedConcepts.size} extracted concepts`)
  console.log()
  
  // Merge concepts
  console.log('Merging concepts...')
  const merged = new Map<string, MergedConcept>()
  
  // Add curated concepts first (they have descriptions and categories)
  for (const [id, concept] of curatedConcepts) {
    merged.set(id, {
      id,
      baseNoun: concept.baseNoun,
      modifiers: concept.modifiers,
      frequency: 0, // Will be updated if found in extracted
      category: concept.category,
      description: concept.description,
      sources: concept.source
    })
  }
  
  // Add/update with extracted concepts
  for (const [id, concept] of extractedConcepts) {
    if (merged.has(id)) {
      // Update frequency for curated concept
      const existing = merged.get(id)!
      existing.frequency = concept.frequency
      existing.sources = `${existing.sources},${concept.sources}`
    } else {
      // Add new extracted concept
      merged.set(id, {
        id,
        baseNoun: concept.baseNoun,
        modifiers: concept.modifiers,
        frequency: concept.frequency,
        category: inferCategory(concept.baseNoun, concept.modifiers),
        description: concept.sampleContext.substring(0, 200),
        sources: concept.sources
      })
    }
  }
  
  console.log(`  ✓ Total merged concepts: ${merged.size}`)
  console.log()
  
  // Sort by frequency (descending)
  const sorted = Array.from(merged.values())
    .sort((a, b) => b.frequency - a.frequency)
  
  // Write merged concepts
  const outputPath = path.join(dataDir, 'Concepts.tsv')
  const backupPath = path.join(dataDir, 'Concepts.curated.tsv')
  
  // Backup curated concepts
  fs.copyFileSync(outputPath, backupPath)
  console.log(`  ✓ Backed up curated concepts to ${backupPath}`)
  
  // Write merged file
  const header = 'id\tbaseNoun\tmodifiers\tfrequency\tcategory\tdescription\tsources\n'
  const rows = sorted.map(c =>
    `${c.id}\t${c.baseNoun}\t${c.modifiers}\t${c.frequency}\t${c.category}\t${c.description}\t${c.sources}`
  ).join('\n')
  
  fs.writeFileSync(outputPath, header + rows)
  console.log(`  ✓ Wrote merged concepts to ${outputPath}`)
  
  // Remove ExtractedConcepts.tsv
  fs.unlinkSync(path.join(dataDir, 'ExtractedConcepts.tsv'))
  console.log(`  ✓ Removed ExtractedConcepts.tsv (merged into Concepts.tsv)`)
  
  console.log()
  console.log('='.repeat(80))
  console.log('MERGE COMPLETE')
  console.log('='.repeat(80))
  console.log(`Total concepts: ${merged.size}`)
  console.log(`Curated: ${curatedConcepts.size}`)
  console.log(`Extracted: ${extractedConcepts.size - curatedConcepts.size}`)
  console.log()
}

function inferCategory(baseNoun: string, modifiers: string): string {
  const fullPhrase = `${modifiers} ${baseNoun}`.toLowerCase()
  
  // Category inference based on keywords
  if (/health|medical|clinical|surgical|diagnosis|disease|treatment|intervention|procedure/.test(fullPhrase)) {
    return 'Healthcare'
  }
  if (/customer|client|service|satisfaction|feedback/.test(fullPhrase)) {
    return 'Customer Relations'
  }
  if (/business|strategic|financial|performance|management/.test(fullPhrase)) {
    return 'Business Management'
  }
  if (/product|goods|manufacturing/.test(fullPhrase)) {
    return 'Product Development'
  }
  if (/data|information|technology|system|software/.test(fullPhrase)) {
    return 'Information Technology'
  }
  if (/risk|quality|safety|compliance/.test(fullPhrase)) {
    return 'Governance'
  }
  if (/employee|staff|human resources|workforce/.test(fullPhrase)) {
    return 'Human Resources'
  }
  if (/market|sales|revenue|pricing/.test(fullPhrase)) {
    return 'Sales & Marketing'
  }
  
  return 'General'
}

main().catch(console.error)

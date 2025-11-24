#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Decompose a CamelCase compound word into components
 * Examples:
 *   OrganizationalPerformanceStrategy → [Organizational, Performance, Strategy]
 *   SafetyProcedures → [Safety, Procedures]
 *   QualityStandards → [Quality, Standards]
 */
function decompose(compound: string): string[] {
  // Split on capital letters, keeping the capital with the following word
  const parts = compound.split(/(?=[A-Z])/).filter(p => p.length > 0)
  return parts
}

async function main() {
  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')
  
  const conceptsPath = path.join(dataDir, 'Business.Concepts.tsv')
  const content = fs.readFileSync(conceptsPath, 'utf-8')
  const lines = content.split('\n').slice(1) // Skip header

  const relationships: Array<{
    compound: string
    component: string
    position: number
    totalComponents: number
  }> = []

  console.log('Generating concept relationships...\n')

  for (const line of lines) {
    if (!line.trim()) continue
    
    const cols = line.split('\t')
    const compound = cols[0]
    
    // Only decompose if it's a compound word (has multiple components)
    const components = decompose(compound)
    
    if (components.length > 1) {
      // Create relationships for each component
      components.forEach((component, index) => {
        relationships.push({
          compound,
          component,
          position: index,
          totalComponents: components.length
        })
      })
    }
  }

  console.log(`✅ Generated ${relationships.length} relationships for ${new Set(relationships.map(r => r.compound)).size} compound concepts`)

  // Write relationships file
  const relationshipsPath = path.join(dataDir, 'Business.Concepts.Relationships.tsv')
  const headers = ['compound', 'component', 'position', 'totalComponents']
  const rows = relationships.map(r => 
    `${r.compound}\t${r.component}\t${r.position}\t${r.totalComponents}`
  )
  
  fs.writeFileSync(relationshipsPath, headers.join('\t') + '\n' + rows.join('\n'))
  console.log(`✓ Wrote ${relationshipsPath}`)

  // Show examples
  console.log('\nExample relationships:')
  const examples = relationships.slice(0, 10)
  examples.forEach(r => {
    console.log(`  ${r.compound} → ${r.component} (position ${r.position}/${r.totalComponents})`)
  })
}

main().catch(console.error)

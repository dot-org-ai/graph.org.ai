#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

interface ConceptUsage {
  concept: string
  statementId: string
  source: string
  industry?: string
  occupation?: string
}

async function main() {
  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')
  
  const usages: ConceptUsage[] = []

  console.log('Extracting concept usage from GraphDL statements...\n')

  // Process Processes.tsv (has industry column)
  const processesPath = path.join(dataDir, 'Processes.tsv')
  if (fs.existsSync(processesPath)) {
    const content = fs.readFileSync(processesPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')
    const industryIdx = headers.indexOf('industry')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      
      const cols = line.split('\t')
      const statementId = cols[0]
      const industry = industryIdx >= 0 ? cols[industryIdx] : undefined
      
      // Parse GraphDL: Subject.predicate.Object.preposition.Complement
      const parts = statementId.split('.')
      
      // Extract concepts (skip subject and predicate, extract objects and complements)
      if (parts.length >= 3) {
        for (let j = 2; j < parts.length; j++) {
          const part = parts[j]
          
          // Skip lowercase prepositions
          if (part && part[0] === part[0].toUpperCase() && part.length > 1) {
            usages.push({
              concept: part,
              statementId,
              source: 'Processes',
              industry
            })
          }
        }
      }
    }
    
    console.log(`  ✓ Processed Processes.tsv (${usages.length} concept usages)`)
  }

  // Process Tasks.tsv (has occupationTitle column)
  const tasksPath = path.join(dataDir, 'Tasks.tsv')
  if (fs.existsSync(tasksPath)) {
    const content = fs.readFileSync(tasksPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')
    const occupationIdx = headers.indexOf('occupationTitle')
    
    const taskUsagesStart = usages.length

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      
      const cols = line.split('\t')
      const statementId = cols[0]
      const occupation = occupationIdx >= 0 ? cols[occupationIdx] : undefined
      
      // Parse GraphDL: Subject.predicate.Object.preposition.Complement
      const parts = statementId.split('.')
      
      // Extract concepts
      if (parts.length >= 3) {
        for (let j = 2; j < parts.length; j++) {
          const part = parts[j]
          
          // Skip lowercase prepositions
          if (part && part[0] === part[0].toUpperCase() && part.length > 1) {
            usages.push({
              concept: part,
              statementId,
              source: 'Tasks',
              occupation
            })
          }
        }
      }
    }
    
    console.log(`  ✓ Processed Tasks.tsv (${usages.length - taskUsagesStart} concept usages)`)
  }

  console.log(`\n✅ Extracted ${usages.length} total concept usages`)

  // Write Business.Concepts.Usage.tsv
  const usagePath = path.join(dataDir, 'Business.Concepts.Usage.tsv')
  const headers = ['concept', 'statementId', 'source', 'industry', 'occupation']
  const rows = usages.map(u => 
    `${u.concept}\t${u.statementId}\t${u.source}\t${u.industry || ''}\t${u.occupation || ''}`
  )
  
  fs.writeFileSync(usagePath, headers.join('\t') + '\n' + rows.join('\n'))
  console.log(`✓ Wrote ${usagePath}`)

  // Show example for OrganizationalPerformanceStrategy
  console.log('\nExample: OrganizationalPerformanceStrategy usage:')
  const examples = usages.filter(u => u.concept === 'OrganizationalPerformanceStrategy').slice(0, 5)
  examples.forEach(u => {
    console.log(`  ${u.statementId} (${u.industry || u.occupation})`)
  })
}

main().catch(console.error)

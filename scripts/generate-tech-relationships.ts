#!/usr/bin/env tsx
/**
 * Generate Tech.Relationships.tsv by merging:
 * - Technologies.Relationships.tsv (ONET Tech relationships)
 * - App relationships (Apps.Relationships.tsv if it exists, or generate from Apps.tsv)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')

function parseTsv(content: string): any[] {
  const lines = content.trim().split('\n')
  const headers = lines[0].split('\t')
  const rows: any[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = lines[i].split('\t')
    const obj: any = {}
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] || ''
    }
    rows.push(obj)
  }

  return rows
}

function writeTsv(path: string, rows: any[], headers: string[]) {
  const lines = [
    headers.join('\t'),
    ...rows.map(row => headers.map(h => row[h] || '').join('\t'))
  ]
  writeFileSync(path, lines.join('\n') + '\n')
}

console.log('🚀 Generating Tech.Relationships.tsv\n')

const techRelationships: any[] = []

// Load ONET Technologies.Relationships.tsv
console.log('1️⃣  Loading Technologies.Relationships.tsv (ONET)...')
const onetTechRels = parseTsv(readFileSync(resolve(DATA_DIR, 'Technologies.Relationships.tsv'), 'utf-8'))
console.log(`   Loaded ${onetTechRels.length.toLocaleString()} ONET technology relationships`)

// Update namespace to tech.org.ai for consistency
onetTechRels.forEach(rel => {
  techRelationships.push({
    ns: 'tech.org.ai',
    from: rel.from.replace('https://onet.org/', 'https://tech.org.ai/'),
    to: rel.to.replace('https://onet.org/', 'https://tech.org.ai/'),
    predicate: rel.predicate,
    reverse: rel.reverse
  })
})

// Load Apps and create App relationships
console.log('\n2️⃣  Generating relationships for Apps (as Tech)...')
const apps = parseTsv(readFileSync(resolve(DATA_DIR, 'Apps.tsv'), 'utf-8'))
console.log(`   Loaded ${apps.length.toLocaleString()} apps`)

// Generate App → Category relationships
apps.forEach(app => {
  if (!app.category) return

  const categoryId = app.category.replace(/\s+/g, '')

  techRelationships.push({
    ns: 'tech.org.ai',
    from: `https://tech.org.ai/${app.id}`,
    to: `https://integrations.org.ai/Category/${categoryId}`,
    predicate: 'inCategory',
    reverse: 'hasTech'
  })
})

console.log(`   Generated ${apps.length.toLocaleString()} app→category relationships`)

// Write Tech.Relationships.tsv
console.log('\n3️⃣  Writing Tech.Relationships.tsv...')
const headers = ['ns', 'from', 'to', 'predicate', 'reverse']
writeTsv(resolve(DATA_DIR, 'Tech.Relationships.tsv'), techRelationships, headers)

console.log('\n✅ Tech.Relationships.tsv created!')
console.log(`   Total relationships: ${techRelationships.length.toLocaleString()}`)
console.log(`   - ONET Tech relationships: ${onetTechRels.length.toLocaleString()}`)
console.log(`   - App→Category relationships: ${apps.length.toLocaleString()}`)

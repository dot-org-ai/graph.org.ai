#!/usr/bin/env tsx
/**
 * Merge ONET Technologies with Apps to create unified Tech.tsv
 */

import { readFileSync, writeFileSync } from 'fs'
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

console.log('🚀 Merging ONET Technologies with Apps to create Tech.tsv\n')

// Load ONET Technologies
console.log('1️⃣  Loading Technologies.tsv (ONET)...')
const onetTech = parseTsv(readFileSync(resolve(DATA_DIR, 'Technologies.tsv'), 'utf-8'))
console.log(`   Loaded ${onetTech.length.toLocaleString()} ONET technologies`)

// Load Apps
console.log('\n2️⃣  Loading Apps.tsv...')
const apps = parseTsv(readFileSync(resolve(DATA_DIR, 'Apps.tsv'), 'utf-8'))
console.log(`   Loaded ${apps.length.toLocaleString()} apps`)

// Create unified Tech map (using ID as key)
const techMap = new Map()

// Add ONET Technologies
onetTech.forEach(tech => {
  techMap.set(tech.id, {
    url: tech.url,
    ns: tech.ns,
    type: 'Technology',
    id: tech.id,
    code: tech.code,
    name: tech.name,
    description: tech.description,
    source: 'ONET'
  })
})

// Add Apps as Technologies
apps.forEach(app => {
  // Only add if not already present (ONET takes precedence)
  if (!techMap.has(app.id)) {
    techMap.set(app.id, {
      url: `https://tech.org.ai/${app.id}`,
      ns: 'tech.org.ai',
      type: 'Technology',
      id: app.id,
      code: app.code,
      name: app.name,
      description: app.description || `${app.name} - Integration technology`,
      source: 'Integrations'
    })
  }
})

console.log('\n3️⃣  Merging technologies...')
console.log(`   ONET technologies: ${onetTech.length.toLocaleString()}`)
console.log(`   Apps as technologies: ${apps.length.toLocaleString()}`)
console.log(`   Total unique technologies: ${techMap.size.toLocaleString()}`)

// Write Tech.tsv
const mergedTech = Array.from(techMap.values())
const techHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'source']
writeTsv(resolve(DATA_DIR, 'Tech.tsv'), mergedTech, techHeaders)

console.log('\n✅ Tech.tsv created!')
console.log(`   Final count: ${mergedTech.length.toLocaleString()} technologies`)

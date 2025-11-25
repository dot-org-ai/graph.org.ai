#!/usr/bin/env tsx
/**
 * Generate Apps.tsv and App.Searches.tsv from Zapier API
 * Note: App.Nouns.tsv, App.Events.tsv, App.Actions.tsv are already generated
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')

interface ZapierApp {
  key: string
  title: string
  description?: string
  url?: string
  image?: string
  hex_color?: string
  category?: string
  categories?: string[]
  app_category?: { slug: string; title: string }
  searches?: { key: string; noun: string; display_label: string; description?: string }[]
}

function toPascalCase(str: string): string {
  if (!str) return ''
  const cleaned = str
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

function generateId(name: string, fallback?: string): string {
  const pascalName = toPascalCase(name)
  if (!pascalName || pascalName.length < 2) {
    return toPascalCase(name + (fallback || ''))
  }
  return pascalName
}

console.log('🚀 Generating Apps.tsv and App.Searches.tsv from Zapier API\n')

// 1. Fetch all apps from Zapier API
console.log('1️⃣  Fetching apps from API...')

const zapierApps: ZapierApp[] = []
let offset = 0
let hasMore = true

while (hasMore) {
  const response = await fetch(`https://zapier.com/api/v4/services/?limit=250&offset=${offset}`)
  const data = await response.json()

  if (data.results && data.results.length > 0) {
    zapierApps.push(...data.results)
    console.log(`   Fetched offset ${offset}: ${zapierApps.length.toLocaleString()} apps total`)
    offset += 250
    hasMore = data.results.length === 250
  } else {
    hasMore = false
  }
}

console.log(`   ✓ Fetched ${zapierApps.length.toLocaleString()} apps\n`)

// 2. Generate Apps.tsv
console.log('2️⃣  Generating Apps.tsv...')
const apps = zapierApps.map((app: any) => {
  const id = generateId(app.name, app.slug)
  const categories = app.categories?.map((c: any) => c.title).join(', ') || ''
  const category = app.categories?.[0]?.title || ''

  return {
    url: `https://zapier.com/App/${id}`,
    ns: 'zapier.com.ai',
    type: 'App',
    id,
    code: app.slug,
    name: app.name,
    description: app.description || '',
    category,
    categories,
    imageUrl: app.image || '',
    hexColor: app.primary_color || '',
    appUrl: app.app_url || '',
  }
})

const appsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'category', 'categories', 'imageUrl', 'hexColor', 'appUrl']
const appsOutput = [
  appsHeaders.join('\t'),
  ...apps.map(app => appsHeaders.map(h => app[h as keyof typeof app] || '').join('\t'))
]

writeFileSync(resolve(DATA_DIR, 'Apps.tsv'), appsOutput.join('\n') + '\n')
console.log(`   ✓ Generated Apps.tsv with ${apps.length.toLocaleString()} apps\n`)

// 3. Generate App.Searches.tsv
console.log('3️⃣  Generating App.Searches.tsv...')
const searchMap = new Map<string, { name: string; apps: Set<string>; descriptions: Set<string> }>()

for (const app of zapierApps) {
  if (!app.searches || app.searches.length === 0) continue

  for (const search of app.searches) {
    const searchName = search.display_label || search.key
    const key = searchName.toLowerCase()

    if (!searchMap.has(key)) {
      searchMap.set(key, {
        name: searchName,
        apps: new Set(),
        descriptions: new Set(),
      })
    }

    const entry = searchMap.get(key)!
    entry.apps.add(app.key)
    if (search.description) entry.descriptions.add(search.description)
  }
}

const appSearches = Array.from(searchMap.entries()).map(([key, data]) => {
  const id = generateId(data.name, key)

  return {
    url: `https://zapier.com/Search/${id}`,
    ns: 'zapier.com.ai',
    type: 'Search',
    id,
    code: key.replace(/\s+/g, '_'),
    name: data.name,
    description: Array.from(data.descriptions)[0] || `Search operation for ${data.name}`,
    appCount: data.apps.size.toString(),
  }
})

const searchesHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'appCount']
const searchesOutput = [
  searchesHeaders.join('\t'),
  ...appSearches.map(search => searchesHeaders.map(h => search[h as keyof typeof search] || '').join('\t'))
]

writeFileSync(resolve(DATA_DIR, 'App.Searches.tsv'), searchesOutput.join('\n') + '\n')
console.log(`   ✓ Generated App.Searches.tsv with ${appSearches.length.toLocaleString()} searches\n`)

// Summary
console.log('='.repeat(60))
console.log('📊 Summary')
console.log('='.repeat(60))
console.log(`Apps: ${apps.length.toLocaleString()}`)
console.log(`Searches: ${appSearches.length.toLocaleString()}`)
console.log('='.repeat(60))
console.log('\n✅ Apps and Searches generation complete!')

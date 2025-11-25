#!/usr/bin/env tsx
/**
 * Generate Apps.tsv and App.Searches.tsv from Zapier API
 * Note: App.Nouns.tsv, App.Events.tsv, App.Actions.tsv are already generated
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import TurndownService from 'turndown'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = resolve(__dirname, '../.data')

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})

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

  // Common acronyms that should remain uppercase
  const acronyms = new Set([
    'API', 'SMS', 'MMS', 'URL', 'URI', 'HTTP', 'HTTPS', 'FTP', 'SFTP',
    'PDF', 'CSV', 'TSV', 'XML', 'JSON', 'HTML', 'CSS', 'SQL', 'NoSQL',
    'REST', 'SOAP', 'GraphQL', 'OAuth', 'JWT', 'SSO', 'SAML',
    'CRM', 'ERP', 'HRM', 'POS', 'CMS', 'LMS', 'ATS', 'HRIS',
    'RSS', 'ATOM', 'AJAX', 'CDN', 'DNS', 'VPN', 'IP', 'TCP', 'UDP',
    'UI', 'UX', 'CLI', 'GUI', 'IDE', 'SDK', 'APK', 'IPA',
    'ID', 'UUID', 'GUID', 'MD5', 'SHA', 'AES', 'RSA', 'SSL', 'TLS',
    'US', 'UK', 'EU', 'USA', 'ISO', 'ANSI', 'IEEE', 'IETF',
    'ASCII', 'UTF', 'MIME', 'JPEG', 'JPG', 'PNG', 'GIF', 'SVG',
    'AI', 'ML', 'NLP', 'OCR', 'QR', 'NFC', 'RFID', 'GPS', 'GIS',
    'SLA', 'KPI', 'ROI', 'B2B', 'B2C', 'SaaS', 'PaaS', 'IaaS',
    'AWS', 'GCP', 'IBM', 'VMware', 'VM', 'VPS', 'IoT', 'AR', 'VR'
  ])

  const cleaned = str
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned
    .split(/[\s_-]+/)
    .map(word => {
      const upper = word.toUpperCase()
      if (acronyms.has(upper)) {
        return upper
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join('')
}

function generateId(name: string, fallback?: string): string {
  const pascalName = toPascalCase(name)
  if (!pascalName || pascalName.length < 2) {
    return toPascalCase(name + (fallback || ''))
  }
  return pascalName
}

function replaceZapierReferences(text: string): string {
  if (!text) return ''

  // Replace all mentions of "Zapier" (case-insensitive) with ".do"
  return text.replace(/Zapier/gi, '.do')
}

function htmlToMarkdown(html: string | null | undefined): string {
  if (!html) return ''

  // Convert HTML to Markdown
  let markdown = turndownService.turndown(html)

  // Replace zapier.com URLs with integrations.org.ai
  // Pattern: https://zapier.com/apps/{app-slug}/integrations/{other-app-slug}
  markdown = markdown.replace(/https:\/\/zapier\.com\/apps\/([^\/\s)]+)(\/[^\s)]*)?/g, (match, appSlug) => {
    const appId = generateId(appSlug.replace(/-/g, ' '))
    return `https://integrations.org.ai/${appId}`
  })

  // Pattern: https://zapier.com/app/use-case/{slug}
  markdown = markdown.replace(/https:\/\/zapier\.com\/app\/use-case\/([^\s)]+)/g, (match, slug) => {
    return `https://integrations.org.ai/UseCase/${toPascalCase(slug.replace(/-/g, ' '))}`
  })

  // Replace any other zapier.com URLs
  markdown = markdown.replace(/https?:\/\/zapier\.com/g, 'https://integrations.org.ai')

  // Replace all mentions of "Zapier" with ".do"
  markdown = replaceZapierReferences(markdown)

  // Escape newlines for TSV format
  markdown = markdown.replace(/\n/g, '\\n')

  return markdown.trim()
}

function escapeTsvField(value: string): string {
  if (!value) return ''

  // First replace Zapier references
  let cleaned = replaceZapierReferences(value)

  // Then escape special characters for TSV format
  return cleaned
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/\n/g, '\\n')   // Escape newlines
    .replace(/\t/g, '\\t')   // Escape tabs
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
  const content = htmlToMarkdown(app.integration_overview_html)

  return {
    url: `https://integrations.org.ai/${id}`,
    ns: 'integrations.org.ai',
    type: 'App',
    id,
    code: app.slug,
    name: replaceZapierReferences(app.name),
    description: escapeTsvField(app.description || ''),
    content,
    category,
    categories,
    imageUrl: app.image || '',
    primaryColor: app.primary_color || '',
    appUrl: app.app_url || '',
  }
})

const appsHeaders = ['url', 'ns', 'type', 'id', 'code', 'name', 'description', 'content', 'category', 'categories', 'imageUrl', 'primaryColor', 'appUrl']
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
  const firstDescription = Array.from(data.descriptions)[0] || `Search operation for ${data.name}`

  return {
    url: `https://integrations.org.ai/Search/${id}`,
    ns: 'integrations.org.ai',
    type: 'Search',
    id,
    code: key.replace(/\s+/g, '_'),
    name: replaceZapierReferences(data.name),
    description: escapeTsvField(firstDescription),
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

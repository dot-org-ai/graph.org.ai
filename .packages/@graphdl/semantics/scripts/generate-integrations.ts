#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Parse Zapier integration data into semantic GraphDL format:
 * - Apps (Nouns)
 * - Triggers/Events (reads)
 * - Searches
 * - Actions (writes)
 */

function toPascalCase(text: string): string {
  const articles = new Set(['the', 'a', 'an'])
  const conjunctions = new Set(['and', 'or', 'but', 'nor', 'so', 'yet'])
  const prepositions = new Set(['in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by'])

  const tokens = text.split(/[\s\-\/,;:()]+/).filter(t => t.trim())

  const result = tokens
    .filter(t => {
      const lower = t.toLowerCase()
      return !articles.has(lower) && !conjunctions.has(lower) && !prepositions.has(lower)
    })
    .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join('')

  return result || text.replace(/\s+/g, '')
}

async function main() {
  console.log('='.repeat(100))
  console.log('INTEGRATIONS GENERATION')
  console.log('='.repeat(100))

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const integrationsDir = path.join(repoRoot, 'Integrations.org.ai')
  const dataDir = path.join(repoRoot, '.data')

  // Read apps.json
  console.log('\n📱 Processing Apps...')
  const appsData = JSON.parse(fs.readFileSync(path.join(integrationsDir, 'apps.json'), 'utf-8'))

  const apps: Array<{
    id: string
    name: string
    description: string
    slug: string
    category: string
  }> = []

  for (const app of appsData) {
    const id = toPascalCase(app.name)
    const category = app.categories && app.categories.length > 0 ? app.categories[0].title : ''

    apps.push({
      id,
      name: app.name,
      description: app.description || '',
      slug: app.slug,
      category
    })
  }

  apps.sort((a, b) => a.id.localeCompare(b.id))

  const appsPath = path.join(dataDir, 'Apps.tsv')
  const appsHeaders = ['id', 'name', 'description', 'slug', 'category']
  const appsRows = apps.map(a =>
    `${a.id}\t${a.name}\t${a.description}\t${a.slug}\t${a.category}`
  )

  fs.writeFileSync(appsPath, appsHeaders.join('\t') + '\n' + appsRows.join('\n'))
  console.log(`  ✓ Apps.tsv (${apps.length} apps)`)

  // Read services.json for triggers/searches/actions
  console.log('\n🔌 Processing Services (Triggers, Searches, Actions)...')
  const servicesData = JSON.parse(fs.readFileSync(path.join(integrationsDir, 'services.json'), 'utf-8'))

  const triggers: Array<{
    url: string
    ns: string
    type: string
    id: string
    name: string
    description: string
    code: string
    sourceUrl: string
    appSlug: string
    appName: string
    key: string
    isImportant: boolean
  }> = []

  const searches: Array<{
    url: string
    ns: string
    type: string
    id: string
    name: string
    description: string
    code: string
    sourceUrl: string
    appSlug: string
    appName: string
    key: string
    isImportant: boolean
  }> = []

  const actions: Array<{
    url: string
    ns: string
    type: string
    id: string
    name: string
    description: string
    code: string
    sourceUrl: string
    appSlug: string
    appName: string
    key: string
    isImportant: boolean
  }> = []

  for (const service of servicesData) {
    const appSlug = service.slug
    const appName = service.name

    // Process Triggers (reads)
    if (service.reads && Array.isArray(service.reads)) {
      for (const read of service.reads) {
        const id = toPascalCase(read.name)
        triggers.push({
          url: `https://triggers.org.ai/${id}`,
          ns: 'triggers.org.ai',
          type: 'Trigger',
          id,
          name: read.name,
          description: read.description || '',
          code: read.key !== id ? read.key : '',
          sourceUrl: '',
          appSlug,
          appName,
          key: read.key,
          isImportant: read.is_important || false
        })
      }
    }

    // Process Searches
    if (service.searches && Array.isArray(service.searches)) {
      for (const search of service.searches) {
        const id = toPascalCase(search.name)
        searches.push({
          url: `https://searches.org.ai/${id}`,
          ns: 'searches.org.ai',
          type: 'Search',
          id,
          name: search.name,
          description: search.description || '',
          code: search.key !== id ? search.key : '',
          sourceUrl: '',
          appSlug,
          appName,
          key: search.key,
          isImportant: search.is_important || false
        })
      }
    }

    // Process Actions (writes)
    if (service.writes && Array.isArray(service.writes)) {
      for (const write of service.writes) {
        const id = toPascalCase(write.name)
        actions.push({
          url: `https://actions.org.ai/${id}`,
          ns: 'actions.org.ai',
          type: 'Action',
          id,
          name: write.name,
          description: write.description || '',
          code: write.key !== id ? write.key : '',
          sourceUrl: '',
          appSlug,
          appName,
          key: write.key,
          isImportant: write.is_important || false
        })
      }
    }
  }

  // Sort and write Triggers
  triggers.sort((a, b) => a.id.localeCompare(b.id))
  const triggersPath = path.join(dataDir, 'Triggers.tsv')
  const triggersHeaders = ['url', 'ns', 'type', 'id', 'name', 'description', 'code', 'sourceUrl', 'appSlug', 'appName', 'key', 'isImportant']
  const triggersRows = triggers.map(t =>
    `${t.url}\t${t.ns}\t${t.type}\t${t.id}\t${t.name}\t${t.description}\t${t.code}\t${t.sourceUrl}\t${t.appSlug}\t${t.appName}\t${t.key}\t${t.isImportant}`
  )

  fs.writeFileSync(triggersPath, triggersHeaders.join('\t') + '\n' + triggersRows.join('\n'))
  console.log(`  ✓ Triggers.tsv (${triggers.length} triggers)`)

  // Sort and write Searches
  searches.sort((a, b) => a.id.localeCompare(b.id))
  const searchesPath = path.join(dataDir, 'Searches.tsv')
  const searchesHeaders = ['url', 'ns', 'type', 'id', 'name', 'description', 'code', 'sourceUrl', 'appSlug', 'appName', 'key', 'isImportant']
  const searchesRows = searches.map(s =>
    `${s.url}\t${s.ns}\t${s.type}\t${s.id}\t${s.name}\t${s.description}\t${s.code}\t${s.sourceUrl}\t${s.appSlug}\t${s.appName}\t${s.key}\t${s.isImportant}`
  )

  fs.writeFileSync(searchesPath, searchesHeaders.join('\t') + '\n' + searchesRows.join('\n'))
  console.log(`  ✓ Searches.tsv (${searches.length} searches)`)

  // Sort and write Actions
  actions.sort((a, b) => a.id.localeCompare(b.id))
  const actionsPath = path.join(dataDir, 'Actions.tsv')
  const actionsHeaders = ['url', 'ns', 'type', 'id', 'name', 'description', 'code', 'sourceUrl', 'appSlug', 'appName', 'key', 'isImportant']
  const actionsRows = actions.map(a =>
    `${a.url}\t${a.ns}\t${a.type}\t${a.id}\t${a.name}\t${a.description}\t${a.code}\t${a.sourceUrl}\t${a.appSlug}\t${a.appName}\t${a.key}\t${a.isImportant}`
  )

  fs.writeFileSync(actionsPath, actionsHeaders.join('\t') + '\n' + actionsRows.join('\n'))
  console.log(`  ✓ Actions.tsv (${actions.length} actions)`)

  console.log('\n' + '='.repeat(100))
  console.log('✅ Integrations files generated!')
  console.log('='.repeat(100))
}

main().catch(console.error)

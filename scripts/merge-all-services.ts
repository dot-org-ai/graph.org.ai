#!/usr/bin/env tsx
/**
 * Merge all services (NAPCS + UNSPSC + GPC) into unified Services.tsv
 *
 * This script:
 * 1. Reads Services-Expanded.tsv (NAPCS services with semantic parsing)
 * 2. Reads UNSPSC-Services.tsv (UNSPSC/GPC services)
 * 3. Normalizes schemas to common format
 * 4. Merges into unified Services.tsv
 */

import { readFileSync, writeFileSync } from 'fs'

interface UnifiedService {
  url: string
  ns: string
  type: string
  id: string
  code: string
  unspsc?: string
  gpc?: string
  napcs?: string
  name: string
  description: string
  source: string
  segment?: string
  segmentCode?: string
  family?: string
  familyCode?: string
  class?: string
  classCode?: string
  parent?: string
  hierarchy?: string
  originalUrl?: string
  activity?: string
  preposition?: string
  object?: string
  exclusion?: string
}

/**
 * Main execution
 */
function main() {
  console.log('🔗 MERGING ALL SERVICES\n')
  console.log('='.repeat(100) + '\n')

  // Read NAPCS services
  console.log('📖 Reading Services-Expanded.tsv (NAPCS)...')
  const napcsPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services-Expanded.tsv'
  const napcsContent = readFileSync(napcsPath, 'utf-8')
  const napcsLines = napcsContent.trim().split('\n')
  const napcsHeaders = napcsLines[0].split('\t')

  console.log(`  Headers: ${napcsHeaders.join(', ')}`)

  const napcsServices: UnifiedService[] = napcsLines.slice(1).map(line => {
    const fields = line.split('\t')
    return {
      url: fields[0] || '',
      ns: fields[1] || '',
      type: fields[2] || '',
      id: fields[3] || '',
      code: fields[4] || '',
      napcs: fields[4] || '',
      name: fields[5] || '',
      description: fields[6] || '',
      source: 'NAPCS',
      originalUrl: fields[7] || '',
      activity: fields[8] || undefined,
      preposition: fields[9] || undefined,
      object: fields[10] || undefined,
      exclusion: fields[11] || undefined
    }
  }).filter(s => s.name)

  console.log(`  Loaded ${napcsServices.length.toLocaleString()} NAPCS services\n`)

  // Read UNSPSC services
  console.log('📖 Reading UNSPSC-Services.tsv...')
  const unspscPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/UNSPSC-Services.tsv'
  const unspscContent = readFileSync(unspscPath, 'utf-8')
  const unspscLines = unspscContent.trim().split('\n')
  const unspscHeaders = unspscLines[0].split('\t')

  console.log(`  Headers: ${unspscHeaders.join(', ')}`)

  const unspscServices: UnifiedService[] = unspscLines.slice(1).map(line => {
    const fields = line.split('\t')
    return {
      url: fields[0] || '',
      ns: fields[1] || '',
      type: fields[2] || '',
      id: fields[3] || '',
      code: fields[4] || '',
      unspsc: fields[5] || fields[4] || '',
      gpc: fields[6] || '',
      napcs: fields[7] || '',
      name: fields[8] || '',
      description: fields[9] || '',
      source: fields[10] || 'UNSPSC',
      segment: fields[11] || '',
      segmentCode: fields[12] || '',
      family: fields[13] || '',
      familyCode: fields[14] || '',
      class: fields[15] || '',
      classCode: fields[16] || ''
    }
  }).filter(s => s.name)

  console.log(`  Loaded ${unspscServices.length.toLocaleString()} UNSPSC services\n`)

  // Merge services
  console.log('🔗 Merging services...')
  const allServices = [...napcsServices, ...unspscServices]

  console.log(`  Total: ${allServices.length.toLocaleString()} services\n`)

  // Statistics by source
  console.log('📊 STATISTICS\n')

  const bySource = new Map<string, number>()
  for (const service of allServices) {
    bySource.set(service.source, (bySource.get(service.source) || 0) + 1)
  }

  console.log('By Source:')
  for (const [source, count] of Array.from(bySource.entries()).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / allServices.length) * 100).toFixed(1)
    console.log(`  ${source}: ${count.toLocaleString()} (${pct}%)`)
  }

  // Statistics by namespace
  const byNamespace = new Map<string, number>()
  for (const service of allServices) {
    byNamespace.set(service.ns, (byNamespace.get(service.ns) || 0) + 1)
  }

  console.log('\nBy Namespace:')
  for (const [ns, count] of Array.from(byNamespace.entries()).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / allServices.length) * 100).toFixed(1)
    console.log(`  ${ns}: ${count.toLocaleString()} (${pct}%)`)
  }

  // Show examples from each source
  console.log('\n📋 EXAMPLE SERVICES\n')

  console.log('NAPCS Examples:')
  const napcsExamples = napcsServices.slice(0, 3)
  for (const service of napcsExamples) {
    console.log(`  "${service.name}"`)
    console.log(`    Code: ${service.napcs || service.code}`)
    if (service.activity || service.object) {
      console.log(`    Semantic: activity="${service.activity || ''}" object="${service.object || ''}"`)
    }
    console.log()
  }

  console.log('UNSPSC Examples:')
  const unspscExamples = unspscServices.slice(0, 3)
  for (const service of unspscExamples) {
    console.log(`  "${service.name}"`)
    console.log(`    Code: ${service.unspsc || service.code}`)
    console.log(`    Segment: ${service.segment || 'N/A'}`)
    console.log()
  }

  // Save unified Services.tsv
  console.log('💾 Saving unified Services.tsv...')
  const outputPath = '/Users/nathanclevenger/projects/graph.org.ai/.data/Services.tsv'

  // Determine headers (include all columns)
  const headers = [
    'url',
    'ns',
    'type',
    'id',
    'code',
    'unspsc',
    'gpc',
    'napcs',
    'name',
    'description',
    'source',
    'segment',
    'segmentCode',
    'family',
    'familyCode',
    'class',
    'classCode',
    'parent',
    'hierarchy',
    'originalUrl',
    'activity',
    'preposition',
    'object',
    'exclusion'
  ]

  const outputLines = [headers.join('\t')]

  for (const service of allServices) {
    const fields = [
      service.url,
      service.ns,
      service.type,
      service.id,
      service.code,
      service.unspsc || '',
      service.gpc || '',
      service.napcs || '',
      service.name,
      service.description,
      service.source,
      service.segment || '',
      service.segmentCode || '',
      service.family || '',
      service.familyCode || '',
      service.class || '',
      service.classCode || '',
      service.parent || '',
      service.hierarchy || '',
      service.originalUrl || '',
      service.activity || '',
      service.preposition || '',
      service.object || '',
      service.exclusion || ''
    ]
    outputLines.push(fields.join('\t'))
  }

  writeFileSync(outputPath, outputLines.join('\n'))
  console.log(`  Saved ${allServices.length.toLocaleString()} services to: ${outputPath}\n`)

  console.log('✅ MERGE COMPLETE\n')
  console.log(`Total services: ${allServices.length.toLocaleString()}`)
  console.log(`  NAPCS: ${napcsServices.length.toLocaleString()}`)
  console.log(`  UNSPSC: ${unspscServices.length.toLocaleString()}\n`)
}

main()

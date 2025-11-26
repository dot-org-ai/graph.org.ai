#!/usr/bin/env tsx
/**
 * Analyze uncategorized NAPCS services (those not in product lifecycle)
 * to understand what types of pure services exist
 */

import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_DEFAULT_PASSWORD,
  database: process.env.CLICKHOUSE_DATABASE || 'platform',
  request_timeout: 600000,
})

console.log('🔍 ANALYZING UNCATEGORIZED SERVICES\n')
console.log('=' .repeat(100) + '\n')

// Get all services
const result = await client.query({
  query: `
    SELECT
      JSONExtractString(toString(data), 'originalName') as originalName
    FROM Things FINAL
    WHERE ns = 'products.org.ai'
      AND JSONExtractString(toString(data), 'source') = 'NAPCS'
    ORDER BY originalName
  `,
  format: 'JSONEachRow',
})

const services = await result.json() as Array<{ originalName: string }>

// Product lifecycle keywords to filter out
const lifecycleKeywords = [
  'manufacturing', 'fabrication', 'assembly', 'production', 'processing', 'refining',
  'farming', 'mining', 'harvesting', 'extraction', 'custom manufacturing',
  'wholesale', 'retail', 'transportation', 'shipping', 'freight', 'logistics',
  'warehousing', 'distribution', 'delivery',
  'installation', 'setup', 'training', 'technical support',
  'maintenance', 'repair', 'refurbishment', 'upgrade', 'servicing', 'calibration',
  'cleaning', 'inspection',
  'recycling', 'disposal', 'waste', 'decommissioning', 'salvage', 'reclamation'
]

// Pure service categories
const pureServiceCategories = [
  {
    name: 'Financial Services',
    keywords: ['banking', 'insurance', 'investment', 'lending', 'credit', 'financial', 'securities', 'fund', 'portfolio', 'mortgage', 'pension', 'annuit', 'premium', 'underwriting'],
  },
  {
    name: 'Professional Services',
    keywords: ['legal', 'accounting', 'audit', 'tax preparation', 'bookkeeping', 'payroll', 'consulting', 'advisory', 'actuarial', 'notary'],
  },
  {
    name: 'Information/Telecom',
    keywords: ['telecommunications', 'telephone', 'internet', 'broadcasting', 'cable', 'satellite', 'data processing', 'hosting', 'streaming', 'wireless', 'cellular', 'telecom'],
  },
  {
    name: 'Real Estate',
    keywords: ['real estate', 'property management', 'leasing', 'rental', 'condominium', 'appraisal', 'title', 'escrow', 'brokerage'],
  },
  {
    name: 'Healthcare',
    keywords: ['hospital', 'medical', 'health', 'physician', 'dental', 'nursing', 'ambulance', 'laboratory', 'diagnostic', 'therapy', 'patient', 'clinical', 'veterinary'],
  },
  {
    name: 'Education',
    keywords: ['education', 'school', 'university', 'tutoring', 'instruction', 'training', 'teaching', 'academic', 'learning'],
  },
  {
    name: 'Entertainment/Arts',
    keywords: ['entertainment', 'recreation', 'tourism', 'travel', 'hotel', 'restaurant', 'gambling', 'casino', 'sports', 'fitness', 'gym', 'museum', 'theatre', 'performing arts', 'amusement'],
  },
  {
    name: 'Personal Services',
    keywords: ['beauty', 'hair', 'nail', 'spa', 'salon', 'childcare', 'day care', 'babysitting', 'laundry', 'dry-cleaning', 'funeral', 'dating', 'matchmaking', 'wedding'],
  },
  {
    name: 'Government/Public',
    keywords: ['government', 'public administration', 'regulatory', 'defence', 'military', 'police', 'fire', 'emergency', 'postal', 'immigration', 'customs', 'court', 'judicial'],
  },
  {
    name: 'Advertising/Marketing',
    keywords: ['advertising', 'marketing', 'promotion', 'public relations', 'media buying', 'sponsorship'],
  },
  {
    name: 'R&D/Scientific',
    keywords: ['research', 'development', 'experimental', 'scientific', 'testing', 'laboratory'],
  },
  {
    name: 'Other Business Services',
    keywords: ['employment', 'staffing', 'recruitment', 'security', 'investigation', 'collection agency', 'credit bureau', 'photography', 'translation', 'interpretation'],
  },
]

// Filter to uncategorized services
const uncategorized: string[] = []
for (const service of services) {
  const name = service.originalName.toLowerCase()
  let isLifecycle = false

  for (const keyword of lifecycleKeywords) {
    if (name.includes(keyword.toLowerCase())) {
      isLifecycle = true
      break
    }
  }

  if (!isLifecycle) {
    uncategorized.push(service.originalName)
  }
}

console.log(`Total uncategorized: ${uncategorized.length.toLocaleString()}\n`)

// Categorize uncategorized services
const categorized = new Map<string, string[]>()
const stillUncategorized: string[] = []

for (const category of pureServiceCategories) {
  categorized.set(category.name, [])
}

for (const service of uncategorized) {
  const name = service.toLowerCase()
  let matched = false

  for (const category of pureServiceCategories) {
    for (const keyword of category.keywords) {
      if (name.includes(keyword.toLowerCase())) {
        categorized.get(category.name)!.push(service)
        matched = true
        break
      }
    }
    if (matched) break
  }

  if (!matched) {
    stillUncategorized.push(service)
  }
}

// Report
console.log('📊 PURE SERVICE CATEGORIES\n')
console.log('=' .repeat(100) + '\n')

for (const [category, categoryServices] of categorized.entries()) {
  if (categoryServices.length > 0) {
    console.log(`\n## ${category.toUpperCase()} (${categoryServices.length} services)\n`)

    // Show first 10 examples
    for (const service of categoryServices.slice(0, 10)) {
      console.log(`  - ${service}`)
    }

    if (categoryServices.length > 10) {
      console.log(`  ... and ${categoryServices.length - 10} more`)
    }

    console.log('\n' + '-'.repeat(100))
  }
}

console.log(`\n\n## STILL UNCATEGORIZED (${stillUncategorized.length} services)\n`)
console.log('First 30 examples:\n')
for (const service of stillUncategorized.slice(0, 30)) {
  console.log(`  - ${service}`)
}

// Summary
console.log('\n\n📈 SUMMARY\n')
console.log('=' .repeat(100) + '\n')

let totalCategorized = 0
for (const [category, categoryServices] of categorized.entries()) {
  if (categoryServices.length > 0) {
    console.log(`${category.padEnd(30)} ${categoryServices.length.toString().padStart(5)} services`)
    totalCategorized += categoryServices.length
  }
}
console.log(`${'Still uncategorized'.padEnd(30)} ${stillUncategorized.length.toString().padStart(5)} services`)
console.log(`${'TOTAL'.padEnd(30)} ${uncategorized.length.toString().padStart(5)} services`)

console.log(`\nCategorization rate: ${Math.round(totalCategorized / uncategorized.length * 100)}%`)

await client.close()

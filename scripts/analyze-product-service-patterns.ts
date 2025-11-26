#!/usr/bin/env tsx
/**
 * Analyze NAPCS services to identify product-service lifecycle patterns
 *
 * Goal: Extract relationships like:
 * - "Maintenance and repair services for X" → Product category X
 * - "Manufacturing services for X" → Product category X
 * - "Transportation of X" → Product category X
 */

import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_DEFAULT_PASSWORD,
  database: process.env.CLICKHOUSE_DATABASE || 'platform',
  request_timeout: 600000,
})

console.log('🔍 ANALYZING PRODUCT-SERVICE LIFECYCLE PATTERNS\n')
console.log('=' .repeat(100) + '\n')

// Lifecycle stage patterns to search for
const lifecyclePatterns = [
  {
    stage: 'Production',
    keywords: ['manufacturing', 'fabrication', 'assembly', 'production', 'processing', 'refining', 'farming', 'mining', 'harvesting', 'extraction', 'custom manufacturing'],
  },
  {
    stage: 'Distribution',
    keywords: ['wholesale', 'retail', 'transportation', 'shipping', 'freight', 'logistics', 'warehousing', 'distribution', 'delivery'],
  },
  {
    stage: 'Consumption',
    keywords: ['installation', 'setup', 'training', 'consulting', 'support', 'technical support'],
  },
  {
    stage: 'Maintenance',
    keywords: ['maintenance', 'repair', 'refurbishment', 'upgrade', 'servicing', 'calibration', 'cleaning', 'inspection'],
  },
  {
    stage: 'End-of-Life',
    keywords: ['recycling', 'disposal', 'waste', 'decommissioning', 'salvage', 'reclamation'],
  },
]

// Pattern: "services for [product]"
const servicesForPattern = /services? (?:for|of|to) ([a-z ]+?)(?:\s+\(|$|;|,| and | or )/i

// Get all NAPCS services
const result = await client.query({
  query: `
    SELECT
      id,
      JSONExtractString(toString(data), 'originalName') as originalName,
      JSONExtractString(toString(data), 'description') as description,
      JSONExtractString(toString(data), 'napcs') as napcs
    FROM Things FINAL
    WHERE ns = 'products.org.ai'
      AND JSONExtractString(toString(data), 'source') = 'NAPCS'
    ORDER BY id
  `,
  format: 'JSONEachRow',
})

const services = await result.json() as Array<{
  id: string
  originalName: string
  description: string
  napcs: string
}>

console.log(`Found ${services.length.toLocaleString()} NAPCS services\n`)

// Categorize services by lifecycle stage
const servicesByStage = new Map<string, Array<{ id: string, originalName: string, napcs: string, productRef?: string }>>()

for (const pattern of lifecyclePatterns) {
  servicesByStage.set(pattern.stage, [])
}

for (const service of services) {
  const name = service.originalName.toLowerCase()

  // Check which lifecycle stage this service belongs to
  for (const pattern of lifecyclePatterns) {
    for (const keyword of pattern.keywords) {
      if (name.includes(keyword.toLowerCase())) {
        // Try to extract product reference
        let productRef: string | undefined

        // Pattern 1: "services for X"
        const forMatch = name.match(servicesForPattern)
        if (forMatch) {
          productRef = forMatch[1].trim()
        }

        // Pattern 2: "X maintenance" or "X repair"
        const maintenanceMatch = name.match(/^([a-z ]+?)\s+(maintenance|repair|servicing|cleaning)/i)
        if (maintenanceMatch && !productRef) {
          productRef = maintenanceMatch[1].trim()
        }

        // Pattern 3: "transportation of X"
        const transportMatch = name.match(/(transportation|shipping|freight|delivery) of ([a-z ]+?)(?:\s+\(|$|;|,| and | or | by )/i)
        if (transportMatch && !productRef) {
          productRef = transportMatch[2].trim()
        }

        servicesByStage.get(pattern.stage)!.push({
          id: service.id,
          originalName: service.originalName,
          napcs: service.napcs,
          productRef,
        })

        break // Only assign to first matching stage
      }
    }
  }
}

// Report findings
console.log('📊 SERVICES BY LIFECYCLE STAGE\n')
console.log('=' .repeat(100) + '\n')

for (const [stage, stageServices] of servicesByStage.entries()) {
  console.log(`\n## ${stage.toUpperCase()} (${stageServices.length} services)\n`)

  // Group by whether they have product references
  const withRefs = stageServices.filter(s => s.productRef)
  const withoutRefs = stageServices.filter(s => !s.productRef)

  console.log(`Services with product references: ${withRefs.length}`)
  console.log(`Services without product references: ${withoutRefs.length}\n`)

  // Show first 10 examples with product references
  if (withRefs.length > 0) {
    console.log('Examples with product references:\n')
    for (const service of withRefs.slice(0, 10)) {
      console.log(`  - ${service.originalName}`)
      console.log(`    → Product: "${service.productRef}"`)
      console.log(`    → NAPCS: ${service.napcs}\n`)
    }
  }

  // Show first 5 examples without product references
  if (withoutRefs.length > 0 && withoutRefs.length <= 20) {
    console.log('Examples without product references:\n')
    for (const service of withoutRefs.slice(0, 5)) {
      console.log(`  - ${service.originalName}`)
      console.log(`    → NAPCS: ${service.napcs}\n`)
    }
  }

  console.log('-'.repeat(100))
}

// Summary statistics
console.log('\n\n📈 SUMMARY STATISTICS\n')
console.log('=' .repeat(100) + '\n')

let totalCategorized = 0
let totalWithProductRefs = 0

for (const [stage, stageServices] of servicesByStage.entries()) {
  const withRefs = stageServices.filter(s => s.productRef).length
  totalCategorized += stageServices.length
  totalWithProductRefs += withRefs

  console.log(`${stage.padEnd(20)} ${stageServices.length.toString().padStart(5)} services (${withRefs} with product refs)`)
}

const uncategorized = services.length - totalCategorized
console.log(`${'Uncategorized'.padEnd(20)} ${uncategorized.toString().padStart(5)} services`)
console.log(`${'TOTAL'.padEnd(20)} ${services.length.toString().padStart(5)} services`)

console.log(`\nProduct reference extraction rate: ${Math.round(totalWithProductRefs / totalCategorized * 100)}%`)

await client.close()

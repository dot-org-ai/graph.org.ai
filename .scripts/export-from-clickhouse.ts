#!/usr/bin/env tsx

/**
 * Export ClickHouse data to .data/ TSV files
 *
 * Generates denormalized TSV files for each type in the things table
 */

import { createClient } from '@clickhouse/client'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')

// Load environment variables
config()

const client = createClient({
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  database: process.env.CLICKHOUSE_DATABASE || 'default',
})

interface ExportConfig {
  type: string
  filename: string
  columns: string[]
  transform?: (row: any) => any
}

const EXPORT_CONFIGS: ExportConfig[] = [
  {
    type: 'Occupation',
    filename: 'Occupations.tsv',
    columns: ['code', 'name', 'ns', 'url'],
  },
  {
    type: 'Process',
    filename: 'Processes.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.category', 'data.level', 'data.digital'],
  },
  {
    type: 'Commodity',
    filename: 'Commodities.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.segment', 'data.family', 'data.class'],
  },
  {
    type: 'Class',
    filename: 'Classes.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.segment', 'data.family'],
  },
  {
    type: 'Family',
    filename: 'Families.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.segment'],
  },
  {
    type: 'Segment',
    filename: 'Segments.tsv',
    columns: ['code', 'name', 'ns', 'url'],
  },
  {
    type: 'Type',
    filename: 'Types.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.comment'],
  },
  {
    type: 'Property',
    filename: 'Properties.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.comment', 'data.domainIncludes', 'data.rangeIncludes'],
  },
  {
    type: 'Skill',
    filename: 'Skills.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.elementId', 'data.description'],
  },
  {
    type: 'Knowledge',
    filename: 'Knowledge.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.elementId', 'data.description'],
  },
  {
    type: 'Ability',
    filename: 'Abilities.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.elementId', 'data.description'],
  },
  {
    type: 'WorkActivity',
    filename: 'WorkActivities.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.elementId', 'data.description'],
  },
  {
    type: 'WorkContext',
    filename: 'WorkContexts.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.elementId', 'data.category'],
  },
  {
    type: 'WorkStyle',
    filename: 'WorkStyles.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.elementId', 'data.description'],
  },
  {
    type: 'WorkValue',
    filename: 'WorkValues.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.elementId', 'data.description'],
  },
  {
    type: 'Interest',
    filename: 'Interests.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.elementId'],
  },
  {
    type: 'Tool',
    filename: 'Tools.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.commodityCode', 'data.hotTechnology'],
  },
  {
    type: 'Technology',
    filename: 'Technologies.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.commodityCode', 'data.example'],
  },
  {
    type: 'LLM',
    filename: 'LLMs.tsv',
    columns: ['code', 'name', 'ns', 'url', 'data.contextLength', 'data.organization'],
  },
]

/**
 * Export a single type to TSV
 */
async function exportType(config: ExportConfig): Promise<void> {
  const { type, filename, columns } = config

  console.log(`\n📦 Exporting ${type} to ${filename}...`)

  // Build SELECT clause with proper JSON field extraction
  const selectClauses = columns.map(col => {
    if (col.startsWith('data.')) {
      const field = col.substring(5)
      return `data.${field} AS ${field}`
    }
    return col
  })

  const query = `
    SELECT DISTINCT ${selectClauses.join(', ')}
    FROM things
    WHERE type = '${type}'
    ORDER BY code
  `

  try {
    const result = await client.query({ query, format: 'TSVWithNames' })
    const data = await result.text()

    // Write to file
    const outputPath = join(PROJECT_ROOT, '.data', filename)
    writeFileSync(outputPath, data)

    // Count rows (subtract 1 for header)
    const rowCount = data.split('\n').filter(line => line.trim()).length - 1
    console.log(`  ✅ Exported ${rowCount.toLocaleString()} ${type} records`)
  } catch (error: any) {
    console.error(`  ❌ Failed to export ${type}:`, error.message)
  }
}

/**
 * Export all types
 */
async function main() {
  console.log('='.repeat(80))
  console.log('ClickHouse to TSV Export')
  console.log('='.repeat(80))

  // Ensure .data directory exists
  mkdirSync(join(PROJECT_ROOT, '.data'), { recursive: true })

  // Export each type
  for (const config of EXPORT_CONFIGS) {
    await exportType(config)
  }

  console.log('\n✅ Export complete!')
  console.log(`\n📊 Generated ${EXPORT_CONFIGS.length} TSV files in .data/`)

  await client.close()
}

main().catch(console.error)

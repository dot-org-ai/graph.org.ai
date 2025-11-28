#!/usr/bin/env tsx

/**
 * Complete build pipeline for the knowledge graph
 *
 * This script orchestrates the full build process:
 * 1. Ingest raw data from external sources to .source/
 * 2. Generate normalized TSV files in .data/ (includes digital score enrichment)
 * 3. Build normalized things.db (SQLite)
 * 4. Build normalized things in ClickHouse
 *
 * Note: Embeddings are generated separately with generate-embeddings.ts
 *
 * Usage:
 *   tsx .scripts/build-all.ts [--skip-ingest] [--skip-generate] [--skip-sqlite] [--skip-clickhouse]
 */

import { execSync } from 'child_process'

interface BuildOptions {
  skipIngest: boolean
  skipGenerate: boolean
  skipSqlite: boolean
  skipClickhouse: boolean
}

function parseArgs(): BuildOptions {
  const args = process.argv.slice(2)
  return {
    skipIngest: args.includes('--skip-ingest'),
    skipGenerate: args.includes('--skip-generate'),
    skipSqlite: args.includes('--skip-sqlite'),
    skipClickhouse: args.includes('--skip-clickhouse'),
  }
}

function run(command: string, description: string) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`📦 ${description}`)
  console.log(`${'='.repeat(80)}\n`)

  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`\n✅ ${description} complete!`)
  } catch (error) {
    console.error(`\n❌ ${description} failed!`)
    throw error
  }
}

async function main() {
  const options = parseArgs()
  const startTime = Date.now()

  console.log('🚀 Starting complete knowledge graph build...\n')
  console.log('Options:')
  console.log(`  Skip ingest: ${options.skipIngest}`)
  console.log(`  Skip generate: ${options.skipGenerate}`)
  console.log(`  Skip SQLite: ${options.skipSqlite}`)
  console.log(`  Skip ClickHouse: ${options.skipClickhouse}`)

  try {
    // Step 1: Ingest source data
    if (!options.skipIngest) {
      run(
        'tsx .scripts/ingest.ts',
        'Step 1/4: Ingesting source data to .source/'
      )
    } else {
      console.log('\n⏭️  Skipping source data ingestion')
    }

    // Step 2: Generate normalized data (includes digital score enrichment)
    if (!options.skipGenerate) {
      run(
        'tsx .scripts/generate-data.ts',
        'Step 2/4: Generating normalized data in .data/ (with digital scores)'
      )
    } else {
      console.log('\n⏭️  Skipping data generation')
    }

    // Step 3: Build SQLite things.db
    if (!options.skipSqlite) {
      run(
        'tsx .scripts/build-things-db.ts sqlite',
        'Step 3/4: Building normalized things.db (SQLite)'
      )
    } else {
      console.log('\n⏭️  Skipping SQLite build')
    }

    // Step 4: Build ClickHouse
    if (!options.skipClickhouse) {
      run(
        'tsx .scripts/build-things-db.ts clickhouse',
        'Step 4/4: Building normalized things in ClickHouse'
      )
    } else {
      console.log('\n⏭️  Skipping ClickHouse build')
    }

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2)

    console.log('\n' + '='.repeat(80))
    console.log('✅ Complete knowledge graph build finished!')
    console.log(`⏱️  Total time: ${duration} minutes`)
    console.log('='.repeat(80))
    console.log('\nNext steps:')
    console.log('  - Generate embeddings: tsx .scripts/generate-embeddings.ts [sqlite|clickhouse]')
    console.log('  - Verify data: tsx .scripts/verify-clickhouse.ts')
    console.log('='.repeat(80))

  } catch (error) {
    console.error('\n❌ Build pipeline failed!')
    process.exit(1)
  }
}

main()

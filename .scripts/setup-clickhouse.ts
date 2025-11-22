#!/usr/bin/env tsx

/**
 * Setup ClickHouse schema for mdxdb
 *
 * Creates tables with JSON fields and vector similarity indexes
 */

import { getClickHouseClient, closeClickHouseClient, isClickHouseAvailable } from '../.mdxdb/clickhouse-client.js'

async function setup() {
  console.log('🚀 Setting up ClickHouse schema...\n')

  // Check if ClickHouse is available
  const available = await isClickHouseAvailable()
  if (!available) {
    console.error('❌ ClickHouse is not available')
    console.error('   Please ensure ClickHouse is running and check your connection settings')
    process.exit(1)
  }

  console.log('✅ ClickHouse is available\n')

  const client = getClickHouseClient()

  try {
    // Create database if it doesn't exist
    console.log('📦 Creating database...')
    await client.command({
      query: 'CREATE DATABASE IF NOT EXISTS mdxdb',
    })
    console.log('✅ Database created\n')

    // Create things table with JSON field
    console.log('📊 Creating things table...')

    // Drop if exists to allow clean rebuild
    await client.command({ query: 'DROP TABLE IF EXISTS mdxdb.things' })

    await client.command({
      query: `
        CREATE TABLE mdxdb.things
        (
          url String,
          ns String,
          type String,
          id String,
          data JSON,
          code String,
          content String,
          meta JSON,
          created_at DateTime DEFAULT now(),
          updated_at DateTime DEFAULT now()
        )
        ENGINE = MergeTree()
        ORDER BY (ns, type, url)
        SETTINGS index_granularity = 8192
      `,
    })
    console.log('✅ Things table created\n')

    // Create relationships table
    console.log('🔗 Creating relationships table...')

    // Drop if exists to allow clean rebuild
    await client.command({ query: 'DROP TABLE IF EXISTS mdxdb.relationships' })

    await client.command({
      query: `
        CREATE TABLE mdxdb.relationships
        (
          from String,
          predicate String,
          reverse String,
          to String,
          meta JSON,
          created_at DateTime DEFAULT now()
        )
        ENGINE = MergeTree()
        ORDER BY (from, predicate, to)
        SETTINGS index_granularity = 8192
      `,
    })
    console.log('✅ Relationships table created\n')

    // Create searches table with vector similarity index
    console.log('🔍 Creating searches table with vector index...')

    // Drop if exists to allow clean rebuild
    await client.command({ query: 'DROP TABLE IF EXISTS mdxdb.searches' })

    await client.command({
      query: `
        CREATE TABLE mdxdb.searches
        (
          url String,
          text String,
          embedding Array(Float32),
          meta JSON,
          created_at DateTime DEFAULT now()
        )
        ENGINE = MergeTree()
        ORDER BY url
        SETTINGS index_granularity = 8192
      `,
    })
    console.log('✅ Searches table created\n')

    // Create vector similarity index using HNSW (Hierarchical Navigable Small World)
    console.log('📐 Creating vector similarity index...')
    await client.command({
      query: `
        ALTER TABLE mdxdb.searches
        ADD INDEX embedding_hnsw embedding
        TYPE vector_similarity('hnsw', 'cosineDistance')
        GRANULARITY 1000
      `,
    }).catch((err) => {
      // Index might already exist
      if (!err.message.includes('already exists')) {
        throw err
      }
      console.log('   Index already exists, skipping...')
    })
    console.log('✅ Vector similarity index created\n')

    // Create materialized view for fast type lookups
    console.log('📊 Creating materialized views...')
    await client.command({
      query: `
        CREATE MATERIALIZED VIEW IF NOT EXISTS mdxdb.things_by_type
        ENGINE = SummingMergeTree()
        ORDER BY (type, ns)
        AS SELECT
          type,
          ns,
          count() as count
        FROM mdxdb.things
        GROUP BY type, ns
      `,
    })
    console.log('✅ Materialized views created\n')

    console.log('=' .repeat(80))
    console.log('\n✅ ClickHouse schema setup complete!')
    console.log('\nTables created:')
    console.log('  - mdxdb.things (with JSON data field)')
    console.log('  - mdxdb.relationships (with JSON meta field)')
    console.log('  - mdxdb.searches (with vector similarity index)')
    console.log('  - mdxdb.things_by_type (materialized view)')
    console.log('\n' + '='.repeat(80))

  } catch (error) {
    console.error('\n❌ Error setting up ClickHouse schema:', error)
    throw error
  } finally {
    await closeClickHouseClient()
  }
}

setup()

#!/usr/bin/env tsx

/**
 * Query ClickHouse CLI
 *
 * Simple CLI for running SQL queries against ClickHouse
 *
 * Usage:
 *   tsx .scripts/query-clickhouse.ts "SELECT COUNT(*) FROM things"
 *   tsx .scripts/query-clickhouse.ts --file queries/occupation-scores.sql
 *   tsx .scripts/query-clickhouse.ts --interactive
 */

import { createClient } from '@clickhouse/client'
import { readFileSync } from 'fs'
import { config } from 'dotenv'
import * as readline from 'readline'

// Load environment variables
config()

const client = createClient({
  host: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  database: process.env.CLICKHOUSE_DATABASE || 'default',
})

async function runQuery(query: string, format: string = 'PrettyCompact') {
  try {
    const result = await client.query({
      query,
      format,
    })

    const data = await result.text()
    console.log(data)
  } catch (error: any) {
    console.error('Query error:', error.message)
    process.exit(1)
  }
}

async function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'clickhouse> ',
  })

  console.log('ClickHouse Interactive Query CLI')
  console.log('Type your SQL queries and press Enter')
  console.log('Type .exit or Ctrl+C to quit\n')

  rl.prompt()

  rl.on('line', async (line: string) => {
    const query = line.trim()

    if (query === '.exit' || query === 'exit' || query === 'quit') {
      console.log('Goodbye!')
      rl.close()
      process.exit(0)
    }

    if (query === '') {
      rl.prompt()
      return
    }

    if (query === '.help') {
      console.log('\nCommands:')
      console.log('  .exit, exit, quit - Exit interactive mode')
      console.log('  .help             - Show this help\n')
      rl.prompt()
      return
    }

    try {
      await runQuery(query)
    } catch (error: any) {
      console.error('Error:', error.message)
    }

    console.log('')
    rl.prompt()
  }).on('close', () => {
    console.log('\nGoodbye!')
    process.exit(0)
  })
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Usage:')
    console.error('  tsx .scripts/query-clickhouse.ts "SELECT COUNT(*) FROM things"')
    console.error('  tsx .scripts/query-clickhouse.ts --file queries/occupation-scores.sql')
    console.error('  tsx .scripts/query-clickhouse.ts --interactive')
    process.exit(1)
  }

  if (args[0] === '--interactive' || args[0] === '-i') {
    await interactiveMode()
    return
  }

  if (args[0] === '--file' || args[0] === '-f') {
    if (!args[1]) {
      console.error('Error: --file requires a filename')
      process.exit(1)
    }

    const query = readFileSync(args[1], 'utf-8')
    await runQuery(query)
    await client.close()
    return
  }

  // Direct query from command line
  const query = args.join(' ')
  await runQuery(query)
  await client.close()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

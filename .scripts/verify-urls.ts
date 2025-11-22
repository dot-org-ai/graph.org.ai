#!/usr/bin/env tsx

import { getClickHouseClient } from '../.mdxdb/clickhouse-client.js'

const client = getClickHouseClient()

async function verifyURLs() {
  console.log('🔍 Verifying URL formats...\n')

  // Check Occupations
  const occupations = await client.query({
    query: "SELECT url, type, id FROM default.things WHERE type = 'Occupation' LIMIT 3",
    format: 'JSONEachRow',
  })

  const occData = await occupations.json()
  console.log('📋 Sample Occupation URLs:')
  occData.forEach((row: any) => {
    console.log(`  ${row.url} (id: ${row.id})`)
  })

  // Check Schema.org Types
  const types = await client.query({
    query: "SELECT url, type, id FROM default.things WHERE type = 'Type' LIMIT 3",
    format: 'JSONEachRow',
  })

  const typeData = await types.json()
  console.log('\n📋 Sample Schema.org Type URLs:')
  typeData.forEach((row: any) => {
    console.log(`  ${row.url} (id: ${row.id})`)
  })

  // Check Skills
  const skills = await client.query({
    query: "SELECT url, type, id FROM default.things WHERE type = 'Skill' LIMIT 3",
    format: 'JSONEachRow',
  })

  const skillData = await skills.json()
  console.log('\n📋 Sample Skill URLs:')
  skillData.forEach((row: any) => {
    console.log(`  ${row.url} (id: ${row.id})`)
  })

  // Check relationships
  const rels = await client.query({
    query: 'SELECT from, predicate, reverse, to FROM default.relationships LIMIT 3',
    format: 'JSONEachRow',
  })

  const relData = await rels.json()
  console.log('\n🔗 Sample Relationships:')
  relData.forEach((row: any) => {
    console.log(`  ${row.from} --[${row.predicate}]--> ${row.to}`)
    console.log(`    (reverse: ${row.reverse})`)
  })

  await client.close()
}

verifyURLs()

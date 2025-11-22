#!/usr/bin/env tsx

/**
 * Validate things.db against Zod schemas
 *
 * This script validates all things in the database against their
 * corresponding Zod schemas to ensure data quality and consistency.
 */

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../.mdxdb/schema.js'
import { validateThingData, getSchemaForThing } from '../.mdxdb/schemas.js'

const db = new Database('.mdxdb/things.db', { readonly: true })
const things = drizzle(db, { schema })

interface ValidationResult {
  ns: string
  type: string
  total: number
  valid: number
  invalid: number
  errors: Array<{
    id: string
    url: string
    error: string
  }>
}

async function validateAll() {
  console.log('🔍 Validating things.db...\n')

  // Get all unique ns/type combinations
  const nsTypes = db.prepare(`
    SELECT DISTINCT ns, type, COUNT(*) as count
    FROM things
    GROUP BY ns, type
    ORDER BY ns, type
  `).all() as Array<{ ns: string; type: string; count: number }>

  const results: ValidationResult[] = []

  for (const { ns, type, count } of nsTypes) {
    console.log(`📦 Validating ${ns}/${type} (${count} things)...`)

    const result: ValidationResult = {
      ns,
      type,
      total: count,
      valid: 0,
      invalid: 0,
      errors: [],
    }

    // Check if schema exists
    const hasSchema = getSchemaForThing(ns, type) !== null

    if (!hasSchema) {
      console.log(`   ⚠️  No schema defined for ${ns}/${type}`)
      results.push(result)
      continue
    }

    // Validate each thing
    const allThings = db.prepare(`
      SELECT id, url, data
      FROM things
      WHERE ns = ? AND type = ?
    `).all(ns, type) as Array<{ id: string; url: string; data: string }>

    for (const thing of allThings) {
      const data = JSON.parse(thing.data)
      const validation = validateThingData(ns, type, data)

      if (validation.success) {
        result.valid++
      } else {
        result.invalid++

        // Store first 10 errors
        if (result.errors.length < 10 && validation.errors) {
          result.errors.push({
            id: thing.id,
            url: thing.url,
            error: validation.errors.errors.map(e =>
              `${e.path.join('.')}: ${e.message}`
            ).join(', '),
          })
        }
      }
    }

    console.log(`   ✅ Valid: ${result.valid}/${result.total}`)
    if (result.invalid > 0) {
      console.log(`   ❌ Invalid: ${result.invalid}`)
      console.log(`   Sample errors:`)
      result.errors.slice(0, 3).forEach(err => {
        console.log(`      ${err.id}: ${err.error}`)
      })
    }

    results.push(result)
  }

  // Summary
  console.log('\n📊 Validation Summary:\n')

  const totalThings = results.reduce((sum, r) => sum + r.total, 0)
  const totalValid = results.reduce((sum, r) => sum + r.valid, 0)
  const totalInvalid = results.reduce((sum, r) => sum + r.invalid, 0)
  const withSchemas = results.filter(r => getSchemaForThing(r.ns, r.type) !== null)
  const withoutSchemas = results.filter(r => getSchemaForThing(r.ns, r.type) === null)

  console.log(`Total things: ${totalThings.toLocaleString()}`)
  console.log(`Valid: ${totalValid.toLocaleString()} (${((totalValid / totalThings) * 100).toFixed(1)}%)`)
  console.log(`Invalid: ${totalInvalid.toLocaleString()} (${((totalInvalid / totalThings) * 100).toFixed(1)}%)`)
  console.log(`\nWith schemas: ${withSchemas.length} types`)
  console.log(`Without schemas: ${withoutSchemas.length} types`)

  if (withoutSchemas.length > 0) {
    console.log('\n⚠️  Types without schemas:')
    withoutSchemas.forEach(r => {
      console.log(`   - ${r.ns}/${r.type} (${r.total} things)`)
    })
  }

  // Show types with errors
  const typesWithErrors = results.filter(r => r.invalid > 0)
  if (typesWithErrors.length > 0) {
    console.log('\n❌ Types with validation errors:')
    typesWithErrors.forEach(r => {
      console.log(`   - ${r.ns}/${r.type}: ${r.invalid}/${r.total} invalid`)
    })
  }

  db.close()
}

validateAll()

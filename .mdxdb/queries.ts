/**
 * Type-safe query helpers for things.db
 *
 * Provides typed access to the knowledge graph with automatic
 * schema validation using Zod.
 */

import { eq, and, like, sql } from 'drizzle-orm'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'
import type { Thing, Relationship } from './schema.js'
import { validateThingData } from './schemas.js'
import type {
  Occupation,
  Skill,
  Knowledge,
  ProductCommodity,
  Process,
  SchemaOrgType,
  SchemaOrgProperty,
  Model,
} from './schemas.js'

// Open things.db for reading
const sqlite = new Database('.mdxdb/things.db', { readonly: true })
const db = drizzle(sqlite, { schema })

// ============================================================================
// Generic query helpers
// ============================================================================

/**
 * Get a thing by URL
 */
export function getThingByURL(url: string): Thing | undefined {
  return db.select().from(schema.things).where(eq(schema.things.url, url)).get()
}

/**
 * Get things by namespace and type
 */
export function getThingsByType(ns: string, type: string): Thing[] {
  return db.select().from(schema.things)
    .where(and(
      eq(schema.things.ns, ns),
      eq(schema.things.type, type)
    ))
    .all()
}

/**
 * Search things by content
 */
export function searchThings(query: string, limit = 100): Thing[] {
  return db.select().from(schema.things)
    .where(like(schema.things.content, `%${query}%`))
    .limit(limit)
    .all()
}

/**
 * Get relationships for a thing
 */
export function getRelationships(url: string): {
  outgoing: Relationship[]
  incoming: Relationship[]
} {
  const outgoing = db.select().from(schema.relationships)
    .where(eq(schema.relationships.from, url))
    .all()

  const incoming = db.select().from(schema.relationships)
    .where(eq(schema.relationships.to, url))
    .all()

  return { outgoing, incoming }
}

/**
 * Get things related by a specific predicate
 */
export function getRelatedThings(
  url: string,
  predicate: string,
  direction: 'outgoing' | 'incoming' = 'outgoing'
): Thing[] {
  if (direction === 'outgoing') {
    const rels = db.select().from(schema.relationships)
      .where(and(
        eq(schema.relationships.from, url),
        eq(schema.relationships.predicate, predicate)
      ))
      .all()

    const urls = rels.map(r => r.to)
    if (urls.length === 0) return []

    return db.select().from(schema.things)
      .where(sql`${schema.things.url} IN (${sql.join(urls.map(u => sql`${u}`), sql`, `)})`)
      .all()
  } else {
    const rels = db.select().from(schema.relationships)
      .where(and(
        eq(schema.relationships.to, url),
        eq(schema.relationships.predicate, predicate)
      ))
      .all()

    const urls = rels.map(r => r.from)
    if (urls.length === 0) return []

    return db.select().from(schema.things)
      .where(sql`${schema.things.url} IN (${sql.join(urls.map(u => sql`${u}`), sql`, `)})`)
      .all()
  }
}

// ============================================================================
// Type-safe domain helpers
// ============================================================================

/**
 * Get all occupations with typed data
 */
export function getOccupations(): Array<Thing & { data: Occupation }> {
  const things = getThingsByType('onet', 'Occupation')
  return things.map(t => ({
    ...t,
    data: t.data as Occupation
  }))
}

/**
 * Get occupation by name
 */
export function getOccupationByName(name: string): (Thing & { data: Occupation }) | undefined {
  const url = `https://occupations.org.ai/${name}`
  const thing = getThingByURL(url)
  if (!thing) return undefined

  return {
    ...thing,
    data: thing.data as Occupation
  }
}

/**
 * Get skills required for an occupation
 */
export function getOccupationSkills(occupationURL: string): Array<Thing & { data: Skill }> {
  const skillThings = getRelatedThings(occupationURL, 'requiresSkill', 'outgoing')
  return skillThings.map(t => ({
    ...t,
    data: t.data as Skill
  }))
}

/**
 * Get knowledge required for an occupation
 */
export function getOccupationKnowledge(occupationURL: string): Array<Thing & { data: Knowledge }> {
  const knowledgeThings = getRelatedThings(occupationURL, 'requiresKnowledge', 'outgoing')
  return knowledgeThings.map(t => ({
    ...t,
    data: t.data as Knowledge
  }))
}

/**
 * Get all products/commodities with typed data
 */
export function getProducts(limit = 1000): Array<Thing & { data: ProductCommodity }> {
  const things = db.select().from(schema.things)
    .where(and(
      eq(schema.things.ns, 'unspsc'),
      eq(schema.things.type, 'Commodity')
    ))
    .limit(limit)
    .all()

  return things.map(t => ({
    ...t,
    data: t.data as ProductCommodity
  }))
}

/**
 * Get product by name
 */
export function getProductByName(name: string): (Thing & { data: ProductCommodity }) | undefined {
  const url = `https://products.org.ai/${name}`
  const thing = getThingByURL(url)
  if (!thing) return undefined

  return {
    ...thing,
    data: thing.data as ProductCommodity
  }
}

/**
 * Get all processes with typed data
 */
export function getProcesses(): Array<Thing & { data: Process }> {
  const things = getThingsByType('apqc', 'Process')
  return things.map(t => ({
    ...t,
    data: t.data as Process
  }))
}

/**
 * Get process by name
 */
export function getProcessByName(name: string): (Thing & { data: Process }) | undefined {
  const url = `https://processes.org.ai/${name}`
  const thing = getThingByURL(url)
  if (!thing) return undefined

  return {
    ...thing,
    data: thing.data as Process
  }
}

/**
 * Get child processes
 */
export function getChildProcesses(processURL: string): Array<Thing & { data: Process }> {
  const children = getRelatedThings(processURL, 'childOf', 'incoming')
  return children.map(t => ({
    ...t,
    data: t.data as Process
  }))
}

/**
 * Get parent process
 */
export function getParentProcess(processURL: string): (Thing & { data: Process }) | undefined {
  const parents = getRelatedThings(processURL, 'childOf', 'outgoing')
  if (parents.length === 0) return undefined

  return {
    ...parents[0],
    data: parents[0].data as Process
  }
}

/**
 * Get Schema.org types
 */
export function getSchemaOrgTypes(): Array<Thing & { data: SchemaOrgType }> {
  const things = getThingsByType('schema.org', 'Type')
  return things.map(t => ({
    ...t,
    data: t.data as SchemaOrgType
  }))
}

/**
 * Get Schema.org type by name
 */
export function getSchemaOrgType(name: string): (Thing & { data: SchemaOrgType }) | undefined {
  const url = `https://schema.org.ai/${name}`
  const thing = getThingByURL(url)
  if (!thing) return undefined

  return {
    ...thing,
    data: thing.data as SchemaOrgType
  }
}

/**
 * Get subclasses of a Schema.org type
 */
export function getSchemaOrgSubclasses(typeURL: string): Array<Thing & { data: SchemaOrgType }> {
  const subclasses = getRelatedThings(typeURL, 'subClassOf', 'incoming')
  return subclasses.map(t => ({
    ...t,
    data: t.data as SchemaOrgType
  }))
}

/**
 * Get all AI models
 */
export function getModels(): Array<Thing & { data: Model }> {
  const things = getThingsByType('model', 'LLM')
  return things.map(t => ({
    ...t,
    data: t.data as Model
  }))
}

// ============================================================================
// Statistics helpers
// ============================================================================

export function getStats() {
  const thingsCount = db.select({ count: sql<number>`count(*)` })
    .from(schema.things)
    .get()

  const relationshipsCount = db.select({ count: sql<number>`count(*)` })
    .from(schema.relationships)
    .get()

  const byNamespace = db.select({
    ns: schema.things.ns,
    count: sql<number>`count(*)`
  })
    .from(schema.things)
    .groupBy(schema.things.ns)
    .all()

  const byType = db.select({
    ns: schema.things.ns,
    type: schema.things.type,
    count: sql<number>`count(*)`
  })
    .from(schema.things)
    .groupBy(schema.things.ns, schema.things.type)
    .all()

  return {
    things: thingsCount?.count || 0,
    relationships: relationshipsCount?.count || 0,
    byNamespace,
    byType,
  }
}

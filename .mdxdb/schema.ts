import { sqliteTable, text, integer, real, blob, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

/**
 * Things table - Core entities based on mdxld
 * Stores all entities with their namespace, type, id, and associated data
 */
export const things = sqliteTable('things', {
  // Core identifiers
  ns: text('ns').notNull(),           // Full namespace origin (e.g., 'https://schema.org', 'https://occupations.org.ai')
  type: text('type').notNull(),       // Type within namespace (e.g., 'Person', 'Occupation', 'Product')
  id: text('id').notNull(),           // TitleCase name (e.g., 'ChiefExecutive', 'ArmHandSteadiness')

  // URL - fully qualified with namespace path
  url: text('url').primaryKey().notNull(),

  // Names and codes
  name: text('name'),                         // Original unchanged name/title
  code: text('code'),                         // Original source code/ID (e.g., '11-1011.00', '1.A.2.a')

  // Content and metadata
  data: text('data', { mode: 'json' }),      // Structured data as JSON
  content: text('content'),                   // Text content (markdown, etc.)
  meta: text('meta', { mode: 'json' }),      // Metadata as JSON

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  // Indexes for performance with large datasets
  nsIdx: index('things_ns_idx').on(table.ns),
  typeIdx: index('things_type_idx').on(table.type),
  nsTypeIdx: index('things_ns_type_idx').on(table.ns, table.type),
  idIdx: index('things_id_idx').on(table.id),
}))

/**
 * Relationships table - Connects things via predicates
 * Does not enforce foreign keys for flexibility
 */
export const relationships = sqliteTable('relationships', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // From/To URLs (not enforced as foreign keys)
  from: text('from').notNull(),              // Source thing URL
  predicate: text('predicate').notNull(),     // Relationship type (e.g., 'subClassOf', 'requires', 'relatedTo')
  reverse: text('reverse'),                   // Optional reverse predicate name
  to: text('to').notNull(),                   // Target thing URL

  // Optional metadata and content about the relationship
  data: text('data', { mode: 'json' }),
  content: text('content'),

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

/**
 * Searches table - Full-text search and vector embeddings
 * Supports both traditional search and semantic/vector search
 */
export const searches = sqliteTable('searches', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Reference to the thing
  url: text('url').notNull(),                 // Thing URL (not enforced as FK)

  // Search content
  text: text('text').notNull(),               // Text chunk for search

  // Vector embeddings for semantic search
  // Note: SQLite doesn't have native vector type, so we store as blob
  // For production, consider using sqlite-vss extension or separate vector DB
  embedding: blob('embedding'),               // Vector embedding as binary blob

  // Metadata about the chunk
  meta: text('meta', { mode: 'json' }),       // Chunk metadata (position, type, etc.)

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (table) => ({
  // Index for URL lookups
  urlIdx: index('searches_url_idx').on(table.url),
}))

// Type exports for TypeScript
export type Thing = typeof things.$inferSelect
export type NewThing = typeof things.$inferInsert

export type Relationship = typeof relationships.$inferSelect
export type NewRelationship = typeof relationships.$inferInsert

export type Search = typeof searches.$inferSelect
export type NewSearch = typeof searches.$inferInsert

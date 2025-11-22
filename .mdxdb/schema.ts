import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

/**
 * Things table - Core entities based on mdxld
 * Stores all entities with their namespace, type, id, and associated data
 */
export const things = sqliteTable('things', {
  // Core identifiers
  ns: text('ns').notNull(),           // Namespace (e.g., 'schema.org', 'onet', 'unspsc')
  type: text('type').notNull(),       // Type within namespace (e.g., 'Person', 'Occupation', 'Product')
  id: text('id').notNull(),           // Unique ID within ns/type

  // URL - defaults to ns/type/id but can be custom
  url: text('url').primaryKey().notNull(),

  // Content and metadata
  data: text('data', { mode: 'json' }),      // Structured data as JSON
  code: text('code'),                         // Optional code/script content
  content: text('content'),                   // Text content (markdown, etc.)
  meta: text('meta', { mode: 'json' }),      // Metadata as JSON

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

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

  // Optional metadata about the relationship
  meta: text('meta', { mode: 'json' }),

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
})

// Type exports for TypeScript
export type Thing = typeof things.$inferSelect
export type NewThing = typeof things.$inferInsert

export type Relationship = typeof relationships.$inferSelect
export type NewRelationship = typeof relationships.$inferInsert

export type Search = typeof searches.$inferSelect
export type NewSearch = typeof searches.$inferInsert

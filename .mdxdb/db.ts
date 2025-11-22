import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'

// Initialize SQLite database
const sqlite = new Database('.mdxdb/source.db')

// Enable WAL mode for better concurrent access
sqlite.pragma('journal_mode = WAL')

// Enable foreign keys (even though we don't use them in relationships for flexibility)
sqlite.pragma('foreign_keys = ON')

// Create Drizzle ORM instance
export const db = drizzle(sqlite, { schema })

// Export schema for use in queries
export { schema }

// Export types
export type * from './schema.js'

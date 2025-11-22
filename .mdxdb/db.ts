import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize SQLite database with absolute path
const dbPath = path.join(__dirname, 'things.db')
const sqlite = new Database(dbPath)

// Enable WAL mode for better concurrent access
sqlite.pragma('journal_mode = WAL')

// Enable foreign keys (even though we don't use them in relationships for flexibility)
sqlite.pragma('foreign_keys = ON')

// Create Drizzle ORM instance
export const db = drizzle(sqlite, { schema })

// Export schema for use in queries
export { schema }

// Export types
export type * from './schema'

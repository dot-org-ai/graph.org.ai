import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

console.log('🔄 Running database migrations...')

const sqlite = new Database('.mdxdb/source.db')
const db = drizzle(sqlite)

migrate(db, { migrationsFolder: '.mdxdb/migrations' })

console.log('✅ Database migrations completed!')

sqlite.close()

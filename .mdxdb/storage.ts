/**
 * Storage abstraction for mdxdb
 *
 * Provides a unified interface for different storage backends
 * (SQLite for simple/local, ClickHouse for scale)
 */

import Database from 'better-sqlite3'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import { getClickHouseClient } from './clickhouse-client.js'
import type { ClickHouseClient } from '@clickhouse/client'
import * as schema from './schema.js'
import type { NewThing, NewRelationship, NewSearch } from './schema.js'

export type StorageBackend = 'sqlite' | 'clickhouse'

export interface StorageAdapter {
  backend: StorageBackend

  // Things operations
  insertThings(things: NewThing[]): Promise<void>
  insertThing(thing: NewThing): Promise<void>

  // Relationships operations
  insertRelationships(relationships: NewRelationship[]): Promise<void>
  insertRelationship(relationship: NewRelationship): Promise<void>

  // Searches operations
  insertSearches(searches: NewSearch[]): Promise<void>
  insertSearch(search: NewSearch): Promise<void>

  // Utility
  close(): Promise<void>
}

/**
 * SQLite storage adapter
 */
export class SqliteStorage implements StorageAdapter {
  backend: StorageBackend = 'sqlite'
  private db: Database.Database
  private drizzle: ReturnType<typeof drizzleSqlite>

  constructor(dbPath: string = '.mdxdb/things.db') {
    this.db = new Database(dbPath)
    this.drizzle = drizzleSqlite(this.db, { schema })
  }

  async insertThings(things: NewThing[]): Promise<void> {
    const CHUNK_SIZE = 100
    for (let i = 0; i < things.length; i += CHUNK_SIZE) {
      const chunk = things.slice(i, i + CHUNK_SIZE)
      await this.drizzle.insert(schema.things).values(chunk)
    }
  }

  async insertThing(thing: NewThing): Promise<void> {
    await this.drizzle.insert(schema.things).values(thing)
  }

  async insertRelationships(relationships: NewRelationship[]): Promise<void> {
    const CHUNK_SIZE = 100
    for (let i = 0; i < relationships.length; i += CHUNK_SIZE) {
      const chunk = relationships.slice(i, i + CHUNK_SIZE)
      await this.drizzle.insert(schema.relationships).values(chunk)
    }
  }

  async insertRelationship(relationship: NewRelationship): Promise<void> {
    await this.drizzle.insert(schema.relationships).values(relationship)
  }

  async insertSearches(searches: NewSearch[]): Promise<void> {
    const CHUNK_SIZE = 50
    for (let i = 0; i < searches.length; i += CHUNK_SIZE) {
      const chunk = searches.slice(i, i + CHUNK_SIZE)
      await this.drizzle.insert(schema.searches).values(chunk)
    }
  }

  async insertSearch(search: NewSearch): Promise<void> {
    await this.drizzle.insert(schema.searches).values(search)
  }

  async close(): Promise<void> {
    this.db.close()
  }
}

/**
 * ClickHouse storage adapter with streaming inserts
 */
export class ClickHouseStorage implements StorageAdapter {
  backend: StorageBackend = 'clickhouse'
  private client: ClickHouseClient

  constructor() {
    this.client = getClickHouseClient()
  }

  async insertThings(things: NewThing[]): Promise<void> {
    if (things.length === 0) return

    // Use streaming insert for better performance with large datasets
    await this.client.insert({
      table: 'default.things',
      values: things.map(thing => ({
        url: thing.url,
        ns: thing.ns,
        type: thing.type,
        id: thing.id,
        name: thing.name || '',
        code: thing.code || '',
        data: thing.data || {},
        content: thing.content || '',
        meta: thing.meta || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      format: 'JSONEachRow',
    })
  }

  async insertThing(thing: NewThing): Promise<void> {
    await this.insertThings([thing])
  }

  async insertRelationships(relationships: NewRelationship[]): Promise<void> {
    if (relationships.length === 0) return

    await this.client.insert({
      table: 'default.relationships',
      values: relationships.map(rel => ({
        from: rel.from,
        predicate: rel.predicate,
        reverse: rel.reverse || '',
        to: rel.to,
        data: rel.data || {},
        content: rel.content || '',
        createdAt: new Date(),
      })),
      format: 'JSONEachRow',
    })
  }

  async insertRelationship(relationship: NewRelationship): Promise<void> {
    await this.insertRelationships([relationship])
  }

  async insertSearches(searches: NewSearch[]): Promise<void> {
    if (searches.length === 0) return

    await this.client.insert({
      table: 'default.searches',
      values: searches.map(search => {
        // Convert Buffer to Float32Array if needed
        let embedding: number[]
        if (Buffer.isBuffer(search.embedding)) {
          const float32Array = new Float32Array(
            search.embedding.buffer,
            search.embedding.byteOffset,
            search.embedding.byteLength / 4
          )
          embedding = Array.from(float32Array)
        } else {
          embedding = search.embedding as any
        }

        return {
          url: search.url,
          text: search.text,
          embedding,
          meta: search.meta || {},
          createdAt: new Date(),
        }
      }),
      format: 'JSONEachRow',
    })
  }

  async insertSearch(search: NewSearch): Promise<void> {
    await this.insertSearches([search])
  }

  async close(): Promise<void> {
    await this.client.close()
  }
}

/**
 * Create storage adapter based on backend type
 */
export function createStorage(backend: StorageBackend = 'sqlite'): StorageAdapter {
  switch (backend) {
    case 'sqlite':
      return new SqliteStorage()
    case 'clickhouse':
      return new ClickHouseStorage()
    default:
      throw new Error(`Unknown storage backend: ${backend}`)
  }
}

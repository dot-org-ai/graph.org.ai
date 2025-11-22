/**
 * Database abstraction layer for ClickHouse
 * Provides a unified interface for both Node.js and Web environments
 */

// Use any to support both Node and Web ClickHouse clients
let client: any = null;

/**
 * Initialize database client
 * For Node.js: uses @mdxdb/clickhouse
 * For Workers: uses @mdxdb/clickhouse/web with env bindings
 */
export function initDB(clickhouseClient: any) {
  client = clickhouseClient;
}

/**
 * Get the database client
 */
export function getDB(): any {
  if (!client) {
    throw new Error('Database not initialized. Call initDB first.');
  }
  return client;
}

/**
 * Execute a query and return JSON results
 */
export async function query<T = any>(sql: string, params?: Record<string, any>): Promise<T[]> {
  const db = getDB();
  const result = await db.query({
    query: sql,
    query_params: params,
    format: 'JSONEachRow',
  });

  return await result.json();
}

/**
 * Execute a query and return a single row
 */
export async function queryOne<T = any>(sql: string, params?: Record<string, any>): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results[0] || null;
}

/**
 * Insert data into a table
 */
export async function insert(table: string, values: any[]): Promise<void> {
  const db = getDB();
  await db.insert({
    table,
    values,
    format: 'JSONEachRow',
  });
}

/**
 * Execute a command (CREATE, ALTER, etc.)
 */
export async function exec(sql: string): Promise<void> {
  const db = getDB();
  await db.exec({ query: sql });
}

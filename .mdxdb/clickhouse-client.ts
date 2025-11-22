/**
 * ClickHouse client for mdxdb
 *
 * Provides connection and configuration for ClickHouse database
 */

import 'dotenv/config'
import { createClient, type ClickHouseClient } from '@clickhouse/client'

// Configuration from environment
const config = {
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  database: process.env.CLICKHOUSE_DATABASE || 'mdxdb',
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
}

let client: ClickHouseClient | null = null

/**
 * Get or create ClickHouse client instance
 */
export function getClickHouseClient(): ClickHouseClient {
  if (!client) {
    client = createClient({
      url: config.url,
      database: config.database,
      username: config.username,
      password: config.password,
      request_timeout: 30000,
      compression: {
        request: true,
        response: true,
      },
    })
  }
  return client
}

/**
 * Close ClickHouse client connection
 */
export async function closeClickHouseClient() {
  if (client) {
    await client.close()
    client = null
  }
}

/**
 * Check if ClickHouse is available
 */
export async function isClickHouseAvailable(): Promise<boolean> {
  try {
    const ch = getClickHouseClient()
    await ch.ping()
    return true
  } catch {
    return false
  }
}

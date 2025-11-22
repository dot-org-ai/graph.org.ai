/**
 * ClickHouse client for mdxdb (Node.js)
 *
 * Provides connection and configuration for ClickHouse database using Node.js client
 */

import { createClient, type ClickHouseClient } from '@clickhouse/client';

export interface ClickHouseConfig {
  url?: string;
  database?: string;
  username?: string;
  password?: string;
  request_timeout?: number;
}

// Default configuration
const defaultConfig: Required<ClickHouseConfig> = {
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  database: process.env.CLICKHOUSE_DATABASE || 'mdxdb',
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
  request_timeout: 30000,
};

let client: ClickHouseClient | null = null;

/**
 * Get or create ClickHouse client instance (Node.js)
 */
export function getClickHouseClient(options?: ClickHouseConfig): ClickHouseClient {
  const config = { ...defaultConfig, ...options };

  // Always create a new client if custom options provided
  if (options?.database || options?.url) {
    return createClient({
      url: config.url,
      database: config.database,
      username: config.username,
      password: config.password,
      request_timeout: config.request_timeout,
      compression: {
        request: true,
        response: true,
      },
    });
  }

  if (!client) {
    client = createClient({
      url: config.url,
      database: config.database,
      username: config.username,
      password: config.password,
      request_timeout: config.request_timeout,
      compression: {
        request: true,
        response: true,
      },
    });
  }

  return client;
}

/**
 * Close ClickHouse client connection
 */
export async function closeClickHouseClient() {
  if (client) {
    await client.close();
    client = null;
  }
}

/**
 * Check if ClickHouse is available
 */
export async function isClickHouseAvailable(): Promise<boolean> {
  try {
    const ch = getClickHouseClient();
    await ch.ping();
    return true;
  } catch {
    return false;
  }
}

// Export types
export type { ClickHouseClient };

/**
 * ClickHouse client for mdxdb (Web/Cloudflare Workers)
 *
 * Provides connection and configuration for ClickHouse database using Web client
 * Compatible with Cloudflare Workers, Edge Runtime, and browser environments
 */

import { createClient, type ClickHouseClient } from '@clickhouse/client-web';

export interface ClickHouseConfig {
  url?: string;
  database?: string;
  username?: string;
  password?: string;
  request_timeout?: number;
}

// Default configuration (can be overridden)
const defaultConfig: Required<ClickHouseConfig> = {
  url: 'http://localhost:8123',
  database: 'mdxdb',
  username: 'default',
  password: '',
  request_timeout: 30000,
};

/**
 * Get ClickHouse client instance for web environments
 * Note: Web client doesn't support connection pooling, so we create new instances
 */
export function getClickHouseClient(options?: ClickHouseConfig): ClickHouseClient {
  const config = { ...defaultConfig, ...options };

  return createClient({
    url: config.url,
    database: config.database,
    username: config.username,
    password: config.password,
    request_timeout: config.request_timeout,
  });
}

/**
 * Get ClickHouse client with environment binding (Cloudflare Workers)
 * @param env - Environment bindings from Cloudflare Workers
 */
export function getClickHouseClientFromEnv(env: Record<string, any>): ClickHouseClient {
  return getClickHouseClient({
    url: env.CLICKHOUSE_URL,
    database: env.CLICKHOUSE_DATABASE,
    username: env.CLICKHOUSE_USERNAME,
    password: env.CLICKHOUSE_PASSWORD,
  });
}

/**
 * Check if ClickHouse is available
 */
export async function isClickHouseAvailable(client: ClickHouseClient): Promise<boolean> {
  try {
    await client.ping();
    return true;
  } catch {
    return false;
  }
}

// Export types
export type { ClickHouseClient };

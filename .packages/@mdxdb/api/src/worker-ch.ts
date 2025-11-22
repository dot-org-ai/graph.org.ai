/**
 * Cloudflare Worker entry point for @mdxdb/api (ClickHouse version)
 * Uses @mdxdb/clickhouse/web for ClickHouse access
 */

import { getClickHouseClientFromEnv } from '@mdxdb/clickhouse/web';
import { initDB } from './db';
import { createApp } from './index-ch';

export interface Env {
  CLICKHOUSE_URL: string;
  CLICKHOUSE_DATABASE?: string;
  CLICKHOUSE_USERNAME?: string;
  CLICKHOUSE_PASSWORD?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Initialize ClickHouse client from environment
    const client = getClickHouseClientFromEnv(env);
    initDB(client);

    // Create and run the app
    const app = createApp();
    return app.fetch(request, env, ctx);
  },
};

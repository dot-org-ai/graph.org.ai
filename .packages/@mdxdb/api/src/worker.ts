/**
 * Cloudflare Worker entry point for @mdxdb/api
 * Uses Cloudflare D1 for SQLite database
 */

import { createApp } from './index';

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const app = createApp();

    // Make DB available to the app context if needed
    // For now, the routes use the imported db from @graph.org.ai/mdxdb
    // In production, you'd want to pass env.DB to your routes

    return app.fetch(request, env, ctx);
  },
};

#!/usr/bin/env ts-node
/**
 * Simple Node.js test server for local development with ClickHouse
 * Run with: npx tsx test-server-ch.ts
 */

import { serve } from '@hono/node-server';
import { getClickHouseClient } from '@mdxdb/clickhouse';
import { initDB } from './src/db.js';
import { createApp } from './src/index-ch.js';

// Initialize ClickHouse client for Node.js
const client = getClickHouseClient({
  url: process.env.CLICKHOUSE_URL || 'http://localhost:8123',
  database: process.env.CLICKHOUSE_DATABASE || 'mdxdb',
  username: process.env.CLICKHOUSE_USERNAME || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
});

initDB(client);

const app = createApp();
const port = 8787;

console.log(`🚀 Starting mdxdb API server (ClickHouse)...`);
console.log(`📡 Server running at http://localhost:${port}`);
console.log(`🗄️  Database: ClickHouse`);
console.log(`\nAvailable endpoints:`);
console.log(`  GET  http://localhost:${port}/`);
console.log(`  GET  http://localhost:${port}/health`);
console.log(`  GET  http://localhost:${port}/things`);
console.log(`  GET  http://localhost:${port}/relationships`);
console.log(`  GET  http://localhost:${port}/search`);
console.log(`\nPress Ctrl+C to stop`);

serve({
  fetch: app.fetch,
  port,
});

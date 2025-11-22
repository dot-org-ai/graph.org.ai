#!/usr/bin/env ts-node
/**
 * Simple Node.js test server for local development
 * Run with: npx tsx test-server.ts
 */

import { serve } from '@hono/node-server';
import { createApp } from './src/index.js';

const app = createApp();
const port = 8787;

console.log(`🚀 Starting mdxdb API test server...`);
console.log(`📡 Server running at http://localhost:${port}`);
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

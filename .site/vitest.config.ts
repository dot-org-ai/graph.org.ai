import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // CRITICAL: Limit concurrency to prevent resource exhaustion
    maxConcurrency: 1,
    maxWorkers: 1,
    minWorkers: 1,
    fileParallelism: false,

    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}', 'tests/integration/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
    testTimeout: 30000, // 30 seconds for integration tests
    hookTimeout: 15000,

    // Run tests sequentially with better memory isolation
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});

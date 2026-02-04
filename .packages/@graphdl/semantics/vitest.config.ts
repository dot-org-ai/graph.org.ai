import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // CRITICAL: Limit concurrency to prevent resource exhaustion
    maxConcurrency: 1,
    maxWorkers: 1,
    minWorkers: 1,
    fileParallelism: false,

    globals: true,
    environment: 'node',
    exclude: ['node_modules/**', 'dist/**'],
    testTimeout: 30000,
    hookTimeout: 15000,

    // Run tests sequentially with better memory isolation
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.test.ts', '**/node_modules/**', '**/dist/**']
    }
  }
})

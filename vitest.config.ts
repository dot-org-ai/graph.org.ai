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
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**'],
    testTimeout: 30000, // 30s for large file processing
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
      include: ['.data/**/*.tsv'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.test.ts'
      ]
    },
  },
})

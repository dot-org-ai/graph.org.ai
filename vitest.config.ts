import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
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
    testTimeout: 30000, // 30s for large file processing
  },
})

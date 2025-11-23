import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './.mdxdb/schema.ts',
  out: './.mdxdb/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './.mdxdb/source.db',
  },
})

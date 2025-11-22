# Setup Instructions

## Current Status

The API is built with Hono and designed for Cloudflare Workers. However, the database layer currently uses:
- `@graph.org.ai/mdxdb` which uses `better-sqlite3` (Node.js only)
- This needs to be refactored to use D1 (Cloudflare's SQLite)

## Options for Testing

### Option 1: Use D1 (Cloudflare)

1. Create a D1 database:
```bash
wrangler d1 create mdxdb
```

2. Update `wrangler.toml` with the database ID

3. Create tables:
```bash
wrangler d1 execute mdxdb --file=schema.sql
```

4. Start dev server:
```bash
pnpm dev
```

### Option 2: Mock for Testing

For now, we can test the API structure without a real database by:

1. Creating mock route handlers
2. Using in-memory data structures
3. Testing the HTTP layer and format conversions

### Option 3: Node.js Server (Temporary)

Use the Hono app with Node.js for local testing:

```typescript
import { serve } from '@hono/node-server';
import { createApp } from './index';

serve({
  fetch: createApp().fetch,
  port: 8787,
});
```

## Next Steps

1. **Refactor database layer** to support both:
   - SQLite (via better-sqlite3) for Node.js
   - D1 for Cloudflare Workers

2. **Create database adapter pattern**:
   ```typescript
   interface DatabaseAdapter {
     things: ThingsRepository;
     relationships: RelationshipsRepository;
     search: SearchRepository;
   }
   ```

3. **Update routes** to use the adapter instead of direct drizzle calls

## Current URLs

All URLs are now validated to start with `https://` for proper web compatibility.

Examples:
- Input: `schema.org/Person/john-doe`
- Output: `https://schema.org/Person/john-doe`

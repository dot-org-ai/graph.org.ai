# @mdxdb/api

Hono-based REST API for mdxdb with Things, Relationships, and Search capabilities. Designed for **Cloudflare Workers** with support for JSON, MDX, and Markdown input/output formats.

## Features

- **Things API**: Full CRUD operations for entities
- **Relationships API**: Manage relationships between things with object-based responses
- **Search API**: Full-text search with filtering and statistics
- **Format Support**: JSON, MDX, and Markdown inputs/outputs
- **Graph Queries**: Traverse relationship graphs
- **Cloudflare Workers**: Optimized for edge deployment
- **Type-safe**: Built with TypeScript and Zod validation

## Installation

```bash
npm install @mdxdb/api
```

## Quick Start

### Cloudflare Workers Deployment

1. **Configure Database**
```bash
# Create D1 database
wrangler d1 create mdxdb

# Update wrangler.toml with your database_id
```

2. **Deploy**
```bash
npm run deploy
```

3. **Local Development**
```bash
npm run dev
```

The server runs on port 8787 by default for local development.

## API Reference

### Things API

**List Things**
```
GET /things?ns=...&type=...&q=...&format=json|markdown|mdx
```

**Get Thing with Relationships**
```
GET /things/:url?format=json|markdown|mdx&relationships=true

Response:
{
  "ns": "schema.org",
  "type": "Person",
  "id": "john-doe",
  "url": "schema.org/Person/john-doe",
  "content": "# John Doe...",
  "data": {...},
  "relationships": {
    "worksAt": "schema.org/Organization/acme",
    "knows": ["schema.org/Person/jane", "schema.org/Person/bob"]
  },
  "references": {
    "managedBy": "schema.org/Person/alice"
  }
}
```

**Create Thing**
```
POST /things?format=mdx|markdown|json
Body: {
  "ns": "schema.org",
  "type": "Person",
  "id": "john-doe",
  "content": "# John Doe\n\nSoftware developer...",
  "data": { "age": 30 }
}
```

**Update Thing**
```
PUT /things/:url
PATCH /things/:url  (partial update)
```

**Delete Thing**
```
DELETE /things/:url
```

### Relationships API

Relationships are returned as objects with predicates as keys:

```typescript
// Single relationship
{ "worksAt": "schema.org/Organization/acme" }

// Multiple relationships of same predicate
{ "knows": ["schema.org/Person/jane", "schema.org/Person/bob"] }
```

**List Relationships**
```
GET /relationships?from=...&to=...&predicate=...
```

**Get Outgoing Relationships**
```
GET /relationships/from/:url?predicate=...
```

**Get Incoming Relationships (References)**
```
GET /relationships/to/:url?predicate=...
```

**Get Relationship Graph**
```
GET /relationships/graph/:url?depth=1

Response:
{
  "url": "schema.org/Person/john-doe",
  "outgoing": [...],
  "incoming": [...],
  "depth": 1
}
```

**Create Relationship**
```
POST /relationships
Body: {
  "from": "schema.org/Person/john",
  "predicate": "knows",
  "reverse": "knownBy",
  "to": "schema.org/Person/jane",
  "data": { "since": 2020 }
}
```

**Update/Delete Relationship**
```
PUT /relationships/:id
PATCH /relationships/:id
DELETE /relationships/:id
```

### Search API

**Full-Text Search**
```
GET /search?q=query&ns=...&type=...
```

**Advanced Search**
```
POST /search
Body: {
  "q": "search term",
  "ns": "schema.org",
  "type": "Person",
  "filters": {},
  "limit": 50,
  "offset": 0
}
```

**Search by Namespace**
```
GET /search/namespace/:ns?q=...
```

**Search by Type**
```
GET /search/type/:ns/:type?q=...
```

**Statistics**
```
GET /search/stats

Response:
{
  "total": 1234,
  "byNamespace": [
    { "ns": "schema.org", "count": 500 },
    { "ns": "onet", "count": 734 }
  ],
  "byType": [
    { "ns": "schema.org", "type": "Person", "count": 200 },
    ...
  ]
}
```

## Format Support

All endpoints support format conversion:

**Query Parameter:**
- `?format=json` - Return JSON representation
- `?format=markdown` - Return Markdown
- `?format=mdx` - Return MDX (default for content)

**Relationships Parameter:**
- `?relationships=true` (default) - Include relationships and references as objects
- `?relationships=false` - Exclude relationships

## Examples

### Create a Person with MDX Content

```typescript
const response = await fetch('https://your-worker.workers.dev/things', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ns: 'schema.org',
    type: 'Person',
    id: 'john-doe',
    content: `# John Doe

Software developer and open source contributor.

## Skills
- JavaScript
- TypeScript
- React`,
    data: {
      email: 'john@example.com',
      github: 'johndoe'
    }
  })
});
```

### Create a Relationship

```typescript
await fetch('https://your-worker.workers.dev/relationships', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'schema.org/Person/john-doe',
    predicate: 'worksAt',
    reverse: 'employs',
    to: 'schema.org/Organization/acme-corp',
    data: { role: 'Senior Developer', since: '2020-01-01' }
  })
});
```

### Get Thing with Relationships

```typescript
const response = await fetch(
  'https://your-worker.workers.dev/things/schema.org/Person/john-doe'
);
const person = await response.json();

// person.relationships = { worksAt: "...", knows: ["...", "..."] }
// person.references = { managedBy: "..." }
```

### Search with Filters

```typescript
const response = await fetch(
  'https://your-worker.workers.dev/search?q=developer&ns=schema.org&type=Person'
);
const results = await response.json();
```

## Cloudflare Workers Configuration

### D1 Database

The API uses Cloudflare D1 (SQLite) for data storage. Configure in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "mdxdb"
database_id = "your-database-id"
```

### Environment Variables

Create a `.dev.vars` file for local development:

```
# .dev.vars
API_KEY=your-api-key-here
```

### Database Schema

The API expects the following D1 schema (from `@graph.org.ai/mdxdb`):

- **things** - Core entities table
- **relationships** - Relationship edges table
- **searches** - Full-text search and embeddings table

## Development

```bash
# Install dependencies
npm install

# Run locally with Wrangler
npm run dev

# Deploy to Cloudflare
npm run deploy

# Build TypeScript
npm run build
```

## Architecture

```
@mdxdb/api
├── src/
│   ├── index.ts           # Main Hono app
│   ├── worker.ts          # Cloudflare Worker entry
│   ├── types.ts           # Zod schemas & types
│   ├── utils.ts           # Helper functions
│   └── routes/
│       ├── things.ts      # Things CRUD + relationships
│       ├── relationships.ts # Relationships API
│       └── search.ts      # Search & filtering
└── wrangler.toml          # Cloudflare config
```

## Related Packages

- `@mdxui/json` - MDX to JSON rendering
- `@mdxui/markdown` - MDX to Markdown rendering
- `@mdxui/api` - Unified MDX rendering API
- `@graph.org.ai/mdxdb` - Database schema and types

## License

MIT

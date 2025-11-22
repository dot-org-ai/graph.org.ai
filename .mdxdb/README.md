# mdxdb - SQLite Knowledge Graph Database

This directory contains the mdxdb SQLite database schema and ingestion scripts for building a knowledge graph from multiple data sources.

## Database Schema

The database follows the mdxld (MDX Linked Data) model with three core tables:

### 1. **things** - Core entities
- `ns` (namespace): e.g., 'schema.org', 'onet', 'unspsc', 'apqc', 'model'
- `type`: Entity type within namespace
- `id`: Unique identifier within ns/type
- `url` (primary key): Default format is `ns/type/id`, can be custom
- `data` (JSON): Structured data
- `code`: Optional code/script content
- `content`: Text content (markdown, descriptions)
- `meta` (JSON): Metadata
- `createdAt`, `updatedAt`: Timestamps

### 2. **relationships** - Entity connections
- `from`: Source entity URL
- `predicate`: Relationship type (e.g., 'subClassOf', 'requiresSkill', 'partOf')
- `reverse`: Optional reverse predicate name
- `to`: Target entity URL
- `meta` (JSON): Relationship metadata
- Foreign keys are NOT enforced for flexibility

### 3. **searches** - Full-text search and embeddings
- `url`: Reference to thing
- `text`: Text chunk for search
- `embedding` (blob): Vector embedding for semantic search
- `meta` (JSON): Chunk metadata

## Current Data Sources

| Namespace | Types | Count | Description |
|-----------|-------|-------|-------------|
| **schema.org** | Type, Property | 2,430 | Schema.org vocabulary |
| **onet** | Occupation, Skill, Knowledge | 1,084 | O*NET occupational data |
| **unspsc** | Segment, Family, Class, Commodity | 158,463 | UN Standard Products and Services |
| **apqc** | Process | 1,921 | APQC Process Classification Framework |
| **model** | LLM | 306 | AI/LLM models from OpenRouter |

**Total:** 164,204 things, 285,154 relationships

## Database Size

- **source.db**: ~185 MB
- Optimized with WAL mode for concurrent access

## Usage

### Initialize Database

```bash
# Run migrations
tsx .mdxdb/migrate.ts

# Ingest all data sources
tsx .scripts/ingest-db.ts

# Or ingest specific source
tsx .scripts/ingest-unspsc-only.ts
```

### Query Examples

```typescript
import { db, schema } from './.mdxdb/db.js'

// Find all Schema.org types
const types = await db
  .select()
  .from(schema.things)
  .where(eq(schema.things.ns, 'schema.org'))
  .where(eq(schema.things.type, 'Type'))

// Find relationships
const rels = await db
  .select()
  .from(schema.relationships)
  .where(eq(schema.relationships.predicate, 'subClassOf'))
```

### SQL Examples

```sql
-- Count by namespace
SELECT ns, COUNT(*) as count
FROM things
GROUP BY ns;

-- Find UNSPSC commodities
SELECT id, data
FROM things
WHERE ns = 'unspsc' AND type = 'Commodity'
LIMIT 10;

-- Find occupation skills
SELECT t1.id as occupation, t2.id as skill
FROM things t1
JOIN relationships r ON r.from = t1.url
JOIN things t2 ON r.to = t2.url
WHERE t1.ns = 'onet'
  AND t1.type = 'Occupation'
  AND r.predicate = 'requiresSkill';
```

## Architecture

- **ORM**: Drizzle ORM
- **Database**: better-sqlite3
- **Schema**: TypeScript with full type inference
- **Migrations**: Versioned in `.mdxdb/migrations/`

## Files

- `schema.ts` - Table definitions
- `db.ts` - Database connection
- `migrate.ts` - Run migrations
- `source.db` - SQLite database (gitignored)
- `migrations/` - Drizzle migration files

## Future Enhancements

1. **Full-text search**: Implement FTS5 virtual tables
2. **Vector search**: Integrate sqlite-vss for embeddings
3. **More sources**: Add NAICS, GS1, Icons, Integrations
4. **Indexes**: Add indexes for common query patterns
5. **Search table**: Populate with chunked content and embeddings

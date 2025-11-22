# Knowledge Graph Architecture

This document describes the architecture of the graph.org.ai knowledge graph database.

## Overview

The knowledge graph is built from multiple authoritative data sources and provides a unified, semantic web of:
- **Products** (UNSPSC, GS1)
- **Occupations** (O*NET, BLS)
- **Processes** (APQC)
- **Industries** (NAICS)
- **Services** (NAPCS)
- **Career Pathways** (AdvanceCTE)
- **Ontologies** (Schema.org)
- **AI Models** (Custom)
- **Integrations** (APIs, tools)

## Data Pipeline

### 1. Source Data Ingestion

**Script**: `.scripts/ingest.ts`

Downloads and normalizes data from authoritative sources into TSV files:

```
.source/
├── Schema.org/       # Schema.org types and properties
├── ONET/            # O*NET occupational data
├── UNSPSC/          # UN Standard Products and Services Code
├── APQC/            # Process Classification Framework
├── GS1/             # Global Standards for product identification
├── NAICS/           # North American Industry Classification
├── NAPCS/           # North American Product Classification
├── BLS/             # Bureau of Labor Statistics
├── AdvanceCTE/      # Career Technical Education pathways
├── Models/          # AI model metadata
└── Integrations/    # Tool and API integrations
```

**Output**: `.mdxdb/source.db` (SQLite)

All TSV files are imported into a source database with:
- `things` table: All entities with their raw data
- `relationships` table: All connections between entities

### 2. Normalization & Validation

**Script**: `.scripts/build-things-db.ts`

Transforms source data into normalized, semantic URLs with Zod validation:

**Transformations**:
- `schema:Person` → `https://schema.org.ai/Person`
- `onet:11-1011.00` → `https://occupations.org.ai/ChiefExecutives`
- `unspsc:10101501` → `https://products.org.ai/Cats`
- `apqc:10023` → `https://processes.org.ai/[ProcessName]`

**Validation**:
- Zod schemas ensure data quality
- Type checking for all fields
- Relationship integrity

**Outputs**:
- `.mdxdb/things.db` (SQLite) - for local development
- `mdxdb.things` (ClickHouse) - for production scale

### 3. Storage Backends

The system supports multiple storage backends through a unified interface:

#### SQLite (Development)

**File**: `.mdxdb/things.db`

**Best for**:
- Local development
- Datasets < 1M rows
- Simple queries
- Prototyping

**Limitations**:
- Slower vector search
- Single-threaded writes
- Limited concurrency

#### ClickHouse (Production)

**Database**: `mdxdb`

**Best for**:
- Production deployments
- Datasets > 1M rows
- High-performance analytics
- Concurrent queries
- Vector similarity search

**Features**:
- New JSON field type for flexible schema
- HNSW vector indexes for fast similarity search
- Columnar storage with excellent compression (4x vs SQLite)
- Distributed query execution
- Materialized views for fast aggregations

**Tables**:
```sql
-- Main entities
mdxdb.things (
  url String,
  ns String,
  type String,
  id String,
  data JSON,              -- Flexible schema
  code String,
  content String,
  meta JSON,
  created_at DateTime,
  updated_at DateTime
)

-- Graph edges
mdxdb.relationships (
  from String,
  predicate String,
  reverse String,
  to String,
  meta JSON,
  created_at DateTime
)

-- Search with embeddings
mdxdb.searches (
  url String,
  text String,
  embedding Array(Float32),  -- 768-dimensional vectors
  meta JSON,
  created_at DateTime
)

-- Fast type aggregations
mdxdb.things_by_type (materialized view)
```

### 4. Vector Embeddings

**Script**: `.scripts/generate-embeddings.ts`

Generates semantic embeddings for all entities using Google's `gemini-embedding-001` model:

**Process**:
1. Create searchable text from entity data (title, description, etc.)
2. Generate 768-dimensional embeddings in batches
3. Store in `searches` table with HNSW index
4. Enable fast similarity search (<20ms for 10 results)

**Storage**:
- SQLite: `things.db.searches` table
- ClickHouse: `mdxdb.searches` table with vector index

## Storage Abstraction Layer

**File**: `.mdxdb/storage.ts`

Provides a unified interface for both SQLite and ClickHouse:

```typescript
interface StorageAdapter {
  backend: StorageBackend
  insertThings(things: NewThing[]): Promise<void>
  insertRelationships(relationships: NewRelationship[]): Promise<void>
  insertSearches(searches: NewSearch[]): Promise<void>
  close(): Promise<void>
}
```

**Usage**:
```bash
# Build to SQLite
tsx .scripts/build-things-db.ts sqlite

# Build to ClickHouse
tsx .scripts/build-things-db.ts clickhouse

# Generate embeddings to ClickHouse
tsx .scripts/generate-embeddings.ts clickhouse
```

## Query Interfaces

### Vector Search

**File**: `.mdxdb/vector-search.ts`

Semantic similarity search across all entities:

```typescript
// Find similar entities
const similar = await findSimilar(url, {
  limit: 10,
  threshold: 0.8,
  namespace: 'onet',
  types: ['Occupation', 'Skill']
})

// Find top N per type
const byType = await findSimilarByType(url, {
  types: ['Occupation', 'Skill', 'Industry'],
  limitPerType: 5
})

// Find best match per type
const bestMatches = await findMostSimilarOfEachType(url)
```

### Graph Queries

Direct SQL queries via Drizzle ORM or ClickHouse client:

```typescript
// SQLite (development)
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { things, relationships } from '.mdxdb/schema'

const db = drizzle(...)
const occupations = await db
  .select()
  .from(things)
  .where(eq(things.type, 'Occupation'))

// ClickHouse (production)
import { getClickHouseClient } from '.mdxdb/clickhouse-client'

const client = getClickHouseClient()
const result = await client.query({
  query: `
    SELECT url, data.title, data.description
    FROM mdxdb.things
    WHERE type = 'Occupation'
    LIMIT 100
  `
})
```

## Performance Characteristics

### Storage Comparison

| Metric | SQLite | ClickHouse |
|--------|--------|------------|
| 164K things | ~200MB | ~50MB |
| Vector search (10 results) | 100-500ms | 5-20ms |
| Filter by type | 50-100ms | <5ms |
| Aggregate counts | 100-200ms | <10ms |
| Practical limit | 1-10M rows | 1B+ rows |

### Scalability

**SQLite**: Recommended for datasets under 10M rows
**ClickHouse**: Can handle billions of rows with sub-second queries

## Data Sources & Namespaces

| Namespace | Domain | Source | Entities |
|-----------|--------|--------|----------|
| `schema.org` | `schema.org.ai` | Schema.org | 2,430 |
| `onet` | `occupations.org.ai` | O*NET | 1,084 |
| `unspsc` | `products.org.ai` | UNSPSC | 158,463 |
| `apqc` | `processes.org.ai` | APQC | 1,921 |
| `gs1` | `products.org.ai` | GS1 | TBD |
| `naics` | `industries.org.ai` | Census | TBD |
| `napcs` | `services.org.ai` | Census | TBD |
| `bls` | `occupations.org.ai` | BLS | TBD |
| `advancecte` | `careers.org.ai` | AdvanceCTE | TBD |
| `model` | `models.org.ai` | Custom | 306 |

## Build Pipeline

### Complete Build

```bash
# Full pipeline: ingest → sqlite → clickhouse
tsx .scripts/build-all.ts

# Skip specific steps
tsx .scripts/build-all.ts --skip-ingest
tsx .scripts/build-all.ts --skip-sqlite --skip-clickhouse
```

### Individual Steps

```bash
# 1. Ingest source data
tsx .scripts/ingest.ts

# 2. Build normalized SQLite
tsx .scripts/build-things-db.ts sqlite

# 3. Build ClickHouse
tsx .scripts/setup-clickhouse.ts
tsx .scripts/build-things-db.ts clickhouse

# 4. Generate embeddings
tsx .scripts/generate-embeddings.ts clickhouse

# 5. Verify data
tsx .scripts/verify-clickhouse.ts
```

## Development Workflow

1. **Local Development**: Use SQLite for fast iteration
2. **Testing**: Validate with small datasets in SQLite
3. **Production**: Deploy to ClickHouse for scale
4. **Embeddings**: Generate after data is stable

## Future Enhancements

### ClickHouse Scaling

1. **Distributed Mode**: Run ClickHouse cluster
2. **Replication**: Add data redundancy
3. **Partitioning**: Partition by namespace/type
4. **Materialized Views**: Pre-compute common queries
5. **Direct Ingestion**: Stream large datasets directly

### Data Sources

1. **Wikipedia**: Entity descriptions
2. **Wikidata**: Additional properties
3. **OpenAlex**: Research papers and citations
4. **USPTO**: Patents and trademarks
5. **Custom**: Domain-specific ontologies

### Query Capabilities

1. **GraphQL API**: Unified query interface
2. **SPARQL Support**: RDF query language
3. **Full-Text Search**: Advanced text queries
4. **Graph Algorithms**: PageRank, community detection
5. **ML Integration**: Embeddings, classification

## Resources

- [ClickHouse Documentation](https://clickhouse.com/docs)
- [Vector Similarity Indexes](https://clickhouse.com/docs/engines/table-engines/mergetree-family/annindexes)
- [JSON Type](https://clickhouse.com/docs/sql-reference/data-types/newjson)
- [Drizzle ORM](https://orm.drizzle.team/)
- [O*NET Database](https://www.onetcenter.org/)
- [UNSPSC](https://www.unspsc.org/)
- [APQC PCF](https://www.apqc.org/pcf)

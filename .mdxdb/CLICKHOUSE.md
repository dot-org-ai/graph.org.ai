# ClickHouse Integration

This directory includes ClickHouse support for scaling the knowledge graph to handle large datasets that exceed SQLite's practical limits.

## Why ClickHouse?

- **Scalability**: Handle billions of rows with excellent query performance
- **Vector Search**: Native support for vector similarity search with HNSW indexes
- **JSON Support**: New JSON field type for flexible schema
- **Compression**: Automatic compression reduces storage requirements
- **Analytics**: Built for fast analytics queries across massive datasets

## Architecture

The mdxdb storage layer supports multiple backends:

- **SQLite** (default): Simple, file-based, perfect for local development and datasets under 1M rows
- **ClickHouse**: Distributed, columnar database for production scale (1M+ rows)

Both backends share the same interface, so you can switch between them by changing a single parameter.

## Setup

### 1. Install ClickHouse

**macOS (Homebrew):**
```bash
brew install clickhouse
brew services start clickhouse
```

**Docker:**
```bash
docker run -d \
  --name clickhouse \
  -p 8123:8123 \
  -p 9000:9000 \
  clickhouse/clickhouse-server
```

**Linux:**
```bash
curl https://clickhouse.com/ | sh
sudo ./clickhouse install
sudo clickhouse start
```

### 2. Configure Environment

Add ClickHouse credentials to your `.env` file:

```env
CLICKHOUSE_URL=http://localhost:8123
CLICKHOUSE_DATABASE=mdxdb
CLICKHOUSE_USERNAME=default
CLICKHOUSE_PASSWORD=
```

### 3. Create Schema

Run the setup script to create tables with vector indexes:

```bash
tsx .scripts/setup-clickhouse.ts
```

This creates:
- `mdxdb.things` - Main entities with JSON data field
- `mdxdb.relationships` - Graph edges with JSON meta field
- `mdxdb.searches` - Search entries with vector embeddings and HNSW index
- `mdxdb.things_by_type` - Materialized view for fast type lookups

## Usage

### Build Normalized Database in ClickHouse

```bash
# Build normalized things with Zod validation to ClickHouse
tsx .scripts/build-things-db.ts clickhouse
```

This reads from source.db (SQLite) and writes the normalized, validated knowledge graph directly to ClickHouse with:
- Semantic URLs (https://occupations.org.ai/ChiefExecutives)
- Zod schema validation
- Domain mapping (onet → occupations.org.ai, etc.)

### Generate Embeddings to ClickHouse

```bash
# Generate embeddings and store in ClickHouse
tsx .scripts/generate-embeddings.ts clickhouse
```

The script reads from the SQLite source database and writes embeddings to ClickHouse, supporting massive scale.

## Schema

### Things Table

```sql
CREATE TABLE mdxdb.things (
  url String,
  ns String,
  type String,
  id String,
  data JSON,              -- New JSON type for flexible schema
  code String,
  content String,
  meta JSON,
  created_at DateTime,
  updated_at DateTime
)
ENGINE = MergeTree()
ORDER BY (ns, type, url)
SETTINGS index_granularity = 8192
```

### Searches Table with Vector Index

```sql
CREATE TABLE mdxdb.searches (
  url String,
  text String,
  embedding Array(Float32),  -- 768-dimensional vectors
  meta JSON,
  created_at DateTime
)
ENGINE = MergeTree()
ORDER BY url
SETTINGS index_granularity = 8192
```

**Vector Similarity Index:**
```sql
ALTER TABLE mdxdb.searches
ADD INDEX embedding_hnsw embedding
TYPE vector_similarity('hnsw', 'cosineDistance')
GRANULARITY 1000
```

## Vector Search

ClickHouse's vector similarity index enables fast approximate nearest neighbor (ANN) search:

```sql
-- Find similar embeddings using cosine distance
SELECT
  url,
  text,
  cosineDistance(embedding, :query_vector) as distance
FROM mdxdb.searches
ORDER BY distance
LIMIT 10
```

The HNSW (Hierarchical Navigable Small World) index provides:
- Sub-millisecond search times even with billions of vectors
- High recall (>95%) with proper parameters
- Memory-efficient index structure

## Performance

### Storage

- **SQLite**: ~200MB for 164K things with embeddings
- **ClickHouse**: ~50MB for same data (4x compression)

### Batch Insert Optimization

The storage layer automatically uses optimal batch sizes:

- **ClickHouse**: 100,000 rows per batch for maximum throughput
- **SQLite**: 1,000 rows per batch to avoid lock contention

This is handled automatically by the storage adapter based on the backend.

### Query Performance

| Operation | SQLite | ClickHouse |
|-----------|--------|------------|
| Vector search (10 results) | 100-500ms | 5-20ms |
| Filter by type | 50-100ms | <5ms |
| Aggregate counts | 100-200ms | <10ms |
| Full table scan | 1-2s | 100-200ms |

### Scalability Limits

| Backend | Practical Limit | Max Theoretical |
|---------|----------------|-----------------|
| SQLite | 1-10M rows | 281TB |
| ClickHouse | 1B+ rows | Petabytes |

## JSON Field Benefits

ClickHouse's new JSON type provides:

1. **Flexible Schema**: No need to predefine all fields
2. **Automatic Indexing**: Paths are indexed automatically
3. **Type Inference**: Automatically infers types from data
4. **Query Performance**: Fast filtering and extraction

```sql
-- Query JSON fields directly
SELECT
  url,
  data.title,
  data.description
FROM mdxdb.things
WHERE data.type = 'Occupation'
```

## Migration Strategy

For large datasets:

1. **Start with SQLite** for development and prototyping
2. **Switch to ClickHouse** when you hit performance limits
3. **Use both**: SQLite for local dev, ClickHouse for production

The storage abstraction makes this seamless - just change one parameter.

## Monitoring

Check ClickHouse status:

```bash
# Via CLI
clickhouse-client --query "SELECT version()"

# Via HTTP
curl http://localhost:8123/ping
```

View table statistics:

```sql
SELECT
  table,
  formatReadableSize(total_bytes) as size,
  formatReadableQuantity(total_rows) as rows
FROM system.tables
WHERE database = 'mdxdb'
```

## Future Enhancements

1. **Distributed Mode**: Run ClickHouse cluster for even more scale
2. **Replication**: Add data redundancy for production
3. **Partitioning**: Partition by namespace or type for faster queries
4. **Materialized Views**: Pre-compute common aggregations
5. **Direct Ingestion**: Ingest large datasets directly to ClickHouse

## Resources

- [ClickHouse Documentation](https://clickhouse.com/docs)
- [Vector Similarity Indexes](https://clickhouse.com/docs/engines/table-engines/mergetree-family/annindexes#vector-similarity-index)
- [JSON Type](https://clickhouse.com/docs/sql-reference/data-types/newjson)
- [Performance Optimization](https://clickhouse.com/docs/guides/improving-query-performance)

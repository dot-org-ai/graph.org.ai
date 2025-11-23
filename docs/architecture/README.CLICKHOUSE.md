# ClickHouse Data Ingestion for graph.org.ai

## Overview

This project uses **ClickHouse** as the primary data warehouse for large-scale knowledge graph construction. ClickHouse provides:

- **Fast ingestion**: Process billions of records in hours, not days
- **Efficient storage**: 5-10x compression with ZSTD codec
- **Sub-second queries**: Even on 100M+ row tables
- **Direct streaming**: `SELECT FROM url()` for no-download ingestion
- **mdxdb compatibility**: Schema matches `.mdxdb/schema.ts` exactly

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Sources                              │
├─────────────────────────────────────────────────────────────┤
│  Wikidata (130GB)  │  Wikipedia (23GB)  │  GeoNames (2GB)  │
└──────────┬──────────────────┬──────────────────┬────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
    ┌──────────────────────────────────────────────┐
    │         ClickHouse (graph_org_ai DB)         │
    ├──────────────────────────────────────────────┤
    │  Staging Tables → Things + Relationships     │
    │  • wikidata_staging   →  things              │
    │  • wikipedia_raw      →  relationships       │
    │  • geonames_raw       →  searches            │
    └──────────┬───────────────────────────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │    mdxdb (SQLite)        │
    │  • Filtered exports      │
    │  • Local queries         │
    │  • Vector search         │
    └──────────────────────────┘
```

## Quick Start

### 1. Start ClickHouse

```bash
# Using provided script
./.scripts/start-clickhouse.sh

# Or manually
docker run -d \
  --name clickhouse-server \
  -p 8123:8123 -p 9000:9000 \
  -v clickhouse_data:/var/lib/clickhouse \
  clickhouse/clickhouse-server
```

### 2. Ingest Wikidata

```bash
# Stream 130GB directly from Wikimedia (24-48 hours)
docker exec -i clickhouse-server clickhouse-client < .scripts/ingest-wikidata.sql
```

### 3. Monitor Progress

```bash
# Connect to ClickHouse
docker exec -it clickhouse-server clickhouse-client

# Check row counts
SELECT count() FROM graph_org_ai.wikidata_staging;  -- Raw data
SELECT count() FROM graph_org_ai.things;             -- Processed things
SELECT count() FROM graph_org_ai.relationships;      -- Processed relationships
```

## Data Pipelines

### Wikidata → Things + Relationships

**Input**: https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.bz2

**Pipeline**:
1. **Stream** → `wikidata_staging` table (raw NDJSON)
2. **Transform** → Extract entities into `things` table
3. **Flatten** → Extract claims into `relationships` table
4. **Index** → Create bloom filters and text search indexes
5. **Filter** → Materialized views for companies, occupations, industries

**Schema Mapping**:
```sql
-- Wikidata Entity → Thing
{
  ns: 'wikidata',
  type: <P31 instance-of value>,  -- e.g., 'Q5' for human
  id: <entity ID>,                 -- e.g., 'Q42'
  url: 'wikidata/{type}/{id}',
  data: <full JSON entity>,
  content: '<label>\n\n<description>',
  meta: <sitelinks + aliases>
}

-- Wikidata Claim → Relationship
{
  from: 'wikidata/item/{subject}',
  predicate: <property ID>,        -- e.g., 'P31' for instance-of
  to: 'wikidata/item/{object}',
  data: <full claim JSON>,
  content: ''
}
```

**Output**:
- ~50M things (entities with English labels)
- ~500M+ relationships (entity-to-entity claims)
- ~300-400GB total storage

### Wikipedia → Things

**Input**: https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-pages-articles.xml.bz2

**Status**: Download in progress (3.0GB / 22.9GB downloaded)

**Schema Mapping**:
```sql
-- Wikipedia Article → Thing
{
  ns: 'wikipedia',
  type: <namespace>,               -- e.g., 'main', 'category'
  id: <page ID>,
  url: 'wikipedia/{namespace}/{id}',
  data: <infobox + metadata JSON>,
  content: <article text>,
  meta: <categories + templates>
}
```

### GeoNames → Things

**Schema Mapping**:
```sql
-- GeoNames Place → Thing
{
  ns: 'geonames',
  type: <feature class>,           -- e.g., 'P' for populated place
  id: <geoname ID>,
  url: 'geonames/{feature_class}/{id}',
  data: <full place JSON>,
  content: '<name>, <admin1>, <country>',
  meta: <coordinates + population>
}
```

## Schema

### Things Table

```sql
CREATE TABLE graph_org_ai.things (
    ns String,              -- Namespace: 'wikidata', 'wikipedia', 'geonames', etc.
    type String,            -- Type within namespace
    id String,              -- Unique ID within ns/type
    url String,             -- Primary key: ns/type/id
    data String,            -- Full JSON data
    code String,            -- Optional code/script
    content String,         -- Text content
    meta String,            -- Metadata JSON
    created_at DateTime,
    updated_at DateTime
) ENGINE = MergeTree()
ORDER BY (ns, type, id)
PARTITION BY ns;
```

### Relationships Table

```sql
CREATE TABLE graph_org_ai.relationships (
    id UInt64,
    `from` String,          -- Source thing URL
    predicate String,       -- Relationship type
    reverse String,         -- Reverse predicate
    `to` String,            -- Target thing URL
    data String,            -- Metadata JSON
    content String,         -- Optional content
    created_at DateTime
) ENGINE = MergeTree()
ORDER BY (`from`, predicate, `to`)
PARTITION BY substring(predicate, 1, 2);
```

### Searches Table

```sql
CREATE TABLE graph_org_ai.searches (
    id UInt64,
    url String,             -- Thing URL
    text String,            -- Search text
    embedding Array(Float32), -- Vector embedding
    meta String,
    created_at DateTime
) ENGINE = MergeTree()
ORDER BY url;
```

## Key Features

### 1. Direct URL Streaming

No need to download 130GB locally:

```sql
INSERT INTO wikidata_staging
SELECT * FROM url(
  'https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.bz2',
  'LineAsString'
);
```

### 2. Multi-Stage Transformation

```
Raw Data (staging) → Clean Data (things/relationships) → Filtered Views
```

Allows complex transformations without re-downloading data.

### 3. Materialized Views

Auto-filtered subsets:

```sql
CREATE MATERIALIZED VIEW things_companies AS
SELECT * FROM things
WHERE type IN ('Q4830453', 'Q783794', 'Q891723');  -- Company types
```

### 4. Efficient Compression

Using ZSTD codec:
- 130GB compressed Wikidata → ~100GB in ClickHouse
- ~50GB after transformation and filtering

### 5. Fast Queries

```sql
-- Find all companies in technology industry (sub-second on 50M things)
SELECT * FROM things
WHERE ns = 'wikidata'
  AND type IN (SELECT object_id FROM relationships
               WHERE predicate = 'P452' AND object_id = 'Q11661')
LIMIT 100;
```

## Usage Patterns

### Pattern 1: ClickHouse as Primary Database

Use ClickHouse directly for all queries:

```typescript
import { createClient } from '@clickhouse/client';

const ch = createClient({ host: 'http://localhost:8123' });

const companies = await ch.query({
  query: 'SELECT * FROM graph_org_ai.things_companies LIMIT 100',
  format: 'JSONEachRow',
});
```

### Pattern 2: Hybrid (ClickHouse + SQLite)

Export filtered data to SQLite for local use:

```typescript
// Export companies to SQLite
const companies = await ch.query({
  query: 'SELECT * FROM things_companies WHERE created_at > now() - INTERVAL 1 DAY',
  format: 'JSONEachRow',
});

const db = new Database('.mdxdb/things.db');
// Insert into SQLite...
```

### Pattern 3: Incremental Sync

Use materialized views for incremental updates:

```sql
-- Track last sync
CREATE TABLE sync_state (table String, last_sync DateTime);

-- Export only new/updated records
SELECT * FROM things
WHERE updated_at > (SELECT last_sync FROM sync_state WHERE table = 'things');
```

## File Structure

```
.scripts/
  ├── ingest-wikidata.sql          # Main Wikidata ingestion SQL
  ├── start-clickhouse.sh          # Start ClickHouse via Docker
  ├── CLICKHOUSE_SETUP.md          # Detailed setup guide
  └── ingest-wikipedia-clickhouse.ts  # Wikipedia TypeScript ingestion

.source/
  ├── Wikidata/CLICKHOUSE_INGESTION.md  # Wikidata documentation
  ├── CLICKHOUSE_README.md               # General ClickHouse guide
  └── DATA_INGESTION_STATUS.md           # Overall status

.mdxdb/
  └── schema.ts                    # SQLite schema (matches ClickHouse)
```

## Performance Tips

1. **Memory**: Allocate 16-32GB RAM for Wikidata ingestion
2. **Threads**: Increase `max_threads` and `max_insert_threads` to 8-16
3. **Batch Size**: Use `max_insert_block_size = 100000` for large imports
4. **Network**: Increase `max_download_threads` for faster streaming
5. **Storage**: Use SSD for ClickHouse data directory

## Monitoring

### Current Ingestion Status

```bash
# Check staging table size
SELECT formatReadableSize(sum(bytes))
FROM system.parts
WHERE table = 'wikidata_staging';

# Check transformation progress
SELECT
  (SELECT count() FROM things) /
  (SELECT count() FROM wikidata_staging) as progress_pct;

# Running queries
SELECT query_id, formatReadableTimeDelta(elapsed), query
FROM system.processes;
```

### Resource Usage

```bash
# Memory
SELECT formatReadableSize(value)
FROM system.metrics
WHERE metric = 'MemoryTracking';

# Disk I/O
SELECT formatReadableSize(sum(bytes)) as total_written
FROM system.query_log
WHERE type = 'QueryFinish';
```

## Next Steps

1. ✅ **ClickHouse Setup** - Scripts ready (`.scripts/start-clickhouse.sh`)
2. ✅ **Wikidata Pipeline** - SQL ready (`.scripts/ingest-wikidata.sql`)
3. 🔄 **Wikipedia Download** - In progress (3.0GB / 22.9GB)
4. ⏳ **Wikipedia Ingestion** - Script ready, pending download completion
5. ⏳ **GeoNames Ingestion** - Scripts ready
6. ⏳ **ClickHouse → SQLite Export** - Implementation pending

## Resources

- [ClickHouse Documentation](https://clickhouse.com/docs)
- [ClickHouse SQL Reference](https://clickhouse.com/docs/en/sql-reference/)
- [Wikidata JSON Format](https://www.wikidata.org/wiki/Wikidata:Data_access)
- [Wikipedia Dumps](https://dumps.wikimedia.org/)
- [GeoNames Downloads](https://download.geonames.org/)

---

**Status**: Ready for Wikidata ingestion. Wikipedia download 13% complete (3GB/23GB).

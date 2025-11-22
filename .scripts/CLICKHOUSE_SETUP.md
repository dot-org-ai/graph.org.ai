# ClickHouse Setup Guide

## Overview

ClickHouse will be used for large-scale data ingestion (Wikidata, Wikipedia, GeoNames) and transformation into the mdxdb Things/Relationships schema.

## Installation Options

### Option 1: Docker (Recommended for Development)

```bash
# Start ClickHouse with persistent storage
docker run -d \
  --name clickhouse-server \
  -p 8123:8123 \
  -p 9000:9000 \
  -v clickhouse_data:/var/lib/clickhouse \
  -v clickhouse_logs:/var/log/clickhouse-server \
  --ulimit nofile=262144:262144 \
  clickhouse/clickhouse-server

# Verify it's running
docker ps | grep clickhouse

# Connect to ClickHouse client
docker exec -it clickhouse-server clickhouse-client

# Or use HTTP interface
curl http://localhost:8123/ping
```

### Option 2: Homebrew (macOS)

```bash
brew install clickhouse
brew services start clickhouse

# Connect
clickhouse-client
```

### Option 3: Cloud (Production)

- **ClickHouse Cloud**: https://clickhouse.com/cloud
- **AWS**: https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc
- **GCP**: https://console.cloud.google.com/marketplace/product/clickhouse-public/clickhouse

## Running Wikidata Ingestion

Once ClickHouse is running:

```bash
# Option 1: Using clickhouse-client
clickhouse-client < .scripts/ingest-wikidata.sql

# Option 2: Using Docker
docker exec -i clickhouse-server clickhouse-client < .scripts/ingest-wikidata.sql

# Option 3: Using HTTP interface
curl -X POST http://localhost:8123 --data-binary @.scripts/ingest-wikidata.sql
```

## Monitoring Progress

```bash
# Connect to client
docker exec -it clickhouse-server clickhouse-client

# Check if streaming has started
SELECT count() FROM graph_org_ai.wikidata_staging;

# Monitor storage usage
SELECT
    table,
    formatReadableSize(sum(bytes)) as size,
    formatReadableQuantity(sum(rows)) as rows
FROM system.parts
WHERE database = 'graph_org_ai'
GROUP BY table
ORDER BY sum(bytes) DESC;

# Check current queries running
SELECT
    query_id,
    user,
    formatReadableTimeDelta(elapsed) as running_for,
    formatReadableSize(memory_usage) as memory,
    query
FROM system.processes;

# View query log
SELECT
    query_duration_ms / 1000 as duration_sec,
    formatReadableSize(memory_usage) as memory,
    substring(query, 1, 100) as query_preview
FROM system.query_log
WHERE type = 'QueryFinish'
ORDER BY event_time DESC
LIMIT 10;
```

## Performance Tuning

For large Wikidata ingestion, you may need to adjust settings:

```sql
-- Increase memory limits
SET max_memory_usage = 50000000000;  -- 50GB
SET max_bytes_before_external_group_by = 20000000000;  -- 20GB

-- Increase thread count
SET max_threads = 16;
SET max_insert_threads = 8;

-- For url() function
SET max_download_threads = 8;
SET max_download_buffer_size = 10485760;  -- 10MB
```

## Estimated Resources

### Wikidata Ingestion
- **Download**: 130GB compressed (will stream, not store locally)
- **Staging Table**: ~100-150GB (with ZSTD compression)
- **Things Table**: ~50-80GB
- **Relationships Table**: ~150-200GB
- **Total Storage**: ~300-400GB
- **RAM**: 16GB minimum, 32GB+ recommended
- **Processing Time**: 24-48 hours

### Wikipedia Ingestion
- **Download**: 22.9GB compressed
- **Storage**: ~10-15GB in ClickHouse
- **RAM**: 8GB minimum
- **Processing Time**: 4-6 hours

## Troubleshooting

### Out of Memory
```sql
-- Check memory usage
SELECT formatReadableSize(value) FROM system.metrics WHERE metric = 'MemoryTracking';

-- Reduce batch size
SET max_insert_block_size = 50000;

-- Use external sorting
SET max_bytes_before_external_sort = 10000000000;
```

### Slow Network
```sql
-- Reduce download threads
SET max_download_threads = 2;

-- Increase timeout
SET receive_timeout = 600;  -- 10 minutes
```

### Disk Space Issues
```bash
# Check disk usage
docker exec clickhouse-server df -h

# Clean up old parts
docker exec -it clickhouse-server clickhouse-client
OPTIMIZE TABLE graph_org_ai.wikidata_staging FINAL;

# Drop staging table after transformation
DROP TABLE IF EXISTS graph_org_ai.wikidata_staging;
```

## Backup and Export

### Export to TSV
```bash
# Export things table
clickhouse-client --query "SELECT * FROM graph_org_ai.things FORMAT TSVWithNames" > things.tsv

# Export with compression
clickhouse-client --query "SELECT * FROM graph_org_ai.things FORMAT TSVWithNames" | gzip > things.tsv.gz
```

### Backup Database
```bash
# Using clickhouse-backup tool
docker exec clickhouse-server clickhouse-backup create wikidata_backup

# Or manual copy
docker exec clickhouse-server tar czf /var/lib/clickhouse/backup.tar.gz /var/lib/clickhouse/data/graph_org_ai
```

## Integration with mdxdb

After ingestion, the ClickHouse `things` and `relationships` tables can be:

1. **Queried directly** via ClickHouse client or HTTP API
2. **Exported to SQLite** for local mdxdb usage
3. **Synced incrementally** using materialized views
4. **Accessed via ClickHouse connector** in the application

### Example: Export filtered data to SQLite

```typescript
import { createClient } from '@clickhouse/client';
import Database from 'better-sqlite3';

const ch = createClient({ host: 'http://localhost:8123' });
const db = new Database('.mdxdb/things.db');

// Get companies from ClickHouse
const result = await ch.query({
  query: 'SELECT * FROM graph_org_ai.things_companies LIMIT 10000',
  format: 'JSONEachRow',
});

const rows = await result.json();

// Insert into SQLite
const insert = db.prepare(`
  INSERT INTO things (ns, type, id, url, data, code, content, meta, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const row of rows) {
  insert.run(
    row.ns, row.type, row.id, row.url,
    row.data, row.code, row.content, row.meta,
    row.created_at, row.updated_at
  );
}
```

## Next Steps

1. **Start ClickHouse** using Docker command above
2. **Run ingestion** script: `docker exec -i clickhouse-server clickhouse-client < .scripts/ingest-wikidata.sql`
3. **Monitor progress** using queries above
4. **Wait 24-48 hours** for completion
5. **Verify data** using verification queries in the SQL script
6. **Export or integrate** with mdxdb as needed

## References

- [ClickHouse Documentation](https://clickhouse.com/docs)
- [ClickHouse Docker](https://hub.docker.com/r/clickhouse/clickhouse-server/)
- [ClickHouse Client Library](https://github.com/ClickHouse/clickhouse-js)

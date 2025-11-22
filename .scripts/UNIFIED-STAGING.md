# Unified Staging Table Architecture

## Overview

Created a unified staging table called `public.source` that consolidates data ingestion from multiple sources (Wikidata, Wiktionary, Crunchbase, etc.) into a single table with consistent structure.

## Table Schema

```sql
CREATE TABLE public.source (
  source String,                    -- 'wikidata', 'wiktionary', 'crunchbase', etc.
  data String CODEC(ZSTD),         -- Raw data string
  batch DateTime,                   -- Timestamp from start of ingest
  ingested DateTime DEFAULT now()   -- Timestamp when row was inserted
) ENGINE = MergeTree()
PARTITION BY source
ORDER BY (source, batch, ingested)
SETTINGS index_granularity = 8192
```

## Key Features

1. **Partitioned by source**: Enables efficient querying per source
2. **Ordered for time-series access**: Sorted by (source, batch, ingested)
3. **ZSTD compression**: Optimal compression for String data
4. **Automatic ingestion timestamp**: `ingested` field auto-populated on insert

## Scripts Created

### 1. Create Unified Table
```bash
npx tsx .scripts/create-unified-staging.ts
```
Creates or recreates the unified source table.

### 2. Wikidata Ingestion (Unified)
```bash
npx tsx .scripts/start-wikidata-stream-unified.ts
```
Streams Wikidata entities to unified table:
- Source: `wikidata`
- Data: Raw JSON entities (String type)
- Batch: Timestamp from ingest start
- Format: JSONAsString (auto-decodes Unicode)

### 3. Wiktionary Ingestion (Unified)
```bash
npx tsx .scripts/start-wiktionary-stream-unified.ts
```
Streams Wiktionary entries to unified table:
- Source: `wiktionary`
- Data: Raw JSONL lines
- Batch: Timestamp from ingest start
- Format: LineAsString

## Benefits Over Separate Tables

1. **Consistent structure**: All sources use same schema
2. **Easier monitoring**: Single table to query for all ingestion status
3. **Batch tracking**: Track different ingestion runs by batch timestamp
4. **Source comparison**: Easy to compare ingestion progress across sources
5. **Simpler maintenance**: One table to manage instead of N tables

## Example Queries

### Check ingestion progress by source
```sql
SELECT
  source,
  count() as row_count,
  min(batch) as first_batch,
  max(batch) as latest_batch,
  min(ingested) as first_ingested,
  max(ingested) as last_ingested
FROM public.source
GROUP BY source
ORDER BY source;
```

### Get latest batch for a specific source
```sql
SELECT *
FROM public.source
WHERE source = 'wikidata'
  AND batch = (SELECT max(batch) FROM public.source WHERE source = 'wikidata')
LIMIT 10;
```

### Monitor ingestion rate
```sql
SELECT
  source,
  toStartOfHour(ingested) as hour,
  count() as rows_per_hour
FROM public.source
WHERE ingested >= now() - INTERVAL 24 HOUR
GROUP BY source, hour
ORDER BY source, hour DESC;
```

## Migration from Old Scripts

### Old Approach (Separate Tables)
- `.scripts/start-wikidata-stream.ts` → `public.wikidata_staging`
- `.scripts/start-wiktionary-stream.ts` → `public.wiktionary_staging`

### New Approach (Unified Table)
- `.scripts/start-wikidata-stream-unified.ts` → `public.source` (source='wikidata')
- `.scripts/start-wiktionary-stream-unified.ts` → `public.source` (source='wiktionary')

## Next Steps

1. Update transformation scripts to read from unified table:
   ```sql
   -- Instead of: FROM public.wikidata_staging
   -- Use: FROM public.source WHERE source = 'wikidata'
   ```

2. Add more sources following the same pattern:
   - Crunchbase
   - Additional datasets
   - All use the same unified table structure

# Data Ingestion Status

## Overview

This document tracks the status of large-scale data ingestion into the graph.org.ai knowledge graph.

## Completed Data Sources

### 1. BLS OES (Occupational Employment Statistics)
✅ **Status**: Complete

- **Source**: Bureau of Labor Statistics - May 2024 OES Data
- **Records Processed**: 6,036,959 total records
- **Output Files**:
  - `Occupations.Wages.tsv` - 1,104 occupations with national wage data
  - `Occupations.Employment.tsv` - 1,104 occupations with employment data
  - `Occupations.Wages.ByLocation.tsv` - 236,711 occupation × location combinations
- **Storage**: TSV files in `.enrichment/` directory
- **Data Includes**:
  - Mean and median wages (hourly and annual)
  - Wage percentiles (10th, 25th, 75th, 90th)
  - Employment counts by location
  - 583 geographic areas (states, metro areas)

### 2. GeoNames (US States)
✅ **Status**: Partial (US states only)

- **Source**: GeoNames admin codes
- **Records**: 51 US states
- **Output**: `GeoNames.US.States.tsv`
- **Next Steps**: Full dataset ingestion to ClickHouse pending

## In Progress

### 3. Wikipedia (English)
🔄 **Status**: Downloading

- **Source**: English Wikipedia XML dump
- **Size**: 22.9 GB compressed
- **Progress**: 555 MB downloaded (2% complete)
- **Estimated Time**: ~2 hours remaining
- **Target**: ~6 million articles
- **Destination**: ClickHouse `wikipedia_articles` table
- **Script**: `.scripts/ingest-wikipedia-clickhouse.ts`

## Planned Data Sources

### 4. Wikidata
📋 **Status**: Ready to ingest

- **Source**: Wikidata JSON dump
- **Size**:
  - Compressed: ~130 GB (bz2)
  - Uncompressed: ~500 GB
- **Records**: 100+ million entities
- **Target Schema**:
  - `wikidata_things` - Entity metadata
  - `wikidata_relationships` - Claims and relationships
- **Estimated Processing**: 24-48 hours
- **Scripts Ready**:
  - `.scripts/ingest-wikidata-clickhouse.ts`
  - `.source/Wikidata/CLICKHOUSE_INGESTION.md`

### 5. GeoNames (Complete Dataset)
📋 **Status**: Ready to ingest

- **Source**: GeoNames complete dump
- **Size**:
  - Geographic places: 396 MB → 1.5-2 GB (11M records)
  - Postal codes: 19 MB → 100-150 MB (1M records)
  - Country codes: 35 KB (250 records)
- **Target Schema**:
  - `geo_places` - All worldwide places
  - `postal_codes` - Global postal codes
  - `countries` - Country metadata
- **Scripts Ready**:
  - `.scripts/ingest-geonames-clickhouse.ts`
  - `.source/GeoNames/CLICKHOUSE_PLAN.md`

## ClickHouse Schema

### Created Tables

```sql
-- Wikipedia
graph_org_ai.wikipedia_articles

-- Wikidata (ready to create)
graph_org_ai.wikidata_things
graph_org_ai.wikidata_relationships

-- GeoNames (ready to create)
graph_org_ai.geo_places
graph_org_ai.postal_codes
graph_org_ai.countries
```

### Schema Setup Script
- `.scripts/setup-clickhouse-schema.ts`

## Integration Points

### BLS OES → GeoNames
- Join on area codes and location names
- Enables wage analysis by specific cities/metros
- Geographic visualization of labor markets

### Wikipedia → Wikidata
- Link via Wikidata IDs in Wikipedia sitelinks
- Enrich articles with structured data from Wikidata
- Cross-reference entities across both sources

### Wikidata → GeoNames
- Match coordinate locations
- Link headquarters/offices to specific places
- Geo-spatial queries for organizations

### All Sources → Things + Relationships
- Materialized views to map into graph schema
- Entity resolution across sources
- Unified knowledge graph queries

## Next Steps

1. **Complete Wikipedia Download** (~2 hours)
   - Then run ingestion script (~4 hours processing)

2. **Download Wikidata Dump**
   ```bash
   cd .source/Wikidata
   wget https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.bz2
   ```
   - ~130 GB download (~4-6 hours)
   - Run ingestion script (~24-48 hours processing)

3. **Download GeoNames Data**
   ```bash
   cd .source/GeoNames
   wget https://download.geonames.org/export/dump/allCountries.zip
   unzip allCountries.zip
   wget https://download.geonames.org/export/zip/allCountries.zip -O postal_codes.zip
   unzip postal_codes.zip
   ```
   - Run ingestion script (~10-20 minutes)

4. **Create Materialized Views**
   - Map Wikidata to Things + Relationships
   - Map Wikipedia to Things
   - Create cross-source entity resolution

## Storage Estimates

| Source | Raw | ClickHouse | TSV Files |
|--------|-----|------------|-----------|
| BLS OES | 317 MB | N/A | 20 MB |
| GeoNames | 2 GB | 600 MB-1.1 GB | 10 MB |
| Wikipedia | 22.9 GB | 5-10 GB | N/A |
| Wikidata | 500 GB | 200-300 GB | N/A |
| **Total** | **~525 GB** | **~210-310 GB** | **30 MB** |

## Performance Notes

### ClickHouse Benefits
- 5-10x compression ratio
- Sub-second queries on millions of records
- Streaming ingestion support
- Built-in geo-spatial functions
- Materialized views for denormalization

### Processing Times
- BLS OES: ~3 minutes (completed)
- GeoNames: ~10-20 minutes (estimated)
- Wikipedia: ~4 hours (estimated)
- Wikidata: ~24-48 hours (estimated)

## Documentation

- [ClickHouse Ingestion Guide](.source/CLICKHOUSE_README.md)
- [GeoNames ClickHouse Plan](.source/GeoNames/CLICKHOUSE_PLAN.md)
- [Wikidata ClickHouse Ingestion](.source/Wikidata/CLICKHOUSE_INGESTION.md)

## Scripts

### Ingestion Scripts
- `.scripts/ingest-geonames-clickhouse.ts`
- `.scripts/ingest-wikipedia-clickhouse.ts`
- `.scripts/ingest-wikidata-clickhouse.ts`
- `.scripts/setup-clickhouse-schema.ts`

### BLS Processing Scripts
- `.scripts/process-oes-with-metadata.ts`
- `.scripts/create-location-wage-enrichments.ts`
- `.scripts/download-bls-metadata.ts`

## Last Updated

2025-11-22 06:39 PST

---

*Note: All large datasets are configured to ingest directly to ClickHouse for optimal storage and query performance.*

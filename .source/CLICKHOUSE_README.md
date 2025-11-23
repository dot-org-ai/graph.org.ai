# ClickHouse Data Ingestion

This directory contains scripts for ingesting large-scale data sources (GeoNames, Wikipedia) directly into ClickHouse for fast querying and analysis.

## Overview

### Why ClickHouse?

- **Fast Ingestion**: 11M+ records in ~1-2 minutes
- **Compression**: 5-10x compression ratio
- **Fast Queries**: Sub-second queries on millions of records
- **Geo-spatial Functions**: Built-in distance calculations
- **Scalability**: Can handle billions of records

### Data Sources

1. **GeoNames** - 11M+ geographic places, 1M+ postal codes, 250+ countries
2. **Wikipedia** - 6M+ English articles (other languages available)

## Setup

### 1. Install ClickHouse

**Using Docker:**
```bash
docker run -d -p 8123:8123 -p 9000:9000 \
  --name clickhouse \
  -v clickhouse_data:/var/lib/clickhouse \
  clickhouse/clickhouse-server
```

**Using Homebrew (macOS):**
```bash
brew install clickhouse
clickhouse-server
```

### 2. Create Schema

```bash
npx tsx .scripts/setup-clickhouse-schema.ts
```

This creates:
- `graph_org_ai.geo_places` - Geographic places
- `graph_org_ai.postal_codes` - Postal codes
- `graph_org_ai.countries` - Country information
- `graph_org_ai.wikipedia_articles` - Wikipedia articles

## GeoNames Ingestion

### Download Data

```bash
# Geographic places (396 MB compressed → ~1.5-2 GB uncompressed)
wget https://download.geonames.org/export/dump/allCountries.zip
unzip allCountries.zip

# Postal codes (19 MB compressed → ~100-150 MB uncompressed)
wget https://download.geonames.org/export/zip/allCountries.zip -O postal_codes.zip
unzip postal_codes.zip -d postal/

# Country codes (small file)
wget https://download.geonames.org/export/dump/countryInfo.txt
```

### Run Ingestion

```bash
npx tsx .scripts/ingest-geonames-clickhouse.ts
```

### Expected Results

- **geo_places**: ~11 million records
- **postal_codes**: ~1 million records
- **countries**: ~250 records
- **Storage**: ~600 MB-1.1 GB (with compression)

### Sample Queries

```sql
-- Find places by postal code
SELECT * FROM graph_org_ai.postal_codes
WHERE country_code = 'US' AND postal_code = '94103';

-- Find all major cities in a country
SELECT name, admin1_code as state, population
FROM graph_org_ai.geo_places
WHERE country_code = 'US'
  AND feature_class = 'P'
  AND population > 100000
ORDER BY population DESC;

-- Geo-spatial search (places near San Francisco)
SELECT name, population,
       geoDistance(longitude, latitude, -122.4194, 37.7749) AS distance
FROM graph_org_ai.geo_places
WHERE country_code = 'US'
  AND feature_class = 'P'
HAVING distance < 50000  -- 50km radius
ORDER BY distance
LIMIT 100;
```

## Wikipedia Ingestion

### Download Wikipedia Dump

```bash
# English Wikipedia (~20 GB compressed)
wget https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-pages-articles.xml.bz2

# Or other languages
wget https://dumps.wikimedia.org/frwiki/latest/frwiki-latest-pages-articles.xml.bz2
```

### Run Ingestion

```bash
# English Wikipedia
npx tsx .scripts/ingest-wikipedia-clickhouse.ts ./enwiki-latest-pages-articles.xml.bz2 en

# French Wikipedia
npx tsx .scripts/ingest-wikipedia-clickhouse.ts ./frwiki-latest-pages-articles.xml.bz2 fr
```

**Note:** Processing takes ~4 hours for English Wikipedia (~6M articles)

### Expected Results

- **wikipedia_articles**: ~6 million records (English)
- **Storage**: Varies by language
- Includes: title, description, text, categories, infoboxes, coordinates

### Sample Queries

```sql
-- Count articles by namespace
SELECT namespace, count() as count
FROM graph_org_ai.wikipedia_articles
GROUP BY namespace
ORDER BY count DESC;

-- Find articles with geographic coordinates
SELECT title, description, coordinates
FROM graph_org_ai.wikipedia_articles
WHERE coordinates IS NOT NULL
LIMIT 100;

-- Top infobox types
SELECT infobox_type, count() as count
FROM graph_org_ai.wikipedia_articles
WHERE infobox_type != ''
GROUP BY infobox_type
ORDER BY count DESC
LIMIT 10;

-- Search by category
SELECT title, description
FROM graph_org_ai.wikipedia_articles
WHERE has(categories, 'Companies based in California')
LIMIT 100;
```

## Integration with Knowledge Graph

### Use Cases

1. **Location-Based Wage Analysis**
   - Join BLS OES wage data with GeoNames locations
   - Calculate labor costs by city/metro area
   - Map occupations to specific regions

2. **Industry-Location Mapping**
   - Link NAICS industries to geographic areas
   - Identify industry clusters by region
   - Analyze regional economic patterns

3. **Entity Enrichment**
   - Use Wikipedia infoboxes for company/organization data
   - Extract structured information about people, places, things
   - Link entities across datasets using coordinates

4. **Geo-coding**
   - Convert addresses to coordinates
   - Standardize location names
   - Validate postal codes

### Example Cross-Dataset Query

```sql
-- Find tech companies in the Bay Area with wage data
SELECT
  w.title as company,
  w.description,
  g.name as city,
  o.occupationTitle,
  o.annualMeanWage
FROM graph_org_ai.wikipedia_articles w
JOIN graph_org_ai.geo_places g
  ON tupleElement(w.coordinates, 1) BETWEEN g.latitude - 0.1 AND g.latitude + 0.1
  AND tupleElement(w.coordinates, 2) BETWEEN g.longitude - 0.1 AND g.longitude + 0.1
JOIN graph_org_ai.occupations o
  ON o.industry = 'Technology'
WHERE has(w.categories, 'Technology companies')
  AND g.country_code = 'US'
  AND g.admin1_code = 'CA'
LIMIT 100;
```

## Performance Tips

1. **Batch Inserts**: Use batches of 1000-10000 records
2. **Streaming**: Stream large files directly to ClickHouse
3. **Compression**: Use compressed formats (gzip, bz2)
4. **Indexes**: Create appropriate indexes for your query patterns
5. **Partitioning**: Partition large tables by country/date

## Troubleshooting

### Connection Issues

```bash
# Test ClickHouse connection
curl http://localhost:8123/ping

# Check if ClickHouse is running
docker ps | grep clickhouse
```

### Out of Memory

- Process data in smaller batches
- Increase ClickHouse memory limits
- Use streaming instead of loading entire files

### Slow Queries

- Add appropriate indexes
- Optimize ORDER BY columns
- Use PREWHERE instead of WHERE for filtering

## Environment Variables

```bash
# ClickHouse connection
export CLICKHOUSE_URL=http://localhost:8123

# For cloud deployments
export CLICKHOUSE_URL=https://your-instance.clickhouse.cloud:8443
export CLICKHOUSE_USER=default
export CLICKHOUSE_PASSWORD=your-password
```

## Sources

- [GeoNames](https://www.geonames.org/)
- [GeoNames Download Server](https://download.geonames.org/)
- [Wikipedia Dumps](https://dumps.wikimedia.org/)
- [dumpster-dip](https://github.com/spencermountain/dumpster-dip)
- [ClickHouse Documentation](https://clickhouse.com/docs)

# Wikimedia Ingestion Workflow

This GitHub Actions workflow automates the download and ingestion of Wikimedia dumps into ClickHouse.

## Setup

1. Add the following secrets to your GitHub repository:
   - `CLICKHOUSE_URL` - Your ClickHouse server URL (e.g., `https://your-server.clickhouse.cloud:8443`)
   - `CLICKHOUSE_USERNAME` - Your ClickHouse username
   - `CLICKHOUSE_PASSWORD` - Your ClickHouse password

2. The workflow uses the modified `dumpster-dive` repository with ClickHouse support

## Usage

### Run from GitHub UI

1. Go to Actions tab in your repository
2. Select "Ingest Wikimedia Dumps" workflow
3. Click "Run workflow"
4. Select which source to ingest:
   - `wikipedia` - English Wikipedia (~105GB compressed, ~22GB decompressed)
   - `wikinews` - English Wikinews (~44MB compressed)
   - `wiktionary` - English Wiktionary (~1.4GB compressed)
   - `wikiquote` - English Wikiquote (~30MB compressed)
   - `wikibooks` - English Wikibooks (~180MB compressed)
   - `wikiversity` - English Wikiversity (~50MB compressed)
   - `all` - All sources (requires ~6+ hours)

### Run from GitHub CLI

```bash
# Ingest Wikipedia
gh workflow run ingest-wikimedia.yml -f source=wikipedia

# Ingest Wikinews
gh workflow run ingest-wikimedia.yml -f source=wikinews

# Ingest all sources
gh workflow run ingest-wikimedia.yml -f source=all
```

## Features

- **Automatic download**: Downloads latest dumps from dumps.wikimedia.org
- **Resume support**: Uses `wget -c` to resume interrupted downloads
- **Parallel processing**: Uses 28 workers for fast ingestion
- **Separate tables**: Each source gets its own ClickHouse table (source.wikipedia, source.wikinews, etc.)
- **Log preservation**: Uploads ingestion logs as artifacts
- **6-hour timeout**: Enough time for large dumps like Wikipedia

## ClickHouse Tables

The workflow creates tables in the `source` database:

- `source.wikipedia` - Wikipedia articles
- `source.wikinews` - Wikinews articles
- `source.wiktionary` - Wiktionary entries
- `source.wikiquote` - Wikiquote entries
- `source.wikibooks` - Wikibooks content
- `source.wikiversity` - Wikiversity content

All tables use the same schema:
```sql
CREATE TABLE source.{name} (
  id UInt64,
  title String,
  namespace UInt32,
  redirect String,
  text String CODEC(ZSTD),
  timestamp DateTime,
  contributor_username String,
  contributor_id UInt64,
  comment String,
  model String,
  format String,
  sha1 String
) ENGINE = MergeTree()
ORDER BY (namespace, title, id)
```

## Estimated Run Times

On GitHub Actions standard runners:

- Wikipedia: ~4-5 hours (download + ingestion)
- Wikinews: ~5-10 minutes
- Wiktionary: ~30-45 minutes
- Wikiquote: ~5-10 minutes
- Wikibooks: ~15-20 minutes
- Wikiversity: ~10-15 minutes
- All sources: ~6+ hours

## Troubleshooting

### Workflow times out
- For Wikipedia, increase the `timeout-minutes` value in the workflow
- Or run smaller sources separately instead of using `all`

### ClickHouse connection errors
- Verify your secrets are set correctly
- Check your ClickHouse server allows connections from GitHub Actions IPs
- Test connection with a simple query first

### Download fails
- The workflow uses resume support (`wget -c`)
- Simply re-run the workflow and it will continue from where it stopped

## Monitoring

- Check the Actions tab for real-time progress
- Download artifacts to view detailed ingestion logs
- Use ClickHouse to monitor data ingestion:
  ```sql
  SELECT count() FROM source.wikipedia;
  SELECT count() FROM source.wikinews;
  -- etc.
  ```

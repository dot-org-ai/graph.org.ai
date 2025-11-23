# USPTO Trademark Ingestion Script

## Overview
`ingest-uspto-trademarks.ts` is a TypeScript script that ingests USPTO trademark data from the daily JSON feed into ClickHouse.

**Source**: https://bulkdata.uspto.gov/data/trademark/dailyxml/applications/json/

## Script Location
```
/Users/nathanclevenger/projects/graph.org.ai/.scripts/ingest-uspto-trademarks.ts
```

## Features

### Data Handling
- **Directory Listing**: Automatically fetches USPTO directory listing and finds most recent JSON zip file
- **Download**: Downloads zip files with progress tracking (files range 10-50MB)
- **Extraction**: Unzips JSON files using system `unzip` command
- **Parsing**: Parses JSON and extracts key trademark fields
- **Batch Insertion**: Inserts records in batches of 1000 for optimal performance
- **Graceful Degradation**: Falls back to sample data if USPTO server is unreachable

### Error Handling
- Connection validation before processing
- HTTP error handling with detailed messages
- Zip file extraction validation
- Automatic cleanup of temporary files
- Detailed error messages with stack traces

### Performance
- Batch processing: 1000 records per batch
- Configurable batch size (BATCH_SIZE constant)
- Request timeout: 60 minutes for large datasets
- ClickHouse insert optimization settings

## Database Schema

### Table: `source.uspto_trademarks`

| Column | Type | Notes |
|--------|------|-------|
| serial_number | String | Unique trademark application serial number |
| registration_number | String | Registration number (empty if not registered) |
| mark_text | String | The actual mark/trademark text |
| owner_name | String | Company or individual owning the trademark |
| filing_date | Date (nullable) | Date the trademark was filed |
| registration_date | Date (nullable) | Date the trademark was registered |
| status | String | Current status (ACTIVE, PENDING, FILED, etc.) |
| ingested_at | DateTime | Timestamp when record was ingested |

### Indices
- Primary sort key: `(serial_number, registration_number)`
- Engine: MergeTree (optimized for analytical queries)

## Execution

### Basic Usage
```bash
tsx .scripts/ingest-uspto-trademarks.ts
```

### What It Does
1. Connects to ClickHouse database
2. Creates table if it doesn't exist
3. Fetches USPTO directory listing
4. Downloads most recent JSON zip file
5. Extracts and parses JSON
6. Inserts records in batches
7. Verifies ingestion with sample records
8. Cleans up temporary files

### Expected Output
```
™️  Starting USPTO Trademark Ingestion

📡 Server: https://jr0jywmccu.us-east-1.aws.clickhouse.cloud:8443

🔍 Testing connection...
✅ Connected

📋 Creating table if not exists...
✅ Table ready

🔍 Fetching directory listing from USPTO...
   URL: https://bulkdata.uspto.gov/data/trademark/dailyxml/applications/json/

📥 Downloading apc_2025_01_19_1.json.zip...
✅ Downloaded: apc_2025_01_19_1.json.zip (25.50 MB)

📦 Extracting JSON from zip...
✅ Extracted: apc_2025_01_19_1.json

💾 Inserting records in batches...
📖 Parsing JSON file...
📊 Found 50000 records in JSON

   Batch 1: inserted 1000 records (1000 total)
   Batch 2: inserted 1000 records (2000 total)
   ...
   Batch 50: inserted 1000 records (50000 total)

✅ Ingestion complete in 2m 15s
📊 Total trademarks ingested: 50000

📊 Verification: 50000 records in database

📝 Sample records:
   90123456: "EXAMPLE" by Example Corporation
   90234567: "TECH SOLUTIONS" by Tech Solutions Inc
   ...
```

## Data Format

### Input JSON Structure
The USPTO JSON feed typically has the following structure:

```json
[
  {
    "serialNumber": "90123456",
    "registrationNumber": "5123456",
    "markIdentification": "EXAMPLE",
    "ownerName": "Example Corporation",
    "filingDate": "2024-01-15",
    "registrationDate": "2024-06-20",
    "statusCode": "ACTIVE"
  },
  ...
]
```

### Date Handling
The script automatically parses multiple date formats:
- ISO format: `2024-01-15`
- US format: `01/15/2024`
- ISO with time: `2024-01-15T10:30:00Z` (extracts date portion)

Null/missing dates are preserved as NULL in the database.

## Configuration

### Environment Variables (from .env)
- `CLICKHOUSE_URL`: ClickHouse server URL
- `CLICKHOUSE_USERNAME`: Username (default: "default")
- `CLICKHOUSE_PASSWORD`: Password

### Constants (in script)
```typescript
const BATCH_SIZE = 1000;           // Records per batch
const TEMP_DIR = path.join(...);   // Temporary file directory
const BASE_URL = '...json/';       // USPTO directory URL
```

## Fallback Behavior

If the USPTO server is unreachable, the script:
1. Catches the error
2. Displays warning message
3. Creates sample data with 3 trademark records
4. Completes ingestion with sample data
5. Indicates in output that sample data was used

This ensures the script can be tested locally without external dependencies.

## Production Considerations

### File Size
- Daily files: 10-50 MB compressed
- Uncompressed JSON: 50-200 MB
- Extraction requires disk space for temporary files

### Performance
- Ingestion time: ~1-5 minutes for typical daily files
- Batch size (1000) is optimized for ClickHouse insert performance
- Recommend running during low-traffic periods

### Frequency
- Run daily to stay current with USPTO releases
- Files are published daily on USPTO bulk data server
- New files typically available by 8 AM ET

### Cleanup
- Script automatically cleans up extracted JSON files
- Downloaded zip files are cached in `.temp/` directory
- Previous runs reuse downloaded files if still present

### Monitoring
- Check `ingested_at` column to identify stale data
- Monitor ClickHouse for query performance
- Set up alerts for failed ingestion runs

## Testing

### Manual Test with Sample Data
The script includes built-in fallback to sample data:
```bash
tsx .scripts/ingest-uspto-trademarks.ts
# Uses sample data if USPTO is unreachable
```

### Test with Custom JSON
Replace the extracted JSON file or modify `createSampleJsonFile()` function.

### Verify Data
```bash
tsx .scripts/check-uspto-table.ts  # Check table schema and data
```

## Verification Queries

### Record Count
```sql
SELECT count() FROM source.uspto_trademarks;
```

### Recent Ingestions
```sql
SELECT
  toDate(ingested_at) as date,
  count() as count
FROM source.uspto_trademarks
GROUP BY date
ORDER BY date DESC;
```

### Status Distribution
```sql
SELECT
  status,
  count() as count
FROM source.uspto_trademarks
GROUP BY status
ORDER BY count DESC;
```

### Registered vs Pending
```sql
SELECT
  count(CASE WHEN registration_number != '' THEN 1 END) as registered,
  count(CASE WHEN registration_number = '' THEN 1 END) as not_registered
FROM source.uspto_trademarks;
```

## Troubleshooting

### Connection Issues
- Verify ClickHouse server is running and accessible
- Check `.env` file has correct credentials
- Ensure network connectivity to ClickHouse

### Download Errors
- Check if USPTO server is accessible: https://bulkdata.uspto.gov/
- Verify internet connectivity
- Try again after a few minutes

### Extraction Errors
- Ensure `unzip` command is available on system (macOS/Linux)
- Check disk space for temporary files
- Verify downloaded zip file is not corrupted

### Ingestion Errors
- Check ClickHouse has sufficient disk space
- Verify table schema hasn't changed
- Check for conflicting inserts from other processes

### No Files Found
- USPTO may not have published files yet
- Check directory URL: https://bulkdata.uspto.gov/data/trademark/dailyxml/applications/json/
- Verify HTML parsing regex matches current page format

## Dependencies

### External
- ClickHouse server (AWS or self-hosted)
- Node.js 18+
- `unzip` command-line utility (macOS/Linux)

### Node Packages
- `@clickhouse/client`: ^1.14.0
- `dotenv`: ^17.2.3
- Standard Node.js modules: `fs`, `zlib`, `path`, `stream`

## License
Part of graph.org.ai data ingestion pipeline

## Support
For issues, check:
1. USPTO data source availability
2. ClickHouse connectivity
3. .env configuration
4. Disk space and permissions
5. Script execution logs

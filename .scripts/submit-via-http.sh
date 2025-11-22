#!/bin/bash

# Submit Wikidata Stream via HTTP POST
# This will run server-side without keeping a client connection

source .env

# URL encode the query
QUERY='INSERT INTO public.wikidata_staging
SELECT
  trimBoth(trim(TRAILING '\'','\'' FROM json))::JSON as entity
FROM url(
  '\''https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.bz2'\'',
  JSONAsString
)
WHERE json != '\''['\'' AND json != '\'']'\'' AND length(trim(json)) > 2
SETTINGS
  max_insert_block_size = 100000,
  max_insert_threads = 8,
  max_download_threads = 4,
  max_download_buffer_size = 1048576,
  input_format_allow_errors_ratio = 0.1,
  input_format_allow_errors_num = 10000'

echo "🚀 Submitting query via HTTP..."
echo ""

# Extract hostname from CLICKHOUSE_URL
# Format: https://user:pass@host:port
HOST=$(echo "$CLICKHOUSE_URL" | sed 's|https://||' | sed 's|http://||' | cut -d@ -f2)
USER=$(echo "$CLICKHOUSE_URL" | sed 's|https://||' | sed 's|http://||' | cut -d: -f1)
PASS=$(echo "$CLICKHOUSE_URL" | sed 's|https://||' | sed 's|http://||' | cut -d: -f2 | cut -d@ -f1)

# Submit query with async mode
curl -X POST \
  "https://${HOST}/?wait_end_of_query=0&send_timeout=10&receive_timeout=10" \
  -u "${CLICKHOUSE_USERNAME}:${CLICKHOUSE_PASSWORD}" \
  --data-binary "$QUERY" \
  -v

echo ""
echo "✅ Query submitted!"
echo ""
echo "📊 Check status with:"
echo "   npx tsx .scripts/verify-stream-status.ts"

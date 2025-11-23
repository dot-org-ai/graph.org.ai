# Batch Embeddings Worker

Cloudflare Worker for generating embeddings at scale using Workers AI and storing them in ClickHouse.

## Features

- **Synchronous embedding generation** via HTTP POST
- **Event subscription support** for async batch processing
- **ClickHouse integration** for storing embeddings
- **Automatic batching** to handle large datasets
- **BGE-M3 model** (1024-dimensional embeddings)

## Setup

### 1. Install dependencies

```bash
cd .packages/batch
pnpm install
```

### 2. Configure secrets

```bash
wrangler secret put CLICKHOUSE_URL
wrangler secret put CLICKHOUSE_USERNAME
wrangler secret put CLICKHOUSE_PASSWORD
```

### 3. Deploy

```bash
pnpm run deploy
```

## API

### POST /embed

Generate embeddings synchronously and store in ClickHouse.

**Request:**
```json
{
  "items": [
    {
      "url": "apqc/Process/Example",
      "text": "Process description here"
    }
  ],
  "batchSize": 100
}
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "dimension": 1024
}
```

### POST /events

Webhook endpoint for Workers AI event subscriptions (batch completion notifications).

### GET /

Health check endpoint.

## Development

```bash
# Run locally
pnpm run dev

# Generate types
pnpm run cf-typegen
```

## Architecture

1. **HTTP Handler** - Receives embedding requests
2. **Batch Processing** - Splits large requests into optimal batch sizes
3. **Workers AI** - Generates embeddings using bge-m3 model
4. **ClickHouse Storage** - Stores embeddings in searches table
5. **Event Subscriptions** - Handles async batch completion (future)

## Batch Size Optimization

The worker uses a default batch size of 100 items. Run the test script to find optimal sizes:

```bash
tsx .scripts/test-batch-sizes.ts
```

## Integration

Use this worker from the batch embeddings script:

```typescript
// Instead of calling Cloudflare API directly
const response = await fetch('https://batch-embeddings.your-subdomain.workers.dev/embed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items })
})
```

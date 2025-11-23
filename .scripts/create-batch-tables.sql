-- Batch processing tables for Cloudflare Workers AI embeddings

-- embedding_batches: Track batch jobs submitted to Cloudflare
CREATE TABLE IF NOT EXISTS embedding_batches (
  batchId String,
  status String, -- 'pending', 'processing', 'completed', 'failed'
  model String DEFAULT 'bge-m3',
  itemCount UInt32,
  createdAt DateTime DEFAULT now(),
  submittedAt DateTime,
  completedAt DateTime,
  errorMessage String DEFAULT ''
) ENGINE = SharedMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY (status, createdAt)
SETTINGS index_granularity = 8192;

-- embedding_queue: Items staged for batch embedding generation
CREATE TABLE IF NOT EXISTS embedding_queue (
  queueId String, -- UUID for this queue item
  url String, -- Foreign key to things.url
  text String, -- Text to embed (name + content)
  batchId String DEFAULT '', -- Assigned batch ID when queued
  status String DEFAULT 'pending', -- 'pending', 'queued', 'processing', 'completed', 'failed'
  priority Int32 DEFAULT 0, -- Higher priority processed first
  createdAt DateTime DEFAULT now(),
  processedAt DateTime
) ENGINE = SharedMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY (status, priority DESC, createdAt)
SETTINGS index_granularity = 8192;

-- Add embedding column to things table (if not exists)
-- ALTER TABLE things ADD COLUMN IF NOT EXISTS embedding Array(Float32);

-- Create index on embedding_queue for efficient batch assignment
-- Note: This would be done separately if needed
-- CREATE INDEX IF NOT EXISTS idx_queue_status ON embedding_queue(status) TYPE minmax GRANULARITY 4;

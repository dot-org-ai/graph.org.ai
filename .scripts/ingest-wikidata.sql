-- Wikidata → ClickHouse → Things/Relationships Pipeline
-- Stage 1: Stream Wikidata dump directly into staging table
-- Stage 2: Transform into mdxdb-compatible Things and Relationships tables

-- ============================================================================
-- STEP 1: Create ClickHouse Schema (matching mdxdb schema)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS public;

-- Things table (matches .mdxdb/schema.ts)
-- Using String with ZSTD compression for JSON fields
CREATE TABLE IF NOT EXISTS public.things (
    ns String,                              -- Namespace (e.g., 'wikidata')
    type String,                            -- Type within namespace (e.g., 'Q5' for human)
    id String,                              -- Unique ID within ns/type (e.g., 'Q42')
    url String,                             -- Primary key: defaults to ns/type/id or custom
    data String CODEC(ZSTD),               -- Structured data as JSON
    code String,                            -- Optional code/script content
    content String CODEC(ZSTD),            -- Text content (descriptions, etc.)
    meta String CODEC(ZSTD),               -- Metadata as JSON
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (ns, type, id)
PARTITION BY ns;

-- Relationships table (matches .mdxdb/schema.ts)
-- Using String with ZSTD compression for JSON fields
CREATE TABLE IF NOT EXISTS public.relationships (
    id UInt64,                              -- Auto-increment equivalent
    `from` String,                          -- Source thing URL
    predicate String,                       -- Relationship type
    reverse String,                         -- Optional reverse predicate
    `to` String,                            -- Target thing URL
    data String CODEC(ZSTD),               -- Optional metadata as JSON
    content String,                         -- Optional content about relationship
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (`from`, predicate, `to`)
PARTITION BY substring(predicate, 1, 2);

-- Searches table (for full-text and vector search)
-- Using String with ZSTD compression for JSON fields
CREATE TABLE IF NOT EXISTS public.searches (
    id UInt64,
    url String,
    text String,
    embedding Array(Float32),               -- Vector embedding
    meta String CODEC(ZSTD),               -- Metadata as JSON
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY url;

-- ============================================================================
-- STEP 2: Create Wikidata Staging Table
-- ============================================================================

-- Raw Wikidata entities (NDJSON format)
-- Using new JSON type for automatic Unicode decoding and better compression
CREATE TABLE IF NOT EXISTS public.wikidata_staging (
    entity JSON(max_dynamic_paths=2048)
) ENGINE = MergeTree()
ORDER BY tuple()
SETTINGS index_granularity = 8192;

-- ============================================================================
-- STEP 3: Stream Wikidata Dump into Staging
-- ============================================================================

-- This streams the entire 130GB compressed dump directly from Wikimedia
-- Processing time: 24-48 hours
-- No local download required!
-- Note: Using JSONAsString + trim to handle Wikidata's array format: [<newline>{"..."},<newline>...]
-- JSONAsString automatically decodes Unicode escapes, then we cast to JSON type

INSERT INTO public.wikidata_staging
SELECT
    trimBoth(trim(TRAILING ',' FROM json))::JSON as entity
FROM url(
    'https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.bz2',
    JSONAsString
)
WHERE json != '[' AND json != ']' AND length(trim(json)) > 2;

-- ============================================================================
-- STEP 4: Transform Wikidata Entities → Things
-- ============================================================================

-- Transform Wikidata entities into Things table
-- Schema: ns=https://wiki.org.ai, type=human-readable (from P31), id=Wikipedia_Style, code=Q-code
-- Using JSONExtract functions to work with JSON type
-- TODO: Resolve type Q-codes to labels with self-join in second pass

INSERT INTO public.things
SELECT
    'https://wiki.org.ai' AS ns,

    -- Type: Q-code from P31 (instance of), will be resolved to label in second pass
    coalesce(
        JSONExtractString(toJSONString(entity), 'claims', 'P31', '1', 'mainsnak', 'datavalue', 'value', 'id'),
        'item'
    ) AS type,

    -- ID: Wikipedia-style name (spaces replaced with underscores)
    replace(
        coalesce(
            JSONExtractString(toJSONString(entity), 'labels', 'en', 'value'),
            JSONExtractString(toJSONString(entity), 'id')
        ),
        ' ', '_'
    ) AS id,

    -- URL: https://wiki.org.ai/{type}/{id}
    concat(
        'https://wiki.org.ai/',
        coalesce(
            JSONExtractString(toJSONString(entity), 'claims', 'P31', '1', 'mainsnak', 'datavalue', 'value', 'id'),
            'item'
        ),
        '/',
        replace(
            coalesce(
                JSONExtractString(toJSONString(entity), 'labels', 'en', 'value'),
                JSONExtractString(toJSONString(entity), 'id')
            ),
            ' ', '_'
        )
    ) AS url,

    -- Data: Clean key:value pairs only (not the massive nested JSON)
    toJSONString(map(
        'qcode', JSONExtractString(toJSONString(entity), 'id'),
        'label', JSONExtractString(toJSONString(entity), 'labels', 'en', 'value'),
        'description', JSONExtractString(toJSONString(entity), 'descriptions', 'en', 'value'),
        'modified', JSONExtractString(toJSONString(entity), 'modified'),
        'entity_type', JSONExtractString(toJSONString(entity), 'type')
    )) AS data,

    -- Code: Store the Q-code (e.g., Q23 for George Washington)
    JSONExtractString(toJSONString(entity), 'id') AS code,

    -- Content: English label + description (Unicode properly decoded!)
    concat(
        coalesce(JSONExtractString(toJSONString(entity), 'labels', 'en', 'value'), ''),
        '\n\n',
        coalesce(JSONExtractString(toJSONString(entity), 'descriptions', 'en', 'value'), '')
    ) AS content,

    -- Meta: Store modified date
    toJSONString(map(
        'modified', JSONExtractString(toJSONString(entity), 'modified')
    )) AS meta,

    parseDateTime64BestEffortOrNull(JSONExtractString(toJSONString(entity), 'modified')) AS created_at,
    parseDateTime64BestEffortOrNull(JSONExtractString(toJSONString(entity), 'modified')) AS updated_at

FROM public.wikidata_staging
WHERE
    JSONExtractString(toJSONString(entity), 'id') != ''
    AND JSONExtractString(toJSONString(entity), 'labels', 'en', 'value') != ''  -- Only entities with English labels
SETTINGS
    max_insert_threads = 8,
    max_memory_usage = 20000000000;  -- 20GB memory limit

-- ============================================================================
-- STEP 4b: Resolve Type Q-codes to Human-Readable Names
-- ============================================================================

-- Update type field from Q-code to human-readable label
-- Uses self-join to look up type entity labels
UPDATE public.things t
SET type = replace(tl.content, '\n\n', '')  -- Extract just the label part
FROM (
    SELECT
        code,
        substring(content, 1, position('\n\n' IN content) - 1) as label
    FROM public.things
    WHERE ns = 'https://wiki.org.ai'
) tl
WHERE t.type = tl.code
AND t.ns = 'https://wiki.org.ai'
SETTINGS
    max_threads = 8;

-- ============================================================================
-- STEP 5: Transform Wikidata Claims → Relationships
-- ============================================================================

-- Extract relationships from Wikidata claims
-- Using JSONExtract functions to flatten nested JSON structure

INSERT INTO public.relationships
WITH
    -- Flatten claims into individual property-value pairs
    flattened_claims AS (
        SELECT
            JSONExtractString(toJSONString(entity), 'id') as entity_id,
            arrayJoin(JSONExtractKeys(toJSONString(entity), 'claims')) as property_key,
            JSONExtractString(toJSONString(entity), 'claims') as all_claims
        FROM public.wikidata_staging
        WHERE JSONExtractString(toJSONString(entity), 'id') != ''
        AND JSONHas(toJSONString(entity), 'claims')
    ),
    -- Extract individual claims for each property
    expanded_claims AS (
        SELECT
            entity_id,
            property_key,
            arrayJoin(JSONExtractArrayRaw(all_claims, property_key)) as claim
        FROM flattened_claims
    )

SELECT
    -- Generate sequential ID using row_number
    row_number() OVER () AS id,

    -- From: construct URL for source entity
    concat('wikidata/item/', entity_id) AS `from`,

    -- Predicate: use Wikidata property ID
    property_key AS predicate,

    -- Reverse: empty for now (can be populated later)
    '' AS reverse,

    -- To: construct URL for target entity (only for entity references)
    concat('wikidata/item/', JSONExtractString(claim, 'mainsnak', 'datavalue', 'value', 'id')) AS `to`,

    -- Data: store full claim as JSON string
    claim AS data,

    -- Content: empty
    '' AS content,

    now() AS created_at

FROM expanded_claims
WHERE
    JSONExtractString(claim, 'mainsnak', 'snaktype') = 'value'
    AND JSONExtractString(claim, 'mainsnak', 'datavalue', 'type') = 'wikibase-entityid'
    AND JSONExtractString(claim, 'mainsnak', 'datavalue', 'value', 'id') != ''
SETTINGS
    max_insert_threads = 8,
    max_memory_usage = 20000000000;

-- ============================================================================
-- STEP 6: Create Indexes for Performance
-- ============================================================================

-- Things indexes
ALTER TABLE public.things
ADD INDEX IF NOT EXISTS idx_ns (ns) TYPE set(100) GRANULARITY 4;

ALTER TABLE public.things
ADD INDEX IF NOT EXISTS idx_type (type) TYPE set(10000) GRANULARITY 4;

ALTER TABLE public.things
ADD INDEX IF NOT EXISTS idx_id (id) TYPE bloom_filter() GRANULARITY 1;

ALTER TABLE public.things
ADD INDEX IF NOT EXISTS idx_url (url) TYPE bloom_filter() GRANULARITY 1;

ALTER TABLE public.things
ADD INDEX IF NOT EXISTS idx_content (content) TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1;

-- Relationships indexes
ALTER TABLE public.relationships
ADD INDEX IF NOT EXISTS idx_from (`from`) TYPE bloom_filter() GRANULARITY 1;

ALTER TABLE public.relationships
ADD INDEX IF NOT EXISTS idx_to (`to`) TYPE bloom_filter() GRANULARITY 1;

ALTER TABLE public.relationships
ADD INDEX IF NOT EXISTS idx_predicate (predicate) TYPE set(1000) GRANULARITY 4;

-- ============================================================================
-- STEP 7: Create Filtered Materialized Views
-- ============================================================================

-- View: Companies and Organizations
CREATE MATERIALIZED VIEW IF NOT EXISTS public.things_companies
ENGINE = MergeTree()
ORDER BY url
AS SELECT *
FROM public.things
WHERE ns = 'wikidata'
AND type IN (
    'Q4830453',  -- business enterprise
    'Q783794',   -- company
    'Q891723',   -- public company
    'Q6881511',  -- enterprise
    'Q167037',   -- corporation
    'Q43229'     -- organization
);

-- View: Occupations and Professions
CREATE MATERIALIZED VIEW IF NOT EXISTS public.things_occupations
ENGINE = MergeTree()
ORDER BY url
AS SELECT *
FROM public.things
WHERE ns = 'wikidata'
AND type IN (
    'Q28640',    -- profession
    'Q12737077', -- occupation
    'Q192581'    -- job
);

-- View: Industries and Economic Sectors
CREATE MATERIALIZED VIEW IF NOT EXISTS public.things_industries
ENGINE = MergeTree()
ORDER BY url
AS SELECT *
FROM public.things
WHERE ns = 'wikidata'
AND type IN (
    'Q8148',     -- industry
    'Q268592',   -- economic sector
    'Q4830453'   -- business
);

-- ============================================================================
-- STEP 8: Verification Queries
-- ============================================================================

-- Count total things by namespace
SELECT
    ns,
    count() as count,
    formatReadableQuantity(count()) as formatted
FROM public.things
GROUP BY ns
ORDER BY count DESC;

-- Count things by type (top 20)
SELECT
    type,
    count() as count,
    formatReadableQuantity(count()) as formatted
FROM public.things
WHERE ns = 'wikidata'
GROUP BY type
ORDER BY count DESC
LIMIT 20;

-- Count relationships by predicate (top 20)
SELECT
    predicate,
    count() as count,
    formatReadableQuantity(count()) as formatted
FROM public.relationships
GROUP BY predicate
ORDER BY count DESC
LIMIT 20;

-- Sample companies
SELECT
    id,
    JSONExtractString(data, 'labels', 'en', 'value') as name,
    JSONExtractString(data, 'descriptions', 'en', 'value') as description
FROM public.things_companies
LIMIT 10;

-- Storage usage
SELECT
    table,
    formatReadableSize(sum(bytes)) as size,
    formatReadableQuantity(sum(rows)) as rows
FROM system.parts
WHERE database = 'public'
GROUP BY table
ORDER BY sum(bytes) DESC;

-- ============================================================================
-- STEP 9: Optional - Drop Staging Table to Save Space
-- ============================================================================

-- After transformation is complete and verified, optionally drop staging:
-- DROP TABLE IF EXISTS public.wikidata_staging;

-- This will free up significant disk space since the staging table
-- contains the full 130GB+ of compressed Wikidata dump

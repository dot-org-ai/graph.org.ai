# Digital Score Implementation Guide

## Overview

Digital scores are added to the existing mdxdb/ClickHouse `data` JSON field - **no schema changes needed**. ClickHouse automatically makes JSON fields columnar and queryable.

## Architecture

### 1. Data Flow

```
.enrichment/DigitalScores.tsv (Universal Scores)
            ↓
      [Lookup/Join during processing]
            ↓
.data/Tasks.tsv (with `digital` column)
.data/Processes.tsv (with `digital` column)
            ↓
      [Build to ClickHouse]
            ↓
mdxdb/ClickHouse (data.digital property)
            ↓
      [Aggregation Queries]
            ↓
Occupation/Industry Digital Scores
```

### 2. File Structure

**`.enrichment/DigitalScores.tsv`** - Source of truth for universal scores
```tsv
entity	entityType	codes	actionScore	eventScore	activityScore	resultScore	notes
8824	task	8824	1.0	1.0	null	null	Can schedule via API
10002	process	10002	0.85	1.0	0.85	0.95	Strategic planning - mostly digital
```

**`.data/Tasks.tsv`** - Contextual tasks with digital scores
```tsv
id	onetCode	taskId	task	occupationTitle	digital	importance	relevance
ChiefExecutives.confer.with.Board.Members	11-1011.00	8824	Confer with...	Chief Executives	1.0	4.52	74.44
```

**`.data/Processes.tsv`** - Contextual processes with digital scores
```tsv
id	pcfId	hierarchyId	name	industry	digital
Companies.develop.Vision.and.Strategy	10002	1.0	Develop Vision and Strategy	cross-industry	0.85
```

### 3. ClickHouse Storage

Data is stored in `things` table with JSON `data` field:

```json
{
  "id": "ChiefExecutives.confer.with.Board.Members",
  "type": "Task",
  "data": {
    "onetCode": "11-1011.00",
    "taskId": "8824",
    "task": "Confer with board members...",
    "occupationTitle": "Chief Executives",
    "digital": 1.0,          // ← Digital score
    "importance": 4.52,       // ← O*NET IM weight
    "relevance": 74.44        // ← O*NET RT weight
  }
}
```

ClickHouse automatically makes `data.digital`, `data.importance`, and `data.relevance` queryable as columns.

## Implementation Steps

### Step 1: Score Universal Tasks/Processes

Already done in `.enrichment/DigitalScores.tsv` using the 4-dimensional framework:
- ✅ Action Score (can AI initiate via API?)
- ✅ Event Score (can be digitally represented?)
- ✅ Activity Score (digital/physical mix)
- ✅ Result Score (digital accessibility of output)

### Step 2: Add Digital Column to TSV Processing

Modify the scripts that generate `.data/*.tsv` files to:

1. Load `.enrichment/DigitalScores.tsv` as lookup table
2. For each task/process, lookup digital score by code (taskId/pcfId)
3. Add `digital` column to output TSV
4. Parse as `float` (0.0-1.0) or `null` (not undefined)

**Example code pattern:**
```typescript
// Load digital scores
const digitalScores = new Map<string, number | null>()
loadDigitalScores('.enrichment/DigitalScores.tsv', digitalScores)

// When processing tasks
for (const task of tasks) {
  const digitalScore = digitalScores.get(task.taskId) ?? null
  outputLine.push(digitalScore === null ? 'null' : digitalScore.toFixed(2))
}
```

### Step 3: Build to ClickHouse

The existing `build-things-db.ts` script already handles JSON data fields. Digital scores will automatically flow through when present in source TSV.

**No code changes needed** - just ensure TSV has `digital` column.

### Step 4: Query with SQL

Use the query CLI:
```bash
# Interactive mode
tsx .scripts/query-clickhouse.ts --interactive

# Run a query file
tsx .scripts/query-clickhouse.ts --file .queries/top-digital-occupations.sql

# Direct query
tsx .scripts/query-clickhouse.ts "SELECT COUNT(*) FROM things WHERE type = 'Task'"
```

## Aggregation Queries

### Occupation Digital Scores

Formula: `Σ(TaskDigital × IM × RT) / Σ(IM × RT)`

```sql
SELECT
    JSONExtractString(data, 'onetCode') AS onetCode,
    JSONExtractString(data, 'occupationTitle') AS occupation,
    SUM(
        toFloat64OrNull(JSONExtractString(data, 'digital')) *
        toFloat64OrNull(JSONExtractString(data, 'importance')) *
        toFloat64OrNull(JSONExtractString(data, 'relevance'))
    ) / SUM(
        toFloat64OrNull(JSONExtractString(data, 'importance')) *
        toFloat64OrNull(JSONExtractString(data, 'relevance'))
    ) AS digitalScore
FROM things
WHERE type = 'Task' AND data.digital IS NOT NULL
GROUP BY onetCode, occupation
ORDER BY digitalScore DESC
```

### Industry Digital Scores

**Option 1: From Process Mix**
```sql
SELECT
    JSONExtractString(data, 'industry') AS industry,
    AVG(toFloat64OrNull(JSONExtractString(data, 'digital'))) AS avgDigitalScore
FROM things
WHERE type = 'Process' AND data.digital IS NOT NULL
GROUP BY industry
ORDER BY avgDigitalScore DESC
```

**Option 2: From Occupation Mix (requires BLS employment data)**
```sql
-- Requires BLS Industry-Occupation Matrix
-- Formula: Σ(OccupationDigitalScore × Employment) / TotalEmployment
-- Implementation TBD based on BLS data availability
```

## Example Queries

All queries are in `.queries/` directory:

1. **`occupation-digital-scores.sql`** - Aggregate scores for all occupations
2. **`top-digital-occupations.sql`** - Top 20 most digital occupations
3. **`occupation-digital-breakdown.sql`** - Task-level breakdown for specific occupation
4. **`industry-digital-scores.sql`** - Industry averages from process data
5. **`digital-score-distribution.sql`** - Histogram of score distribution

## Data Types & Null Handling

**IMPORTANT**: `null` has distinct meaning (context-dependent score)

- **Float**: `0.0` to `1.0` for scored tasks
- **null**: Context-dependent (e.g., "meet" could be digital or physical)
- **NOT undefined**: Always use explicit `null` in TSV

**TSV Format:**
```tsv
id	digital
task1	1.0      ← Pure digital
task2	0.5      ← Hybrid
task3	0.0      ← Pure physical
task4	null     ← Context-dependent (NOT empty string)
```

**ClickHouse Parsing:**
```typescript
// Correct
const digital = value === 'null' ? null : parseFloat(value)

// Incorrect
const digital = value || null  // This treats '0.0' as falsy!
```

## Testing the Implementation

### 1. Verify Digital Scores Loaded
```bash
tsx .scripts/query-clickhouse.ts "
SELECT COUNT(*) as total,
       countIf(JSONHas(data, 'digital')) as withDigital
FROM things WHERE type = 'Task'
"
```

### 2. Check Score Distribution
```bash
tsx .scripts/query-clickhouse.ts --file .queries/digital-score-distribution.sql
```

### 3. Validate Top Occupations
```bash
tsx .scripts/query-clickhouse.ts --file .queries/top-digital-occupations.sql
```

Expected results:
- Software Developers: ~0.98
- Electricians: ~0.15
- Mixed occupations: 0.4-0.8

## Next Steps

1. **Add digital enrichment to data processing**
   - Modify scripts that generate `.data/Tasks.tsv`
   - Add lookup from `.enrichment/DigitalScores.tsv`
   - Ensure proper float parsing and null handling

2. **Batch import to ClickHouse**
   - Run full build with digital scores
   - Verify data loaded correctly

3. **Run aggregation queries**
   - Calculate occupation digital scores
   - Calculate industry digital scores (if BLS data available)
   - Compare against methodology expectations

4. **Validate results**
   - Software/tech occupations should score 0.85+
   - Physical trades should score 0.0-0.3
   - Mixed occupations should score 0.4-0.8
   - Industries should align with occupation mix

## Tools Created

- ✅ **query-clickhouse.ts** - CLI for querying ClickHouse
- ✅ **5 example SQL queries** - Aggregation patterns
- ✅ **fix-digital-score-names.ts** - Naming standardization
- ✅ **generate-digital-scores.ts** - Batch scoring tool (placeholder for LLM)

## Documentation

- ✅ **DigitalScore.Framework.md** - 4-dimensional framework explanation
- ✅ **DigitalScore.Methodology.md** - Scoring approach and formulas
- ✅ **DigitalScores.README.md** - TSV file format and code patterns
- ✅ **DigitalScore.Architecture.md** - Data model and implementation
- ✅ **DigitalScore.Implementation.md** - This file (step-by-step guide)

## Summary

**Key Insight**: Digital scores work just like any other property - add a column to your TSV, it flows through to the `data` JSON field in ClickHouse, and you can query it with SQL. No schema changes, no special handling - it's columnar and fast automatically.

The complexity is in the **scoring methodology** (4 dimensions, hierarchical patterns, weighted aggregation), not in the storage or querying.

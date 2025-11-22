# Digital Score Data Architecture

## Overview

Digital scores are added as properties in the existing `data` JSON field in mdxdb/ClickHouse. No schema changes needed - ClickHouse automatically makes JSON fields columnar and queryable.

## Separation of Universal vs Contextual Entities

### Problem Statement

Digital scores need to be calculated at both:
1. **Universal level** - Generic task/process definitions scored independently
2. **Contextual level** - Task/process as performed within specific occupation/industry context
3. **Aggregated level** - Roll-up scores for occupations and industries

### Data Model

#### 1. Universal Entities (Source of Truth for Digital Scores)

**UniversalTasks** (derived from O*NET TaskStatements)
```
taskId          | task                                          | actionScore | eventScore | activityScore | resultScore | notes
8824            | Confer with board members...                  | 1.0         | 1.0        | null          | null        | Can schedule via API
8827            | Prepare budgets for approval...               | 0.95        | 1.0        | 0.95          | 1.0         | Digital budgeting tools
```

**UniversalProcesses** (derived from APQC PCF)
```
pcfId  | hierarchyId | name                                    | actionScore | eventScore | activityScore | resultScore | notes
10002  | 1.0         | Develop Vision and Strategy             | 0.85        | 1.0        | 0.85          | 0.95        | Strategic planning - mostly digital
17040  | 1.1         | Define the business concept...          | 0.90        | 1.0        | 0.90          | 1.0         | Conceptual work - pure digital
```

#### 2. Contextual Entities (Join Tables with Weights)

**Occupation.Tasks** (already in `.data/Tasks.tsv`)
```
id                                          | onetCode    | taskId | task (denormalized) | occupationTitle
ChiefExecutives.confer.with.Board.Members   | 11-1011.00  | 8824   | Confer with...      | Chief Executives
SoftwareDevelopers.confer.with.Team         | 15-1252.00  | 8824   | Confer with...      | Software Developers
```

Joined with **TaskRatings** for weights:
```
onetCode    | taskId | IM (Importance) | RT (Relevance) | FT (Frequency)
11-1011.00  | 8824   | 4.52            | 74.44          | [distribution]
15-1252.00  | 8824   | 3.80            | 65.20          | [distribution]
```

**Industry.Processes** (to be created - expand `.data/Processes.tsv`)
```
id                                                  | naics | pcfId | name (denorm) | industry
SoftwarePublishers.develop.Vision.and.Strategy      | 5112  | 10002 | Develop...    | Software Publishers
Construction.develop.Vision.and.Strategy            | 23    | 10002 | Develop...    | Construction
```

Joined with **IndustryProcessWeights** (to be created/inferred):
```
naics | pcfId | weight | reasoning
5112  | 10002 | 1.0    | Essential for software companies
23    | 10002 | 0.8    | Important but less central
```

#### 3. Aggregated Entities (Calculated via ClickHouse)

**OccupationDigitalScores** (materialized view or table)
```sql
SELECT
    onetCode,
    occupationTitle,
    SUM(ut.actionScore * tr.IM * tr.RT) / SUM(tr.IM * tr.RT) AS digitalScore,
    COUNT(DISTINCT taskId) AS taskCount
FROM OccupationTasks ot
JOIN UniversalTasks ut ON ot.taskId = ut.taskId
JOIN TaskRatings tr ON ot.onetCode = tr.onetCode AND ot.taskId = tr.taskId
GROUP BY onetCode, occupationTitle
```

**IndustryDigitalScores** (materialized view or table)
```sql
-- Approach 1: From occupation mix (using BLS employment data)
SELECT
    i.naics,
    i.industryName,
    SUM(os.digitalScore * em.employment) / SUM(em.employment) AS digitalScore
FROM Industries i
JOIN BLS_IndustryOccupationMatrix em ON i.naics = em.naics
JOIN OccupationDigitalScores os ON em.onetCode = os.onetCode
GROUP BY i.naics, i.industryName

-- Approach 2: From process mix (if we have Industry.Process weights)
SELECT
    ip.naics,
    ip.industryName,
    SUM(up.actionScore * ipw.weight) / SUM(ipw.weight) AS digitalScore
FROM IndustryProcesses ip
JOIN UniversalProcesses up ON ip.pcfId = up.pcfId
JOIN IndustryProcessWeights ipw ON ip.naics = ipw.naics AND ip.pcfId = ipw.pcfId
GROUP BY ip.naics, ip.industryName
```

### File Structure

```
.enrichment/
├── DigitalScores.tsv              # Universal scores (Tasks, Processes, etc.)
│   # Format: entity, entityType, codes, actionScore, eventScore, activityScore, resultScore, notes
│   # Used for both UniversalTasks (entityType=task, codes=taskId)
│   # and UniversalProcesses (entityType=process, codes=pcfId)
│
└── DigitalScore.*.md              # Documentation

.data/
├── Tasks.tsv                      # Occupation.Tasks (already contextual)
│   # id, onetCode, taskId, task, occupationTitle
│
├── Processes.tsv                  # Currently generic, to become Industry.Processes
│   # id, pcfId, hierarchyId, name, industry (currently "cross-industry")
│
├── Occupations.tsv                # Occupation definitions
└── Industries.tsv                 # Industry definitions

.source/ONET/
└── ONET.TaskRatings.tsv           # IM, RT, FT weights for tasks by occupation

.source/BLS/ (if available)
└── IndustryOccupationMatrix.tsv   # Employment by industry × occupation
```

### Implementation Plan

#### Phase 1: Universal Scores (Current - In Progress)

1. ✅ Score universal tasks in `DigitalScores.tsv` with `entityType=task, codes=taskId`
2. ✅ Score universal processes in `DigitalScores.tsv` with `entityType=process, codes=pcfId`
3. ✅ Document 4-dimensional framework
4. ✅ Create hierarchical pattern matching for wildcards/ranges

#### Phase 2: ClickHouse Schema

1. Create `UniversalTasks` table (extract from DigitalScores.tsv where entityType='task')
2. Create `UniversalProcesses` table (extract from DigitalScores.tsv where entityType='process')
3. Import existing `.data/Tasks.tsv` as `OccupationTasks` table
4. Import existing `.data/Processes.tsv` as `Processes` table (keep generic for now)
5. Import `ONET.TaskRatings.tsv` as `TaskRatings` table
6. Create materialized view `OccupationDigitalScores` with aggregation query

#### Phase 3: Industry-Specific Processes

1. Expand `.data/Processes.tsv` to include industry-specific variations
   - Keep generic `Companies.*` processes with `industry='cross-industry'`
   - Add industry-specific processes like `SoftwarePublishers.develop.Vision`
2. Create `IndustryProcessWeights` table (manual scoring or inferred)
3. Create materialized view `IndustryDigitalScores` (from processes)

#### Phase 4: BLS Integration

1. Import BLS Industry-Occupation Employment Matrix
2. Create materialized view `IndustryDigitalScores` (from occupation mix)
3. Compare/reconcile two approaches (process-based vs occupation-based)

### Query Examples

#### Get digital score for a specific occupation
```sql
SELECT * FROM OccupationDigitalScores
WHERE onetCode = '15-1252.00'
```

#### Get top 10 most digital occupations
```sql
SELECT onetCode, occupationTitle, digitalScore
FROM OccupationDigitalScores
ORDER BY digitalScore DESC
LIMIT 10
```

#### Get digital score breakdown for Chief Executives
```sql
SELECT
    ut.taskId,
    ut.task,
    ut.actionScore,
    tr.IM AS importance,
    tr.RT AS relevance,
    ut.actionScore * tr.IM * tr.RT AS weightedScore
FROM OccupationTasks ot
JOIN UniversalTasks ut ON ot.taskId = ut.taskId
JOIN TaskRatings tr ON ot.onetCode = tr.onetCode AND ot.taskId = tr.taskId
WHERE ot.onetCode = '11-1011.00'
ORDER BY weightedScore DESC
```

#### Compare same process across industries
```sql
SELECT
    ip.industry,
    ip.name,
    up.actionScore AS universalScore,
    ipw.weight AS industryWeight,
    up.actionScore * ipw.weight AS weightedScore
FROM IndustryProcesses ip
JOIN UniversalProcesses up ON ip.pcfId = up.pcfId
LEFT JOIN IndustryProcessWeights ipw ON ip.naics = ipw.naics AND ip.pcfId = ipw.pcfId
WHERE ip.pcfId = '10002'  -- Develop Vision and Strategy
ORDER BY weightedScore DESC
```

### Benefits of This Architecture

1. **Single Source of Truth**: Universal scores in `DigitalScores.tsv` with hierarchical patterns
2. **Context Preservation**: Occupation.Tasks and Industry.Processes maintain relationships
3. **Efficient Aggregation**: ClickHouse materialized views auto-update
4. **Flexibility**: Can query at any level (task, occupation, process, industry)
5. **Weighted Accuracy**: Uses empirical O*NET and BLS weights
6. **Scalability**: Handles millions of combinations efficiently

### Notes

- The current `DigitalScores.tsv` already supports this via the `codes` column
  - `codes=8824` → Universal task score
  - `codes=10002` → Universal process score
  - `codes=1.*` → Hierarchical pattern for process category

- The semantic parser already creates the many-to-many mappings in `.data/Tasks.tsv` and `.data/Processes.tsv`

- We just need to:
  1. Load into ClickHouse
  2. Create aggregation views
  3. Optionally: Expand Processes.tsv for industry-specific variations

# Data Architecture

Graph.org.ai comprehensive knowledge graph structure.

## Directory Structure

```
graph.org.ai/
├── .source/              # Raw, re-ingestable data from external sources
│   ├── Schema.org/       # 920 types, 1,510 properties
│   ├── ONET/             # ~900K rows across 25 files
│   ├── APQC/             # 1,921 processes, 37,623 industry variants
│   ├── AdvanceCTE/       # ✅ 15,575 crosswalk records (4 Excel → 18 TSV)
│   ├── BLS/              # ⏳ OES, JOLTS, Industry-Occupation Matrix (manual)
│   ├── NAICS/            # ⏳ Industry classifications (manual)
│   ├── NAPCS/            # ⏳ Product/Service classifications
│   ├── UNSPSC/           # ⏳ Product/Service codes
│   ├── GS1/              # ⏳ EPCIS, CBV, Identifiers
│   ├── Models/           # ✅ 342 AI models from OpenRouter
│   └── Integrations/     # ⏳ .do integrations (API auth required)
│
├── .enrichment/          # Derived, curated data with added value
│   ├── Language/         # ✅ 529 parts of speech (moved from .source)
│   │   ├── Language.Verbs.tsv (217)
│   │   ├── Language.Prepositions.tsv (54)
│   │   ├── Language.Conjunctions.tsv (32)
│   │   ├── Language.Determiners.tsv (40)
│   │   ├── Language.Pronouns.tsv (58)
│   │   └── Language.Adverbs.tsv (128)
│   │
│   ├── Career Cluster Crosswalks (✅ COMPLETE)
│   │   ├── Occupations.CareerClusters.tsv (1,203)
│   │   ├── Industries.CareerClusters.tsv (112)
│   │   ├── Education.CareerClusters.tsv (4,725)
│   │   ├── CareerClusters.Taxonomy.tsv (14)
│   │   └── InterdisciplinaryOccupations.tsv (125)
│   │
│   ├── Short Names (⏳ IN PROGRESS)
│   │   ├── Industries.ShortNames.tsv (20 ✅)
│   │   ├── Occupations.ShortNames.tsv (planned)
│   │   ├── Processes.ShortNames.tsv (planned)
│   │   ├── Tasks.ShortNames.tsv (planned)
│   │   ├── Skills.ShortNames.tsv (planned)
│   │   └── Knowledge.ShortNames.tsv (planned)
│   │
│   ├── Digital Scores (⏳ PLANNED)
│   │   ├── Tasks.DigitalScore.tsv
│   │   ├── Processes.DigitalScore.tsv
│   │   ├── Occupations.DigitalScore.tsv
│   │   ├── Industries.DigitalScore.tsv
│   │   ├── Skills.DigitalScore.tsv
│   │   ├── Products.DigitalScore.tsv
│   │   └── Services.DigitalScore.tsv
│   │
│   ├── Salary & Employment (⏳ PLANNED)
│   │   ├── Occupations.Wages.tsv (from BLS OES)
│   │   ├── Occupations.Employment.tsv
│   │   ├── Industries.Wages.tsv
│   │   ├── Industries.Employment.tsv
│   │   ├── Occupations.JobOpenings.tsv (from JOLTS)
│   │   └── Industries.JobOpenings.tsv
│   │
│   ├── Time & Cost (⏳ PLANNED)
│   │   ├── Tasks.TimeEstimates.tsv
│   │   ├── Processes.TimeEstimates.tsv
│   │   ├── Tasks.LaborCost.tsv
│   │   ├── Processes.LaborCost.tsv
│   │   └── Processes.RoleDistribution.tsv
│   │
│   ├── Additional Crosswalks (⏳ PLANNED)
│   │   ├── Industries.Processes.tsv
│   │   ├── Industries.Occupations.tsv (from BLS matrix)
│   │   ├── Occupations.Industries.tsv
│   │   ├── Occupations.Processes.tsv
│   │   ├── Processes.Industries.tsv
│   │   ├── Processes.Occupations.tsv
│   │   ├── Industries.Products.tsv
│   │   ├── Products.ProductRelationships.tsv
│   │   └── Services.Products.tsv
│   │
│   ├── Company Attributes (⏳ PLANNED)
│   │   ├── CompanyType.Taxonomy.tsv
│   │   ├── CompanyType.Industries.tsv
│   │   ├── CompanySize.Levels.tsv
│   │   ├── CompanySize.Processes.tsv
│   │   ├── EmployerType.Taxonomy.tsv
│   │   └── Occupations.EmployerTypes.tsv
│   │
│   ├── README.md (✅ Methodology documentation)
│   └── DigitalScore.Methodology.md (✅ Complete framework)
│
├── .data/                # Final normalized output (future)
│
├── .scripts/             # Processing and enrichment scripts
│   ├── ingest.ts                              # ✅ Main ingestion (11 sources)
│   ├── process-advancecte.ts                  # ✅ Multi-sheet Excel processor
│   └── create-career-cluster-enrichments.ts   # ✅ Crosswalk generator
│
└── Documentation
    ├── TODO.md                    # ✅ Comprehensive roadmap
    ├── PROJECT_STATUS.md          # ✅ Current status and metrics
    ├── CHANGELOG.md               # ✅ Version history
    ├── DATA_ARCHITECTURE.md       # ✅ This file
    └── README.md                  # Project overview
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     EXTERNAL SOURCES                         │
├─────────────────────────────────────────────────────────────┤
│ Schema.org │ O*NET │ APQC │ BLS │ Advance CTE │ NAICS │ ... │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│                  .source/ (Raw Data)                         │
├─────────────────────────────────────────────────────────────┤
│ • Excel, CSV, JSON, TXT files                               │
│ • Downloaded via ingest.ts or manually                      │
│ • Converted to TSV with camelCase columns                   │
│ • Re-ingestable (can be refreshed from source)              │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│              .scripts/ (Processing)                          │
├─────────────────────────────────────────────────────────────┤
│ • ingest.ts - Download and convert source data              │
│ • process-*.ts - Specialized data processing                │
│ • create-*.ts - Generate enrichments                        │
│ • TypeScript with tsx execution                             │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│            .enrichment/ (Derived Data)                       │
├─────────────────────────────────────────────────────────────┤
│ • Crosswalks connecting multiple sources                    │
│ • Computed metrics (scores, costs, times)                   │
│ • Human-curated additions (short names, taxonomies)         │
│ • Not re-ingestable (derived from source)                   │
└────────────┬────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│              .data/ (Final Output)                           │
├─────────────────────────────────────────────────────────────┤
│ • Combined source + enrichment data                         │
│ • Production-ready knowledge graph                          │
│ • Optimized for queries and analysis                        │
│ • Future: API endpoints, GraphQL, etc.                      │
└─────────────────────────────────────────────────────────────┘
```

## Entity Relationships

```
┌──────────────┐
│  Education   │ CIP Programs (4,725)
│     (CIP)    ├──────────┐
└──────────────┘          │
                          │  Career
                          │  Clusters (14)
┌──────────────┐          │
│ Occupations  │ SOC (1,203)
│    (SOC)     ├──────────┤
└──────┬───────┘          │
       │                  │
       │ BLS Matrix       │
       │                  │
┌──────▼───────┐          │
│  Industries  │ NAICS (112)
│   (NAICS)    ├──────────┘
└──────┬───────┘
       │
       │ Industry-Specific
       │
┌──────▼───────┐
│  Processes   │ APQC (1,921 + variants)
│    (APQC)    │
└──────┬───────┘
       │
       │ Component Tasks
       │
┌──────▼───────┐
│    Tasks     │ O*NET (~900K)
│   (O*NET)    │
└──────────────┘
       │
       │ Skills, Knowledge,
       │ Abilities, Tools
       │
┌──────▼───────┐
│   Outputs    │ Products & Services
│  (UNSPSC,    │ (NAICS, NAPCS, GS1)
│   NAPCS)     │
└──────────────┘
```

## Data Dimensions

### Core Entities
- **Education**: CIP codes → Programs of study
- **Occupations**: SOC codes → Job titles and roles
- **Industries**: NAICS codes → Business sectors
- **Processes**: APQC codes → Business processes
- **Tasks**: O*NET → Specific work activities
- **Skills/Knowledge**: O*NET → Required competencies
- **Products/Services**: UNSPSC, NAPCS → Goods and services

### Enrichment Attributes
- **Short Names**: Concise 1-2 word identifiers
- **Digital Scores**: 0-1 scale (physical to digital)
- **Wages**: Hourly, annual, percentiles (from BLS OES)
- **Employment**: Job counts (from BLS)
- **Job Openings**: Demand metrics (from JOLTS)
- **Time Estimates**: Hours per task/process
- **Labor Costs**: Time × Wage calculations
- **Career Clusters**: Industry groupings

### Crosswalk Types
1. **Education → Career**: CIP to SOC via Career Clusters
2. **Career → Industry**: SOC to NAICS via BLS matrix
3. **Industry → Process**: NAICS to APQC via industry alignment
4. **Process → Task**: APQC to O*NET via role analysis
5. **Industry → Product**: NAICS to output classifications

## 14 Career Clusters

Career Clusters bridge education, occupations, and industries:

| Cluster | NAICS | Sub-Clusters |
|---------|-------|--------------|
| Advanced Manufacturing | 31-33 | 5 sub-clusters |
| Agriculture | 11 | 6 sub-clusters |
| Arts, Entertainment & Design | 71 | 3 sub-clusters |
| Construction | 23 | 3 sub-clusters |
| Digital Technology | 51, 54 | 4 sub-clusters |
| Education | 61, 92 | 2 sub-clusters |
| Energy & Natural Resources | 21, 22 | 2 sub-clusters |
| Financial Services | 52, 53 | 3 sub-clusters |
| Healthcare & Human Services | 62, 81 | 3 sub-clusters |
| Hospitality, Events, & Tourism | 72, 44-45 | 3 sub-clusters |
| Management & Entrepreneurship | 55 | 2 sub-clusters |
| Marketing & Sales | 54 | 2 sub-clusters |
| Public Service & Safety | 56, 92 | 2 sub-clusters |
| Supply Chain & Transportation | 42, 48-49 | 2 sub-clusters |

## File Format Standards

### TSV (Tab-Separated Values)
- **Delimiter**: Tab (`\t`)
- **Columns**: camelCase naming
- **Encoding**: UTF-8
- **Line endings**: Unix (LF)
- **Escaping**: Tabs and newlines in values converted to spaces

### Column Naming Conventions
```
Good: socCode, occupationTitle, medianWage
Bad: SOC_CODE, Occupation Title, median-wage
```

### ID Columns
- Always include source ID columns (e.g., `socCode`, `naicsCode`, `cipCode`)
- Add `source` column indicating data provenance
- Include human-readable title/name columns

### Example Row
```tsv
socCode  occupationTitle      careerCluster          subCluster           source
15-1252  Software Developers  Digital Technology     Software Development Advance CTE Framework
```

## Data Quality

### Validation
- Row counts documented in README files
- Cross-reference IDs validated between files
- Outlier detection for scores and metrics
- Expert review of sample records

### Versioning
- All files tracked in git
- Changes documented in CHANGELOG.md
- Data source versions noted in README files
- Annual review of methodology

### Updates
- Source data re-ingested when updated
- Enrichments recalculated when source changes
- Documentation updated with each phase

## Processing Pipeline

### Phase 1: Source Ingestion ✅
```bash
npx tsx .scripts/ingest.ts
# Downloads and converts source data to TSV
```

### Phase 2: Excel Processing ✅
```bash
npx tsx .scripts/process-advancecte.ts
# Extracts all sheets from Excel workbooks
```

### Phase 3: Enrichment Generation ✅
```bash
npx tsx .scripts/create-career-cluster-enrichments.ts
# Creates crosswalk enrichments
```

### Phase 4: Validation (Future)
```bash
npx tsx .scripts/validate-enrichments.ts
# Validates data quality and consistency
```

### Phase 5: Output Generation (Future)
```bash
npx tsx .scripts/generate-output.ts
# Combines source + enrichment → .data/
```

## Storage Estimates

### Current (Phase 1)
- **Source**: ~500 MB (mostly O*NET data)
- **Enrichment**: ~1 MB (crosswalks, scores)
- **Scripts**: <1 MB (TypeScript source)
- **Total**: ~501 MB

### Projected (Phase 3)
- **Source**: ~750 MB (with BLS, NAICS, products)
- **Enrichment**: ~50 MB (all crosswalks, scores, costs)
- **Data**: ~200 MB (combined output)
- **Total**: ~1 GB

## Technology Stack

- **Language**: TypeScript (tsx for execution)
- **Libraries**: XLSX.js for Excel parsing
- **Storage**: Flat files (TSV) for simplicity
- **Version Control**: Git
- **Future**: Potential migration to PostgreSQL/Neo4j

## Next Steps

See TODO.md and PROJECT_STATUS.md for detailed roadmap.

### Immediate
1. Download BLS OES data
2. Create wage enrichments
3. Begin digital scoring

### Short Term
1. Complete all crosswalks
2. Implement cost calculations
3. Expand short names

### Medium Term
1. Full digital score implementation
2. Time estimate generation
3. Company type taxonomies

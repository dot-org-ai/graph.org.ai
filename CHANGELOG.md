# Changelog

## [2025-11-22] - Phase 1: Data Architecture & Enrichment Foundation

### Added

#### Data Architecture
- **`.enrichment/`** directory for derived/curated data
- **`.enrichment/Language/`** - Moved 529 language entries from `.source/`
  - Language.Verbs.tsv (217 verbs)
  - Language.Prepositions.tsv (54)
  - Language.Conjunctions.tsv (32)
  - Language.Determiners.tsv (40)
  - Language.Pronouns.tsv (58)
  - Language.Adverbs.tsv (128)

#### Source Data (Downloaded)
- **`.source/AdvanceCTE/`** - 15,575 crosswalk records
  - Full_Framework_Crosswalk.xlsx (4 files, 6,705 rows)
  - CIP_Career_Clusters_Crosswalk.xlsx (5 files, 8,619 rows)
  - SOC_Career_Clusters_Crosswalk.xlsx (5 files, 2,907 rows)
  - NAICS_Subclusters_Crosswalk.xlsx (2 files, 129 rows)
  - Total: 18 TSV files processed from 4 Excel workbooks

- **`.source/BLS/`** - Created structure for BLS data
  - README.md - Manual download instructions
  - DOWNLOAD_GUIDE.md - Comprehensive OES data download guide

#### Enrichment Files Created
1. **`Occupations.CareerClusters.tsv`** (1,203 rows)
   - Maps SOC occupation codes to 14 Career Clusters

2. **`Industries.CareerClusters.tsv`** (112 rows)
   - Maps NAICS industry codes to Career Clusters

3. **`Education.CareerClusters.tsv`** (4,725 rows)
   - Maps CIP educational programs to Career Clusters

4. **`CareerClusters.Taxonomy.tsv`** (14 rows)
   - Career Cluster hierarchy with sub-clusters

5. **`InterdisciplinaryOccupations.tsv`** (125 rows)
   - Occupations spanning multiple Career Clusters

6. **`Industries.ShortNames.tsv`** (20 rows)
   - Concise 1-2 word names for 2-digit NAICS codes

#### Documentation
- **`.enrichment/README.md`** - Enrichment methodology and data sources
- **`.enrichment/DigitalScore.Methodology.md`** - Complete digital scoring framework
- **`.source/AdvanceCTE/README.md`** - Download instructions and file inventory
- **`.source/AdvanceCTE/DATA_SUMMARY.md`** - Comprehensive data inventory
- **`.source/BLS/README.md`** - Manual download requirements
- **`.source/BLS/DOWNLOAD_GUIDE.md`** - Step-by-step OES data download
- **`PROJECT_STATUS.md`** - Comprehensive project overview and status
- **`CHANGELOG.md`** - This file

#### Processing Scripts
- **`.scripts/process-advancecte.ts`** - Multi-sheet Excel processor
  - Processes all sheets in Excel workbooks
  - Filters out header/instruction rows
  - Outputs clean TSV files

- **`.scripts/create-career-cluster-enrichments.ts`** - Enrichment generator
  - Creates 5 crosswalk enrichment files
  - Parses TSV data
  - Generates normalized enrichments

#### Updated Scripts
- **`.scripts/ingest.ts`** - Main data ingestion
  - Added `ingestAdvanceCTE()` function
  - Added `ingestBLS()` function (ready for manual downloads)
  - Updated main() to include new sources

### Changed

#### File Migrations
- Moved **`.source/Language/`** → **`.enrichment/Language/`**
  - Language is enrichment data (manually curated), not re-ingestable source

#### TODO.md Updates
- Added comprehensive enrichment strategy
- Added 14 Career Clusters with NAICS alignments
- Added salary & job market data requirements (BLS OES, JOLTS)
- Added time & cost enrichment requirements
- Added 20+ crosswalk files to create
- Added company type and employer attribute requirements
- Marked completed items (AdvanceCTE downloads, initial crosswalks)

### Data Statistics

#### Source Data Totals
- **Schema.org**: 2,430 types and properties
- **O*NET**: ~900,000 rows across 25 files
- **APQC**: 39,544 processes (1,921 base + 37,623 industry variants)
- **Advance CTE**: 15,575 crosswalk records
- **Models**: 342 AI models

#### Enrichment Data Totals
- **Career Cluster Mappings**: 6,179 records
  - 1,203 Occupations (SOC)
  - 112 Industries (NAICS)
  - 4,725 Education (CIP)
  - 14 Career Clusters
  - 125 Interdisciplinary occupations
- **Short Names**: 20 industry short names
- **Language**: 529 parts of speech entries

### 14 Career Clusters Mapped

1. **Advanced Manufacturing** (NAICS 31-33)
2. **Agriculture** (NAICS 11)
3. **Arts, Entertainment & Design** (NAICS 71)
4. **Construction** (NAICS 23)
5. **Digital Technology** (NAICS 51, 54)
6. **Education** (NAICS 61, 92)
7. **Energy & Natural Resources** (NAICS 21, 22)
8. **Financial Services** (NAICS 52, 53)
9. **Healthcare & Human Services** (NAICS 62, 81)
10. **Hospitality, Events, & Tourism** (NAICS 72, 44-45)
11. **Management & Entrepreneurship** (NAICS 55)
12. **Marketing & Sales** (NAICS 54)
13. **Public Service & Safety** (NAICS 56, 92)
14. **Supply Chain & Transportation** (NAICS 42, 48-49)

### Planned (Phase 2)

#### Immediate Next Steps
- [ ] Download BLS OES wage data (May 2024)
- [ ] Create Occupations.Wages.tsv enrichment
- [ ] Download BLS Industry-Occupation Matrix
- [ ] Begin digital score implementation
- [ ] Expand Industries.ShortNames.tsv to 3-6 digit NAICS

#### Short Term
- [ ] Complete digital scoring for O*NET tasks
- [ ] Aggregate digital scores to occupations and industries
- [ ] Download BLS JOLTS job openings data
- [ ] Create initial time estimates for tasks
- [ ] Build Industries.Occupations.tsv from BLS matrix

#### Medium Term
- [ ] Complete all 20+ crosswalk enrichments
- [ ] Implement cost calculations (time × wage)
- [ ] Create company type and size taxonomies
- [ ] Add product and service classifications
- [ ] Build process-to-industry mappings

### Technical Details

#### Technologies Used
- TypeScript with tsx for processing
- XLSX.js for Excel file parsing
- Node.js fs module for file I/O
- TSV format with tab delimiters
- camelCase column naming convention

#### Data Flow
```
External Sources
    ↓
.source/ (raw TSV files)
    ↓
.scripts/*.ts (processing)
    ↓
.enrichment/ (derived data)
    ↓
.data/ (final output)
```

#### File Naming Conventions
- **Source**: `[SourceName].[TypeName].tsv` (e.g., `ONET.Skills.tsv`)
- **Enrichment**: `[EntityType].[AttributeType].tsv` (e.g., `Occupations.Wages.tsv`)
- **Scripts**: `[action]-[subject].ts` (e.g., `process-advancecte.ts`)

### Breaking Changes
- None (new directories and files only)

### Deprecated
- None

### Removed
- **`.source/Language/`** directory (migrated to `.enrichment/Language/`)

### Security
- No security changes

### Performance
- Multi-sheet Excel processing optimized
- TSV format for fast parsing
- Filtered out header rows during processing

## [Previous Versions]

### [2025-11-21] - Initial Project Setup
- Created project structure
- Added initial data ingestion scripts
- Ingested Schema.org, O*NET, APQC data
- Created TODO.md with initial roadmap

---

## Version Numbering

This project doesn't use semantic versioning yet. Changes are tracked by date and phase.

**Phases:**
- **Phase 1** (Complete): Data architecture and initial enrichments
- **Phase 2** (Planned): Economic data integration (wages, costs, time)
- **Phase 3** (Planned): Full crosswalk completion and validation
- **Phase 4** (Planned): Production data output and API

## Contributing

See PROJECT_STATUS.md for current status and next priorities.

## Data Sources

All data sources and their licenses are documented in:
- `.source/[SourceName]/README.md` for each source
- `.enrichment/README.md` for enrichment methodology

## Contact

For questions about data enrichment methodology:
- See `.enrichment/README.md`
- See `.enrichment/DigitalScore.Methodology.md`

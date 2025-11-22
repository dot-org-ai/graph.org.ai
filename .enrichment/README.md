# Enrichment Data

This directory contains **derived and enriched data** created from the source data in `.source/`.

## Directory Purpose

The `.enrichment/` folder is distinct from:
- **`.source/`** - Raw data that can be re-ingested from external sources
- **`.data/`** - Combined, normalized output ready for production use

Enrichment data includes:
1. **Human-curated additions** (short names, classifications)
2. **Computed metrics** (digital scores, aggregations)
3. **Derived crosswalks** (entity relationships not available in source data)
4. **Custom taxonomies** (company types, employer types)

## Structure

### Language/
Parts of speech for the GraphDL semantic parser:
- `Language.Verbs.tsv` - 217 verbs with conjugations
- `Language.Prepositions.tsv` - 54 prepositions
- `Language.Conjunctions.tsv` - 32 conjunctions
- `Language.Determiners.tsv` - 40 determiners
- `Language.Pronouns.tsv` - 58 pronouns
- `Language.Adverbs.tsv` - 128 adverbs

**Note**: Moved from `.source/Language/` since these are custom-created, not ingested from external sources.

### Short Names (Planned)
Concise 1-2 word names for entities with verbose source names:
- `Industries.ShortNames.tsv`
- `Occupations.ShortNames.tsv`
- `Processes.ShortNames.tsv`
- `Tasks.ShortNames.tsv`
- `Skills.ShortNames.tsv`
- `Knowledge.ShortNames.tsv`

### Digital Scores (Planned)
Scores indicating digital (1), physical (0), either (null), or hybrid (0-1):
- `Industries.DigitalScore.tsv`
- `Occupations.DigitalScore.tsv`
- `Processes.DigitalScore.tsv`
- `Tasks.DigitalScore.tsv`
- `Skills.DigitalScore.tsv`
- `Products.DigitalScore.tsv`
- `Services.DigitalScore.tsv`
- `DigitalScore.Methodology.md` - Scoring rubric and aggregation methodology

### Salary & Job Market Data (Planned)
Wage and employment statistics:
- `Occupations.Wages.tsv` - BLS OES wage data (hourly, annual, percentiles) by SOC
- `Occupations.Employment.tsv` - BLS OES employment counts by SOC
- `Industries.Wages.tsv` - Average wages by NAICS industry
- `Industries.Employment.tsv` - Employment counts by NAICS industry
- `Occupations.JobOpenings.tsv` - JOLTS job openings data by occupation category
- `Industries.JobOpenings.tsv` - JOLTS job openings data by industry

### Time & Cost Enrichment (Planned)
Labor time and cost calculations:
- `Tasks.TimeEstimates.tsv` - Estimated hours to complete each O*NET task by occupation
- `Processes.TimeEstimates.tsv` - Estimated hours for APQC process steps by occupation/role
- `Tasks.LaborCost.tsv` - Dollar cost per task (time × wage) by occupation
- `Processes.LaborCost.tsv` - Dollar cost per process (aggregated task costs)
- `Processes.RoleDistribution.tsv` - Percentage breakdown of which roles perform each process
- `TimeEstimate.Methodology.md` - Documentation of time estimation approach and sources

### Crosswalks (Planned)
Entity relationship mappings:
- `Industries.Processes.tsv` - NAICS to APQC
- `Industries.Occupations.tsv` - NAICS to SOC/O*NET
- `Occupations.Industries.tsv` - SOC/O*NET to NAICS
- `Occupations.Processes.tsv` - SOC/O*NET to APQC
- `Processes.Industries.tsv` - APQC to NAICS
- `Processes.Occupations.tsv` - APQC to SOC/O*NET
- `Processes.CompanySize.tsv` - Process applicability by company size
- `Industries.Products.tsv` - Industries that produce products
- `Industries.ProductsConsumed.tsv` - Industries that consume products
- `Products.Industries.tsv` - Products to producer industries
- `Products.ProductRelationships.tsv` - Product relationships (rawMaterial, component, asset, etc.)
- `Services.Products.tsv` - Services supporting products
- `Products.Services.tsv` - Products used in services

### Company & Employer Attributes (Planned)
- `CompanyType.Taxonomy.tsv` - Company classifications
- `CompanyType.Industries.tsv` - Company types to industries (many-to-many)
- `CompanySize.Levels.tsv` - Size by revenue/employees
- `CompanySize.Processes.tsv` - Processes by company size
- `EmployerType.Taxonomy.tsv` - Employer categories
- `Occupations.EmployerTypes.tsv` - Occupations to employer types

## Data Sources

Enrichment data is derived from:
- `.source/` raw data (Schema.org, O*NET, APQC, NAICS, etc.)
- BLS Industry-Occupation Matrix (NAICS × SOC employment)
- Advance CTE Framework Crosswalk (CIP, SOC, NAICS, Career Clusters)
- BLS OES (Occupational Employment and Wage Statistics) - May 2024
- BLS JOLTS (Job Openings and Labor Turnover Survey)
- APQC Industry-Specific PCFs (NAICS alignments)
- Manual curation and expert input

## Methodology

### Digital Score Rubric
The digital score methodology considers:
- **Processes**: Weighted average of component tasks
- **Tasks**: Based on O*NET work context (computer use, automation)
- **Industries**: Weighted average of common processes and occupations
- **Occupations**: Weighted average of tasks using O*NET importance/frequency
- **Products/Services**: Inherent digital vs physical nature

Weights are derived from O*NET importance and frequency ratings where available.

### Short Name Generation
Short names prioritize:
1. Common abbreviations and industry jargon
2. Removing redundant context (e.g., "Financial Analyst" → "Analyst" when industry context is known)
3. Maintaining uniqueness within each entity type

### Time & Cost Estimation
Task and process time estimates are developed through:
1. **O*NET Task Ratings**: Use importance and frequency ratings as proxies
2. **Industry Benchmarks**: Reference APQC benchmarking data when available
3. **Work Context**: Leverage O*NET work context data (hours worked, pace, etc.)
4. **Expert Estimation**: Manual estimates for tasks without quantitative data
5. **Validation**: Cross-check against real-world time-motion studies

Cost calculations combine:
- Time estimates (hours) × BLS OES wage data ($/hour)
- Weighted by occupation and industry
- Aggregated using role distribution percentages

**Note**: O*NET does not collect actual time-spent data for tasks. Time estimates are derived metrics requiring manual enrichment and validation.

### Crosswalk Development
Crosswalks are created by:
1. Using official mappings when available (BLS, Advance CTE, APQC)
2. Analyzing co-occurrence in source data
3. Manual expert mapping for gaps
4. Validation against industry standards

## Versioning

Enrichment data should be versioned and tracked in git. Changes should be:
- **Documented**: Note rationale for scoring/classification decisions
- **Reproducible**: Scripts in `.scripts/` should regenerate derived data
- **Validated**: Cross-check against source data updates

# TODO

## Source

- [x] Get all data sources into .source/[SourceName.TypeName].tsv files (column names `camelCase`)
  - [x] Schema.org Types & Properties (920 types, 1510 properties)
  - [x] O*NET (25+ tables/files, ~900K rows total)
  - [ ] GS1 (EPCIS, CBV, Identifiers, and Ontologies for each) - Requires manual download
  - [ ] NAICS Industries - Requires manual XLSX conversion (see .source/NAICS/README.md)
  - [ ] NAPCS Products/Services - Requires manual download
  - [ ] UNSPSC Products/Services - Requires registration (see .source/UNSPSC/README.md)
  - [x] APQC Process (1,921 processes, 37,623 industry variants)
  - [ ] Simple Icons / React Icons - API error, requires manual download
  - [x] .do Models, Providers, Labs (342 models from OpenRouter)
  - [ ] .do Integrations - API authentication required
  - [x] BLS Industry-Occupation Matrix - NAICS x SOC employment data (manual download required)
  - [x] Advance CTE Framework Crosswalk - CIP, SOC, NAICS, Career Clusters
  - [ ] APQC Industry-Specific PCFs - Contains NAICS alignments per industry
  - [ ] BLS OES (Occupational Employment and Wage Statistics) - May 2024 salary/wage data for ~830 occupations
  - [ ] BLS JOLTS (Job Openings and Labor Turnover) - Job availability and turnover data

## Schema

- [ ] Create Zod schemas for all .org.ai Nouns
  - [ ] Noun (properties, actions, events)
  - [ ] Verb (action, actor, act, activity, result, event, reverse, inverse)
  - [ ] Things (type, data, content, code, component, relationships, references)
  - [ ] Language (all base partOfSpeech enums: Adjectives, Adverbs, Propositions, Pronouns, Conjunctions, etc)
  - [ ] Statement (Subject.predicate.Object.proposition.Object)
  - [ ] Industries
  - [ ] Products
  - [ ] Services
  - [ ] Occupations
  - [ ] Activities (Work Activities -> IWA -> DWA -> Tasks)
  - [ ] Skills
  - [ ] Knowledge
  - [ ] Abilities
  - [ ] Education
  - [ ] Training
  - [ ] Experience
  - [ ] Jobs (Zones to Alternate Titles)
  - [ ] Interests
  - [ ] Keywords
  - [ ] Work Styles
  - [ ] Work Values
  - [ ] Tasks
  - [ ] Tech
  - [ ] Tools

## Enrichment

### Short Names
- [ ] Industries.ShortNames.tsv - 1-2 word names for each Sector/Industry
- [ ] Occupations.ShortNames.tsv - 1-2 word names for each occupation
- [ ] Processes.ShortNames.tsv - 1-2 word names for each APQC process
- [ ] Tasks.ShortNames.tsv - 1-2 word names for each O*NET task
- [ ] Skills.ShortNames.tsv - 1-2 word names for each skill
- [ ] Knowledge.ShortNames.tsv - 1-2 word names for each knowledge area

### Digital Score (0=physical, 1=digital, null=either, 0-1=hybrid)
- [ ] Industries.DigitalScore.tsv - Digital vs physical score per industry
- [ ] Occupations.DigitalScore.tsv - Digital vs physical score per occupation
- [ ] Processes.DigitalScore.tsv - Digital vs physical score per process
- [ ] Tasks.DigitalScore.tsv - Digital vs physical score per task
- [ ] Skills.DigitalScore.tsv - Digital vs physical score per skill
- [ ] Products.DigitalScore.tsv - Digital vs physical score per product
- [ ] Services.DigitalScore.tsv - Digital vs physical score per service
- [ ] DigitalScore.Methodology.md - Documentation of scoring rubric and aggregation weights

### Crosswalks (Connecting Entities)
- [x] Download BLS Industry-Occupation Matrix (NAICS x SOC employment data) - README created
- [x] Download Advance CTE Framework Crosswalk (CIP-SOC-NAICS-Career Clusters) - 15,575 records
- [x] Occupations.CareerClusters.tsv - 1,203 SOC to Career Cluster mappings
- [x] Industries.CareerClusters.tsv - 112 NAICS to Career Cluster mappings
- [x] Education.CareerClusters.tsv - 4,725 CIP to Career Cluster mappings
- [x] CareerClusters.Taxonomy.tsv - 14 Career Clusters with sub-cluster hierarchies
- [x] InterdisciplinaryOccupations.tsv - 125 SOCs spanning multiple clusters
- [ ] Industries.Processes.tsv - NAICS to APQC process mappings
- [ ] Industries.Occupations.tsv - NAICS to SOC/O*NET occupation mappings (from BLS)
- [ ] Occupations.Industries.tsv - SOC/O*NET to NAICS industry mappings (from BLS)
- [ ] Occupations.Processes.tsv - SOC/O*NET to APQC process mappings
- [ ] Processes.Industries.tsv - APQC to NAICS mappings (from industry-specific PCFs)
- [ ] Processes.Occupations.tsv - APQC to SOC/O*NET mappings
- [ ] Processes.CompanySize.tsv - APQC processes applicable by company size (revenue/employees)
- [ ] Industries.Products.tsv - NAICS industries that produce each product/service
- [ ] Industries.ProductsConsumed.tsv - NAICS industries that consume products (raw materials, components, assets, supplies)
- [ ] Products.Industries.tsv - Products/services to producer industries
- [ ] Products.ProductRelationships.tsv - Product-to-product relationships (rawMaterial, component, asset, tool, equipment, supply)
- [ ] Services.Products.tsv - Services that support product delivery/maintenance
- [ ] Products.Services.tsv - Products used in service delivery

### Company Types & Attributes
- [ ] CompanyType.Taxonomy.tsv - Company type classification (niche, regional, national, conglomerate, etc.)
- [ ] CompanyType.Industries.tsv - Company types to industries (many-to-many for conglomerates)
- [ ] CompanySize.Levels.tsv - Size classifications (by revenue and/or employees)
- [ ] CompanySize.Processes.tsv - APQC processes by applicable company size
- [ ] EmployerType.Taxonomy.tsv - Employer types (government, non-profit, for-profit, etc.)
- [ ] Occupations.EmployerTypes.tsv - Occupations to typical employer types

### Salary & Job Market Data
- [ ] Occupations.Wages.tsv - BLS OES wage data (hourly, annual, percentiles) by SOC
- [ ] Occupations.Employment.tsv - BLS OES employment counts by SOC
- [ ] Industries.Wages.tsv - Average wages by NAICS industry
- [ ] Industries.Employment.tsv - Employment counts by NAICS industry
- [ ] Occupations.JobOpenings.tsv - JOLTS job openings by occupation category
- [ ] Industries.JobOpenings.tsv - JOLTS job openings by industry

### Time & Cost Enrichment
- [ ] Tasks.TimeEstimates.tsv - Estimated hours to complete each O*NET task by occupation
- [ ] Processes.TimeEstimates.tsv - Estimated hours for APQC process steps by occupation/role
- [ ] Tasks.LaborCost.tsv - Dollar cost per task (time × wage) by occupation
- [ ] Processes.LaborCost.tsv - Dollar cost per process (aggregated task costs)
- [ ] Processes.RoleDistribution.tsv - Percentage breakdown of which roles perform each process
- [ ] TimeEstimate.Methodology.md - Documentation of time estimation approach and sources

### Language (Moved from .source to .enrichment)
- [x] Language.Verbs.tsv - 217 verbs with conjugations
- [x] Language.Prepositions.tsv - 54 prepositions
- [x] Language.Conjunctions.tsv - 32 conjunctions
- [x] Language.Determiners.tsv - 40 determiners
- [x] Language.Pronouns.tsv - 58 pronouns
- [x] Language.Adverbs.tsv - 128 adverbs

## Normalize

- [ ]

## MDX Primitivies

- [ ] mdxld
- [ ] mdxui
  - [ ] @mdxui/markdown
  - [ ] @mdxui/ink
  - [ ] @mdxui/hono
  - [ ] @mdxui/next
- [ ] mdxdb
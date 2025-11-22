# Graph.org.ai Project Status

Last Updated: 2025-11-22

## 🎯 Project Overview

Building a comprehensive knowledge graph connecting:
- **Education** (CIP programs)
- **Occupations** (O*NET/SOC)
- **Industries** (NAICS)
- **Processes** (APQC)
- **Products & Services** (UNSPSC, NAPCS, GS1)
- **Economic Data** (wages, employment, job openings)
- **Performance Metrics** (time estimates, costs, digital scores)

## ✅ Completed (Phase 1)

### Data Architecture ✅
- [x] Created `.source/` for raw, re-ingestable data
- [x] Created `.enrichment/` for derived/curated data
- [x] Moved Language files (529 entries) from source to enrichment
- [x] Established clear data flow: source → enrichment → data (output)

### Data Sources Ingested ✅
- [x] **Schema.org** (920 types, 1,510 properties)
- [x] **O*NET** (25+ files, ~900K rows)
- [x] **APQC** (1,921 processes, 37,623 industry variants)
- [x] **Advance CTE** (15,575 crosswalk records)
- [x] **.do Models** (342 AI models from OpenRouter)

### Crosswalk Data Downloaded ✅
- [x] **Advance CTE Framework Crosswalk** (4 Excel workbooks)
  - Full Framework: 6,705 SOC×CIP×Career Cluster mappings
  - CIP-Career Clusters: 8,619 education program mappings
  - SOC-Career Clusters: 2,907 occupation mappings
  - NAICS-Career Clusters: 129 industry mappings

### Enrichment Files Created ✅
1. **Occupations.CareerClusters.tsv** (1,203 rows)
2. **Industries.CareerClusters.tsv** (112 rows)
3. **Education.CareerClusters.tsv** (4,725 rows)
4. **CareerClusters.Taxonomy.tsv** (14 Career Clusters)
5. **InterdisciplinaryOccupations.tsv** (125 multi-cluster SOCs)
6. **Industries.ShortNames.tsv** (20 2-digit NAICS short names)

### Documentation Created ✅
- [x] **DigitalScore.Methodology.md** - Complete digital scoring framework
- [x] **BLS/DOWNLOAD_GUIDE.md** - Step-by-step OES data download instructions
- [x] **AdvanceCTE/DATA_SUMMARY.md** - Comprehensive data inventory
- [x] **AdvanceCTE/README.md** - Download and usage instructions
- [x] **BLS/README.md** - Manual download requirements
- [x] **.enrichment/README.md** - Methodology and data sources
- [x] **TODO.md** - Comprehensive roadmap

### Scripts Created ✅
- [x] `.scripts/ingest.ts` - Main data ingestion (includes AdvanceCTE, BLS)
- [x] `.scripts/process-advancecte.ts` - Multi-sheet Excel processor
- [x] `.scripts/create-career-cluster-enrichments.ts` - Enrichment generator

## 🚧 In Progress (Phase 2)

### Data Sources to Ingest
- [ ] **GS1** (EPCIS, CBV, Identifiers) - Manual download required
- [ ] **NAICS Industries** - XLSX conversion needed
- [ ] **NAPCS Products/Services** - Manual download
- [ ] **UNSPSC Products/Services** - Registration required
- [ ] **Simple Icons** - Manual download (API error)
- [ ] **.do Integrations** - API authentication required
- [ ] **BLS OES** (Occupational Employment & Wages) - May 2024 data
- [ ] **BLS JOLTS** (Job Openings & Labor Turnover)
- [ ] **BLS Industry-Occupation Matrix**

### Enrichment To Create

#### Short Names (Concise 1-2 word names)
- [x] Industries.ShortNames.tsv (20 2-digit codes)
- [ ] Industries.ShortNames.tsv (Complete 3-6 digit codes)
- [ ] Occupations.ShortNames.tsv
- [ ] Processes.ShortNames.tsv
- [ ] Tasks.ShortNames.tsv
- [ ] Skills.ShortNames.tsv
- [ ] Knowledge.ShortNames.tsv

#### Digital Scores (0=physical, 1=digital)
- [ ] Tasks.DigitalScore.tsv
- [ ] Processes.DigitalScore.tsv
- [ ] Occupations.DigitalScore.tsv
- [ ] Industries.DigitalScore.tsv
- [ ] Skills.DigitalScore.tsv
- [ ] Products.DigitalScore.tsv
- [ ] Services.DigitalScore.tsv

#### Salary & Employment Data
- [ ] Occupations.Wages.tsv (from BLS OES)
- [ ] Occupations.Employment.tsv (from BLS OES)
- [ ] Industries.Wages.tsv (aggregated)
- [ ] Industries.Employment.tsv (from BLS)
- [ ] Occupations.JobOpenings.tsv (from JOLTS)
- [ ] Industries.JobOpenings.tsv (from JOLTS)

#### Time & Cost Estimates
- [ ] Tasks.TimeEstimates.tsv
- [ ] Processes.TimeEstimates.tsv
- [ ] Tasks.LaborCost.tsv (time × wage)
- [ ] Processes.LaborCost.tsv (aggregated)
- [ ] Processes.RoleDistribution.tsv
- [ ] TimeEstimate.Methodology.md

#### Additional Crosswalks
- [ ] Industries.Processes.tsv (NAICS → APQC)
- [ ] Industries.Occupations.tsv (NAICS → SOC from BLS)
- [ ] Occupations.Industries.tsv (SOC → NAICS from BLS)
- [ ] Occupations.Processes.tsv (SOC → APQC)
- [ ] Processes.Industries.tsv (APQC → NAICS)
- [ ] Processes.Occupations.tsv (APQC → SOC)
- [ ] Industries.Products.tsv (producer relationships)
- [ ] Industries.ProductsConsumed.tsv (consumer relationships)
- [ ] Products.ProductRelationships.tsv
- [ ] Services.Products.tsv
- [ ] Products.Services.tsv

#### Company & Employer Attributes
- [ ] CompanyType.Taxonomy.tsv
- [ ] CompanyType.Industries.tsv
- [ ] CompanySize.Levels.tsv
- [ ] CompanySize.Processes.tsv
- [ ] EmployerType.Taxonomy.tsv
- [ ] Occupations.EmployerTypes.tsv

## 📊 Data Inventory

### Source Data
| Source | Status | Records | Location |
|--------|--------|---------|----------|
| Schema.org | ✅ Ingested | 2,430 | `.source/Schema.org/` |
| O*NET | ✅ Ingested | ~900K | `.source/ONET/` |
| APQC | ✅ Ingested | 39,544 | `.source/APQC/` |
| Advance CTE | ✅ Processed | 15,575 | `.source/AdvanceCTE/` |
| BLS OES | 📥 Pending | ~830 SOCs | `.source/BLS/` |
| BLS JOLTS | 📥 Pending | Industry/Occ | `.source/BLS/` |
| GS1 | 📥 Pending | TBD | `.source/GS1/` |
| NAICS | 📥 Pending | TBD | `.source/NAICS/` |
| UNSPSC | 📥 Pending | TBD | `.source/UNSPSC/` |

### Enrichment Data
| File | Status | Records | Purpose |
|------|--------|---------|---------|
| Occupations.CareerClusters.tsv | ✅ Created | 1,203 | SOC → Cluster |
| Industries.CareerClusters.tsv | ✅ Created | 112 | NAICS → Cluster |
| Education.CareerClusters.tsv | ✅ Created | 4,725 | CIP → Cluster |
| CareerClusters.Taxonomy.tsv | ✅ Created | 14 | Cluster hierarchy |
| InterdisciplinaryOccupations.tsv | ✅ Created | 125 | Multi-cluster SOCs |
| Industries.ShortNames.tsv | ✅ Created | 20 | NAICS short names |
| Language/* | ✅ Migrated | 529 | Parts of speech |

## 🎓 14 Career Clusters

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

## 🔧 Technical Infrastructure

### Processing Scripts
- **ingest.ts** - Main ingestion pipeline (11 data sources)
- **process-advancecte.ts** - Excel multi-sheet processor
- **create-career-cluster-enrichments.ts** - Crosswalk generator

### Data Flow
```
External Sources
    ↓
.source/ (raw TSV files)
    ↓
Processing Scripts
    ↓
.enrichment/ (derived data)
    ↓
.data/ (final output)
```

### File Formats
- **Input**: Excel, CSV, JSON, TXT, TSV
- **Processing**: TypeScript with tsx
- **Output**: TSV with camelCase columns
- **Dependencies**: XLSX library for Excel processing

## 📈 Key Metrics

### Data Coverage
- **Occupations**: 1,203 SOC codes mapped to Career Clusters
- **Industries**: 112 NAICS mapped to Career Clusters
- **Education**: 4,725 CIP programs mapped to clusters
- **Interdisciplinary**: 125 occupations span multiple clusters
- **Processes**: 1,921 APQC processes + 37,623 industry variants

### Crosswalk Density
- **SOC→Cluster**: 100% coverage (1,203/1,203)
- **CIP→Cluster**: Complete educational pathway mapping
- **NAICS→Cluster**: 2-digit industry coverage complete

## 🎯 Next Priorities

### Immediate (This Week)
1. Download BLS OES data (wages & employment)
2. Create Occupations.Wages.tsv enrichment
3. Begin digital score implementation for sample tasks
4. Expand Industries.ShortNames.tsv to 3-digit NAICS

### Short Term (This Month)
1. Complete digital scoring for all O*NET tasks
2. Aggregate digital scores to occupations
3. Download BLS JOLTS data
4. Create initial time estimates for common tasks
5. Build Industries.Occupations.tsv from BLS matrix

### Medium Term (Next Quarter)
1. Complete all crosswalk enrichments
2. Implement cost calculations (time × wage)
3. Create company type and size taxonomies
4. Add product and service classifications
5. Build process-to-industry mappings

## 📚 Documentation

### Methodology Docs
- ✅ Digital Score Methodology (comprehensive framework)
- ⏳ Time Estimation Methodology (pending)
- ⏳ Short Name Guidelines (pending)

### Data Guides
- ✅ BLS OES Download Guide (step-by-step)
- ✅ Advance CTE Data Summary (inventory)
- ⏳ Complete API Documentation (pending)

### Project Docs
- ✅ TODO.md (comprehensive roadmap)
- ✅ PROJECT_STATUS.md (this file)
- ⏳ Data Dictionary (pending)
- ⏳ Schema Documentation (pending)

## 🤝 Contributing

### Data Quality
- All source data tracked in git
- Enrichment methodology documented
- Changes versioned and reviewable
- Validation scripts for quality control

### Process
1. Source data → `.source/[SourceName]/`
2. Process with scripts in `.scripts/`
3. Output enrichment to `.enrichment/`
4. Update TODO.md and this status doc

## 📞 Resources

### Data Sources
- **O*NET**: https://www.onetcenter.org/
- **BLS OES**: https://www.bls.gov/oes/
- **BLS JOLTS**: https://www.bls.gov/jlt/
- **Advance CTE**: https://careertech.org/
- **APQC**: https://www.apqc.org/pcf
- **Schema.org**: https://schema.org/

### Tools
- **TypeScript**: Processing scripts
- **XLSX.js**: Excel file parsing
- **tsx**: TypeScript execution

## 🎉 Achievements

- ✅ **15,575** crosswalk records processed
- ✅ **7** enrichment files created
- ✅ **14** Career Clusters mapped
- ✅ **1,203** occupations enriched
- ✅ **4,725** education programs mapped
- ✅ **20** industry short names created
- ✅ **8** comprehensive documentation files
- ✅ **3** automated processing scripts

---

*This project builds the foundation for a comprehensive economic knowledge graph enabling wage analysis, cost modeling, digital transformation tracking, and career pathway planning.*

# AdvanceCTE Career Cluster Data Processing Summary

## Overview

Successfully processed AdvanceCTE career cluster and education program data from 29 source TSV files into a normalized, name-based ID structure with comprehensive relationship mappings.

## Files Generated

All files located in `.data/` directory:

### Primary Entity Files

1. **CareerClusters.tsv** (14 records)
   - Career cluster definitions with NAICS alignment
   - Fields: id, name, subclusters, naics_codes, soc_count, cip_count, description
   - IDs: Name-based slugs (e.g., `advanced-manufacturing`, `digital-technology`)

2. **SubClusters.tsv** (71 records)
   - Sub-cluster definitions within career clusters
   - Fields: id, name, career_cluster_id, career_cluster_name, soc_count, cip_count, description
   - IDs: Hierarchical name-based (e.g., `digital-technology/software-solutions`)

3. **EducationPrograms.tsv** (1,946 records)
   - CIP code-based education programs
   - Fields: id, cip_code, name, career_clusters, subclusters, soc_count, description
   - IDs: Name-based from program title (e.g., `computer-science`, `mechanical-engineering`)

### Relationship Mapping Files

4. **SOC_CareerCluster_Mappings.tsv** (1,203 records)
   - Maps SOC occupation codes to career clusters and sub-clusters
   - Fields: soc_code, career_cluster_id, subcluster_id

5. **EducationProgram_CareerCluster_Mappings.tsv** (4,725 records)
   - Maps education programs (CIP codes) to career clusters and sub-clusters
   - Fields: education_program_id, cip_code, career_cluster_id, subcluster_id

6. **SOC_EducationProgram_Mappings.tsv** (5,775 records)
   - Complete crosswalk: SOC codes to education programs (CIP) via career clusters
   - Fields: soc_code, education_program_id, cip_code, career_cluster_id

## Summary Statistics

### Career Clusters
- **Total Clusters:** 14
- **Total Sub-Clusters:** 71
- **Average Sub-Clusters per Cluster:** 5.1

### Coverage
- **Unique SOC Codes:** 851 occupations
- **Unique CIP Codes:** 1,946 education programs
- **SOC-to-Cluster Mappings:** 1,203 (avg 1.4 clusters per SOC)
- **CIP-to-Cluster Mappings:** 4,725 (avg 2.4 clusters per CIP)
- **SOC-to-CIP Relationships:** 5,775 crosswalk entries

### Industry Alignment (NAICS)
All 14 career clusters mapped to 2-digit NAICS codes covering major industry sectors:
- Manufacturing (31-33)
- Agriculture (11)
- Construction (23)
- Information/Technology (51, 54)
- Healthcare (62, 81)
- Education (61, 92)
- And 8 more sectors

## Career Cluster Details

| Cluster ID | Name | NAICS | SOCs | CIPs | Sub-Clusters |
|------------|------|-------|------|------|--------------|
| advanced-manufacturing | Advanced Manufacturing | 31-33 | 137 | 214 | 5 |
| agriculture | Agriculture | 11 | 46 | 173 | 6 |
| arts-entertainment-design | Arts, Entertainment, & Design | 71 | 64 | 149 | 6 |
| construction | Construction | 23 | 93 | 101 | 4 |
| digital-technology | Digital Technology | 51, 54 | 20 | 89 | 5 |
| education | Education | 61, 92 | 83 | 1,332 | 4 |
| energy-natural-resources | Energy & Natural Resources | 21, 22 | 87 | 247 | 6 |
| financial-services | Financial Services | 52, 53 | 40 | 66 | 5 |
| healthcare-human-services | Healthcare & Human Services | 62, 81 | 146 | 766 | 6 |
| hospitality-events-tourism | Hospitality, Events, & Tourism | 72, 44-45 | 51 | 60 | 4 |
| management-entrepreneurship | Management & Entrepreneurship | 55 | 49 | 249 | 5 |
| marketing-sales | Marketing & Sales | 54 | 27 | 54 | 4 |
| public-service-safety | Public Service & Safety | 56, 92 | 108 | 249 | 5 |
| supply-chain-transportation | Supply Chain & Transportation | 42, 48-49 | 84 | 70 | 6 |

## Interdisciplinary Analysis

### Multi-Cluster Occupations
- **Single Cluster SOCs:** 726 (85%)
- **Multi-Cluster SOCs:** 125 (15%)
- **Most Interdisciplinary:** SOC 15-2021 (Mathematicians) - 8 clusters

### Multi-Cluster Education Programs
- **Single Cluster CIPs:** 746 (38%)
- **Multi-Cluster CIPs:** 1,199 (62%)
- **Highly Interdisciplinary Examples:**
  - Business Administration: 10 clusters
  - Statistics: 8 clusters
  - General Business: 10 clusters

### Relationship Density
- **Average Education Programs per SOC:** 6.8
- **Average SOCs per Education Program:** 3.0
- Indicates strong many-to-many relationships between occupations and education paths

## Sample Crosswalk: Industrial Production Managers

**SOC Code:** 11-3051 (Industrial Production Managers)

**Career Clusters (3):**
- Advanced Manufacturing → Production & Automation
- Management & Entrepreneurship → Leadership & Operations
- Supply Chain & Transportation → Planning & Logistics

**Education Programs (9):**
1. Industrial Engineering (CIP 14.3501)
2. Engineering/Industrial Management (CIP 15.1501)
3. Business Administration and Management (CIP 52.0201)
4. Operations Management and Supervision (CIP 52.0205)
5. Logistics, Materials, and Supply Chain Management (CIP 52.0203)
6. Science/Technology Management (CIP 52.0216)
7. Business/Commerce, General (CIP 52.0101)
8. Clinical and Industrial Drug Development (CIP 51.2006)
9. Industrial and Physical Pharmacy (CIP 51.2009)

## Sample Crosswalk: Software Developers

**SOC Code:** 15-1252 (Software Developers)

**Career Clusters (2):**
- Digital Technology → Software Solutions
- Digital Technology → Web & Cloud
- Arts, Entertainment, & Design → Design & Digital Arts

**Education Programs (19 including):**
- Computer Programming/Programmer, General (CIP 11.0201)
- Artificial Intelligence (CIP 11.0102)
- Information Technology (CIP 11.0103)
- Computer Game Programming (CIP 11.0204)
- Web Development (CIP 11.0801)
- Computer Science (CIP 11.0701)

## Data Quality & Validation

### ID Format
✓ All entities use name-based IDs (slugified from display names)
- Career Clusters: `advanced-manufacturing`, `digital-technology`
- Sub-Clusters: `digital-technology/software-solutions`
- Education Programs: `computer-science`, `mechanical-engineering`

### Referential Integrity
✓ All 1,203 SOC mappings reference valid career clusters
✓ All 4,725 CIP mappings reference valid career clusters
✓ All 5,775 SOC-CIP mappings reference valid programs
✓ All sub-cluster IDs properly reference parent clusters

### Data Completeness
- 100% of career clusters have NAICS alignment
- 100% of sub-clusters linked to parent clusters
- 100% of education programs have CIP codes
- All relationship mappings validated

## Use Cases

### 1. Career Pathway Planning
Map from education programs → career clusters → occupations
Example: "Computer Science" degree → Digital Technology cluster → Software Developer (15-1252)

### 2. Workforce Development
Identify education needs for regional industries using NAICS → Career Cluster → CIP mapping

### 3. Curriculum Design
Align educational programs with multiple career pathways using interdisciplinary mappings

### 4. Labor Market Analysis
Cross-reference occupation demand (SOC) with education supply (CIP) via career clusters

### 5. Industry Sector Analysis
Aggregate data by NAICS-aligned career clusters for economic planning

## Source Data

Processed from AdvanceCTE National Career Clusters® Framework Crosswalks:
- **Source Directory:** `.source/AdvanceCTE/`
- **Primary Files:**
  - `AdvanceCTE.SOC-CareerClusters.SOC---CC---Sub-Clusters.tsv`
  - `AdvanceCTE.CIP-CareerClusters.CIP---CC---Sub-Clusters.tsv`
  - `AdvanceCTE.FullCrosswalk.SOC---CIP---CC.tsv`
- **Total Source Files:** 29 TSV files
- **Processing Script:** `process_advancecte.py`

## Key Features

1. **Name-Based IDs:** Human-readable, URL-friendly identifiers throughout
2. **Hierarchical Structure:** Clusters → Sub-Clusters → Mappings
3. **Complete Crosswalk:** SOC ↔ CIP ↔ Career Clusters ↔ NAICS
4. **Interdisciplinary Support:** Many-to-many relationships preserved
5. **Industry Alignment:** Direct NAICS mapping for economic analysis
6. **Validated Data:** All referential integrity checks passed

## Integration Points

These files integrate with existing `.data/` files:
- **Occupations.tsv** - SOC codes with occupation details
- **Industries.tsv** - NAICS codes with industry details
- **Tasks.tsv** - Occupation-specific tasks
- **Verbs.tsv** - Action verbs for career activities

## Next Steps

Potential enhancements:
1. Add NAICS 3-digit and 4-digit sub-cluster mappings
2. Integrate with O*NET detailed occupation data
3. Add wage and employment statistics by cluster
4. Create pathway visualization data
5. Map to APQC process frameworks by cluster
6. Add state/regional program availability data

---

**Generated:** 2024-11-24
**Data Version:** AdvanceCTE National Career Clusters® Framework
**Processing Script:** `process_advancecte.py`

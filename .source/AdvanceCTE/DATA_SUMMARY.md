# Advance CTE Framework Crosswalk - Data Summary

Successfully processed 4 Excel workbooks containing 14 sheets with **15,575 total crosswalk records**.

## Extracted Data Files

### Full Framework Crosswalk (6,705 rows)
- `AdvanceCTE.FullCrosswalk.Overview.tsv` (18 Career Cluster definitions)
- `AdvanceCTE.FullCrosswalk.SOC---CIP---CC.tsv` (6,687 SOC×CIP×Career Cluster mappings)

### CIP to Career Clusters (8,619 rows)
- `AdvanceCTE.CIP-CareerClusters.Overview.tsv` (2 rows)
- `AdvanceCTE.CIP-CareerClusters.CIP---CC---Sub-Clusters.tsv` (4,725 CIP programs mapped to clusters/sub-clusters)
- `AdvanceCTE.CIP-CareerClusters.CIP---CC--Wide-.tsv` (1,946 CIP to cluster mappings, wide format)
- `AdvanceCTE.CIP-CareerClusters.Single-Career-Cluster-CIPs.tsv` (746 CIPs aligned to one cluster)
- `AdvanceCTE.CIP-CareerClusters.Interdisciplinary-CIPs.tsv` (1,200 CIPs spanning multiple clusters)

### SOC to Career Clusters (2,907 rows)
- `AdvanceCTE.SOC-CareerClusters.Overview.tsv` (2 rows)
- `AdvanceCTE.SOC-CareerClusters.SOC---CC---Sub-Clusters.tsv` (1,203 SOC occupations mapped to clusters/sub-clusters)
- `AdvanceCTE.SOC-CareerClusters.SOC---CC--Wide-.tsv` (851 SOC to cluster mappings, wide format)
- `AdvanceCTE.SOC-CareerClusters.Single-Career-Cluster-SOCs.tsv` (726 SOCs in one cluster only)
- `AdvanceCTE.SOC-CareerClusters.Interdisciplinary-SOCs.tsv` (125 SOCs spanning multiple clusters)

### NAICS to Career Clusters (129 rows)
- `AdvanceCTE.NAICS-CareerClusters.Overview.tsv` (17 rows)
- `AdvanceCTE.NAICS-CareerClusters.CC---Sub-Cluster---NAICS.tsv` (112 NAICS industries mapped to clusters/sub-clusters)

## Career Clusters (14 total)

1. **Advanced Manufacturing** (31-33)
   - Production & Automation
   - Engineering
   - Safety & Quality Assurance
   - Robotics
   - Industrial Machinery

2. **Agriculture** (11)
   - Agribusiness
   - Food Science & Processing
   - Water Systems
   - Plant Systems
   - Animal Systems
   - Natural Resources

3. **Arts, Entertainment & Design** (71)
   - Media Production
   - Performing Arts
   - Design & Visual Arts

4. **Construction** (23)
   - Construction Management
   - Building Systems
   - Civil Engineering

5. **Digital Technology** (51, 54)
   - Software Development
   - Cybersecurity
   - Data Science
   - Network Systems

6. **Education** (61, 92)
   - Teaching & Training
   - Education Administration

7. **Energy & Natural Resources** (21, 22)
   - Energy Production
   - Conservation & Land Management

8. **Financial Services** (52, 53)
   - Banking & Finance
   - Insurance
   - Real Estate

9. **Healthcare & Human Services** (62, 81)
   - Healthcare
   - Public Health
   - Human Services

10. **Hospitality, Events, & Tourism** (72, 44-45)
    - Hospitality & Lodging
    - Food Services
    - Events & Tourism

11. **Management & Entrepreneurship** (55)
    - Leadership & Operations
    - Entrepreneurship & Small Business

12. **Marketing & Sales** (54)
    - Marketing Management
    - Sales & Service

13. **Public Service & Safety** (56, 92)
    - Law & Public Safety
    - Government & Public Administration

14. **Supply Chain & Transportation** (42, 48-49)
    - Logistics & Supply Chain
    - Transportation Operations

## Data Schemas

### SOC-Career Clusters Schema
```typescript
{
  socCode: string              // 6-digit SOC code (e.g., "11-1011")
  occupationTitle: string      // Occupation name
  careerCluster: string        // Career cluster name
  subCluster: string           // Sub-cluster name
}
```

### NAICS-Career Clusters Schema
```typescript
{
  careerCluster: string        // Career cluster name
  subCluster: string           // Sub-cluster name
  2digitNaics: string          // 2-digit NAICS code or range (e.g., "31-33")
  naicsTitle: string           // NAICS industry title
}
```

### CIP-Career Clusters Schema
```typescript
{
  cipCode: string              // CIP code (e.g., "01.0101")
  cipTitle: string             // CIP program title
  careerCluster: string        // Career cluster name
  subCluster: string           // Sub-cluster name
}
```

## Usage for Enrichment

This data enables:

1. **Occupation to Industry Mapping**
   - SOC → Career Cluster → NAICS (via cluster alignment)

2. **Education to Career Mapping**
   - CIP → Career Cluster → SOC
   - CIP → Career Cluster → NAICS

3. **Interdisciplinary Analysis**
   - 125 SOC codes span multiple clusters (transferable skills)
   - 1,200 CIP programs align to multiple clusters (broad education)

4. **Industry Clustering**
   - Group NAICS industries by Career Cluster for analysis
   - Identify related industries within clusters

## Next Steps

Use this data to create:
- `.enrichment/Occupations.CareerClusters.tsv` (SOC → Cluster mappings)
- `.enrichment/Industries.CareerClusters.tsv` (NAICS → Cluster mappings)
- `.enrichment/Education.CareerClusters.tsv` (CIP → Cluster mappings)
- `.enrichment/CareerClusters.Taxonomy.tsv` (Cluster hierarchy)
- `.enrichment/Occupations.Industries.tsv` (SOC → NAICS via clusters)

## Processing Script

Data extracted using: `.scripts/process-advancecte.ts`

This script:
- Reads all sheets from each Excel workbook
- Filters out header/instruction rows
- Normalizes column names to camelCase
- Outputs to TSV format with proper escaping

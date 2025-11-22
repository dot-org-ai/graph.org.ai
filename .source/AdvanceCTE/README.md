# Advance CTE Framework Crosswalk

Career and Technical Education framework crosswalks connecting CIP, SOC, NAICS, and Career Clusters.

## Data Source

**Organization**: Advance CTE (Advancing Excellence in Career Technical Education)
**Resource**: Framework Crosswalk
**URL**: https://careertech.org/resource/framework-crosswalk/
**Last Updated**: September 2025

## Classification Systems Included

1. **CIP** - Classification of Instructional Programs (U.S. Department of Education)
2. **SOC** - Standard Occupational Classification (Bureau of Labor Statistics)
3. **NAICS** - North American Industry Classification System (Census Bureau)
4. **Career Clusters & Sub-Clusters** - 16 broad career clusters and associated sub-clusters

## Data Files

| File | Size | Description |
|------|------|-------------|
| `Full_Framework_Crosswalk.xlsx` | 389KB | Complete crosswalk with all four classification systems |
| `CIP_Career_Clusters_Crosswalk.xlsx` | 340KB | CIP codes mapped to Career Clusters |
| `SOC_Career_Clusters_Crosswalk.xlsx` | 194KB | SOC codes mapped to Career Clusters |
| `NAICS_Subclusters_Crosswalk.xlsx` | 186KB | NAICS codes mapped to Career Clusters and Sub-Clusters |

## Expected TSV Output

After ingestion, the following files will be created:

| Output File | Description |
|-------------|-------------|
| `AdvanceCTE.FullCrosswalk.tsv` | Combined crosswalk: CIP → SOC → NAICS → Career Clusters |
| `AdvanceCTE.CIP-CareerClusters.tsv` | CIP to Career Cluster mappings |
| `AdvanceCTE.SOC-CareerClusters.tsv` | SOC to Career Cluster mappings |
| `AdvanceCTE.NAICS-CareerClusters.tsv` | NAICS to Career Cluster and Sub-Cluster mappings |
| `AdvanceCTE.CareerClusters.tsv` | Career Cluster taxonomy |

## Schema

### FullCrosswalk

```typescript
{
  careerCluster: string       // Career cluster name
  careerClusterCode: string   // Career cluster code
  subCluster: string          // Sub-cluster name (if applicable)
  cipCode: string             // CIP code
  cipTitle: string            // CIP title
  socCode: string             // SOC code
  socTitle: string            // SOC title
  naicsCode: string           // NAICS code
  naicsTitle: string          // NAICS title
}
```

### CIP-CareerClusters

```typescript
{
  cipCode: string             // CIP code
  cipTitle: string            // CIP title
  careerCluster: string       // Career cluster name
  careerClusterCode: string   // Career cluster code
}
```

### SOC-CareerClusters

```typescript
{
  socCode: string             // SOC code
  socTitle: string            // SOC title
  careerCluster: string       // Career cluster name
  careerClusterCode: string   // Career cluster code
}
```

### NAICS-CareerClusters

```typescript
{
  naicsCode: string           // NAICS code
  naicsTitle: string          // NAICS title
  careerCluster: string       // Career cluster name
  careerClusterCode: string   // Career cluster code
  subCluster: string          // Sub-cluster name
}
```

### CareerClusters

```typescript
{
  code: string                // Career cluster code
  name: string                // Career cluster name
  description: string         // Career cluster description
  subClusters: string[]       // Array of sub-cluster names
}
```

## 16 Career Clusters

1. Agriculture, Food & Natural Resources
2. Architecture & Construction
3. Arts, Audio/Video Technology & Communications
4. Business Management & Administration
5. Education & Training
6. Finance
7. Government & Public Administration
8. Health Science
9. Hospitality & Tourism
10. Human Services
11. Information Technology
12. Law, Public Safety, Corrections & Security
13. Manufacturing
14. Marketing
15. Science, Technology, Engineering & Mathematics
16. Transportation, Distribution & Logistics

## Usage in Enrichment

This data will be used to create:

### Direct Mappings
- `.enrichment/CIP.SOC.tsv` - Educational programs to occupations
- `.enrichment/CIP.NAICS.tsv` - Educational programs to industries
- `.enrichment/SOC.NAICS.tsv` - Occupations to industries (via career clusters)

### Career Cluster Enrichment
- `.enrichment/Occupations.CareerClusters.tsv` - O*NET/SOC to career clusters
- `.enrichment/Industries.CareerClusters.tsv` - NAICS to career clusters
- `.enrichment/CareerClusters.Taxonomy.tsv` - Career cluster hierarchy

### Cross-Source Integration
Combine with:
- O*NET occupation data (SOC codes)
- NAICS industry data
- BLS Industry-Occupation Matrix

## Update Information

Check for updates at:
- https://careertech.org/resource/framework-crosswalk/

Advance CTE typically updates the framework crosswalk annually or biennially to align with updates to the underlying classification systems (CIP, SOC, NAICS).

## Download Command

```bash
cd .source/AdvanceCTE
curl -L -o Full_Framework_Crosswalk.xlsx 'https://careertech.org/wp-content/uploads/2025/09/Full_Framework_Crosswalk.xlsx'
curl -L -o CIP_Career_Clusters_Crosswalk.xlsx 'https://careertech.org/wp-content/uploads/2025/09/Full_Framework_Crosswalk_CIP-Career-Clusters.xlsx'
curl -L -o SOC_Career_Clusters_Crosswalk.xlsx 'https://careertech.org/wp-content/uploads/2025/09/Full_Framework_Crosswalk_SOC-Career-Clusters.xlsx'
curl -L -o NAICS_Subclusters_Crosswalk.xlsx 'https://careertech.org/wp-content/uploads/2025/09/Full_Framework_Crosswalk_NAICS-Career-Clusters-Subclusters.xlsx'
```

## License

Consult Advance CTE for licensing and usage terms:
https://careertech.org/

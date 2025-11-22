# BLS (Bureau of Labor Statistics) Data

Industry-occupation crosswalk data from the U.S. Bureau of Labor Statistics Employment Projections program.

## Data Sources

### National Employment Matrix

The BLS develops the National Employment Matrix presenting employment for approximately:
- **300 detailed industries** (based on 2022 NAICS)
- **800 detailed occupations** (based on 2018 SOC)

**Primary Sources:**
- [Industry-Occupation Matrix by Industry](https://www.bls.gov/emp/tables/industry-occupation-matrix-industry.htm)
- [Industry-Occupation Matrix by Occupation](https://www.bls.gov/emp/tables/industry-occupation-matrix-occupation.htm)
- [Employment Projections Data Overview](https://www.bls.gov/emp/documentation/data-overview.htm)
- [Classifications and Crosswalks](https://www.bls.gov/emp/documentation/crosswalks.htm)

## Manual Download Required

The BLS industry-occupation matrix data requires manual download from the BLS website.

### Download Instructions

1. Visit the [BLS Employment Projections Tables](https://www.bls.gov/emp/tables.htm)
2. Navigate to "Industry-occupation matrix data"
3. Download the following files:
   - Industry-occupation matrix by industry (Excel)
   - Industry-occupation matrix by occupation (Excel)
4. Save files to this directory as:
   - `BLS.IndustryOccupationMatrix.ByIndustry.xlsx`
   - `BLS.IndustryOccupationMatrix.ByOccupation.xlsx`

### Additional Crosswalk Files

From [BLS Classifications and Crosswalks](https://www.bls.gov/emp/documentation/crosswalks.htm):
- National Employment Matrix/SOC to ACS Crosswalk (XLSX)
- National Employment Matrix/SOC to CPS Crosswalk (XLSX)

## Data Files (To Be Added)

After manual download, this directory should contain:

| File | Description |
|------|-------------|
| `BLS.IndustryOccupationMatrix.ByIndustry.xlsx` | Employment by NAICS industry and SOC occupation |
| `BLS.IndustryOccupationMatrix.ByOccupation.xlsx` | Employment by SOC occupation and NAICS industry |
| `BLS.SOC-ACS-Crosswalk.xlsx` | SOC to American Community Survey crosswalk |
| `BLS.SOC-CPS-Crosswalk.xlsx` | SOC to Current Population Survey crosswalk |

## Expected TSV Output

After ingestion, the following files will be created:

| Output File | Description |
|-------------|-------------|
| `BLS.IndustryOccupationMatrix.tsv` | Combined matrix with NAICS code, industry name, SOC code, occupation name, employment counts |
| `BLS.SOC-ACS-Crosswalk.tsv` | SOC to ACS occupation crosswalk |
| `BLS.SOC-CPS-Crosswalk.tsv` | SOC to CPS occupation crosswalk |

## Schema

### IndustryOccupationMatrix

```typescript
{
  naicsCode: string          // NAICS industry code
  naicsTitle: string         // NAICS industry title
  socCode: string            // SOC occupation code
  socTitle: string           // SOC occupation title
  employmentBase: number     // Base year employment (thousands)
  employmentProjected: number // Projected year employment (thousands)
  employmentChange: number   // Numeric change
  employmentChangePercent: number // Percent change
  baseYear: number           // Base year (e.g., 2022)
  projectedYear: number      // Projected year (e.g., 2032)
}
```

## Usage in Enrichment

This data will be used to create:
- `.enrichment/Industries.Occupations.tsv` - NAICS to SOC mappings with employment weights
- `.enrichment/Occupations.Industries.tsv` - SOC to NAICS mappings with employment weights

Employment counts can be used as weights when aggregating digital scores and other metrics across industries and occupations.

## Data Update Frequency

BLS updates the Employment Projections data every 2 years. Check for new releases at:
https://www.bls.gov/emp/

## Classification Systems

- **Industries**: 2022 North American Industry Classification System (NAICS)
- **Occupations**: 2018 Standard Occupational Classification (SOC)

For more information on classification systems and crosswalks, see:
https://www.bls.gov/emp/documentation/crosswalks.htm

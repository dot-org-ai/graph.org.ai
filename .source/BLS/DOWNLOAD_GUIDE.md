# BLS OES Data Download Guide

Step-by-step instructions for downloading Occupational Employment and Wage Statistics (OES) data.

## Quick Links

- **OES Homepage**: https://www.bls.gov/oes/
- **OES Tables**: https://www.bls.gov/oes/tables.htm
- **Data Download Page**: https://www.bls.gov/oes/data.htm
- **Latest Release (May 2024)**: https://www.bls.gov/oes/current/oessrcst.htm

## Option 1: Flat Files (Recommended for Bulk Data)

### Step 1: Navigate to Download Page
Visit: https://www.bls.gov/oes/special.requests/oesm24all.zip

Or manually:
1. Go to https://www.bls.gov/oes/
2. Click "Special Requests" or "Download OES Data"
3. Look for "All OES Data" or current year download

### Step 2: Download All OES Data
```bash
cd .source/BLS
curl -O https://www.bls.gov/oes/special.requests/oesm24all.zip
unzip oesm24all.zip
```

### Files Included:
- `all_data_M_2024.xlsx` - All areas, all occupations (May 2024)
- `national_M2024_dl.xlsx` - National data only
- `state_M2024_dl.xlsx` - State-level data
- `MSA_M2024_dl.xlsx` - Metropolitan area data

## Option 2: Interactive Query Tool

### Step 1: Use One-Screen Data Search
Visit: https://data.bls.gov/oes/#/home

### Step 2: Configure Query
1. Select **Occupation**: Choose specific SOC codes or "All occupations"
2. Select **Area**: National, State, or Metro area
3. Select **Data Type**:
   - Employment
   - Wages (hourly, annual)
   - Percentiles (10th, 25th, median, 75th, 90th)

### Step 3: Download Results
- Format: Excel or CSV
- Save to `.source/BLS/`

## Option 3: API Access (For Automation)

### BLS Public Data API
```bash
# Register for API key at: https://data.bls.gov/registrationEngine/

# Example API call for SOC 15-1252 (Software Developers)
curl "https://api.bls.gov/publicAPI/v2/timeseries/data/" \
  -H "Content-Type: application/json" \
  -d '{
    "seriesid": ["OEUM003254000000011252001"],
    "registrationkey": "YOUR_API_KEY"
  }'
```

### Series ID Format:
```
OEUM + AREA + INDUSTRY + OWNERSHIP + SOC + DATA_TYPE
```

Example: `OEUM003254000000011252001`
- OEUM = OES series
- 0032540 = National (all areas)
- 000000 = All industries
- 11 = All ownerships
- 252001 = SOC 15-1252 (Software Developers)

## Data Files to Download

### Recommended Downloads:

1. **National Occupational Employment and Wages**
   - File: `national_M2024_dl.xlsx`
   - Contains: ~830 detailed occupations
   - Columns: SOC, Title, Employment, Hourly wages, Annual wages, Percentiles

2. **National Industry-Occupation Matrix** (see BLS/README.md)
   - Cross-tabulation of industries × occupations
   - Employment counts by NAICS industry and SOC occupation

3. **State-Level Data** (Optional)
   - File: `state_M2024_dl.xlsx`
   - For geographic analysis

## Data Schema

### National OES Data Columns:
```typescript
{
  area: string              // "00000" for national
  areaTitle: string         // "U.S."
  areaType: number          // 1=national, 2=state, 4=metro
  naics: string             // "000000" for all industries
  naicsTitle: string        // Industry title
  i_group: string           // Industry group
  own_code: number          // Ownership code
  occ_code: string          // SOC code (e.g., "15-1252")
  occ_title: string         // Occupation title
  o_group: string           // Occupation group
  tot_emp: number           // Total employment
  emp_prse: number          // Employment percent relative standard error
  h_mean: number            // Mean hourly wage
  a_mean: number            // Mean annual wage
  mean_prse: number         // Mean wage percent relative standard error
  h_pct10: number           // 10th percentile hourly wage
  h_pct25: number           // 25th percentile hourly wage
  h_median: number          // Median hourly wage
  h_pct75: number           // 75th percentile hourly wage
  h_pct90: number           // 90th percentile hourly wage
  a_pct10: number           // 10th percentile annual wage
  a_pct25: number           // 25th percentile annual wage
  a_median: number          // Median annual wage
  a_pct75: number           // 75th percentile annual wage
  a_pct90: number           // 90th percentile annual wage
  annual: boolean           // True if annual, false if hourly
  hourly: boolean           // True if hourly occupation
}
```

## Processing with Ingest Script

After downloading, the ingest script will:
1. Read downloaded Excel files
2. Extract relevant columns
3. Normalize to camelCase column names
4. Output to `.source/BLS/*.tsv` files

Expected output files:
- `BLS.OES.National.tsv` - National wage and employment data
- `BLS.OES.States.tsv` - State-level data (if downloaded)
- `BLS.OES.Metro.tsv` - Metropolitan area data (if downloaded)

## Update Frequency

BLS releases OES data **annually** in March/April for the previous May:
- **May 2024 data** - Released March 2025
- **May 2023 data** - Released March 2024

Check for updates: https://www.bls.gov/oes/

## Common SOC Codes for Testing

| SOC Code | Occupation | Typical Wage |
|----------|------------|--------------|
| 11-1011 | Chief Executives | $206,680/year |
| 15-1252 | Software Developers | $132,270/year |
| 29-1141 | Registered Nurses | $86,070/year |
| 41-2031 | Retail Salespersons | $30,940/year |
| 47-2111 | Electricians | $63,310/year |

## Troubleshooting

### Excel File Too Large
If Excel files are too large to process:
1. Use CSV format instead
2. Split by state or metro area
3. Use API for specific occupations only

### Missing Data
- "#" in wage columns = data not available
- "*" = estimate not released
- "**" = estimate below publication standards

### API Rate Limits
- Daily limit: 500 queries per day
- Register for key: https://data.bls.gov/registrationEngine/

## Enrichment Use Cases

### 1. Wage Enrichment
Map SOC codes to wage data:
```
.enrichment/Occupations.Wages.tsv
├── socCode
├── occupationTitle
├── medianHourlyWage
├── medianAnnualWage
├── wagePercentile10
├── wagePercentile90
└── employmentCount
```

### 2. Industry Wage Analysis
Combine with Industry-Occupation Matrix:
```
.enrichment/Industries.Wages.tsv
├── naicsCode
├── industryTitle
├── avgWage (weighted by employment)
└── totalEmployment
```

### 3. Task Cost Calculation
```
TaskCost = TaskTime(hours) × OccupationHourlyWage
```

### 4. Process Cost Calculation
```
ProcessCost = Σ(TaskCost × RoleDistribution)
```

## Additional Resources

- **OES Overview**: https://www.bls.gov/oes/oes_emp.htm
- **Technical Notes**: https://www.bls.gov/oes/current/oes_tec.htm
- **SOC Structure**: https://www.bls.gov/soc/
- **NAICS Codes**: https://www.census.gov/naics/

## Support

For questions about BLS data:
- Email: oesinfo@bls.gov
- Phone: (202) 691-6569

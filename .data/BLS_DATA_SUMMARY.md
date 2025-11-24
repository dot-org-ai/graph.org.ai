# BLS Employment and Wage Data Generation Summary

Generated: 2024-11-24

## Source Data

Primary source files from `.source/BLS/`:
- `BLS.OES.National.May2024.tsv` - National employment and wage data (2,021,745 records)
- `BLS.STEM.STEM_occupations_list.tsv` - STEM occupation classifications (105 occupations)
- `BLS.Education.National.tsv` - Education requirements by occupation
- `oe.occupation` - BLS occupation code/name lookup (1,105 occupations)
- `oe.datatype` - Data type definitions (employment, wages, percentiles)

## Generated Files

### 1. Employment.tsv
- **Location**: `.data/Employment.tsv`
- **Records**: 1,019 occupations
- **Fields**:
  - `id`: Occupation identifier (name-based for compatibility)
  - `name`: Full occupation name
  - `code`: 6-digit SOC code (BLS format)
  - `employment`: Total employment count
  - `matched_onet`: Boolean indicating ONET match
- **ONET Match Rate**: 72% (734 of 1,019 occupations)

**Top 5 by Employment**:
1. Office and Administrative Support Occupations - 18,218,070 employees
2. Transportation and Material Moving Occupations - 13,645,620 employees
3. Food Preparation and Serving Related Occupations - 13,613,490 employees
4. Sales and Related Occupations - 13,351,680 employees
5. Management Occupations - 10,966,830 employees

### 2. Wages.tsv
- **Location**: `.data/Wages.tsv`
- **Records**: 1,019 occupations
- **Fields**:
  - `id`: Occupation identifier
  - `name`: Full occupation name
  - `code`: 6-digit SOC code
  - `annual_mean`: Mean annual wage
  - `annual_median`: Median annual wage
  - `annual_10th`: 10th percentile annual wage
  - `annual_25th`: 25th percentile annual wage
  - `annual_75th`: 75th percentile annual wage
  - `annual_90th`: 90th percentile annual wage
  - `hourly_mean`: Mean hourly wage
  - `hourly_median`: Median hourly wage
  - `matched_onet`: Boolean indicating ONET match
- **ONET Match Rate**: 72% (734 of 1,019 occupations)

**Top 5 by Annual Mean Wage**:
1. Pediatric Surgeons - $450,810
2. Cardiologists - $432,490
3. Surgeons, All Other - $371,280
4. Ophthalmologists, Except Pediatric - $365,060
5. Oral and Maxillofacial Surgeons - $360,240

### 3. STEMOccupations.tsv
- **Location**: `.data/STEMOccupations.tsv`
- **Records**: 105 STEM occupations
- **Fields**:
  - `id`: Occupation identifier
  - `name`: Full occupation name
  - `code`: SOC code (with hyphens, ONET format)
  - `employment`: Total employment count
  - `annual_mean_wage`: Mean annual wage
  - `matched_onet`: Boolean indicating ONET match
- **ONET Match Rate**: 100% (105 of 105 occupations)

**Top 5 STEM Occupations by Employment**:
1. Software Developers - 1,654,440 employees ($144,570/year)
2. Computer User Support Specialists - 697,210 employees ($64,990/year)
3. Computer and Information Systems Managers - 645,970 employees ($187,990/year)
4. Health Informatics Specialists - 497,800 employees ($111,960/year)
5. Information Technology Project Managers - 439,380 employees ($151,780/year)

## Processing Statistics

- **Source records processed**: 2,021,745 BLS data records
- **BLS series parsed**: 32,925 valid series
- **Unique occupations identified**: 1,019
- **Overall ONET match rate**: 37.31% of processed series (72% of unique occupations)

## Data Quality Notes

1. **Code Format Handling**: Successfully mapped BLS 6-digit codes (e.g., 111011) to ONET SOC format (e.g., 11-1011.00)
2. **Missing Values**: Some wage percentiles marked as "-", "*", or "#" in source data indicate:
   - `-`: Data not available or cannot be calculated
   - `*`: Estimate not released
   - `#`: Wage greater than $100.00 per hour or $208,000 per year
3. **Occupation Hierarchy**: Includes both aggregate categories (e.g., "Management Occupations") and detailed occupations
4. **STEM Definition**: Uses BLS Standard Occupational Classification Policy Committee (SOCPC) definition - domains 1 and 3

## Join Success Rate

The join between BLS and ONET data achieved:
- **72% match rate** for detailed occupations (734 of 1,019)
- **100% match rate** for STEM occupations (all 105 matched)
- Unmatched records (28%) are primarily aggregate occupation categories that don't have direct ONET equivalents

## Usage

These files can be joined with other ONET data files using the `id` field:
- Join with `Occupations.tsv` for detailed occupation information
- Join with `Tasks.tsv` for occupation-specific tasks
- Join with `Processes.tsv` for work processes
- Join with `Industries.tsv` for industry-occupation relationships

## Processing Script

The data was generated using: `.scripts/process_bls_data.js`

To regenerate:
```bash
node .scripts/process_bls_data.js
```

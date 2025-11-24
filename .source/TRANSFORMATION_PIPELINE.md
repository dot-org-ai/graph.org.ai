# Data Transformation Pipeline

## Overview

The transformation pipeline converts raw source data into standardized `[Source].[Type].tsv` files with consistent camelCase column names and PascalCase filenames.

## Pipeline Script

**Location**: `.scripts/transform-pipeline.ts`

**Usage**:
```bash
tsx .scripts/transform-pipeline.ts
```

## Transformation Rules

1. **Column Headers**: Converted to camelCase
   - Example: `O*NET-SOC Code` → `oNETSOCCode`
   - Example: `Career Cluster` → `careerCluster`

2. **Filenames**: Converted to PascalCase
   - Pattern: `[Source].[Type].tsv`
   - Example: `ONET.AlternateTitles.tsv`
   - Example: `NAICS.2022NAICSStructure.tsv`

3. **Format**: Tab-separated values (TSV)
   - Delimiter: `\t` (tab)
   - Encoding: UTF-8
   - Line endings: LF (`\n`)

## Source Directory Structure

```
.source/
├── [Source]/
│   ├── [raw-data-files]        # Original source files
│   │   ├── *.txt, *.csv, *.xlsx
│   │   └── subdirectories/
│   └── [Source].[Type].tsv     # Transformed output files
```

## Supported Sources

### ✅ ONET (41 files)
- **Raw Data**: `.source/ONET/db_30_0_text/*.txt`
- **Format**: Tab-delimited text files
- **Output**: 41 TSV files with occupational data

### ✅ NAICS (2 files)
- **Raw Data**: `.source/NAICS/*.xlsx`
- **Format**: Excel spreadsheets
- **Output**: Industry classification structure

### ✅ NAPCS (1 file)
- **Raw Data**: `.source/NAPCS/*.csv`
- **Format**: CSV files
- **Output**: Product/service classification

### ✅ UNSPSC (1 file)
- **Raw Data**: `.source/UNSPSC/*.tsv` (already transformed)
- **Format**: TSV
- **Output**: Universal product code classification

### ✅ AdvanceCTE (14+ files from 4 workbooks)
- **Raw Data**: `.source/AdvanceCTE/*.xlsx`
- **Format**: Excel workbooks with multiple sheets
- **Output**: Career cluster crosswalks (CIP, SOC, NAICS)

### ✅ APQC (23+ files per industry)
- **Raw Data**: `.source/APQC/*.xlsx`
- **Format**: Excel workbooks (Process Classification Framework)
- **Output**: Business process taxonomies by industry

### ✅ GS1 (2 files)
- **Raw Data**: `.source/GS1/*.xlsx`
- **Format**: Excel spreadsheets
- **Output**: Global product classification

### ✅ GeoNames (2 files)
- **Raw Data**: `.source/GeoNames/*.txt`
- **Format**: Tab-delimited text files
- **Output**: Geographic data
- **Note**: `allCountries.txt` requires custom header mapping

### ✅ Schema.org (2 files)
- **Raw Data**: Already transformed
- **Output**: Schema.org types and properties

### ⏳ BLS (Pending)
- **Raw Data**: `.source/BLS/oesm24all/*.xlsx` (78MB file)
- **Format**: Large Excel spreadsheet
- **Status**: Skipped in main pipeline due to size
- **Note**: Requires separate processing

## Adding New Sources

To add a new source to the pipeline:

1. **Create transformer function** in `.scripts/transform-pipeline.ts`:

```typescript
function transformYourSource(): void {
  console.log('\n📊 Transforming YourSource...')
  
  const sourceDir = path.join(SOURCE_DIR, 'YourSource')
  
  // For Excel files
  const xlsxFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.xlsx'))
  for (const xlsxFile of xlsxFiles) {
    transformExcelFile(path.join(sourceDir, xlsxFile), sourceDir, 'YourSource')
  }
  
  // For text files
  const txtFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.txt'))
  for (const txtFile of txtFiles) {
    const typeName = toPascalCase(txtFile.replace('.txt', ''))
    const targetPath = path.join(sourceDir, `YourSource.${typeName}.tsv`)
    transformTextFile(path.join(sourceDir, txtFile), targetPath, '\t')
  }
}
```

2. **Add to main pipeline**:

```typescript
async function main(): Promise<void> {
  // ...
  transformYourSource()
  // ...
}
```

3. **Export the function**:

```typescript
export {
  // ...
  transformYourSource,
}
```

## Utility Functions

### `toCamelCase(str: string): string`
Converts column headers to camelCase.

### `toPascalCase(str: string): string`
Converts filenames to PascalCase.

### `parseTSV(content: string, delimiter: string): any[]`
Parses delimited text into structured data.

### `writeTSV(filePath: string, data: any[]): void`
Writes structured data as TSV with camelCase headers.

### `transformTextFile(sourcePath, targetPath, delimiter)`
Transforms text files (txt, csv, tsv).

### `transformExcelFile(sourcePath, targetDir, sourcePrefix)`
Transforms Excel workbooks (all sheets).

## Current Status

**Total**: 159 TSV files across 14 sources

| Source | TSV Files | Status |
|--------|-----------|--------|
| ONET | 41 | ✅ Complete |
| AdvanceCTE | 29 | ✅ Complete |
| APQC | 23 | ✅ Complete |
| BLS | 22 | ⏳ Partial (missing large file) |
| Business | 18 | ✅ Complete |
| GS1 | 8 | ✅ Complete |
| Language | 7 | ✅ Complete |
| NAICS | 2 | ✅ Complete |
| GeoNames | 2 | ✅ Complete |
| Integrations | 2 | ✅ Complete |
| Schema.org | 2 | ✅ Complete |
| UNSPSC | 1 | ✅ Complete |
| NAPCS | 1 | ✅ Complete |
| Models | 1 | ✅ Complete |

## Known Issues

1. **BLS Large File**: The `all_data_M_2024.xlsx` (78MB) is currently skipped due to processing time. Consider processing it separately or implementing streaming.

2. **GeoNames allCountries.txt**: Requires custom header mapping as the file doesn't include column headers.

3. **APQC Duplicates**: Multiple industry variants create many similar TSV files. Consider consolidating or organizing by industry.

## Maintenance

**Regenerate all transformed files**:
```bash
tsx .scripts/transform-pipeline.ts
```

**Clean and regenerate specific source**:
```bash
rm .source/ONET/ONET.*.tsv
tsx .scripts/transform-pipeline.ts
```

**Add new source data**:
1. Place raw files in `.source/[Source]/`
2. Run pipeline
3. Verify output TSV files

---

Last updated: 2025-11-24

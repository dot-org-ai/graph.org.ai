# Generated Data Documentation

## Overview

This document describes the comprehensive data generation process for GraphDL semantics, including entity expansion, classification systems integration, and output formats.

## Data Sources

### 1. NAICS (North American Industry Classification System)
- **Source**: 2,125 industry classifications
- **Output**: 3,618 industry entities (70% expansion)
- **File**: `.data/Industries.tsv`
- **Expansion Logic**: Conjunction expansion, short name mappings

### 2. O*NET (Occupational Information Network)
- **Source**: 1,016 occupation titles
- **Output**: 1,675 occupation entities (65% expansion)
- **File**: `.data/Occupations.tsv`
- **Tasks**: 73,036 task entities
- **File**: `.data/Tasks.tsv`

### 3. APQC PCF (Process Classification Framework)
- **Source**: Business process framework
- **Output**: 49,095 process entities
- **File**: `.data/Processes.tsv`
- **Concepts**: 59 concept entities
- **File**: `.data/Concepts.tsv`

### 4. UNSPSC (United Nations Standard Products and Services Code)
- **Source**: 158,464 commodities
- **Structure**: 4-tier hierarchy (Segment → Family → Class → Commodity)
- **Contribution**: ~182,918 entities
- **Classification**:
  - Segments 10-64, 95: Products
  - Segments 70-94: Services

### 5. NAPCS (North American Product Classification System)
- **Source**: 3,049 detail-level entries (5,232 total)
- **Version**: 2022 v1.0
- **Structure**: 4-tier hierarchy (Group → Class → Subclass → Detail)
- **Contribution**: ~5,558 entities
- **Classification**:
  - Code starts with 1: Products
  - Code starts with 2-8: Services

### 6. GS1 GPC (Global Product Classification)
- **Status**: Manual download required
- **Structure**: 4-tier hierarchy (Segment → Family → Class → Brick)
- **Instructions**: See `.source/GS1/README.md`

## Entity Expansion

### Conjunction Expansion Patterns

The `toEntityTypes()` function handles complex name patterns:

1. **Comma-Separated Lists with Shared Suffix**
   - Input: "Veneer, Plywood, and Engineered Wood Product Manufacturing"
   - Output: `VeneerWoodProductManufacturing`, `PlywoodWoodProductManufacturing`, `EngineeredWoodProductManufacturing`

2. **Including/Except Clauses**
   - Input: "Beef Cattle Ranching and Farming, including Feedlots"
   - Output: `BeefCattleRanching`, `Farming`, `Feedlots`

3. **Shared Prefix and Suffix**
   - Input: "Fishery information or documentation services"
   - Output: `FisheryInformationServices`, `FisheryDocumentationServices`

4. **Simple Conjunctions**
   - Input: "Dry Pea and Bean Farming"
   - Output: `DryPeaFarming`, `BeanFarming`

5. **Or Conjunctions**
   - Input: "Buffalo or bison"
   - Output: `Buffalo`, `Bison`

### Short Name Mappings

Verbose category names are mapped to concise identifiers:

- "Agriculture, Forestry, Fishing and Hunting" → `Agriculture`
- "Professional, Scientific, and Technical Services" → `ProfessionalServices`
- "Adult Basic Education, Adult Secondary Education, and English as a Second Language Instructors" → `ESLInstructors`

## Output Files

All outputs are located in `/Users/nathanclevenger/projects/graph.org.ai/.data/`

### File Formats

All files use TSV (tab-separated values) format with headers.

#### Industries.tsv
```
id	name	description	code	type
Agriculture	Agriculture, Forestry, Fishing and Hunting	...	11	Industry
```

#### Occupations.tsv
```
id	name	description	code	shortName
ChiefExecutives	Chief Executives	...	11-1011.00	ChiefExecutives
```

#### Tasks.tsv
```
id	description	occupation	occupation_code	verb	object	complement
...
```

#### Processes.tsv
```
id	description	category	source	industries
...
```

#### Products.tsv
```
id	name	description	code
Cattle	Cattle	Live beef and dairy cattle...	10101516
Cattle	Cattle	Live beef and dairy cattle...	NAPCS-1111111
```

#### Services.tsv
```
id	name	description	code
FisheryInformationServices	Fishery information or documentation services	...	70101601
FisheryDocumentationServices	Fishery information or documentation services	...	70101601
```

#### Concepts.tsv
```
id	description	baseNoun	modifiers	category	source
LongTermVision	Strategic direction and goals...	Vision	long-term	Strategic Planning	APQC PCF 7.0
```

#### Verbs.tsv
```
id	baseForm	pastTense	presentParticiple	frequency	source
Develop	develop	developed	developing	1234	All
```

## Current Statistics

| Entity Type | Count | Sources |
|-------------|-------|---------|
| Industries | 3,618 | NAICS |
| Occupations | 1,675 | O*NET |
| Tasks | 73,036 | O*NET + APQC |
| Processes | 49,095 | APQC |
| **Products** | **85,959** | **UNSPSC + NAPCS** |
| **Services** | **102,515** | **UNSPSC + NAPCS** |
| Concepts | 59 | APQC + O*NET |
| Verbs | 432 | All sources |
| **TOTAL** | **316,389** | **All sources** |

## Generation Scripts

### 1. `scripts/generate-comprehensive-outputs-v2.ts`
Generates Industries, Occupations, Tasks, Processes, Concepts, and Verbs.

```bash
tsx scripts/generate-comprehensive-outputs-v2.ts
```

### 2. `scripts/generate-products-services.ts`
Generates Products and Services from UNSPSC, NAPCS, and (optionally) GS1 GPC.

```bash
tsx scripts/generate-products-services.ts
```

## Code Structure

### Key Functions

#### `toEntityTypes(text: string, parser: GraphDLParser, shortNames?: Map<string, string>): string[]`

Converts natural language text to CamelCase entity type identifiers with conjunction expansion.

**Location**: Both generation scripts

**Logic Flow**:
1. Check short name mappings
2. Handle "including/except" clauses
3. Parse comma-separated lists
4. Detect shared prefix/suffix patterns
5. Expand simple conjunctions
6. Convert to CamelCase

#### `parseCSV(line: string): string[]`

Parses CSV lines with proper handling of quoted fields containing commas.

**Location**: `generate-products-services.ts`

**Used for**: NAPCS CSV data

## Testing

### Unit Tests

Entity name expansion is tested in `src/__tests__/entity-name-expansion.test.ts`:

```typescript
describe('Entity Name Expansion', () => {
  test('Complex comma-separated list with shared suffix', () => {
    // Tests "Veneer, Plywood, and Engineered Wood Product Manufacturing"
  })

  test('Including clause expansion', () => {
    // Tests "Beef Cattle Ranching and Farming, including Feedlots"
  })

  // ... more tests
})
```

Run tests:
```bash
npm test
```

## Future Enhancements

1. **GS1 GPC Integration**: Once data is downloaded and converted to TSV
2. **Additional Classification Systems**:
   - HS Codes (Harmonized System)
   - CPV (Common Procurement Vocabulary)
   - ISIC (International Standard Industrial Classification)
3. **Deduplication**: Handle overlapping entities from multiple sources
4. **Relationship Mapping**: Link related products, services, and industries

## Changelog

### 2024-11-22
- ✅ Fixed shared prefix/suffix expansion for patterns like "Fishery information or documentation services"
- ✅ Integrated NAPCS 2022 data (3,049 detail entries)
- ✅ Updated Products and Services counts
- ✅ Documented GS1 GPC manual download process

### Previous
- ✅ Implemented comma-separated list expansion
- ✅ Added short name mappings
- ✅ Integrated UNSPSC data
- ✅ Created comprehensive test suite

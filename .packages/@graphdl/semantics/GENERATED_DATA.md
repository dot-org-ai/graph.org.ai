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
| **Products** | **96,465** | **UNSPSC + NAPCS + GS1 GPC** |
| **Services** | **103,382** | **UNSPSC + NAPCS** |
| **Concepts** | **264,322** | **Tasks, Processes, Descriptions** |
| Verbs | 432 | All sources |
| **Synonyms** | **54,841** | **Product/Service descriptions** |
| **Relationships** | **38,439** | **Product/Service descriptions** |
| **Extracted Verbs** | **3,644** | **Product/Service descriptions** |
| **GS1 Vocabulary** | **123** | **Classes, Transactions, Events, BusinessSteps** |
| **GS1 Activities** | **350** | **verb.noun combinations (ship.Product, etc.)** |
| **GLN Location Types** | **30** | **Hierarchical location classes for GLNs** |
| **Location Relationships** | **52** | **Hierarchical location relationships** |
| **TOTAL** | **739,640** | **All sources** |

## Generation Scripts

### 1. `scripts/generate-comprehensive-outputs-v2.ts`
Generates Industries, Occupations, Tasks, Processes, Concepts, and Verbs.

```bash
tsx scripts/generate-comprehensive-outputs-v2.ts
```

### 2. `scripts/generate-products-services.ts`
Generates Products and Services from UNSPSC, NAPCS, and GS1 GPC.

```bash
tsx scripts/generate-products-services.ts
```

### 3. `.scripts/extract-verbs.ts`
Extracts semantic relationships, synonyms, and verbs from product/service descriptions.

```bash
tsx .scripts/extract-verbs.ts
```

**Extraction Patterns:**
- **Synonyms**: "X or Y", "Synonym is X"
- **derivedFrom**: "derived from X"
- **memberOf**: "member of X", "species of X"
- **typeOf**: "type of X"
- **livesIn**: "lives in X", "found in X"
- **relatedTo**: Cross-references to other products (capitalized terms)
- **Verbs**: -ing and -ed forms from descriptions

**Output Files:**
- `.data/extracted/Synonyms.tsv` - 54,841 synonym relationships
- `.data/extracted/Relationships.tsv` - 38,439 semantic relationships
- `.data/extracted/ExtractedVerbs.tsv` - 3,644 unique verb forms

### 4. `.scripts/extract-concepts.ts`
Extracts noun phrase concepts from tasks, processes, and product/service descriptions.

```bash
tsx .scripts/extract-concepts.ts
```

**Extraction Method:**
- Identifies 2-word and 3-word noun phrases
- Filters out common verbs and stop words
- Requires minimum frequency of 3 occurrences
- Extracts base noun and modifiers

**Output Files:**
- `.data/ExtractedConcepts.tsv` - 264,300 concept entries

**Top Concepts:**
- InterventionProcedure (168,308x)
- SurgicalIntervention (142,904x)
- HealthProblems (93,046x)
- ServiceDelivery (844x)
- CustomerService (469x)
- RiskManagement (270x)
- BusinessStrategy (193x)
- CustomerSatisfaction (173x)

### 5. `.scripts/add-location-hierarchy.ts`
Adds GLN location hierarchy with hierarchical location types and relationships.

```bash
tsx .scripts/add-location-hierarchy.ts
```

**GLN Functional Types (4):**
- **PhysicalLocation**: Physical places (Site, Building, Warehouse, etc.)
- **LegalEntity**: Legal entities (Company, Division)
- **FunctionalEntity**: Operational units (Department, LoadingDock, PickingArea, etc.)
- **DigitalLocation**: Digital/virtual locations (Server, DigitalEndpoint)

**Location Types (30):**
Hierarchical location classes organized by functional type:
- Legal: Company → Division → Department
- Physical Site: Site → Facility/Warehouse/Store/Building
- Building: Building → Floor → Room/Zone
- Warehouse: Warehouse → WarehouseArea → Aisle → Bay → Shelf → Bin
- Manufacturing: ManufacturingPlant → ProductionLine → WorkCenter
- Functional: LoadingDock, ReceivingArea, ShippingArea, StagingArea, etc.

**Output Files:**
- `.source/GS1/GS1.GLN.FunctionalTypes.tsv` - 4 GLN functional types
- `.source/GS1/GS1.Location.Types.tsv` - 30 hierarchical location classes
- `.source/GS1/GS1.Location.Relationships.tsv` - 52 parent-child relationships

**Relationships:**
- `isPartOf`: Child location is part of parent (e.g., Aisle.isPartOf.WarehouseArea)
- `contains`: Parent contains child (e.g., Building.contains.Floor)

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

## Extracted Semantic Relationships

### Relationship Types

The `.scripts/extract-verbs.ts` script extracts five types of semantic relationships from product/service descriptions:

#### 1. relatedTo (35,143 relationships)
Cross-references to other products/services identified by capitalized terms in descriptions.

**Examples:**
```
Buffalo → Bison
MilkForDogs → Milk
Cats → Milk
LiveArmoredCatfish → Carachama
```

#### 2. typeOf (2,781 relationships)
Type and classification relationships extracted from "type of X" patterns.

**Examples:**
```
Cattle → large domesticated ungulates
LiveGuineaFowl → bird in the galliformes order
LiveRedBellyPacuFish → omnivorous South American freshwater fish
LivePeruvianRockSeabassFish → gamefish that lives in rocky and sandy coastal areas
```

#### 3. memberOf (385 relationships)
Family and group membership extracted from "member of X" and "species of X" patterns.

**Examples:**
```
Cattle → subfamily Bovinae
Alpaca → artiodactyla mammal family
LiveSole → soleidae family
LiveSardineFish → clupeidae family
```

#### 4. livesIn (73 relationships)
Habitat and location information extracted from "lives in X" and "found in X" patterns.

**Examples:**
```
Buffalo → herds
LiveSole → freshwater and sea water bottom streams
LiveSardineFish → large schools in coastal waters
LivePeruvianRockSeabassFish → rocky and sandy coastal areas
```

#### 5. derivedFrom (57 relationships)
Origin and derivation relationships extracted from "derived from X" patterns.

**Examples:**
```
Alpaca → vicuna
```

### Synonym Extraction (54,841 synonyms)

Synonyms are extracted from three patterns:

1. **"X or Y" in product names**: `Buffalo or bison` → Buffalo = bison
2. **"X, or Y" in descriptions**: `Cattle, or cows (female)` → Cattle = cows
3. **"Synonym is X"**: `Synonym is Bison` → Buffalo = Bison

**Examples:**
```
Buffalo = bison, Bison
Cattle = cows
LivePalometaFishAureum = mylossomaaureum
LiveFrigateTunaFish = melvafish
LiveArmoredCatfish = carachama
```

### Verb Extraction (3,644 unique verbs)

Verbs are extracted by identifying -ing and -ed word forms in descriptions. Top verbs include:

- **related** (93,595 occurrences)
- **listed** (93,023)
- **opening** (15,261)
- **including** (14,858)
- **canned** (12,589)
- **produced** (11,773)
- **used** (9,638)

These verbs can be used to enhance the GraphDL verb lexicon and identify domain-specific actions.

## Future Enhancements

1. ✅ **GS1 GPC Integration**: Complete
2. ✅ **Semantic Relationship Extraction**: Complete
3. **Additional Classification Systems**:
   - HS Codes (Harmonized System)
   - CPV (Common Procurement Vocabulary)
   - ISIC (International Standard Industrial Classification)
4. **Deduplication**: Handle overlapping entities from multiple sources
5. **Enhanced Relationship Extraction**:
   - Extract properties and attributes
   - Parse complex taxonomic hierarchies
   - Identify part-whole relationships

## Changelog

### 2025-11-22 (Latest)
- ✅ Created GLN location hierarchy script (`.scripts/add-location-hierarchy.ts`)
- ✅ Added 4 GLN functional types (PhysicalLocation, LegalEntity, FunctionalEntity, DigitalLocation)
- ✅ Added 30 hierarchical location types (Company, Site, Warehouse, Building, Aisle, etc.)
- ✅ Generated 52 hierarchical location relationships (partOf, contains)
- ✅ Total entities increased from 739,558 to 739,640 (+82)

### 2024-11-22
- ✅ Created concept extraction script (`.scripts/extract-concepts.ts`)
- ✅ Extracted 264,300 noun phrase concepts from tasks, processes, and descriptions
- ✅ Total entities increased from 474,673 to 738,973 (+264,300)
- ✅ Created semantic extraction script (`.scripts/extract-verbs.ts`)
- ✅ Extracted 54,841 synonym relationships from descriptions
- ✅ Extracted 38,439 semantic relationships (derivedFrom, memberOf, typeOf, livesIn, relatedTo)
- ✅ Extracted 3,644 unique verb forms from descriptions
- ✅ Added slash expansion for GPC titles ("Brushes/Applicators" → two entities)
- ✅ GS1 GPC integration complete (7,562 product entities from 5,297 Bricks)

### 2024-11-22 (Earlier)
- ✅ Fixed shared prefix/suffix expansion for patterns like "Fishery information or documentation services"
- ✅ Integrated NAPCS 2022 data (3,049 detail entries)
- ✅ Updated Products and Services counts
- ✅ Documented GS1 GPC manual download process
- ✅ Integrated direct Excel reading via xlsx package

### Previous
- ✅ Implemented comma-separated list expansion
- ✅ Added short name mappings
- ✅ Integrated UNSPSC data
- ✅ Created comprehensive test suite

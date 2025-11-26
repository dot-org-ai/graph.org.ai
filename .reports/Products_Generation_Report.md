# Products.tsv Generation Report

## Summary

Successfully generated a unified Products.tsv file combining product classifications from UNSPSC and GS1 sources.

## Statistics

### Source Breakdown
- **UNSPSC Products**: 143,732 commodities
- **GS1 Products**: 5,279 bricks
- **Total Products**: 149,011

### File Information
- **Output File**: `/Users/nathanclevenger/projects/graph.org.ai/.data/Products.tsv`
- **File Size**: 84 MB
- **Processing Time**: 1.20 seconds

## Data Structure

### Columns
1. **id** - Name-based identifier (URL-friendly slug)
2. **type** - Always "Product"
3. **name** - Human-readable product name
4. **code** - Original classification code from source
5. **source** - "UNSPSC" or "GS1"
6. **level** - Hierarchy level ("commodity" for UNSPSC, "brick" for GS1)
7. **segment** - Top-level category name
8. **segmentCode** - Top-level category code
9. **family** - Second-level category name
10. **familyCode** - Second-level category code
11. **class** - Third-level category name
12. **classCode** - Third-level category code
13. **definition** - Product description/definition
14. **excludes** - What the product excludes (GS1 only)

## Key Features

### ID vs Code Separation
The critical requirement of separating name-based IDs from codes has been implemented:

**Example 1 - Simple Animal Product:**
- **ID**: `cats` (derived from name)
- **Code**: `10101501` (UNSPSC commodity code)
- **Name**: `Cats`

**Example 2 - Multi-word Product:**
- **ID**: `mobile-phones` (hyphenated)
- **Code**: `43191501` (UNSPSC commodity code)
- **Name**: `Mobile phones`

**Example 3 - Complex Art Supply:**
- **ID**: `artists-brushesapplicators` (compound name)
- **Code**: `10001674` (GS1 brick code)
- **Name**: `Artists Brushes/Applicators`

### Service Filtering (UNSPSC)
Products were filtered to exclude pure services based on keywords:
- service
- consulting
- training
- support
- maintenance
- installation
- repair

This reduced UNSPSC from 158,464 total codes to 143,732 product-focused commodities.

## Source Analysis

### UNSPSC (Universal Standard Products and Services Classification)
- **Original File**: 74.6 MB, 158,464 records
- **Extracted**: 143,732 product commodities (90.7%)
- **Filtered Out**: ~14,732 service entries (9.3%)
- **Hierarchy**: Segment > Family > Class > Commodity
- **Level Used**: Commodity (most specific)

### GS1 (Global Product Classification)
- **Original File**: 154 MB, 184,098 records
- **Extracted**: 5,279 unique product bricks
- **Hierarchy**: Segment > Family > Class > Brick
- **Level Used**: Brick (most specific product classification)
- **Additional Data**: Includes/Excludes definitions

## Sample Products by Category

### Live Animals (UNSPSC)
```
ID: cats, Code: 10101501, Name: Cats
ID: dogs, Code: 10101502, Name: Dogs
ID: horses, Code: 10101506, Name: Horses
```

### Electronics (UNSPSC)
```
ID: mobile-phones, Code: 43191501, Name: Mobile phones
ID: mobile-phone-face-plates, Code: 43191601, Name: Mobile phone face plates
ID: television-tester, Code: 41113730, Name: Television tester
```

### Art Supplies (GS1)
```
ID: artists-brushesapplicators, Code: 10001674, Name: Artists Brushes/Applicators
ID: artists-paintsdyes, Code: 10001676, Name: Artists Paints/Dyes
ID: artists-palettes, Code: 10001680, Name: Artists Palettes
```

### Medical Equipment (UNSPSC)
```
ID: computerized-medication-dispensing-cabinets, Code: 42191909
ID: computer-aided-detection-software, Code: 42203607
ID: computer-aided-diagnosis-system, Code: 42203713
```

## Hierarchy Examples

### UNSPSC Structure
```
Segment: Live Plant and Animal Material and Accessories and Supplies (10000000)
  ├─ Family: Live animals (10100000)
  │   ├─ Class: Livestock (10101500)
  │   │   ├─ Commodity: Cats (10101501)
  │   │   ├─ Commodity: Dogs (10101502)
  │   │   └─ Commodity: Horses (10101506)
```

### GS1 Structure
```
Segment: Arts/Crafts/Needlework (70000000)
  ├─ Family: Arts/Crafts/Needlework Supplies (70010000)
  │   ├─ Class: Artists Painting/Drawing Supplies (70010100)
  │   │   ├─ Brick: Artists Brushes/Applicators (10001674)
  │   │   ├─ Brick: Artists Paints/Dyes (10001676)
  │   │   └─ Brick: Artists Palettes (10001680)
```

## Processing Logic

### ID Generation
IDs are created from product names using this algorithm:
1. Convert to lowercase
2. Remove special characters (except spaces and hyphens)
3. Replace spaces with hyphens
4. Collapse multiple hyphens to single
5. Trim leading/trailing hyphens

Examples:
- "Cats" → "cats"
- "Mobile phones" → "mobile-phones"
- "Artists Brushes/Applicators" → "artists-brushesapplicators"
- "Guinea pigs" → "guinea-pigs"

### Service Detection (UNSPSC)
Keywords checked in commodity titles:
- service, consulting, training, support, maintenance, installation, repair

If any keyword found → excluded from products

### Data Quality
- All TSV fields are escaped (tabs, newlines removed)
- Empty fields preserved as empty strings
- Definitions preserved from source data
- GS1 excludes field maintained separately

## Integration with Existing Data

This Products.tsv complements:
- **Services.NAPCS.tsv** (739 KB) - Service classifications
- **Occupations.tsv** (208 KB) - Job classifications
- **Industries.tsv** (461 KB) - Industry classifications
- **Tasks.tsv** (29 MB) - Work task classifications
- **Processes.tsv** (7.8 MB) - Business process classifications

## Technical Notes

- Script: `/Users/nathanclevenger/projects/graph.org.ai/scripts/generate-products.js`
- Runtime: Node.js with ES modules
- Memory efficient: Streaming file reads via readline
- Deduplication: Map-based ID deduplication within each source
- Encoding: UTF-8

## Validation

Total line count validation:
```
Header: 1 line
UNSPSC: 143,732 lines
GS1: 5,279 lines
Total: 149,012 lines ✓
```

Source validation:
```
grep -c "UNSPSC": 143,732 ✓
grep -c "GS1": 5,279 ✓
```

## Recommendations

1. **Cross-referencing**: Consider mapping between UNSPSC and GS1 classifications
2. **Service Products**: Some hybrid products might exist in the filtered services
3. **Hierarchy Navigation**: The full hierarchy data is preserved for drill-down queries
4. **ID Collisions**: Current implementation uses source-prefixed IDs internally but outputs clean IDs
5. **Definition Enhancement**: GS1 includes/excludes provide rich semantic data

## Next Steps

Potential enhancements:
- Add cross-references between UNSPSC and GS1
- Extract product attributes from GS1 schema
- Create product-to-industry mappings
- Link products to relevant occupations
- Generate product hierarchies as separate relationship file

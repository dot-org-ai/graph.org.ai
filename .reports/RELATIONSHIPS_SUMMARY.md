# Relationship Files Summary

Generated on: 2025-11-24

## Overview

This document describes the relationship files generated for the graph.org.ai knowledge graph. Each TSV file contains relationships between entities in a specific domain.

## File Format

All relationship files use the following TSV format:

```
ns	from	to	predicate	reverse
```

Where:
- `ns` - namespace/source of the relationship (e.g., 'schema', 'unspsc', 'napcs')
- `from` - source entity ID
- `to` - target entity ID
- `predicate` - relationship type from source to target
- `reverse` - inverse relationship type from target to source

## Generated Files

### 1. Types.Relationships.tsv
**Count:** 913 relationships
**Source:** Types.tsv (Schema.org types)
**Relationships:**
- `subClassOf` / `superClassOf` - Type hierarchy from Schema.org

**Example:**
```
schema	schema:WatchAction	schema:ConsumeAction	subClassOf	superClassOf
```

### 2. Properties.Relationships.tsv
**Count:** 4,387 relationships
**Source:** Properties.tsv (Schema.org properties)
**Relationships:**
- `domainIncludes` / `hasDomainProperty` - Which types a property belongs to
- `rangeIncludes` / `hasRangeProperty` - What types of values a property can have
- `subPropertyOf` / `superPropertyOf` - Property hierarchy

**Example:**
```
schema	schema:option	schema:ChooseAction	domainIncludes	hasDomainProperty
schema	schema:option	schema:Text	rangeIncludes	hasRangeProperty
```

### 3. Products.Relationships.tsv
**Count:** 152,012 relationships
**Source:** Products.tsv (UNSPSC product hierarchy)
**Relationships:**
- `partOfProductCategory` / `hasSubProduct` - Product hierarchy (Commodity → Class → Family → Segment)

**Hierarchy Levels:**
- Commodity (most specific)
- Class
- Family
- Segment (most general)

**Example:**
```
unspsc	unspsc-cats	unspsc-class-10101500	partOfProductCategory	hasSubProduct
unspsc	unspsc-class-10101500	unspsc-family-10100000	partOfProductCategory	hasSubProduct
```

### 4. Services.Relationships.tsv
**Count:** 5,046 relationships
**Source:** Services.NAPCS.tsv (North American Product Classification System services)
**Relationships:**
- `partOfServiceCategory` / `hasSubService` - Service hierarchy

**Hierarchy Levels:**
- Detail (most specific)
- Subclass
- Class
- Group (most general)

**Example:**
```
napcs	Cattle	111111	partOfServiceCategory	hasSubService
napcs	CattleCalves111111	11111	partOfServiceCategory	hasSubService
```

### 5. Nouns.Relationships.tsv
**Count:** 14,416 relationships
**Source:** Nouns.tsv
**Relationships:**
- `subClassOf` / `superClassOf` - Noun type hierarchy
- `definedBy` / `defines` - Links nouns to their ontology sources

**Example:**
```
noun	State	Place	subClassOf	superClassOf
noun	State	place.org.ai	definedBy	defines
```

### 6. Models.Relationships.tsv
**Count:** 718 relationships
**Source:** Models.tsv (AI models)
**Relationships:**
- `instanceOf` / `hasInstance` - All models are instances of AIModel
- `hasCapability` / `capabilityOf` - Model capabilities (TextModel, VisionModel, AudioModel)
- `providedBy` / `provides` - Model providers

**Example:**
```
model	google/gemini-3-pro-image-preview	AIModel	instanceOf	hasInstance
model	google/gemini-3-pro-image-preview	TextModel	hasCapability	capabilityOf
model	google/gemini-3-pro-image-preview	VisionModel	hasCapability	capabilityOf
```

### 7. Language.Relationships.tsv
**Count:** 604 relationships
**Source:** Language.*.tsv (Adverbs, Prepositions, Pronouns, Conjunctions, Determiners)
**Relationships:**
- `instanceOf` / `hasInstance` - Links each word to its part of speech class
- `hasCategory` / `categoryOf` - Semantic categories (Manner, Time, Location, etc.)

**Example:**
```
language	accurately	Adverb	instanceOf	hasInstance
language	accurately	Manner	hasCategory	categoryOf
```

## Total Statistics

- **Total Relationships:** 178,096
- **Total Files:** 7
- **Namespaces:** schema, unspsc, napcs, noun, model, language

## Usage

These relationship files can be used to:
1. Build a property graph database
2. Generate RDF/OWL ontologies
3. Create semantic search indices
4. Power knowledge graph queries
5. Enable AI agent reasoning over structured data

## Generation Script

The relationships were generated using `/Users/nathanclevenger/projects/graph.org.ai/scripts/generateRelationships.js`

To regenerate:
```bash
node /Users/nathanclevenger/projects/graph.org.ai/scripts/generateRelationships.js
```

# Data Transformation Strategy

## Overview

Transform data from unified `source` table → `things` + `relationships` tables

## Schema Summary

### Source Table
```
source (String) - 'wiktionary', 'wikipedia', 'wikidata', 'geonames'
data (String)   - Raw JSON/JSONL data
batch (DateTime) - Batch timestamp
ingested (DateTime) - Row insert timestamp  
```

### Things Table  
```
ns (String)      - Namespace (wiki.org.ai, geo.org.ai, etc.)
type (String)    - Type (Noun, City, Country, etc.)
id (String)      - ID (PascalCase for nouns/places, camelCase for verbs/etc.)
url (String)     - Full URL (https://nouns.org.ai/AirportBook)
data (String)    - JSON with thing properties only
code (String)    - Code/symbol
content (String) - Markdown content
meta (String)    - External IDs and metadata
createdAt (DateTime)
updatedAt (DateTime)
```

### Relationships Table
```
ns (String)      - Namespace from "from" thing
from (String)    - Full URL of source thing
predicate (String) - Relationship type (synonym, locatedIn, etc.)
reverse (String) - Inverse predicate
to (String)      - Full URL of target thing
data (String)    - Relationship properties ONLY (not thing properties)
content (String) - Markdown about relationship
createdAt (DateTime)
updatedAt (DateTime)
```

## Transformation Scripts

### 1. Wiktionary → Things + Relationships

**Source**: `source WHERE source = 'wiktionary'`
**Target NS**: `wiki.org.ai`

**Things**:
- Type: Noun, Verb, Adjective, etc. (TitleCase)
- ID: PascalCase for nouns, camelCase for others
- URL examples:
  - https://nouns.org.ai/AirportBook
  - https://verbs.org.ai/coldPress
  - https://language.org.ai/adjectives/coldPressed
- Data: word, partOfSpeech, language, langCode, etymologyText, suffix
- Content: Markdown with definitions, etymology, examples

**Relationships**:
- synonym: word ↔ synonym (symmetric)
- antonym: word ↔ antonym (symmetric)
- suffix: word → suffix (e.g., "alphabetical" → "al")
- Data: ONLY relationship metadata (weight, confidence, etc.) - NOT word properties

### 2. Wikipedia → Things + Relationships

**Source**: `source WHERE source = 'wikipedia'`
**Target NS**: `wiki.org.ai`

**Things**:
- Type: Article, Category, etc.
- ID: PascalCase
- URL: https://wiki.org.ai/articles/ArtificialIntelligence
- Data: title, categories, infobox data
- Content: Full article markdown
- Meta: Wikipedia page ID, revision ID, timestamps

**Relationships**:
- category: article → category
- link: article → article (internal links)
- seeAlso: article ↔ article
- redirect: article → article

### 3. GeoNames → Things + Relationships

**Source**: `source WHERE source = 'geonames'`
**Target NS**: `geo.org.ai`

**Things**:
- Type: City, Country, State, Mountain, River, etc. (from feature codes)
- ID: PascalCase
- URL examples:
  - https://geo.org.ai/cities/SanFrancisco
  - https://geo.org.ai/countries/UnitedStates
  - https://geo.org.ai/mountains/MountEverest
- Data: geonameId, coordinates (lat/lon), population, elevation, timezone, countryCode
- Code: Country code (US, GB, etc.), postal code
- Content: Markdown with place description
- Meta: GeoNames ID, alternate names, modification date

**Relationships**:
- locatedIn: city → country, city → state
- adjacentTo: country ↔ country (neighbors)
- capitalOf: city → country
- Data: distance, timezone difference, etc.

## Implementation Order

1. ✅ Update table schemas (done)
2. ⏳ Wiktionary transformation (update to new schema)
3. ⏳ GeoNames ingestion + transformation
4. ⏳ Wikipedia ingestion + transformation
5. ⏳ Wikidata ingestion + transformation

## Key Principles

1. **Full URLs**: `from` and `to` in relationships are always full URLs
2. **Namespace Consistency**: Use consistent namespaces across sources
3. **Data Purity**: `data` field contains ONLY properties of the thing/relationship itself
4. **Meta for External IDs**: Use `meta` for external identifiers and cross-references
5. **camelCase**: All JSON keys and timestamp columns use camelCase
6. **PascalCase vs camelCase**: Nouns/places use PascalCase, verbs/actions use camelCase


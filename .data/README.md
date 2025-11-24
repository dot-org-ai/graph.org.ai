# .data/ - Clean Structured Data

This directory contains clean, standardized data ready for ingestion into the graph database via mdxdb.

## File Naming Convention

All files follow the pattern: `[Subdomain].[Type].tsv` and `[Subdomain].[Type].Relationships.tsv`

**Examples:**
- `Schema.Class.tsv` and `Schema.Class.Relationships.tsv`
- `ONET.Occupation.tsv` and `ONET.Occupation.Relationships.tsv`
- `Standards.UNSPSC.Product.tsv`

## Entity File Format

All entity files have these standardized fields:

- `$id`: Unique identifier URL for the entity
- `$type`: Type/class URL for the entity
- `$context`: Base domain URL
- `name`: Human-readable name
- `description`: Detailed description
- `code`: Source system code/identifier
- **[additional source-specific fields]**

## Relationship File Format

All relationship files have these fields:

- `ns`: Namespace (e.g., 'onet', 'schema', 'naics')
- `from`: Source entity $id (URL)
- `predicate`: Relationship type (e.g., 'requiresSkill', 'subClassOf')
- `reverse`: Inverse relationship name (e.g., 'skillFor', 'superClassOf')
- `to`: Target entity $id (URL)

## Generated Files

### Schema (2,430 entities + 3,207 relationships)
- **Schema.Class.tsv** (920 rows) - Schema.org types/classes
- **Schema.Property.tsv** (1,510 rows) - Schema.org properties
- **Schema.Class.Relationships.tsv** (3,207 rows) - subClassOf, domainIncludes

### ONET (48,553 entities + 709,161 relationships)
- **ONET.Occupation.tsv** (1,016 rows) - O*NET occupations
- **ONET.Skill.tsv** (35 rows) - Skills taxonomy
- **ONET.Knowledge.tsv** (33 rows) - Knowledge areas
- **ONET.Ability.tsv** (52 rows) - Abilities taxonomy
- **ONET.WorkActivity.tsv** (41 rows) - Work activities
- **ONET.Task.tsv** (18,797 rows) - Occupation tasks
- **ONET.Technology.tsv** (8,931 rows) - Technology skills
- **ONET.Tool.tsv** (18,557 rows) - Tools used
- **ONET.WorkStyle.tsv** (16 rows) - Work styles
- **ONET.WorkValue.tsv** (9 rows) - Work values
- **ONET.Interest.tsv** (9 rows) - Career interests
- **ONET.WorkContext.tsv** (57 rows) - Work context factors
- **ONET.Occupation.Relationships.tsv** (709,161 rows) - requiresSkill, requiresKnowledge, requiresAbility, involvesActivity, hasTask, usesTechnology, usesTool, requiresWorkStyle, alignsWithValue, matchesInterest, hasContext

### NAICS (2,125 entities)
- **NAICS.Industry.tsv** (2,125 rows) - NAICS industry classification

### NAPCS (5,211 entities)
- **NAPCS.Product.tsv** (5,211 rows) - NAPCS product/service classification

### APQC (1,997 entities)
- **APQC.Process.tsv** (1,997 rows) - APQC Process Classification Framework

### Standards (333,714 entities)
- **Standards.UNSPSC.Product.tsv** (149,850 rows) - UNSPSC product codes
- **Standards.GS1.Product.tsv** (183,864 rows) - GS1 Global Product Classification

### Language (798 entities)
- **Language.Verb.tsv** (432 rows) - Canonical verb forms with semantic roles
- **Language.Concept.tsv** (59 rows) - Business and domain concepts
- **Language.Preposition.tsv** (53 rows) - Prepositional relationships
- **Language.Adverb.tsv** (127 rows) - Adverbial modifiers
- **Language.Pronoun.tsv** (57 rows) - Pronoun forms
- **Language.Conjunction.tsv** (31 rows) - Conjunctions for logical connections
- **Language.Determiner.tsv** (39 rows) - Determiners and articles

### Places (51 entities)
- **Places.State.tsv** (51 rows) - US States

## Summary

- **Total Entities**: 394,879
- **Total Relationships**: 712,368
- **Entity Files**: 26
- **Relationship Files**: 2

## Data Generation

To regenerate all data files:

```bash
tsx .scripts/generate-data.ts
```

This will:
1. Read source data from `.source/` directory
2. Transform into standardized entity files
3. Extract and generate relationship files
4. Write all files to `.data/` directory

## Data Quality

✅ All files use consistent naming: `[Subdomain].[Type].tsv`
✅ All entity files have $id, $type, $context, name, description, code
✅ All relationship files have ns, from, predicate, reverse, to
✅ Entities have valid URLs for $id, $type, and $context
✅ Descriptions populated from source data where available
✅ Relationships extracted from source data with proper predicates

## Usage

These files are ready to be ingested via:
1. **mdxdb CLI** with DO_ADMIN_TOKEN
2. **POST to graph.do API**
3. **Direct ClickHouse ingestion**

## Relationship Examples

### ONET Occupation Relationships
```
ns    from                                              predicate         reverse     to
onet  https://onet.org.ai/Occupation/chief-executives  requiresSkill     skillFor    https://onet.org.ai/Skill/reading-comprehension
onet  https://onet.org.ai/Occupation/chief-executives  requiresKnowledge knowledgeFor https://onet.org.ai/Knowledge/administration-and-management
```

### Schema Class Relationships
```
ns      from                             predicate    reverse       to
schema  https://schema.org.ai/Clip       subClassOf   superClassOf  https://schema.org.ai/CreativeWork
schema  https://schema.org.ai/WatchAction subClassOf   superClassOf  https://schema.org.ai/ConsumeAction
```

## Source Mapping

| Output File | Source File | Transform Script |
|-------------|-------------|------------------|
| Schema.*.tsv | .source/Schema.org/*.tsv | generate-data.ts |
| ONET.*.tsv | .source/ONET/ONET.*.tsv | generate-data.ts |
| NAICS.*.tsv | .source/NAICS/NAICS.Industries.tsv | generate-data.ts |
| NAPCS.*.tsv | .source/NAPCS/NAPCS.*.tsv | generate-data.ts |
| APQC.*.tsv | .source/APQC/APQC.Combined.tsv | generate-data.ts |
| Standards.UNSPSC.*.tsv | .source/UNSPSC/UNSPSC.Codes.tsv | generate-data.ts |
| Standards.GS1.*.tsv | .source/GS1/GS1.Schema.tsv | generate-data.ts |

---

Last updated: 2025-11-24

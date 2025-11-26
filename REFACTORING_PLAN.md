# Graph.org.ai Refactoring Plan

## Overview

This document outlines a comprehensive refactoring of the graph.org.ai ontology to:
1. Improve taxonomy and naming conventions
2. Expand semantic relationships across the hierarchy
3. Implement comprehensive validation via vitest
4. Normalize ONET concepts to our domain-specific ontologies

## Phase 1: Validation Infrastructure (PRIORITY)

### 1.1 Setup Vitest Testing Framework

**Goal**: Create comprehensive test suite for all .data files that runs with `pnpm test`

**Files to Create**:
- `vitest.config.ts` - Vitest configuration
- `tests/data-validation/setup.ts` - Test utilities and helpers
- `tests/data-validation/tsv-schema.test.ts` - TSV format validation
- `tests/data-validation/relationships.test.ts` - Relationship integrity tests
- `tests/data-validation/entities.test.ts` - Entity validation tests
- `tests/data-validation/urls.test.ts` - URL format and consistency tests

**Test Categories**:

1. **Schema Validation**
   - All TSV files have correct headers: `url, ns, type, id, code, name, description`
   - All Relationships files have: `ns, from, to, predicate, reverse`
   - No missing required fields
   - No malformed rows (wrong number of columns)

2. **Data Integrity**
   - All URLs are well-formed and match pattern: `https://{domain}/{Type}/{Id}`
   - All relationship `from` and `to` URLs reference existing entities
   - All namespaces are valid (onet.org.ai, education.org.ai, etc.)
   - No duplicate URLs within a file
   - Bidirectional relationships are consistent (if A→B exists, B→A should exist)

3. **Format Validation**
   - IDs are PascalCase (no hyphens, underscores, or spaces)
   - Codes contain original source identifiers when different from name
   - No Windows line endings (\r\n) - Unix only (\n)
   - No trailing whitespace
   - UTF-8 encoding

4. **Semantic Validation**
   - Predicate pairs are valid (relatedTo/relatedTo, partOf/hasPart, etc.)
   - No orphaned relationships (references to non-existent entities)
   - Hierarchical relationships are acyclic (no circular partOf chains)

### 1.2 Package Updates

```json
// package.json additions
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "fast-csv": "^5.0.0"
  }
}
```

## Phase 2: Taxonomy Restructuring

### 2.1 Current → Proposed Naming

| Current | Domain | Proposed | Rationale |
|---------|---------|----------|-----------|
| CareerClusters | education.org.ai | Industries | Top-level industry categorization |
| SubClusters | education.org.ai | Careers | Mid-level career paths |
| Occupations | onet.org.ai | Occupations | Specific job roles (unchanged) |
| AlternateTitles | onet.org.ai | Jobs | Practical job titles people use |
| WorkActivities | onet.org.ai | Activities | Unified activity hierarchy |
| IWA (Intermediate Work Activities) | onet.org.ai | Activities | Flatten to single Activities type |
| DWA (Detailed Work Activities) | onet.org.ai | Activities | Flatten to single Activities type |
| Tasks | onet.org.ai | Tasks | Keep with semantic expansion |
| Processes | apqc.org.ai | Processes | Keep with semantic expansion |

### 2.2 New Domain Structure

```
industries.org.ai        (was: CareerClusters)
├── careers.org.ai       (was: SubClusters)
│   └── occupations.org.ai
│       └── jobs.org.ai  (was: AlternateTitles)

activities.org.ai        (was: WorkActivities/IWA/DWA - unified)
├── tasks.org.ai         (semantic expansion)
└── processes.org.ai     (semantic expansion)

skills.org.ai
abilities.org.ai
knowledge.org.ai
context.org.ai           (was: WorkContext)
```

### 2.3 File Migrations

**New Files**:
- `.data/Industries.tsv` (from CareerClusters.tsv)
- `.data/Industries.Relationships.tsv`
- `.data/Careers.tsv` (from SubClusters.tsv)
- `.data/Careers.Relationships.tsv`
- `.data/Jobs.tsv` (from AlternateTitles - ONET source)
- `.data/Jobs.Relationships.tsv`
- `.data/Activities.tsv` (merge WorkActivities + IWA + DWA)
- `.data/Activities.Relationships.tsv`

**Updated Files**:
- All relationship files referencing old types

## Phase 3: Semantic Expansion

### 3.1 Short Name Generation

**Goal**: Create semantic short names for all activities, tasks, and processes

**Examples**:
- "Evaluating Information to Determine Compliance with Standards" → `determine.Compliance`
- "Thinking Creatively" → `think.Creatively`
- "Getting Information" → `get.Information`

**Implementation**:
```typescript
// Semantic name parser
function generateShortName(description: string): string {
  // Extract verb + primary noun/adjective
  // Use NLP or pattern matching
  // Return in format: {verb}.{object}
}
```

### 3.2 Relationship Expansion

**Current Problem**: Abilities only link to Activities, but should also link to correlated Careers and Occupations

**Solution**: Expand relationships transitively

```typescript
// If we have:
// Ability → Activity
// Activity → Occupation
// Then create:
// Ability → Occupation (derived relationship)

// Similarly for:
// Skills → Activities → Occupations → Careers → Industries
```

**New Relationship Types**:
- `requires` / `requiredBy` (Occupation requires Ability)
- `utilizes` / `utilizedBy` (Career utilizes Skill)
- `correlates` / `correlatedWith` (indirect associations)

### 3.3 Hierarchy Normalization

**Activities Hierarchy** (from ONET):
```
WorkActivities (19 top-level)
├── IWA (Intermediate - 41 items)
│   └── DWA (Detailed - 332 items)
```

**Normalize to**:
```
Activities (flat structure with hierarchy via relationships)
├── id: PascalCase semantic name
├── shortName: verb.object format
├── code: original ONET code
├── level: "general" | "intermediate" | "detailed"
└── Relationships: partOf/hasPart for hierarchy
```

## Phase 4: Cross-Ontology Mapping

### 4.1 ONET → Our Ontology Mapping

| ONET Entity | Maps To | Relationship Type |
|-------------|---------|-------------------|
| Abilities | abilities.org.ai | direct |
| Skills | skills.org.ai | direct |
| Knowledge | knowledge.org.ai | direct |
| Work Activities | activities.org.ai | direct |
| Work Context | context.org.ai | direct |
| Work Styles | Could be split | TBD |
| Work Values | Could be split | TBD |
| Tasks | tasks.org.ai | with semantic expansion |
| Technologies | products.org.ai | map to products |
| Tools | products.org.ai | map to products |

### 4.2 Education → Our Ontology Mapping

| Education Entity | Maps To | Relationship Type |
|------------------|---------|-------------------|
| CareerClusters | industries.org.ai | rename |
| SubClusters | careers.org.ai | rename |
| EducationPrograms | education.org.ai | keep |

## Phase 5: Implementation Plan

### Step 1: Validation Tests (Week 1)
1. Setup vitest configuration
2. Write schema validation tests
3. Write relationship integrity tests
4. Write format validation tests
5. Run tests and document failures

### Step 2: Fix Existing Issues (Week 1-2)
1. Fix malformed relationships
2. Fix line ending issues
3. Fix URL format inconsistencies
4. Ensure all tests pass

### Step 3: Taxonomy Migration (Week 2-3)
1. Create new Industries/Careers files
2. Update all relationship references
3. Create Jobs entities from AlternateTitles
4. Flatten Activities hierarchy
5. Update tests for new structure

### Step 4: Semantic Expansion (Week 3-4)
1. Implement short name generation
2. Add shortName field to Activities/Tasks/Processes
3. Generate transitive relationships
4. Create correlation mappings

### Step 5: Documentation (Ongoing)
1. Update CLAUDE.md with new taxonomy
2. Create migration guide
3. Document relationship types
4. Create API documentation

## Success Criteria

- [ ] All vitest tests pass with 100% coverage of .data files
- [ ] No malformed TSV files
- [ ] All relationships reference valid entities
- [ ] Taxonomy uses intuitive, consistent naming
- [ ] Semantic short names exist for all activities/tasks/processes
- [ ] Transitive relationships properly expanded
- [ ] Documentation complete and accurate

## Open Questions

1. **Work Styles & Work Values**: Should these be split into separate domain ontologies or kept as-is?
2. **Semantic Name Generation**: Use NLP library (compromise.js, natural) or pattern-based?
3. **Transitive Relationship Storage**: Store explicitly or compute on-demand?
4. **Backward Compatibility**: Keep old files with deprecation warnings or hard cutover?
5. **URL Migration**: Change existing URLs or maintain redirects?

## Notes

- All changes should be backward compatible where possible
- Use feature flags for gradual rollout
- Maintain audit trail of all transformations
- Consider performance implications of expanded relationships

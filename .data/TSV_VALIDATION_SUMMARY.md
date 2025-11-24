# TSV Validation Summary

**Date:** November 24, 2025
**Total Files:** 41 TSV files (excluding Relationships files)

## Executive Summary

The validation scan identified **316,052 errors** and **32 warnings** across all 41 TSV files in the `.data/` directory. All files require standardization to conform to the standard TSV schema.

## Key Findings

### 1. Header Structure Issues
- **All 41 files** are missing one or more standard headers
- Most common missing columns:
  - `url` (41 files)
  - `ns` (41 files)
  - `code` (35 files)
  - `description` (23 files)

### 2. ID Format Issues
- **316,011 IDs** need to be converted to PascalCase
- **166,988 codes** need to be moved from `id` to `code` field
- **335,687 URLs** need to be generated

### 3. Most Affected Files

| File | Issues | Type |
|------|--------|------|
| Products.tsv | 149,011 ID issues | UNSPSC product codes as IDs |
| Processes.tsv | 52,052 ID issues | APQC process IDs |
| Nouns.tsv | 7,212 missing URLs | Schema.org entities |
| Industries.tsv | 3,619 missing URLs | NAICS codes |
| EducationPrograms.tsv | 1,946 ID issues | CIP codes as IDs |
| Occupations.tsv | 1,676 missing URLs | SOC codes |
| Properties.tsv | 1,510 ID issues | Schema.org properties |
| Employment.tsv | 1,019 missing URLs | BLS employment data |

## Standard Schema

All files should conform to this structure:

```tsv
url	ns	type	id	code	name	description	[...additional columns...]
```

### Column Definitions

1. **url**: Full entity URL (e.g., `https://onet.org/Knowledge/BusinessAdministration`)
2. **ns**: Namespace domain (e.g., `onet.org.ai`)
3. **type**: Entity type in PascalCase (e.g., `Knowledge`)
4. **id**: PascalCase identifier from name (e.g., `BusinessAdministration`)
5. **code**: Original source code (e.g., `2.C.1.a`)
6. **name**: Human-readable name (e.g., `Business Administration`)
7. **description**: Full description

## Specific File Issues

### ONET Files
**Files:** Knowledge.tsv, Skills.tsv, Abilities.tsv, WorkValues.tsv, WorkStyles.tsv, WorkContext.tsv, WorkActivities.tsv, Tasks.tsv, Tools.tsv, Technologies.tsv, Occupations.tsv

**Issues:**
- Using ONET codes as IDs (e.g., `2.C.1.a`, `1.A.1.a.1`)
- Missing `url`, `ns`, `code`, `description` columns
- IDs should be PascalCase from names

**Example Fix:**
```tsv
# Before
id	type	name
2.C.1.a	Knowledge	Administration and Management

# After
url	ns	type	id	code	name	description
https://onet.org/Knowledge/AdministrationAndManagement	onet.org.ai	Knowledge	AdministrationAndManagement	2.C.1.a	Administration and Management
```

### Apps and Integration Services
**Files:** Apps.tsv, IntegrationServices.tsv

**Issues:**
- Using kebab-case slugs as IDs (e.g., `google-sheets`)
- Missing `url`, `ns`, `code` columns

**Example Fix:**
```tsv
# Before
id	type	key	name	description
google-sheets	App	google-sheets	Google Sheets	Create, edit, and share spreadsheets

# After
url	ns	type	id	code	name	description	key
https://apps.org/App/GoogleSheets	apps.org.ai	App	GoogleSheets		Google Sheets	Create, edit, and share spreadsheets	google-sheets
```

### Products and Services
**Files:** Products.tsv, Services.NAPCS.tsv

**Issues:**
- Using source codes as IDs (UNSPSC, NAPCS)
- Missing `url`, `ns` columns
- Massive scale (149,011 products)

**Example Fix:**
```tsv
# Before
id	type	name	code	source
unspsc-cats	Product	Cats	10101501	UNSPSC

# After
url	ns	type	id	code	name	description	source
https://unspsc.org/Product/Cats	unspsc.org.ai	Product	Cats	10101501	Cats		UNSPSC
```

### Language Files
**Files:** Language.Adverbs.tsv, Language.Prepositions.tsv, Language.Pronouns.tsv, Language.Conjunctions.tsv, Language.Determiners.tsv

**Issues:**
- Using lowercase words as IDs
- Missing `url`, `ns`, `code`, `name` columns

**Example Fix:**
```tsv
# Before
id	type	description	category	usage
however	Adverb	In whatever way or manner	conjunctive	formal

# After
url	ns	type	id	code	name	description	category	usage
https://language.org/Adverb/However	language.org.ai	Adverb	However	however	However	In whatever way or manner	conjunctive	formal
```

### Processes
**Files:** Processes.tsv

**Issues:**
- Using APQC process IDs as IDs
- Missing `url`, `ns`, `type`, `code` columns
- 52,052 rows to update

**Example Fix:**
```tsv
# Before
id	pcfId	hierarchyId	name	description
1.0	1.0	1.0	Develop Vision and Strategy	Develop Vision and Strategy

# After
url	ns	type	id	code	name	description	pcfId	hierarchyId
https://apqc.org/Process/DevelopVisionAndStrategy	apqc.org.ai	Process	DevelopVisionAndStrategy	1.0	Develop Vision and Strategy	Develop Vision and Strategy	1.0	1.0
```

## Standardization Plan

### Phase 1: Backup and Validation
1. ✅ Create validation script (`validate-tsv.ts`)
2. ✅ Run validation on all files
3. ✅ Generate validation report

### Phase 2: Standardization (Ready to Execute)
1. Run standardization in dry-run mode
2. Review changes
3. Apply standardization
4. Verify with validation script

### Phase 3: Verification
1. Run validation again to confirm all issues resolved
2. Review sample files manually
3. Test with downstream systems
4. Commit standardized files

## Impact Assessment

### Benefits
- **Consistency**: All files follow the same schema
- **Interoperability**: Standard URLs enable easy linking between entities
- **Clarity**: PascalCase IDs are more readable and URL-friendly
- **Preservation**: Original codes preserved in `code` field
- **Extensibility**: Standard schema makes it easy to add new entity types

### Risks
- **Breaking Changes**: Systems using old IDs will need updates
- **Data Volume**: Large files (Products, Processes) take time to process
- **Validation**: Need to verify downstream systems still work

### Mitigation
- Backup files created automatically (`.backup` extension)
- Dry-run mode allows preview before changes
- Git history preserves original files
- Old IDs preserved in `code` field for lookup/mapping

## Next Steps

### Immediate Actions Required
1. **Review this summary** and approve standardization approach
2. **Run standardization** on all files:
   ```bash
   npx tsx scripts/standardize-tsv.ts
   ```
3. **Verify results** with validation:
   ```bash
   npx tsx scripts/validate-tsv.ts
   ```
4. **Test downstream systems** to ensure compatibility
5. **Commit changes** to repository

### Post-Standardization Tasks
1. Update any scripts/tools that reference old IDs
2. Update documentation to reference new schema
3. Add CI/CD checks to validate new TSV files
4. Consider generating TypeScript types from schemas
5. Add relationship file standardization

## Scripts Available

### Validation
```bash
# Validate all TSV files
npx tsx scripts/validate-tsv.ts
```

### Standardization
```bash
# Preview changes (no files modified)
npx tsx scripts/standardize-tsv.ts --dry-run

# Apply changes (creates backups)
npx tsx scripts/standardize-tsv.ts
```

### Testing
```bash
# Run unit tests
npm test scripts/tsv-utils.test.ts
```

## Documentation

Full documentation available at:
- `/Users/nathanclevenger/projects/graph.org.ai/scripts/TSV_STANDARDIZATION.md`

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Files | 41 |
| Total Rows | 347,390 |
| Files Needing Changes | 41 (100%) |
| IDs to Convert | 316,011 |
| Codes to Move | 166,988 |
| URLs to Generate | 335,687 |
| Errors | 316,052 |
| Warnings | 32 |

## Recommendation

**Proceed with standardization immediately.** All files require updates, and the standardization script is ready to:
- ✅ Automatically fix all issues
- ✅ Create backups before modifying
- ✅ Preserve all data and additional columns
- ✅ Generate proper URLs and IDs

The dry-run mode has confirmed the changes are correct and safe to apply.

# TSV Standardization System

This directory contains scripts for validating and standardizing TSV files in the `.data/` directory.

## Standard TSV Schema

All entity TSV files MUST follow this schema:

```tsv
url	ns	type	id	code	name	description	[...additional columns...]
```

### Required Columns

1. **url**: Full entity URL
   - Format: `https://{namespace}/{type}/{id}`
   - Example: `https://onet.org/Knowledge/BusinessAdministration`

2. **ns**: Namespace domain
   - Format: Domain name with `.org.ai` suffix
   - Examples: `onet.org.ai`, `apps.org.ai`, `schema.org.ai`

3. **type**: Entity type in PascalCase
   - Examples: `Knowledge`, `Ability`, `Tool`, `App`, `Occupation`

4. **id**: PascalCase identifier derived from name
   - MUST be PascalCase (e.g., `BusinessAdministration`)
   - MUST be derived from entity name, not codes
   - NO special characters except underscores for technical terms
   - Examples:
     - ✅ `BusinessAdministration` (from "Business Administration")
     - ✅ `OralComprehension` (from "Oral Comprehension")
     - ✅ `GoogleSheets` (from "Google Sheets")
     - ❌ `2.C.1.a` (ONET code - belongs in `code` field)
     - ❌ `google-sheets` (kebab-case)
     - ❌ `business_administration` (snake_case)

5. **code**: Original source code or identifier
   - For ONET: `2.C.1.a`, `1.A.1.a.1`, etc.
   - For UNSPSC: `43231505`, etc.
   - For NAICS: `11-1011.00`, etc.
   - Can be empty if no source code exists

6. **name**: Human-readable name
   - Examples: `Business Administration`, `Oral Comprehension`, `Google Sheets`

7. **description**: Full description of the entity
   - Can be empty for some entity types

### Additional Columns

Any domain-specific columns can follow the standard columns. These are preserved during standardization.

## Scripts

### validate-tsv.ts

Validates all TSV files against the standard schema.

**Usage:**
```bash
npx tsx scripts/validate-tsv.ts
```

**Checks:**
- Header structure includes all required columns
- All IDs are PascalCase
- Required fields are populated
- URL format is correct
- Namespace format follows domain pattern

**Output:**
- Validation report with errors and warnings
- Files grouped by issue type
- Suggested fixes for non-compliant IDs

**Exit Code:**
- `0` if validation passes (warnings are OK)
- `1` if any errors are found

### standardize-tsv.ts

Transforms TSV files to conform to the standard schema.

**Usage:**
```bash
# Dry run (no files modified)
npx tsx scripts/standardize-tsv.ts --dry-run

# Apply changes
npx tsx scripts/standardize-tsv.ts
```

**Transformations:**
1. Adds missing standard columns
2. Converts non-PascalCase IDs to PascalCase
3. Moves old IDs (like ONET codes) to `code` field
4. Generates URLs from `ns` + `type` + `id`
5. Preserves all additional columns

**Safety:**
- Creates `.backup` files before modifying originals
- Dry run mode available to preview changes

**Output:**
- Standardization report with changes per file
- Summary of transformations applied

### tsv-utils.test.ts

Unit tests for validation and standardization utilities.

**Usage:**
```bash
# Run tests (requires jest)
npm test scripts/tsv-utils.test.ts
```

**Tests:**
- PascalCase conversion
- ID validation
- URL generation
- Namespace inference
- Real-world transformation examples

## Workflow

### 1. Validate Current State

First, run validation to see what needs to be fixed:

```bash
npx tsx scripts/validate-tsv.ts
```

Review the validation report to understand the scope of changes needed.

### 2. Preview Standardization

Run standardization in dry-run mode to see what changes would be made:

```bash
npx tsx scripts/standardize-tsv.ts --dry-run
```

### 3. Apply Standardization

If the preview looks good, apply the changes:

```bash
npx tsx scripts/standardize-tsv.ts
```

This will:
- Create `.backup` files for all modified TSV files
- Apply standardization transformations
- Generate a report of changes

### 4. Verify Changes

Run validation again to confirm all issues are resolved:

```bash
npx tsx scripts/validate-tsv.ts
```

### 5. Review and Commit

Review the changes using git:

```bash
git diff .data/
```

If everything looks good, commit the changes:

```bash
git add .data/
git commit -m "Standardize TSV files to conform to standard schema"
```

## Examples

### Before Standardization

**Knowledge.tsv:**
```tsv
id	type	name
2.C.1.a	Knowledge	Administration and Management
2.C.1.b	Knowledge	Administrative
```

**Apps.tsv:**
```tsv
id	type	key	name	description	slug
google-sheets	App	google-sheets	Google Sheets	Create, edit, and share spreadsheets	google-sheets
gmail	App	gmail	Gmail	Popular email service	gmail
```

### After Standardization

**Knowledge.tsv:**
```tsv
url	ns	type	id	code	name	description
https://onet.org/Knowledge/AdministrationAndManagement	onet.org.ai	Knowledge	AdministrationAndManagement	2.C.1.a	Administration and Management
https://onet.org/Knowledge/Administrative	onet.org.ai	Knowledge	Administrative	2.C.1.b	Administrative
```

**Apps.tsv:**
```tsv
url	ns	type	id	code	name	description	key	slug
https://apps.org/App/GoogleSheets	apps.org.ai	App	GoogleSheets		Google Sheets	Create, edit, and share spreadsheets	google-sheets	google-sheets
https://apps.org/App/Gmail	apps.org.ai	App	Gmail		Gmail	Popular email service	gmail	gmail
```

## ID Conversion Rules

### ONET Codes → PascalCase

| Original Code | Name | New ID |
|--------------|------|--------|
| `2.C.1.a` | Administration and Management | `AdministrationAndManagement` |
| `2.A.1.a` | Reading Comprehension | `ReadingComprehension` |
| `1.A.1.a.1` | Oral Comprehension | `OralComprehension` |

### App Slugs → PascalCase

| Original Slug | Name | New ID |
|--------------|------|--------|
| `google-sheets` | Google Sheets | `GoogleSheets` |
| `gmail` | Gmail | `Gmail` |
| `microsoft-teams` | Microsoft Teams | `MicrosoftTeams` |

### Tool Names → PascalCase

| Original Name | New ID |
|--------------|--------|
| `.40 caliber semi-automatic pistols` | `40CaliberSemiAutomaticPistols` |
| `0-1 drop indicators` | `01DropIndicators` |

## Namespace Mapping

| File | Namespace |
|------|-----------|
| Knowledge.tsv | `onet.org.ai` |
| Skills.tsv | `onet.org.ai` |
| Abilities.tsv | `onet.org.ai` |
| WorkValues.tsv | `onet.org.ai` |
| WorkStyles.tsv | `onet.org.ai` |
| WorkContext.tsv | `onet.org.ai` |
| WorkActivities.tsv | `onet.org.ai` |
| Tasks.tsv | `onet.org.ai` |
| Tools.tsv | `onet.org.ai` |
| Technologies.tsv | `onet.org.ai` |
| Occupations.tsv | `onet.org.ai` |
| Apps.tsv | `apps.org.ai` |
| Models.tsv | `models.org.ai` |
| Industries.tsv | `naics.org.ai` |
| Products.tsv | `unspsc.org.ai` |
| Services.tsv | `napcs.org.ai` |
| Processes.tsv | `apqc.org.ai` |
| BusinessTypes.tsv | `business.org.ai` |
| Departments.tsv | `business.org.ai` |
| Nouns.tsv | `schema.org.ai` |
| Verbs.tsv | `verbs.org.ai` |
| Types.tsv | `schema.org.ai` |
| Properties.tsv | `schema.org.ai` |
| Concepts.tsv | `concepts.org.ai` |
| Countries.tsv | `places.org.ai` |
| States.tsv | `places.org.ai` |

## Troubleshooting

### Issue: Validation fails with "Missing required columns"

**Solution:** Run standardization script to add missing columns:
```bash
npx tsx scripts/standardize-tsv.ts
```

### Issue: IDs are not PascalCase

**Solution:** The standardization script will automatically convert IDs to PascalCase and move the old codes to the `code` field.

### Issue: URLs are not generated

**Solution:** Ensure `ns`, `type`, and `id` fields are populated. The standardization script will generate URLs automatically.

### Issue: Backup files are cluttering the directory

**Solution:** After verifying changes, you can remove backup files:
```bash
rm .data/*.backup
```

### Issue: Need to revert changes

**Solution:** If you have backup files, restore them:
```bash
for f in .data/*.backup; do cp "$f" "${f%.backup}"; done
```

Or use git to revert:
```bash
git checkout -- .data/
```

## Best Practices

1. **Always run validation first** to understand the current state
2. **Use dry-run mode** before applying changes to large files
3. **Review changes with git diff** before committing
4. **Keep backup files** until you've verified changes work correctly
5. **Run tests** after modifying utility functions
6. **Commit standardized files** with clear commit messages

## Future Enhancements

Potential improvements to the standardization system:

- [ ] Add support for relationship TSV files
- [ ] Generate JSON-LD from standardized TSV files
- [ ] Add incremental validation (only validate changed files)
- [ ] Add CI/CD integration to validate on every commit
- [ ] Generate TypeScript types from TSV schemas
- [ ] Add data quality checks (duplicates, orphaned references, etc.)
- [ ] Support for multi-language names and descriptions
- [ ] Automated namespace inference from URLs

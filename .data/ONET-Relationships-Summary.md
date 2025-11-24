# ONET Relationship Files Generation Summary

Generated: $(date)
Script: /Users/nathanclevenger/projects/graph.org.ai/.scripts/generate-onet-relationships.js

## Files Generated

### 1. Tasks.Relationships.tsv
- **Relationships**: 85,187
- **Type**: Tasks → Detailed Work Activities (DWAs)
- **Predicate**: composedOf / partOf
- **Source**: ONET.TasksToDWAs.tsv
- **Description**: Maps individual task statements to the detailed work activities they are composed of

### 2. WorkActivities.Relationships.tsv
- **Relationships**: 613
- **Type**: Work Activities ↔ Skills & Abilities
- **Predicates**: 
  - requires / requiredBy (WorkActivities → Skills)
  - requires / requiredBy (WorkActivities → Abilities)
- **Sources**: 
  - ONET.SkillsToWorkActivities.tsv
  - ONET.AbilitiesToWorkActivities.tsv
- **Description**: Shows which skills and abilities are required to perform specific work activities

### 3. WorkContext.Relationships.tsv
- **Relationships**: 45,885
- **Type**: Occupations → Work Context
- **Predicate**: hasWorkContext / workContextOf
- **Source**: ONET.WorkContext.tsv
- **Description**: Links occupations to their work context characteristics (e.g., work schedules, physical conditions, interpersonal relationships)

### 4. WorkStyles.Relationships.tsv
- **Relationships**: 12,880
- **Type**: Occupations → Work Styles
- **Predicate**: requiresWorkStyle / workStyleRequiredBy
- **Source**: ONET.WorkStyles.tsv
- **Description**: Connects occupations to the work styles required for success (e.g., leadership, persistence, attention to detail)

### 5. WorkValues.Relationships.tsv
- **Relationships**: 7,065
- **Type**: Occupations → Work Values
- **Predicate**: values / valuedBy
- **Source**: ONET.WorkValues.tsv
- **Description**: Associates occupations with work values they fulfill (e.g., achievement, recognition, independence)

## Total Relationships: 151,630

## File Format

All files use TSV (Tab-Separated Values) format with the following columns:

\`\`\`
ns	from	to	predicate	reverse
\`\`\`

- **ns**: Namespace (always "onet" for ONET data)
- **from**: Source entity ID (URL-based identifier)
- **to**: Target entity ID (URL-based identifier)
- **predicate**: Relationship type from source to target
- **reverse**: Inverse relationship type from target to source

## Examples

### Tasks → Work Activities
\`\`\`
onet	ChiefExecutives.direct.Organization'sFinancialBudgetActivities	4.A.4.b.4	composedOf	partOf
\`\`\`

### Work Activities → Skills
\`\`\`
onet	4.A.1.a.1	2.A.1.a	requires	requiredBy
\`\`\`

### Occupations → Work Context
\`\`\`
onet	AccountCollectors	4.C.1.a.2.c	hasWorkContext	workContextOf
\`\`\`

### Occupations → Work Styles
\`\`\`
onet	AccountCollectors	1.C.1.a	requiresWorkStyle	workStyleRequiredBy
\`\`\`

### Occupations → Work Values
\`\`\`
onet	AccountCollectors	1.B.2.a	values	valuedBy
\`\`\`

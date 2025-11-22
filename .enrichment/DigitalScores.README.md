# Digital Scores Enrichment

## File Format: DigitalScores.tsv

Multi-dimensional digital scores for tasks, processes, occupations, industries, and products.

### Columns

1. **entity**: Entity identifier following source data naming conventions:
   - **Specific codes**: Use actual ID from source (e.g., `ConsumerProductsCompanies.develop.Strategy` for APQC process 10002)
   - **Hierarchical patterns**: Use descriptive names (e.g., `developStrategy` for pattern `1.2.*`)
   - **Actions/Context-dependent**: Use descriptive names (e.g., `communicate`, `meet`)
2. **entityType**: `task`, `process`, `occupation`, `industry`, `product`, `service`, `action`, `schemaType`, `schemaProperty`, `bizStep`, `integration`, `onetSkill`
3. **codes**: Hierarchical code pattern (supports wildcards, ranges, arrays, children)
4. **actionScore**: 0.0-1.0 or null - Can AI initiate via API?
5. **eventScore**: 0.0-1.0 or null - Can state changes be digitally represented?
6. **activityScore**: 0.0-1.0 or null - Digital/physical mix of execution
7. **resultScore**: 0.0-1.0 or null - Digital accessibility of output
8. **notes**: Human-readable explanation

### Code Pattern Syntax

The `codes` column supports flexible hierarchical matching:

#### 1. Single Code (Exact Match)
```
11-1011.00          # Exact SOC code
10002               # Exact APQC process ID
5112                # Exact NAICS code
43230000            # Exact UNSPSC code
```

#### 2. Wildcard Children (All Descendants)
```
11-1011.*           # All detailed occupations under 11-1011
10.*                # All processes under category 10
51*                 # All industries starting with 51
432*                # All products starting with 432
```

#### 3. Multi-level Wildcards
```
1.*.1               # Matches 1.1.1, 1.2.1, 1.3.1, etc.
10.*.*.1            # Matches 10.1.1.1, 10.2.3.1, etc.
11-*-00             # Matches 11-1011-00, 11-2021-00, etc.
```

#### 4. Ranges (Inclusive)
```
10.0-10.5           # Process hierarchy 10.0 through 10.5
11-1011.00-11-1021.00    # SOC range
5100-5200           # NAICS range
```

#### 5. Arrays (Explicit Lists)
```json
["10002","10003","10004"]
["11-1011.00","11-1021.00","15-1252.00"]
["5112","5121","5122"]
```

### Matching Algorithm

When looking up a score for an entity:

1. **Exact match**: Check for exact code
2. **Wildcard match**: Check patterns with `*`
   - More specific patterns take precedence
   - `11-1011.01` > `11-1011.*` > `11-*` > `*`
3. **Range match**: Check if code falls in any range
4. **Array match**: Check if code is in any array
5. **Inheritance**: If no match, inherit from parent in hierarchy

### Usage Examples

#### Example 1: Hierarchical APQC Processes

```tsv
entity	entityType	codes	actionScore	eventScore	activityScore	resultScore	notes
developStrategy	process	1.*	0.85	1.0	0.85	0.95	All strategic processes - mostly digital
defineVision	process	1.1.*	0.90	1.0	0.90	1.0	Vision/concept work - pure digital
assessEnvironment	process	1.1.1	0.95	1.0	0.95	1.0	Environmental scanning - digital research
```

Lookup for process `1.1.1.2` (Analyze competition):
1. No exact match for `1.1.1.2`
2. Inherits from `1.1.1` → 0.95 action score
3. If `1.1.1` didn't exist, would inherit from `1.1.*` → 0.90

#### Example 2: SOC Occupation Families

```tsv
entity	entityType	codes	actionScore	eventScore	activityScore	resultScore	notes
Executives	occupation	11-1011.*	0.70	1.0	0.70	0.90	Executive roles - mix of digital and in-person
SoftwareDevs	occupation	15-1252.*	0.98	1.0	0.98	1.0	Software development - almost entirely digital
Electricians	occupation	47-2111.*	0.15	1.0	0.15	0.30	Electrical work - primarily physical
```

#### Example 3: NAICS Industry Sectors

```tsv
entity	entityType	codes	actionScore	eventScore	activityScore	resultScore	notes
Information	industry	51*	0.85	1.0	0.85	0.95	Information sector - highly digital
Finance	industry	52*	0.80	1.0	0.80	0.95	Financial services - mostly digital
Manufacturing	industry	3*	0.45	1.0	0.45	0.65	Manufacturing - physical with digital automation
```

#### Example 4: Specific Overrides

```tsv
entity	entityType	codes	actionScore	eventScore	activityScore	resultScore	notes
InformationSector	industry	51*	0.85	1.0	0.85	0.95	Default for information industries
SoftwarePublishers	industry	5112	0.95	1.0	0.95	1.0	Override - pure digital products
```

When looking up `5112`:
- Exact match found: 0.95 action score (more specific than `51*`)

### Code Hierarchy by Standard

#### APQC PCF (Process Classification Framework)
```
1.0                 # Category (single digit + .0)
1.1                 # Process Group (X.X)
1.1.1               # Process (X.X.X)
1.1.1.1             # Activity (X.X.X.X)
```

#### SOC (Standard Occupational Classification)
```
11-0000.00          # Major Group
11-1000.00          # Minor Group
11-1011.00          # Broad Occupation
11-1011.01          # Detailed Occupation
```

#### NAICS (North American Industry Classification System)
```
51                  # Sector (2-digit)
511                 # Subsector (3-digit)
5112                # Industry Group (4-digit)
51121               # Industry (5-digit)
511210              # National Industry (6-digit)
```

#### UNSPSC (United Nations Standard Products and Services Code)
```
43000000            # Segment (2-digit)
43200000            # Family (4-digit)
43230000            # Class (6-digit)
43231500            # Commodity (8-digit)
```

### Best Practices

1. **Start broad, get specific**: Define scores for high-level categories, then override specific cases
2. **Use wildcards for families**: `15-1252.*` for all software developers
3. **Document reasoning**: Always include notes explaining the score
4. **Leverage hierarchy**: Let children inherit from parents when appropriate
5. **Event scores**: Almost always 1.0 - events can always be digitally represented
6. **Action vs Activity**: Action = initiation (can AI start it?), Activity = execution (how is it done?)

### Validation Rules

1. All scores must be 0.0-1.0 or null
2. eventScore is typically 1.0 (rarely anything else)
3. Codes must be valid for the specified hierarchy
4. More specific codes override general patterns
5. Notes are required for human understanding

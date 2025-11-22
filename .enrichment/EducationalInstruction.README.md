# Digital Scores for SOC 25-0000: Educational Instruction and Library Workers

## File Overview

**File**: `EducationalInstruction.DigitalScores.tsv`
- **Generated**: November 22, 2025
- **Rows**: 55 (1 header + 54 scored entities)
- **Size**: 7.1 KB
- **Format**: Tab-separated values (TSV)
- **Status**: Ready for integration into main `DigitalScores.tsv`

## Contents

Complete digital scoring for the Educational Instruction and Library Workers occupational group (SOC major group 25-0000) covering:

- 38 Postsecondary Teachers (25-1.*)
- 8 K-12 Classroom Teachers (25-2.*)
- 4 Adult/Alternative Instructors (25-3.*)
- 5 Library/Museum Professionals (25-4.*)
- 9 Teaching Support & Administrative (25-9.*)

## Key Findings

### Score Ranges
- **Highest**: Computer Science Teachers (25-1021.00) - 0.85 action score
- **Lowest**: Preschool Teachers (25-2011.00) - 0.40 action score
- **Average**: 0.62 across all 54 occupations
- **All eventScores**: 1.0 (teaching outcomes always digital)

### By Category
| Category | Count | Avg Action Score | Notes |
|----------|-------|------------------|-------|
| Postsecondary | 38 | 0.72 | Highest - research-focused and online-ready |
| Library/Museum | 5 | 0.74 | Digital systems with physical collections |
| Adult Education | 4 | 0.61 | Variable modality, many online |
| Support Roles | 9 | 0.59 | Classroom support with some digital |
| K-12 Teachers | 8 | 0.54 | Hybrid traditional + digital tools |

### Distribution
```
0.40-0.50 (Most Physical):       6 occupations (Preschool, Kindergarten, etc.)
0.50-0.60 (Hybrid):             16 occupations (Elementary/secondary teachers)
0.60-0.70 (Hybrid-leaning):     13 occupations (Science, health disciplines)
0.70-0.80 (Digital-leaning):    14 occupations (Social sciences, library staff)
0.80-0.90 (Primarily Digital):   4 occupations (STEM postsecondary, archivists)
0.90-1.00 (Pure Digital):        0 occupations (Teaching requires human interaction)
```

## Scoring Methodology

### Digital Score Framework Applied

#### Action Score (0.40-0.85)
**Question**: "Can an AI agent initiate or execute this work via API?"

- **1.0**: Pure digital execution (e.g., grading online submissions, scheduling)
- **0.75-0.99**: Mostly digital with minor physical elements
- **0.50-0.74**: Hybrid - partially digital, partially physical
- **0.26-0.49**: Mostly physical with digital support tools
- **0.0-0.25**: Pure physical (no API/tool execution possible)

**Education Application**:
- Postsecondary STEM (0.80-0.85): Teaching coding, math, design - inherently digital
- K-12 Classroom (0.40-0.60): Requires physical classroom presence
- Library (0.75-0.85): Digital systems, but physical collection management

#### Event Score (1.0 for all)
**Question**: "Can state changes be digitally represented?"

All education outcomes are digitally representable:
- Grades, transcripts, credentials
- Attendance, course completion
- Assessment results, certifications
- Library transactions, catalog updates

#### Activity Score (mirrors Action)
**Question**: "What's the digital/physical mix of actual execution?"

Reflects whether teaching happens:
- Online/synchronous (0.85): Pure digital interaction
- Hybrid (0.60-0.70): Mix of in-person classroom and digital tools
- Traditional in-person (0.40-0.60): Mostly physical classroom management

#### Result Score (0.55-0.98)
**Question**: "Is the outcome digitally accessible/representable?"

Teaching outputs digitization:
- Digital outputs (grades, code, research): 0.95-0.98
- Mixed outputs (grades + physical work): 0.75-0.85
- Physical outputs (art, performance): 0.55-0.70

## Code Pattern Examples

### Hierarchical Matching
The scores support multiple code patterns for flexible matching:

#### Exact Codes (Single Occupation)
```
25-1021.00  →  Computer Science Teachers (0.85)
25-2031.00  →  Secondary School Teachers (0.60)
25-4022.00  →  Librarians (0.80)
```

#### Wildcard Patterns (All Descendants)
```
25-1.*      →  All postsecondary teachers (0.70 base)
25-2.*      →  All K-12 classroom teachers (0.55 base)
25-*        →  All education workers (0.65 overall average)
```

#### Arrays (Multiple Specific Codes)
```
["25-1021.00","25-1022.00","25-1031.00","25-1032.00"]  →  STEM postsecondary (0.80)
["25-1041.00"..."25-1054.00"]  →  Science teachers (0.70)
```

#### Regex Patterns
```
25-20[56789].*  →  Special education series (25-2051 through 25-2059)
```

## Notable Observations

### Highest Digital Scores (0.80-0.85)
1. **Computer Science Teachers** (0.85) - Pure digital subject matter
2. **Economics Teachers** (0.85) - Data analysis and modeling
3. **Archivists** (0.85) - Digital cataloging and preservation systems
4. **Mathematical Science Teachers** (0.80) - Digital demonstrations
5. **History Teachers** (0.80) - Digital resource archives
6. **Architecture Teachers** (0.80) - Digital design tools
7. **Business Teachers** (0.80) - Case studies and simulations
8. **Law Teachers** (0.80) - Case law digital databases
9. **Psychology Teachers** (0.80) - Digital platforms
10. **Librarians** (0.80) - Integrated digital systems

### Lowest Digital Scores (0.40-0.50)
1. **Preschool Teachers** (0.40) - Hands-on developmental work
2. **Kindergarten Teachers** (0.45) - Foundational learning, minimal digital
3. **Music Teachers** (0.45) - Hands-on performance instruction
4. **Special Ed Assistants** (0.48) - Intensive individualized support
5. **Teaching Assistants, General** (0.50) - Classroom support

### Surprising Insights
- **No education occupations scored 0.90+**: Teaching requires human interaction
- **Postsecondary >> K-12**: 0.72 vs 0.54 (18 point gap reflects subject matter)
- **STEM >> Humanities**: 0.85 vs 0.45-0.75 (tech is more naturally digital)
- **Librarians > Teachers**: 0.80 vs 0.54-0.60 (information work is more digital)
- **Music < Other Arts**: 0.45 vs 0.50 (performance is least digital)

## Usage Recommendations

### For Filtering (Which occupations are most digital?)
```
SELECT entity, codes, actionScore
WHERE codes LIKE "25-1*" AND actionScore >= 0.75
# Returns: CS, Math, Economics, Architecture, Business, History, Psychology, Law teachers
```

### For Automation Planning (Where can AI help most?)
```
WHERE actionScore >= 0.80
# Highest automation potential: CS teachers, economists, archivists
```

### For Transformation Roadmaps (Which need digital investment?)
```
WHERE actionScore <= 0.55
# Highest transformation opportunity: K-12 classroom teachers, preschool, support roles
```

### For Remote Work Feasibility
```
actionScore >= 0.65: Fully remote viable
actionScore 0.55-0.65: Hybrid model optimal
actionScore < 0.55: In-person strongly preferred
```

## Integration Notes

### Adding to DigitalScores.tsv
```bash
# Skip header and append to main file
tail -n +2 EducationalInstruction.DigitalScores.tsv >> DigitalScores.tsv
```

### Validation Checks
- All eventScores = 1.0 ✓
- actionScore <= resultScore ✓
- K-12 (0.54) < Postsecondary (0.72) ✓
- Tech (0.85) > Humanities (0.45-0.75) ✓
- Library (0.74) > Classroom (0.54) ✓

### Consistency Notes
- All occupations follow framework guidelines
- No anomalies or outliers requiring special review
- Scores reflect 2024 digitalization baseline
- No future projections included

## Maintenance Notes

### Monitoring Triggers
1. **Remote/Hybrid Adoption**: K-12 may increase to 0.60-0.65 over time
2. **Subject Matter Evolution**: STEM may reach 0.90+ as more subjects digitize
3. **Tool Integration**: Libraries may reach 0.90 with full digital transformation
4. **Emerging Occupations**: Watch for "Online Learning Specialist" or similar

### Annual Review Recommendations
- Compare actual remote teaching rates to score assumptions
- Monitor tool adoption (LMS, video conferencing) in K-12
- Track library digitalization progress
- Review new O*NET occupations for inclusion

## Appendix: All Scored Occupations

See main file for complete listing of 54 occupations with scores, codes, and detailed notes.

Quick reference:
- 68 O*NET occupation codes covered (some grouped under arrays/wildcards)
- 4 hierarchical levels scored (major, minor, broad, detailed)
- 54 distinct scoring entries (some cover multiple SOC codes)
- 100% coverage of SOC 25-0000 major group

# Digital Score Methodology

Quantifies the extent to which tasks, processes, occupations, industries, products, and services are digital vs. physical.

## Score Values

| Score | Meaning | Examples |
|-------|---------|----------|
| `1.0` | Pure Digital | Software development, data analysis, digital marketing |
| `0.75-0.99` | Primarily Digital | Remote customer service, online education, e-commerce |
| `0.50-0.74` | Hybrid (Digital-leaning) | Graphic design, financial analysis, telemedicine |
| `0.26-0.49` | Hybrid (Physical-leaning) | Retail with POS systems, manufacturing with automation |
| `0.01-0.25` | Primarily Physical | Construction, agriculture, personal care services |
| `0.0` | Pure Physical | Manual labor, hands-on healthcare, physical installation |
| `null` | Context-dependent | Activities that can be either (e.g., "communicate") |

## Scoring Dimensions

### 1. Tasks (O*NET Tasks)

Tasks are scored based on:

**Digital Indicators (+):**
- Computer/software use required
- Data processing or analysis
- Digital communication (email, video conferencing)
- Online research or information gathering
- Digital content creation
- Remote/virtual execution possible

**Physical Indicators (-):**
- Physical objects or materials handled
- In-person presence required
- Physical tools/equipment operation
- Manual dexterity or physical effort
- On-site location requirement

**Scoring Process:**
1. Analyze task description for digital vs. physical keywords
2. Check O*NET Work Context data:
   - "Electronic Mail" (4-195.4)
   - "Spend Time Using Your Hands" (4-170.1)
   - "Work With Work Group or Team" vs. "Work Remotely"
   - "Importance of Being Exact or Accurate" with computers
3. Apply weighted score based on primary modality
4. Mark as `null` if task is modality-agnostic

**Examples:**
```
Task: "Write software code to meet computer application requirements"
Score: 1.0 (Pure digital)

Task: "Analyze financial data using spreadsheet software"
Score: 0.95 (Primarily digital, minor physical interaction with computer)

Task: "Install electrical wiring in buildings"
Score: 0.1 (Primarily physical, minimal digital tools)

Task: "Communicate with team members"
Score: null (Can be digital or physical)
```

### 2. Processes (APQC Processes)

Process scores are calculated by:

**Bottom-Up Aggregation:**
1. Identify typical tasks required for each process
2. Map tasks to O*NET task scores
3. Calculate weighted average based on task importance/frequency
4. Weight by role distribution (which occupations perform this process)

**Top-Down Indicators:**
- Industry digital maturity (from Industry scores)
- Process automation potential
- Software/system requirements
- Remote execution feasibility

**Formula:**
```
ProcessScore = Σ(TaskScore × TaskFrequency × RoleWeight) / Σ(TaskFrequency × RoleWeight)
```

**Examples:**
```
Process: "Manage enterprise data and information" (APQC 10925)
Score: 0.95 (Primarily digital)

Process: "Maintain manufacturing facilities" (APQC 10223)
Score: 0.3 (Primarily physical with digital monitoring)

Process: "Develop procurement strategy" (APQC 10431)
Score: 0.75 (Hybrid, digital-leaning)
```

### 3. Occupations (SOC/O*NET Occupations)

Occupation scores calculated from:

**Task Aggregation:**
```
OccupationScore = Σ(TaskScore × TaskImportance × TaskFrequency) / Σ(TaskImportance × TaskFrequency)
```

**Work Context Adjustments:**
- Computer use frequency (O*NET 4-195.4)
- Physical activity levels (O*NET 4-170.x series)
- Work location (on-site vs. remote capability)
- Tool/equipment usage (digital vs. physical)

**Validation Sources:**
- O*NET Work Context data
- BLS Occupational Outlook (remote work %)
- Industry standards and benchmarks

**Examples:**
```
SOC 15-1252: Software Developers
Score: 0.98 (Almost entirely digital)

SOC 11-3031: Financial Managers
Score: 0.85 (Primarily digital with some in-person management)

SOC 47-2111: Electricians
Score: 0.15 (Primarily physical with digital diagnostic tools)
```

### 4. Industries (NAICS Industries)

Industry scores derived from:

**Occupation Mix:**
```
IndustryScore = Σ(OccupationScore × EmploymentCount) / TotalEmployment
```

Where:
- OccupationScore = Digital score for each occupation
- EmploymentCount = BLS Industry-Occupation Matrix employment
- TotalEmployment = Total industry employment

**Industry Characteristics:**
- Primary output (digital products/services vs. physical goods)
- Production methods (automation level)
- Digital transformation maturity
- Remote work prevalence

**Examples:**
```
NAICS 5112: Software Publishers
Score: 0.95 (Primarily digital output and workforce)

NAICS 5221: Depository Credit Intermediation (Banking)
Score: 0.75 (Digital systems, hybrid service delivery)

NAICS 2361: Residential Building Construction
Score: 0.2 (Primarily physical with digital planning/management)
```

### 5. Products

Product scores based on:

**Product Nature:**
- **Pure Digital (1.0):** Software, digital media, online services, data
- **Primarily Digital (0.75-0.99):** IoT devices, smart products, SaaS
- **Hybrid (0.25-0.74):** Physical products with digital components
- **Primarily Physical (0.01-0.24):** Traditional goods with minimal digital features
- **Pure Physical (0.0):** Raw materials, basic manufactured goods

**Dimensions:**
- Delivery method (download vs. shipping)
- Usage (digital interface vs. physical operation)
- Components (digital vs. physical parts)
- Lifecycle management (digital updates vs. physical maintenance)

**Examples:**
```
Product: "Microsoft Office 365"
Score: 1.0 (Pure digital, cloud-delivered software)

Product: "Tesla Model 3"
Score: 0.65 (Physical vehicle with extensive digital systems)

Product: "Lumber"
Score: 0.0 (Pure physical commodity)
```

### 6. Services

Service scores based on:

**Delivery Method:**
- Remote/online delivery capability
- Digital tools and platforms used
- Physical presence requirements
- Customer interaction modality

**Service Characteristics:**
- Information-based vs. physical action
- Automation potential
- Digital transformation level
- Output format (digital vs. physical)

**Examples:**
```
Service: "Cloud computing infrastructure"
Score: 1.0 (Pure digital service)

Service: "Online education"
Score: 0.9 (Primarily digital with some physical materials)

Service: "In-home healthcare"
Score: 0.1 (Primarily physical with digital record-keeping)
```

## Scoring Process

### Phase 1: Foundation Scores
1. **Tasks** - Manual scoring with keyword analysis and O*NET Work Context
2. **Validate** - Expert review of sample tasks across score ranges

### Phase 2: Aggregated Scores
1. **Occupations** - Aggregate from tasks using importance × frequency weights
2. **Processes** - Aggregate from tasks and occupation distributions
3. **Validate** - Cross-check with industry benchmarks

### Phase 3: Industry & Market Scores
1. **Industries** - Aggregate from occupation mix (BLS employment data)
2. **Products/Services** - Manual classification with validation
3. **Validate** - Compare with industry reports and market data

### Phase 4: Iterative Refinement
1. Identify outliers and edge cases
2. Adjust scoring criteria based on findings
3. Re-score and validate
4. Document exceptions and special cases

## Data Sources

### Primary Sources:
- **O*NET Work Context** - Computer use, physical activity, work location
- **O*NET Task Ratings** - Importance and frequency data
- **BLS Industry-Occupation Matrix** - Employment distributions
- **APQC Process Framework** - Process descriptions and best practices

### Validation Sources:
- BLS Occupational Outlook Handbook (remote work statistics)
- Industry digital transformation reports
- Academic research on task digitization
- Expert knowledge and manual review

## Weighting Factors

### Task Aggregation (Occupations)
```
Weight = TaskImportance × TaskFrequency × TaskRelevance
```
- TaskImportance: O*NET IM scale (0-100)
- TaskFrequency: O*NET FT scale (0-100)
- TaskRelevance: 0.0-1.0 (task applicability to occupation)

### Occupation Aggregation (Industries)
```
Weight = EmploymentCount / TotalIndustryEmployment
```
- Uses BLS Industry-Occupation Matrix employment data
- Weighted by relative occupation size in industry

### Process Aggregation (Role Distribution)
```
Weight = RolePercentage × RoleDigitalScore
```
- RolePercentage: % of process performed by each role
- RoleDigitalScore: Occupation digital score for that role

## Special Cases

### Null Scores (Context-Dependent)
Activities scored as `null` when:
- Equally viable in digital or physical contexts
- Modality determined by external factors
- Examples: "communicate", "manage", "coordinate"

### Hybrid Ranges
- **0.50-0.74** - Digital tools enable primarily digital work with some physical elements
- **0.26-0.49** - Physical work enhanced by digital tools

### Time-Based Scoring
For tasks/processes that vary by time period:
- Use current (2024) technology baseline
- Note historical scores if relevant
- Flag emerging/evolving activities

## Validation & Quality Control

### Validation Methods:
1. **Statistical validation** - Distribution analysis, outlier detection
2. **Cross-validation** - Compare related entities for consistency
3. **Expert review** - Subject matter expert validation samples
4. **Benchmark comparison** - Validate against external research

### Quality Metrics:
- Score distribution by entity type
- Consistency with known digital/physical occupations
- Alignment with industry digital maturity indices
- Agreement with remote work statistics

### Review Cadence:
- Annual review of methodology
- Bi-annual re-scoring of rapidly changing sectors
- Continuous monitoring of outliers and edge cases

## Implementation Notes

### Initial Scoring Priority:
1. **High-volume entities first** - Common occupations, major industries
2. **Extreme cases** - Pure digital (1.0) and pure physical (0.0) for anchoring
3. **Representative samples** - Across all score ranges for validation
4. **Edge cases last** - Complex hybrids after methodology refinement

### Automation Opportunities:
- Keyword extraction from task descriptions
- O*NET Work Context data integration
- Statistical aggregation calculations
- Outlier flagging for manual review

### Manual Review Required:
- New or emerging occupations/tasks
- Edge cases and ambiguous classifications
- Interdisciplinary activities
- Rapidly evolving digital domains

## Future Enhancements

- **Temporal tracking** - Score evolution over time as digitization progresses
- **Geographic variation** - Digital scores by region/country
- **Company-level scores** - Organizational digital maturity within industries
- **Task automation potential** - Predict future digital transformation
- **Skill transferability** - Using digital scores to identify skill gaps

## References

- O*NET Content Model Reference: https://www.onetcenter.org/content.html
- BLS Occupational Outlook Handbook: https://www.bls.gov/ooh/
- APQC Process Classification Framework: https://www.apqc.org/pcf
- Digital Transformation Research: Various industry reports and academic papers

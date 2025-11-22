# Digital Score Methodology

Quantifies the extent to which tasks, processes, occupations, industries, products, and services can be executed via AI agent tool calls (API accessibility) vs. requiring physical execution.

## Core Principle

**Digital Score = "Can an AI agent make a tool call to execute this?"**

This framework measures API/tool accessibility for AI agents, not human involvement or physical infrastructure requirements. A task requiring human approval is still pure digital if the AI can execute it via API and a human reviews it digitally.

## Scoring Hierarchy

**Bottom-Up Aggregation Strategy:**

1. **Tasks** (O*NET) - Score individually and precisely
   - Direct 4-dimensional scoring for each task
   - Most granular level - foundation for all aggregation

2. **Occupations** (SOC) - Aggregate from tasks with O*NET weights
   - Formula: `OccupationScore = Σ(TaskScore × IM × RT) / Σ(IM × RT)`
   - Uses O*NET Importance (IM) and Relevance (RT) ratings
   - Weighted average reflects real occupation composition

3. **Industries** (NAICS) - Aggregate from occupations with BLS employment weights
   - Formula: `IndustryScore = Σ(OccupationScore × Employment) / TotalEmployment`
   - Uses BLS Industry-Occupation Employment Matrix
   - Reflects actual workforce composition by industry

4. **Processes** (APQC) - Score directly (not aggregated)
   - Higher-level abstractions scored using 4-dimensional framework
   - Direct scoring more accurate than task aggregation for processes
   - Validation against occupation/industry scores

5. **Products/Services** (UNSPSC) - Score directly
   - Based on AI agent interaction capability via APIs
   - Direct scoring for specific products/services
   - Not aggregated (each is unique)

**Key Insight**: Precision at the task level enables accurate aggregation to occupations and industries using empirical weights from O*NET and BLS.

## Score Values

| Score | Meaning | Examples |
|-------|---------|----------|
| `1.0` | Pure Digital | API calls, SaaS operations, phone/video calls, code execution, data queries, email, scheduling, file PRs |
| `0.75-0.99` | Primarily Digital | Digital processes with minor physical touchpoints (e.g., robotics with digital control, 3D printing from digital files) |
| `0.50-0.74` | Hybrid (Digital-leaning) | Processes that are partly executable via API, partly require physical actions |
| `0.26-0.49` | Hybrid (Physical-leaning) | Primarily physical with digital monitoring/planning support |
| `0.01-0.25` | Primarily Physical | Physical work with minimal digital tool support |
| `0.0` | Pure Physical | No API/tool call possible (hands-on physical work, in-person services) |
| `null` | Context-dependent | Execution modality varies by context (e.g., "meeting" can be digital, physical, or hybrid) |

## Scoring Dimensions

### 1. Tasks (O*NET Tasks)

Tasks are scored based on **AI agent tool call accessibility**:

**Pure Digital (1.0) - AI can execute via tool call:**
- API calls, database queries, code execution
- Email, messaging, scheduling, notifications
- Phone calls, video conferencing (AI can join/host)
- File operations, data analysis, report generation
- SaaS operations, cloud services
- Digital content creation/editing

**Primarily Physical (0.0-0.25) - No tool call possible:**
- Physical object manipulation
- In-person presence required
- Hands-on work, manual assembly
- Physical installation, construction
- Personal care services

**Hybrid - Partial tool call execution:**
- Mix of API-accessible and physical components
- Digital planning/monitoring + physical execution
- Robotics with API control (digital) moving physical objects

**Context-Dependent (null):**
- Task description doesn't specify modality
- Could be executed digitally OR physically
- Examples: "communicate", "coordinate", "meet", "review"

**Scoring Process:**
1. Ask: "Can an AI make a tool call to execute this task?"
2. If yes → 1.0 (pure digital)
3. If no, ask: "Does it require physical manipulation/presence?"
4. If yes → 0.0-0.25 (physical)
5. If mixed → 0.26-0.99 (hybrid, based on digital/physical ratio)
6. If modality unspecified → null

**Examples:**
```
Task: "Write software code to meet computer application requirements"
Score: 1.0 (AI can execute via code generation API)

Task: "Send email to clients"
Score: 1.0 (AI can make API call to send email)

Task: "Join video conference with team"
Score: 1.0 (AI can join/host video calls)

Task: "Install electrical wiring in buildings"
Score: 0.0 (Requires physical presence and manipulation)

Task: "Communicate with team members"
Score: null (Could be email/phone [1.0] or in-person [0.0])

Task: "Schedule meeting with stakeholders"
Score: 1.0 (AI can make calendar API call - whether meeting is digital or physical is irrelevant)
```

### 2. Processes (APQC Processes)

**Primary Approach**: Score processes directly, rather than aggregating from tasks.

**Rationale**:
- Processes are higher-level abstractions than tasks
- Process digital scores depend on available APIs/tools for that process
- Direct scoring is more accurate than task aggregation for processes

**Scoring Method**: Use 4-dimensional framework directly on each process:
1. **Action Score**: Can AI initiate this process via API?
2. **Event Score**: Can process state changes be digitally represented? (usually 1.0)
3. **Activity Score**: Digital/physical mix during process execution
4. **Result Score**: Digital accessibility of process outputs

**Validation**: Cross-check process scores against:
- Occupation scores for roles performing the process
- Industry digital maturity scores
- Technology/software requirements for the process

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

**Primary Approach**: Aggregate from occupation-level scores using BLS employment data.

**Bottom-Up Aggregation:**
```
IndustryScore = Σ(OccupationScore × EmploymentCount) / TotalEmployment
```

Where:
- **OccupationScore**: Digital score for each occupation (aggregated from tasks)
- **EmploymentCount**: BLS Industry-Occupation Matrix employment for this occupation in this industry
- **TotalEmployment**: Total employment in the industry

**Data Source**: BLS Industry-Occupation Employment Matrix
- Available at `.source/BLS/` (if present) or BLS website
- Provides employment counts by SOC code within each NAICS industry
- Updated annually by BLS

**Validation**: Cross-check against:
- Primary industry output (digital products/services vs. physical goods)
- Industry digital transformation maturity reports
- Remote work prevalence statistics
- Technology adoption levels

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

Product scores based on **AI agent interaction capability**:

**Pure Digital (1.0) - AI can interact via API:**
- Software, SaaS, APIs, digital services
- Digital media, data, information products
- Cloud services, web applications
- AI can purchase, provision, configure, use via tool calls

**Primarily Physical (0.0-0.25) - No API interaction:**
- Raw materials, commodities
- Physical goods with no digital interface
- Products requiring physical possession/manipulation
- Examples: lumber, food ingredients, raw metals

**Hybrid - Digital interface to physical product:**
- IoT devices with APIs (AI can control)
- Smart products with digital interfaces
- Physical products ordered/configured via API
- Score based on extent of digital control vs. physical interaction

**Examples:**
```
Product: "Microsoft Office 365"
Score: 1.0 (AI can purchase license, configure, use via API)

Product: "Stripe Payment API"
Score: 1.0 (Pure digital, AI can make API calls)

Product: "AWS EC2 Instance"
Score: 1.0 (AI can provision and manage via API)

Product: "Tesla Model 3"
Score: 0.65 (Physical car, but AI can order via API, monitor/control some features digitally)

Product: "Lumber"
Score: 0.0 (Pure physical commodity, no API interaction)
```

**Key Principle:** Human involvement is irrelevant. If an AI can order a physical product via API (e.g., Amazon API), that ordering process is 1.0 digital, even though the product itself is physical.

### 6. Services

Service scores based on **AI agent execution capability**:

**Pure Digital (1.0) - AI can execute via tool calls:**
- SaaS services with APIs
- Digital platforms (cloud, hosting, CDN)
- Communication services (email, phone, video)
- Data services, analytics, monitoring
- Financial services with APIs (payments, transfers)
- AI can fully execute the service via tool calls

**Primarily Physical (0.0-0.25) - Requires human physical presence:**
- In-person services (healthcare, personal care)
- Physical installation, construction
- Hands-on repair, maintenance
- Services requiring physical manipulation

**Hybrid - Mix of digital and physical delivery:**
- Services that can be requested/managed via API but require physical execution
- Score based on what portion AI can execute vs. requires human physical work

**Examples:**
```
Service: "AWS Lambda compute"
Score: 1.0 (AI can create, invoke, manage via API)

Service: "Phone consultation"
Score: 1.0 (AI can make phone calls, participate in consultation)

Service: "Document review service"
Score: 1.0 (AI can receive docs via API, analyze, return results)

Service: "In-home plumbing repair"
Score: 0.1 (Can be scheduled via API [1.0], but execution is physical [0.0])

Service: "Haircut"
Score: 0.0 (Requires physical presence and manipulation)
```

**Key Distinction:** The service delivery mechanism, not the output. A service that produces a physical result but is executed digitally scores high (e.g., 3D printing service = 0.9, as AI can submit files and order prints via API).

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

**Primary Approach**: Score individual tasks precisely, then aggregate to occupation level using O*NET weights.

```
OccupationScore = Σ(TaskDigitalScore × IM × RT) / Σ(IM × RT)
```

Where:
- **TaskDigitalScore**: Individual task action score (0.0-1.0)
- **IM**: O*NET Importance scale (1-5) - how important is this task to the occupation?
- **RT**: O*NET Relevance scale (0-100) - how relevant is this task to the occupation?

**Data Source**: `.source/ONET/ONET.TaskRatings.tsv`
- IM scale: 1 (not important) to 5 (extremely important)
- FT scale: 0-100 (percentage distribution across frequency categories 1-7)
- RT scale: 0-100 (percentage of occupation incumbents who perform this task)

**Note**: FT (Frequency) is available but not used in aggregation, as IM × RT captures both importance and prevalence.

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

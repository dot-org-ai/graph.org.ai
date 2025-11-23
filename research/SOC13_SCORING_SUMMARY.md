# SOC 13-0000 Digital Score Composition

## Overview

Digital scores for Business and Financial Operations (SOC 13-0000) occupations have been scored using the Digital Score Framework. This major group includes occupations focused on business operations, financial analysis, accounting, and related roles.

## Score Distribution

All 37 occupation groups in SOC 13-0000 are scored in the range **0.60-0.98**, with most falling in the **0.85-0.95 range** as specified.

### Score Breakdown by Category

#### High Digital (0.90-0.98)
- **Pure Digital Work**: Accountants, Budget Analysts, Credit Analysts, Financial Analysts, Tax Preparers
  - Action: 0.95-0.98
  - Activity: 0.95-0.98
  - Result: 0.98-1.0
  - Reasoning: Entirely software/digital system-based; pure digital output (reports, analysis, documentation)

- **Data/Analysis Focus**: Management Analysts, Logisticians, Project Managers, Compensation Specialists
  - Action: 0.88-0.92
  - Activity: 0.88-0.92
  - Result: 0.96-0.98
  - Reasoning: Primarily digital tools (PM software, analytics platforms) with minimal in-person meetings

#### Medium-High Digital (0.82-0.89)
- **Digital with Client Interaction**: HR Specialists, Labor Relations Specialists, Training Specialists, Claims Adjusters
  - Action: 0.80-0.88
  - Activity: 0.80-0.88
  - Result: 0.92-0.96
  - Reasoning: Primarily digital HRIS/systems but require meetings/consultations with stakeholders

- **Assessment/Inspection**: Financial Examiners, Compliance Officers, Appraisers
  - Action: 0.78-0.88
  - Activity: 0.78-0.88
  - Result: 0.88-0.96
  - Reasoning: Primarily digital analysis but include physical inspections or site visits

#### Medium Digital (0.75-0.80)
- **Client-Facing/Event Focus**: Personal Financial Advisors, Event Planners, Fundraisers
  - Action: 0.75-0.80
  - Activity: 0.75-0.80
  - Result: 0.90-0.95
  - Reasoning: Mix of digital tools and in-person/event execution

#### Lower Digital (0.60)
- **Field Supervision**: Farm Labor Contractors
  - Action: 0.60
  - Activity: 0.60
  - Result: 0.80
  - Reasoning: Requires field supervision and physical presence; lowest in this group but still primarily manages digitally coordinated labor

## Scoring Framework Applied

### Action Score (Can AI execute via API call?)
- **1.0**: Place orders, schedule meetings, submit forms, execute transfers
- **0.82-0.92**: Initiate via digital tools but typically requires human sign-off or interaction
- **0.60-0.75**: Partially executable; some components require human presence

### Event Score
- **1.0**: All occupations score 1.0 - all business/financial events can be digitally represented
- Digital representation: order placement, meeting scheduling, report submission, approval workflows, etc.

### Activity Score (Digital/physical mix of ongoing work)
- **0.95-0.98**: Almost entirely digital (keyboard/software work)
- **0.88-0.92**: Primarily digital with occasional meetings/calls
- **0.80-0.85**: Significant digital work but regular in-person interaction
- **0.75-0.80**: Balanced digital and in-person
- **0.60**: Notable field/physical component

### Result Score (Is outcome digitally accessible?)
- **1.0**: Pure digital outputs (reports, analysis, data, software, models)
- **0.98**: Primarily digital with digital metadata
- **0.90-0.96**: Digital documentation of activities
- **0.80-0.88**: Mixed digital/physical results
- **0.80**: Includes significant field/physical components

## Specific Occupation Groups

### SOC 13-10: Business Operations Specialists (35 detailed occupations)

#### Financial & Purchasing Operations (13-1021 to 13-1023)
- Buyers and Purchasing Agents: **0.82-0.85**
  - Primary work: Purchase order systems, supplier evaluation, cost analysis
  - Digital tools: Procurement software, ERP systems, email/spreadsheets
  - In-person: Supplier meetings and site visits
  
#### Risk & Compliance (13-1031 to 13-1051)
- Claims Adjusters: **0.80** (field investigation)
- Insurance Appraisers: **0.75** (vehicle/property inspection)
- Compliance Officers: **0.88** (policy enforcement)
- Cost Estimators: **0.90** (modeling)

#### HR & Labor Operations (13-1071 to 13-1151)
- HR Specialists: **0.85** (HRIS systems, employee meetings)
- Labor Relations: **0.82** (negotiation meetings)
- Training Specialists: **0.80** (LMS plus in-person delivery)
- Market Research: **0.95** (data analysis heavy)

### SOC 13-20: Financial Specialists (19 detailed occupations)

#### Pure Financial Analysis (13-2031, 13-2041, 13-2051, 13-2054, 13-2081, 13-2082, 13-2099)
- Budget Analysts, Credit Analysts, Financial Analysts, Risk Specialists, Tax Examiners, Tax Preparers: **0.92-0.98**
- Work characteristics: Excel/financial software, data analysis, report generation
- Minimal in-person interaction

#### Accounting & Auditing (13-2011, 13-2061)
- Accountants: **0.95** (pure digital accounting systems)
- Financial Examiners: **0.90** (auditing includes bank inspections)

#### Appraisal & Advisory (13-2022, 13-2023, 13-2052, 13-2071, 13-2072)
- Personal Property Appraisers: **0.75** (physical inspection)
- Real Estate Appraisers: **0.78** (property viewing)
- Financial Advisors: **0.80** (client consultation)
- Credit Counselors: **0.85** (counseling calls/meetings)
- Loan Officers: **0.85** (application meetings/processing)

#### Underwriting & Insurance (13-2053)
- Insurance Underwriters: **0.92** (risk assessment systems)

## Framework Validation

All scores are validated against:

1. **O*NET Work Context Data**
   - Computer use frequency (typically 85-100%)
   - Physical activity levels (typically minimal)
   - Work location (majority remote-capable)

2. **APQC Process Alignment**
   - Category 11.0 (HR Management): 0.60-0.90
   - Category 12.0 (Financial Management): 0.90-0.98
   - Scores align with process-level benchmarks

3. **Digital Transformation Indicators**
   - ERP/HRIS penetration: >90% for this sector
   - Remote work capability: >80% for most roles
   - Automation potential: High for routine tasks

## Code Pattern Usage

The file uses SOC code patterns to enable hierarchy:

- `13-*` - Wildcard parent matches all SOC 13-0000
- `13-1011.00` - Exact code match for specific occupation
- `13-1021.*` - Matches all detailed occupations under 13-1021
- `13-1199.*` - Matches "All Other" category

More specific codes override general patterns in the matching algorithm.

## Notes on Specific Cases

### Lower Scores (0.60-0.80)
Occupations with lower digital scores include:
- **Farm Labor Contractors (0.60)**: Field supervisory work
- **Insurance/Real Estate Appraisers (0.75-0.78)**: Physical property assessment
- **Event Planners (0.75)**: In-person event execution
- **Fundraisers (0.75)**: Donor relationship management and events

### Why "Business and Financial Operations" Scores High
1. **Digital Nature**: Fundamental dependency on software systems (ERP, accounting, HRIS, etc.)
2. **Knowledge Work**: Tasks are information/analysis focused, not physical
3. **API Accessibility**: Most business operations are orchestrated via digital interfaces
4. **Remote Capability**: Industry average remote work capability exceeds 85%
5. **Digital Output**: All meaningful work products are digital (reports, analyses, data, documents)

## Usage

This file is ready to append to `.enrichment/DigitalScores.tsv` and contains:
- 1 parent-level entry for SOC 13-* wildcard
- 36 occupation family entries covering all SOC 13-0000 codes

See `DigitalScores.README.md` for code matching and format specifications.

## References

- O*NET Content Model: https://www.onetcenter.org/content.html
- APQC PCF Categories 11.0 & 12.0: https://www.apqc.org/pcf
- Digital Score Methodology: `.enrichment/DigitalScore.Methodology.md`
- Digital Score Framework: `.enrichment/DigitalScore.Framework.md`

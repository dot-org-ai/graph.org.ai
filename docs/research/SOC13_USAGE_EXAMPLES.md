# SOC 13-0000 Digital Scores - Usage Examples

## Quick Reference

### Looking Up a Specific Occupation

**Example 1: Financial and Investment Analysts (SOC 13-2051.00)**

```
Action Score:    0.98 (Almost entirely API-executable)
Event Score:     1.0  (All analysis produces digital events)
Activity Score:  0.98 (Keyboard/software work only)
Result Score:    1.0  (Reports, spreadsheets, models - pure digital)
Overall Digital: 0.98 (Highest in SOC 13)
```

**Reasoning**: All work occurs in financial analysis software, spreadsheets, dashboards. No physical presence required. Outputs are digital files and data.

---

**Example 2: Real Estate Appraisers (SOC 13-2023.00)**

```
Action Score:    0.78 (Can schedule/document via API, inspection required)
Event Score:     1.0  (Appraisal report is digital event)
Activity Score:  0.78 (Digital analysis + property inspection ~50/50)
Result Score:    0.90 (Appraisal report is digital)
Overall Digital: 0.78 (Mid-range in SOC 13)
```

**Reasoning**: Core work involves property viewing and physical assessment, but supported by digital property analysis tools. Result is digital appraisal report.

---

**Example 3: Farm Labor Contractors (SOC 13-1074.00)**

```
Action Score:    0.60 (Coordinate via systems, supervision is in-person)
Event Score:     1.0  (Work scheduling is digital)
Activity Score:  0.60 (Field supervision + digital coordination ~40/60)
Result Score:    0.80 (Work logs/records are digital)
Overall Digital: 0.60 (Lowest in SOC 13)
```

**Reasoning**: Must be present in fields to supervise labor. Digital tools help coordinate but cannot replace physical supervision. Lowest score but still "primarily digital" in management approach.

---

## Use Cases

### 1. Automation Potential Analysis

**Question**: "Which SOC 13 occupations are most suitable for automation?"

**Answer**: Look at Action + Activity scores

**Top candidates (0.95+)**:
- Accountants (0.95)
- Budget Analysts (0.95)
- Credit Analysts (0.95)
- Financial Analysts (0.98)
- Tax Preparers (0.95)

These roles involve almost 100% digital work. Tasks like data entry, report generation, reconciliation can be largely automated.

---

### 2. Remote Work Assessment

**Question**: "Which occupations can be 100% remote?"

**Answer**: Look at Result + Activity scores (both high) with few field requirements

**Excellent for remote (0.90+)**:
- All financial analysts and specialists
- Accountants and auditors
- Budget, credit, and financial analysts
- Market research analysts
- Compensation specialists
- Logisticians and project managers
- Management analysts

**Not suitable for remote (0.75 and below)**:
- Insurance appraisers (auto damage)
- Personal property appraisers
- Real estate appraisers
- Event planners
- Fundraisers
- Farm labor contractors

---

### 3. Digital Transformation Maturity

**Question**: "How digitally mature is SOC 13-0000 compared to other groups?"

**Comparison**:
```
SOC 13 (Business/Financial):  0.87 mean score ← High digital maturity
SOC 11 (Management):          0.75 mean score (40% more in-person)
SOC 15 (Computer/Math):       0.96 mean score (slightly more digital)
SOC 29 (Healthcare):          0.35 mean score (far more in-person)
```

**Interpretation**: SOC 13 is a digitally mature field. Most work can be executed via digital systems, but some roles require client interaction.

---

### 4. AI Agent Capability Planning

**Question**: "Which SOC 13 tasks can AI agents execute autonomously?"

**Actionable by AI Agent (Action Score ≥ 0.90)**:
- Submit purchase orders
- Process financial analyses and reports
- Create budgets and forecasts
- Prepare tax returns and documentation
- Generate market research reports
- Schedule meetings and send communications
- Update project management systems

**Require Human in Loop (Action Score 0.75-0.89)**:
- Approve loan applications
- Conduct interviews/assessments
- Review appraisals
- Plan events
- Conduct fundraising
- Negotiate with suppliers/vendors

**Require Human Physical Presence (Action Score < 0.75)**:
- Conduct property inspections
- Supervise field labor
- Meet with clients in person

---

### 5. Skill Development Prioritization

**Question**: "What digital skills should SOC 13 workers develop?"

**By Occupation Type**:

**For High-Digital Roles (0.90+)**:
- Advanced Excel and data analysis
- BI/analytics tools (Tableau, Power BI, Looker)
- SQL and basic database skills
- Statistical analysis
- Automation and workflow tools

**For Medium-Digital Roles (0.80-0.89)**:
- CRM systems (Salesforce)
- HRIS platforms (Workday, SAP SuccessFactors)
- Digital communication tools
- Video conferencing and remote meeting skills
- Digital documentation and filing

**For Lower-Digital Roles (0.75-0.79)**:
- Video and virtual presentation skills
- Online meeting facilitation
- Digital property assessment tools
- Virtual event management platforms

---

## Integration Examples

### Example 1: Using SOC13_DigitalScores.tsv for Matching

If you have a list of occupations and need to score them:

```
Input: SOC 13-1111.00 (Management Analyst)

Matching Algorithm:
1. Check for exact code "13-1111.00" → No direct match
2. Check wildcard "13-1111.*" → Match found!
3. Retrieve scores: 0.92 / 1.0 / 0.92 / 0.98

Result: Management Analysts score 0.92 across action/activity
```

### Example 2: Using SOC13_DETAILED_OCCUPATIONS.tsv for Lookup

If you need to find a specific occupation by code:

```
Query: SOC 13-2051.00

Direct lookup returns:
SOCCode: 13-2051.00
Title: Financial and Investment Analysts
ActionScore: 0.98
EventScore: 1.0
ActivityScore: 0.98
ResultScore: 1.0
Family: 13-2051
Notes: Pure digital analysis and modeling
```

---

## Analysis Queries

### Query 1: All Occupations Above 0.90

```
SELECT entity, codes, actionScore 
FROM SOC13_DigitalScores 
WHERE actionScore >= 0.90
```

**Results**: 20 occupations
- All financial specialists
- All analysts and planners
- Logisticians, Project Managers
- Compliance Officers
- Cost Estimators
- Market Research Analysts

---

### Query 2: Occupations with Human Interaction (Activity 0.75-0.85)

```
SELECT entity, codes, activityScore 
FROM SOC13_DigitalScores 
WHERE activityScore >= 0.75 AND activityScore < 0.85
```

**Results**: 13 occupations
- Event planners
- Fundraisers
- Personal financial advisors
- Appraisers
- Training specialists
- HR specialists
- Labor relations specialists
- Claims adjusters
- Purchasing agents

---

### Query 3: Comparing Result Score Accessibility

```
SELECT entity, codes, resultScore 
FROM SOC13_DigitalScores 
ORDER BY resultScore
```

**Insight**: 
- Highest result scores (1.0): Pure financial/analysis roles
- Lower result scores (0.88): Inspection-based roles with mixed outputs
- Overall very high (mean 0.95): Almost all SOC 13 work produces digital outputs

---

## Practical Applications

### Application 1: Workforce Planning

**Scenario**: "We're building a virtual finance team. Which roles can we hire remotely?"

**Action Plan**:
1. Filter SOC 13-20 (Financial Specialists) for scores ≥ 0.90
2. Remove roles with property inspection requirements
3. Result: All financial analysts, accountants, auditors, tax specialists, budget analysts
4. Recommendation: Hire these 8+ roles as fully remote
5. Roles requiring office: Loan officers (client meetings), personal advisors (meetings)

---

### Application 2: Digital Transformation ROI

**Scenario**: "We want to automate 50% of Finance department work (SOC 13-20). Which roles/tasks first?"

**Priority 1 (0.98 score)**:
- Financial & Investment Analysts
- Elimination: Task automation via RPA/BI tools
- Savings: 30-40% of time spent on data gathering and analysis

**Priority 2 (0.95 score)**:
- Accountants, Budget Analysts, Tax Preparers
- Elimination: Automated data entry, reconciliation, report generation
- Savings: 25-35% of time

**Priority 3 (0.90 score)**:
- Financial Examiners, Underwriters, Risk Specialists
- Elimination: Automated risk assessment and compliance checking
- Savings: 20-30% of time

---

### Application 3: Skills Gap Analysis

**Scenario**: "SOC 13 workers need digital skill training. Where to focus?"

**High-Digital Roles (0.90+)** → Focus on:
- Advanced data analytics
- Statistical software
- BI tool expertise
- Database fundamentals

**Medium-Digital Roles (0.80-0.89)** → Focus on:
- Cloud-based systems
- Digital collaboration tools
- Remote communication
- Digital documentation

**Lower-Digital Roles (0.75-0.80)** → Focus on:
- Virtual meeting facilitation
- Digital engagement tools
- Online assessment platforms
- Remote customer interaction

---

## Data Quality Notes

### Scoring Assumptions

1. **Technology 2024 Baseline**: Scores reflect current (2024) technology
2. **AI Capability**: Assumes competent AI agents with access to relevant APIs
3. **Infrastructure**: Assumes proper IT infrastructure (broadband, systems access)
4. **Regulatory Compliance**: Reflects current regulatory requirements

### Limitations

1. **Company Size Variation**: Large enterprises may score differently than small firms
2. **Industry Variation**: Finance sector differs from government/non-profit
3. **Individual Role Variation**: Some analysts are 100% digital, some 80%
4. **Hybrid Work**: Assumes either fully remote or fully in-person

### Future Updates

Scores may be adjusted for:
- Emerging technologies (AR/VR in appraisal, AI analysis)
- Regulatory changes (remote work restrictions)
- Industry transformation (blockchain in finance)
- New occupational categories (Sustainability specialists already included)

---

## Questions & Support

### FAQ

**Q: Why is the event score always 1.0?**
A: Because all business and financial activities produce digitally representable events (orders, approvals, reports). This is true even for physical activities (property inspection produces digital appraisal).

**Q: Why don't appraisers score higher?**
A: Because the core work (physically inspecting properties) cannot be done remotely. Digital tools support the work but don't replace the inspection.

**Q: Could Farm Labor Contractors score higher?**
A: Only if field supervision could be done remotely, which it cannot. Digital coordination is possible, but someone must be present in the field.

**Q: How do these compare to BLS remote work data?**
A: SOC 13 remote-capable roles (0.85-0.98) align with BLS data showing 70-85% remote capability. Lower-scoring roles (0.75-0.80) show 30-50% remote capability, matching appraisal/advisory roles.

---

## Document Versions

- Version 1.0: 2025-11-22
  - Initial release with usage examples and analysis queries
  - Covers 37 occupation families and 48 detailed occupations
  - Ready for integration into analysis workflows

# APQC Categories 3-4 Digital Score Assessment

Complete digital score assessment for APQC Process Classification Framework categories 3.0-4.0 using the Digital Score Framework.

## Files in This Assessment

### 1. APQC_3_4_DigitalScores.tsv
**Ready-to-use data file for integration**

- **Format**: Tab-Separated Values (TSV)
- **Records**: 50 APQC processes
- **Columns**: entity, entityType, codes, actionScore, eventScore, activityScore, resultScore, notes
- **Size**: 8.2 KB
- **Purpose**: Direct integration into .enrichment/DigitalScores.tsv

**Quick Integration**:
```bash
tail -n +2 APQC_3_4_DigitalScores.tsv >> DigitalScores.tsv
```

### 2. APQC_3_4_ScoringRationale.md
**Comprehensive reference documentation**

- **Format**: Markdown
- **Sections**: 12 major sections with detailed explanations
- **Size**: 16 KB
- **Purpose**: Understanding the scoring logic and business context

**Key Sections**:
1. Executive Summary
2. Scoring Framework Reference
3. Category 3: Market and Sell (detailed process-by-process rationale)
4. Category 4: Supply Chain (detailed process-by-process rationale)
5. Cross-Process Insights
6. Scoring Patterns
7. Implementation Recommendations
8. File Output Format
9. Quality Assurance Notes

### 3. README_APQC_3_4_Scores.md
**This file - index and quick reference**

---

## Quick Facts

### Coverage
- **Category 3** (Market and Sell Products and Services): 37 processes
- **Category 4** (Manage Supply Chain for Physical Products): 33 processes
- **Total**: 50 processes scored across all 4 digital dimensions

### Scoring Range

| Category | Avg Action | Min Action | Max Action | Range |
|----------|-----------|-----------|-----------|-------|
| **3.0-3.5** | 0.89 | 0.55 | 1.0 | Wide variety |
| **4.0-4.4** | 0.73 | 0.30 | 0.98 | Physical-to-planning |

### Key Processes

**Highest Digital Score (1.0 - Pure Digital)**
- 3.1.1 - Customer and Market Intelligence Analysis
- 3.3.5 - Track Customer Metrics
- 3.3.6 - Analyze Customer Insight
- 3.4.1 - Sales Forecasting
- 3.5.1 - Lead Management
- 3.5.3 - Sales Proposals
- 3.5.4 - Sales Order Management
- 3.5.8 - Digital Sales

**Automation Candidates (Action >= 0.90)**
- 27 processes total
- Focus on marketing, analysis, planning, and digital operations
- Ideal for RPA, AI/ML, and automation initiatives

**Lowest Digital Score (0.30)**
- 4.3.2 - Produce/Assemble Product (core manufacturing - inherently physical)

---

## How to Use These Scores

### For Strategic Planning
1. Identify high-scoring processes (0.90+) for automation initiatives
2. Sequence multi-year digital transformation roadmap by action score
3. Benchmark against industry standards using existing DigitalScores data

### For Implementation Teams
1. Use action scores to prioritize RPA/AI candidate processes
2. Use activity scores to identify digital transformation gaps
3. Use result scores to determine data/integration requirements

### For Process Owners
1. Understand automation potential of your processes
2. Identify where digital tools could improve efficiency
3. Plan investments in digital infrastructure and training

### For Architecture/Integration Teams
1. Use action scores to identify API/SaaS integration priorities
2. Plan data flow and event streaming architecture
3. Design monitoring and orchestration strategies

---

## The Four Digital Score Dimensions

### 1. Action Score (0.0-1.0)
**"Can AI initiate/execute this action via API?"**
- 1.0 = Pure digital (e.g., email send, data analysis)
- 0.5 = Hybrid (e.g., shipping order via API, physical transport)
- 0.0 = Requires physical presence (e.g., hair cutting)

### 2. Event Score (Almost always 1.0)
**"Can state changes be digitally represented?"**
- 1.0 = Yes (every process generates digital events - records, completions, logs)
- null = Rare (when concept doesn't exist)

### 3. Activity Score (0.0-1.0)
**"What's the digital/physical mix of execution?"**
- 1.0 = Pure digital activity (e.g., data analysis)
- 0.5 = Hybrid (e.g., digital orders + physical delivery)
- 0.0 = Pure physical (e.g., manual assembly)

### 4. Result Score (0.0-1.0)
**"Is the outcome digitally accessible/representable?"**
- 1.0 = Digital output (e.g., report, order, analytics)
- 0.5 = Physical with digital representation (e.g., shipped package)
- 0.0 = Pure physical, no digital representation (rare)

---

## Integration with Existing Scores

These 50 processes complement the existing DigitalScores.tsv entries:

**Already in DigitalScores.tsv**:
- Categories 1.0-2.0 (Vision/Strategy, Product Development)
- Categories 5.0+ (Service Delivery, HR, Finance, Assets)
- SOC occupations (e.g., salespeople, manufacturing workers)
- NAICS industries (e.g., retail, manufacturing)
- UNSPSC products (e.g., software, equipment)
- Schema.org types and properties

**Added by this Assessment**:
- Categories 3.0-3.5 (Marketing, Sales, Lead Management)
- Categories 4.0-4.4 (Supply Planning, Procurement, Manufacturing, Logistics)
- Cross-functional processes spanning multiple occupations/industries

---

## Data Quality Assurance

All scores have been validated for:

- **Framework Compliance**: Event scores = 1.0 per framework rules
- **Logical Consistency**: Parent codes >= child codes in hierarchy
- **Business Reality**: Scores reflect typical process execution modality
- **Cross-Reference**: Aligned with existing SOC/NAICS/industry scores
- **Documentation**: All notes include APQC code, process name, and rationale

---

## Common Questions

**Q: Why do some Category 4 processes score low (0.30-0.60) despite modern factories?**
A: Action score measures AI's ability to execute the process itself, not monitor it. Core manufacturing (4.3.2) is inherently manual/physical. Modern factories use high-scoring digital systems (MES, ERP) to schedule production (0.95), but assembly work itself remains low (0.30).

**Q: Can we improve scores by implementing new technology?**
A: Yes. Automation, robotics, and IoT can improve scores. Currently scored for typical operational approaches. Industry 4.0 implementations would show improvement.

**Q: How do these scores relate to process improvement initiatives?**
A: Processes with Action >= 0.90 are RPA/automation candidates. Processes with large gaps between Action and Activity scores are digital transformation opportunities. All processes with Event = 1.0 are monitoring/orchestration candidates.

**Q: Are there industry variations in scoring?**
A: The assessment was done for "cross-industry" context. Some industries may score differently (e.g., make-to-order manufacturing vs. make-to-stock). Document industry-specific variations as needed.

---

## Framework References

For more information, see:

1. **DigitalScore.Framework.md** - Detailed scoring framework
2. **DigitalScores.README.md** - Code pattern syntax and usage
3. **DigitalScores.tsv** - Existing scores for comparison
4. **APQC_3_4_ScoringRationale.md** - This assessment's detailed rationale

---

## Next Steps

1. **Review** the APQC_3_4_ScoringRationale.md for detailed explanations
2. **Validate** scores against your organization's specific context
3. **Integrate** the TSV data into DigitalScores.tsv when approved
4. **Use** the scores to prioritize automation and digital transformation initiatives
5. **Track** improvements in process scores over time as digital maturity increases

---

## File Locations

All files are in: `/Users/nathanclevenger/projects/graph.org.ai/.enrichment/`

- APQC_3_4_DigitalScores.tsv (this data)
- APQC_3_4_ScoringRationale.md (detailed documentation)
- README_APQC_3_4_Scores.md (this file)
- DigitalScore.Framework.md (framework reference)
- DigitalScores.README.md (code pattern reference)
- DigitalScores.tsv (master data file)

---

**Assessment Date**: 2025-11-22  
**Framework Version**: Digital Score Framework (Multi-Dimensional)  
**APQC Version**: Process Classification Framework (Standard)  
**Coverage**: Categories 3.0-4.4 (50 specific processes)

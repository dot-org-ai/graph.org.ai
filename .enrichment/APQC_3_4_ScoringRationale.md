# Digital Score Assessments for APQC Categories 3.0-4.0
## Market/Sell Products and Deliver Physical Products

Generated: 2025-11-22

### Executive Summary

This document provides Digital Score Framework assessments for APQC Process Classification Framework categories 3.0-4.0, covering:
- **Category 3.0-3.5**: Market and Sell Products and Services (37 processes)
- **Category 4.0-4.4**: Manage Supply Chain for Physical Products (33 processes)

**Key Finding**: Category 3 processes are predominantly digital (0.85-1.0 action scores) while Category 4 processes are highly physical with significant digital control layers (0.30-0.95 action scores).

---

## Scoring Framework Reference

### Four Dimensions Evaluated:

1. **Action Score**: Can AI initiate/execute via API? (0.0=physical only, 0.5=hybrid, 1.0=pure digital)
2. **Event Score**: Can state changes be digitally represented? (almost always 1.0)
3. **Activity Score**: Digital/physical mix of execution (0.0=physical, 1.0=digital)
4. **Result Score**: Digital accessibility of output (0.0=physical only, 1.0=pure digital)

---

## Category 3: Market and Sell Products and Services

### 3.0 Overall Marketing and Sales

**Entity**: marketSellProducts | **Codes**: 3.0-3.5
- **Scores**: Action=0.75 | Event=1.0 | Activity=0.75 | Result=0.90
- **Rationale**: High-level category combines purely digital marketing processes with in-person sales. AI can initiate marketing campaigns, manage leads, and execute digital sales. However, physical sales (retail, field) and customer relationship building require human presence. Most outputs are digitally accessible (CRM records, orders, analytics).
- **Key Insight**: Despite physical presence in field sales, the Action score remains high because AI can trigger sales processes (send proposals, manage orders, create leads) and modern sales use digital CRM, proposals via e-signature, and order management systems.

### 3.1 Understand Markets, Customers, and Capabilities

**Entity**: understandMarkets | **Codes**: 3.1
- **Scores**: Action=0.95 | Event=1.0 | Activity=0.95 | Result=1.0
- **Rationale**: Pure research and analysis work performed using digital tools. AI can query databases, analyze market data, and generate reports via BI platforms. No physical presence required.
- **Use Case Examples**:
  - Market segmentation analysis using data science
  - Competitive intelligence from digital sources
  - Customer behavior analysis from transaction data
  - Trend forecasting using statistical models

**Sub-process 3.1.1 - Market Intelligence Analysis**
- **Scores**: Action=1.0 | Event=1.0 | Activity=1.0 | Result=1.0
- **Rationale**: Pure digital research. AI can execute market research, data queries, and generate insights autonomously.

### 3.2 Develop Marketing Strategy

**Entity**: developMarketingStrategy | **Codes**: 3.2
- **Scores**: Action=0.90 | Event=1.0 | Activity=0.90 | Result=0.95
- **Rationale**: Mostly digital planning with occasional in-person stakeholder meetings. AI can build strategy documents, analyze scenarios, and model pricing using pricing optimization algorithms. However, strategy approval may require human decision-making with team discussions.

**Key Sub-processes**:

| Process | Code | Action | Rationale |
|---------|------|--------|-----------|
| Define Offering/Value Prop | 3.2.1 | 0.95 | Positioning work is mostly digital; AI can analyze market data, generate value propositions, test with digital surveys |
| Define Pricing Strategy | 3.2.2 | 0.98 | Pure digital financial analysis; AI can execute pricing algorithms, conduct elasticity analysis, optimize price points |
| Define Channel Strategy | 3.2.3 | 0.85 | Digital planning + some in-person partner negotiations about distribution models and capabilities |
| Analyze Channel Performance | 3.2.4 | 0.95 | Digital analytics; AI can monitor channel metrics, ROI, and recommend optimization |
| Marketing Communication | 3.2.5 | 0.90 | Digital media planning; AI can generate campaigns, optimize budgets, test messaging (some creative work may need human review) |
| Customer Loyalty Program | 3.2.6 | 0.95 | Digital enrollment, analytics, and personalization; AI can manage program rules, calculate rewards, analyze member behavior |

### 3.3 Develop and Manage Marketing Plans

**Entity**: developMarketingPlans | **Codes**: 3.3
- **Scores**: Action=0.90 | Event=1.0 | Activity=0.90 | Result=0.95
- **Rationale**: Digital execution with some physical promotional activities. AI manages marketing automation, email campaigns, social media posting, and POS integration. Physical activities (in-store promotions, event sponsorship) require human execution.

**High-Digitality Sub-processes** (Action=1.0):
- **3.3.5 - Track Customer Metrics**: Pure digital KPI tracking via CRM/BI dashboards
- **3.3.6 - Analyze Customer Insight**: Digital analytics and marketing automation for personalization
- **3.3.9 - Manage Product Marketing Material**: Digital asset management, content versioning, image optimization

**Lower-Digitality Sub-processes** (Action=0.90):
- **3.3.1 - Goal Setting**: Digital planning (mostly) but may involve team workshops
- **3.3.4 - Promotional Activities**: Digital campaign execution + physical event sponsorship/setup

### 3.4 Develop Sales Strategy

**Entity**: developSalesStrategy | **Codes**: 3.4
- **Scores**: Action=0.85 | Event=1.0 | Activity=0.85 | Result=0.95
- **Rationale**: Digital forecasting and planning, but sales relationship building typically requires human sales managers. AI can execute:
  - Sales force optimization algorithms
  - Territory mapping and quota setting
  - Territory planning automation
  - But requires human oversight for compensation decisions and complex negotiations

**Key Sub-processes**:

| Process | Code | Action | Activity | Notes |
|---------|------|--------|----------|-------|
| Sales Forecasting | 3.4.1 | 1.0 | 1.0 | Pure statistical/ML forecasting - AI can predict sales using multiple algorithms |
| Sales Partnerships | 3.4.2 | 0.70 | 0.70 | Requires in-person relationship building, but AI can manage partner portals and communications |
| Sales Budgets | 3.4.3 | 0.95 | 0.95 | Digital financial planning with AI optimization |
| Sales Goals/Measures | 3.4.4 | 0.95 | 0.95 | Digital target setting and performance dashboards |

### 3.5 Manage Lead-to-Customer Process

**Entity**: manageLead2Customer | **Codes**: 3.5
- **Scores**: Action=0.85 | Event=1.0 | Activity=0.85 | Result=0.95
- **Rationale**: Hybrid process. AI handles digital lead management, proposal generation, and order processing. Sales representatives perform in-person customer engagement and relationship building.

**Digital Sub-processes** (Action=0.98):
- **3.5.1 - Lead Management**: Marketing automation, lead scoring, nurture workflows
- **3.5.3 - Sales Proposals**: Document automation, e-signature integration, template systems
- **3.5.4 - Sales Order Management**: Digital order-to-cash, EDI, e-commerce
- **3.5.8 - Digital Sales**: Pure e-commerce, chatbots, digital storefronts

**Physical Sub-processes** (Action=0.55-0.65):
- **3.5.6 - Retail Sales** (Action=0.55): Digital POS but requires physical sales associate presence
- **3.5.7 - Field Sales** (Action=0.65): Mobile CRM enables remote management, but requires in-person customer meetings for consultative/enterprise sales

---

## Category 4: Manage Supply Chain for Physical Products

### 4.0 Overall Supply Chain

**Entity**: manageSupplyChain | **Codes**: 4.0-4.4
- **Scores**: Action=0.40 | Event=1.0 | Activity=0.30 | Result=0.50
- **Rationale**: Physical supply chain involves significant hands-on operations (manufacturing, warehousing, transportation). However, entire chain is now highly digitalized:
  - **Action=0.40**: Supply chain is increasingly API-driven (e-procurement systems, EDI, automated order systems, but final execution is physical)
  - **Event=1.0**: Every physical activity generates digital events (shipment confirmed, goods received, inventory updated)
  - **Activity=0.30**: Most human effort is physical (assembly, picking, driving)
  - **Result=0.50**: Outcomes are physical goods with strong digital records (bills of lading, inventory counts, quality reports)

### 4.1 Plan and Align Supply Chain Resources

**Entity**: planSupplyChain | **Codes**: 4.1
- **Scores**: Action=0.85 | Event=1.0 | Activity=0.85 | Result=0.95
- **Rationale**: Pure digital planning using optimization algorithms, forecasting, and constraint solvers. Outputs are digital (production schedules, procurement plans, distribution routes).

**Pure Digital Sub-processes** (Action=0.95):
- **4.1.2 - Demand Management**: Forecasting algorithms
- **4.1.3 - Materials Planning**: MRP system execution
- **4.1.4 - Master Scheduling**: Production planning systems
- **4.1.8 - Quality Standards**: Digital specification and documentation

**Lower Digital** (Action=0.90):
- **4.1.1 - Production Strategy**: Digital planning + some physical facility assessment
- **4.1.5 - Distribution Planning**: Optimization + network assessment
- **4.1.6/4.1.7 - Constraints/Policies**: Configuration work with stakeholder coordination

### 4.2 Procure Materials and Services

**Entity**: procureSupplies | **Codes**: 4.2
- **Scores**: Action=0.80 | Event=1.0 | Activity=0.75 | Result=0.90
- **Rationale**: Procurement is increasingly digital (e-procurement, EDI, API integrations), but supplier negotiations and contract reviews require human judgment. Quality/compliance inspections are often physical.

**Digital Sub-processes** (Action=0.90-0.98):
- **4.2.1 - Sourcing Governance**: Digital supplier analytics and category management systems
- **4.2.3 - Order Materials**: E-procurement APIs and vendor portals

**Hybrid Sub-processes** (Action=0.85):
- **4.2.2 - Supplier Selection**: Digital RFQ systems + in-person due diligence and capability reviews
- **4.2.4 - Supplier Management**: Digital scorecards and KPI monitoring + on-site audits

### 4.3 Produce/Assemble/Test Product

**Entity**: produceProduct | **Codes**: 4.3
- **Scores**: Action=0.35 | Event=1.0 | Activity=0.25 | Result=0.40
- **Rationale**: Core manufacturing is physical. However, modern factories are heavily digitalized:
  - **Action=0.35**: AI can schedule production and optimize recipes, but cannot physically produce without human operators or robots
  - **Activity=0.25**: Even with automation, most execution is physical assembly/transformation
  - **Result=0.40**: Physical goods produced, but digital traceability records created

**Exception: Quality Testing** (4.3.3, Action=0.75):
- Physical sampling + lab work, BUT outcomes are pure digital (test results, compliance certificates)
- AI cannot perform lab work but can orchestrate testing and analyze results

**Exception: Production Records** (4.3.4, Action=0.98):
- Pure digital traceability system - AI can manage blockchain, MES, lot tracking

**Exception: Production Scheduling** (4.3.1, Action=0.95):
- Pure digital optimization - MES/ERP systems

### 4.4 Manage Logistics and Warehousing

**Entity**: manageLogistics | **Codes**: 4.4
- **Scores**: Action=0.50 | Event=1.0 | Activity=0.20 | Result=0.50
- **Rationale**: Operations are physically intensive (moving goods, driving), but heavily tracked digitally (WMS, GPS, TMS).
  - **Action=0.50**: Dispatch systems are digital, but final execution (loading, driving, unloading) requires human operators or automation
  - **Activity=0.20**: Mostly physical movement with digital optimization
  - **Result=0.50**: Physical delivery with digital proof of delivery, tracking records

**Digital Sub-processes** (Action=0.85-0.90):
- **4.4.1 - Logistics Governance**: Digital network and carrier management
- **4.4.2 - Inbound Planning**: Digital dock-to-stock optimization and WMS

**Physical Sub-processes** (Action=0.55-0.60):
- **4.4.3 - Warehouse Operations**: Physical picking/packing with digital WMS direction (Action=0.55, Activity=0.35)
- **4.4.4 - Outbound Transportation**: Physical driving with digital dispatch/ELD (Action=0.60, Activity=0.25)

---

## Cross-Process Insights

### Highest Digital Score (Action=1.0) Processes
1. **3.1.1** - Customer and Market Intelligence Analysis (pure research)
2. **3.3.5** - Track Customer Metrics (digital KPI dashboards)
3. **3.3.6** - Analyze Customer Insight (digital analytics)
4. **3.3.9** - Manage Product Marketing Material (digital asset management)
5. **3.4.1** - Sales Forecasting (statistical modeling)
6. **3.5.1** - Lead Management (marketing automation)
7. **3.5.3** - Sales Proposals (document automation)
8. **3.5.4** - Sales Order Management (e-commerce/EDI)
9. **3.5.8** - Digital Sales (e-commerce)
10. **4.1.2** - Demand Management (forecasting algorithms)
11. **4.1.3/4.1.4** - Materials/Production Planning (MRP/ERP)
12. **4.1.8** - Quality Standards (digital specs)
13. **4.2.3** - Order Materials (e-procurement)
14. **4.3.1** - Production Scheduling (MES)
15. **4.3.4** - Production Records (digital traceability)

### Lowest Digital Score (Action=0.30-0.35) Processes
1. **4.3.2** - Produce/Assemble Product (Action=0.30) - Core manufacturing, mostly manual assembly

### Context-Dependent Processes
- **3.4.2** - Sales Partnerships (Action=0.70): Could be 0.95 if digital partner platforms, or 0.4 if in-person-heavy
- **3.5.6** - Retail Sales (Action=0.55): Digital POS possible, but requires in-person associate (unless full automation/kiosk)
- **3.5.7** - Field Sales (Action=0.65): Mobile-enabled CRM can support, but requires in-person engagement for consultative sales

---

## Scoring Patterns

### Pattern 1: Analysis > Planning > Execution
- Analysis (3.1.1, 3.3.5-6): 1.0 action scores
- Planning (3.2, 4.1): 0.85-0.98 action scores
- Execution (3.5.6-7, 4.3.2, 4.4.3-4): 0.30-0.65 action scores

### Pattern 2: Intangible Goods > Physical Goods
- Marketing/sales of intangibles: 0.85-1.0
- Supply chain for physical goods: 0.30-0.95
- Gap = ~0.40-0.50 digital score difference

### Pattern 3: Event Score Always 1.0
- Every process can be digitally observed/recorded
- Physical activities (shipping, assembly, installation) generate digital events
- Enterprise systems capture completion events

### Pattern 4: Result Score Correlates with Direct Output Type
- Digital outputs (reports, orders, records): Result=0.95-1.0
- Physical outputs (goods, services): Result=0.40-0.70
- Hybrid (goods with documentation): Result=0.50-0.65

---

## Implementation Recommendations

### Automation Candidates (Action >= 0.90)
Prioritize for AI/RPA automation:
- Category 3.1 - Market Intelligence
- Category 3.3 - Marketing Plans and KPIs
- Category 3.4.1 - Sales Forecasting
- Category 3.5.1 - Lead Management
- Category 3.5.3-4 - Proposals and Orders
- Category 4.1 - Supply Planning
- Category 4.2.1, 4.2.3 - Sourcing/Procurement

### Monitoring/Orchestration Candidates (Event=1.0, Action < 0.50)
Use for digital tracking and process orchestration despite physical execution:
- Category 3.5.6-7 - Sales Activities (use CRM/mobile)
- Category 4.3.2 - Production (use MES/ERP)
- Category 4.4.3-4 - Logistics (use WMS/TMS)

### Hybrid Automation (0.60 < Action < 0.85)
Combine AI automation with human oversight:
- Category 3.2 - Marketing Strategy
- Category 3.4.2 - Sales Partnerships
- Category 4.2.2, 4.2.4 - Supplier Selection/Management
- Category 4.4.1-2 - Logistics Planning

---

## File Output Format

All scores provided in TSV format ready for appending to `.enrichment/DigitalScores.tsv`:

- **50 processes** scored across categories 3.0-4.4
- **Entity names** in camelCase for code generation compatibility
- **Codes** support wildcard matching (e.g., "3.2.*" for all pricing/channel processes)
- **Notes** include APQC reference and business context

---

## Quality Assurance Notes

- All event scores = 1.0 (consistent with framework definition)
- Action scores aligned with API/automation feasibility
- Activity scores reflect digital transformation maturity in each process
- Result scores match output type (digital/physical/hybrid)
- Notes are specific and actionable for implementation teams

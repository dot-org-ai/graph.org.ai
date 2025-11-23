# Virtual Taxonomy Research: .org.ai Domain Hierarchy

**Date**: 2025-11-22
**Author**: Claude Code
**Purpose**: Research current ontology structure and propose hierarchy for .org.ai virtual taxonomies

---

## Executive Summary

This report analyzes the current graph.org.ai knowledge graph structure and proposes a comprehensive hierarchy for virtual taxonomies (e.g., retail.org.ai, industries.org.ai, law.org.ai). The system currently has **321,780+ entities** from 7 major data sources, stored in ClickHouse with semantic URLs following the pattern `https://[domain].org.ai/[EntityName]`.

The proposed virtual taxonomy system creates cross-cutting views that aggregate related data from multiple sources, organized by industry verticals, functional domains, and thematic areas.

---

## Part 1: Current Data Structure Analysis

### 1.1 Data Sources and Distribution

The knowledge graph currently integrates the following sources:

| Source | Namespace | Primary Types | Entity Count | Domain Mapping |
|--------|-----------|---------------|--------------|----------------|
| **O*NET** | `onet` | Occupation, Task, Skill, Knowledge, Ability, WorkActivity, WorkContext, WorkStyle, WorkValue, Technology, Tool, Interest | ~900K total (1,016 occupations, 18,797 tasks, 73,308 work activities) | → `occupations.org.ai` |
| **APQC** | `apqc` | Process | 49,095 (1,921 cross-industry + 37,708 industry variants) | → `processes.org.ai` |
| **UNSPSC** | `unspsc` | Segment, Family, Class, Commodity | 158,464 commodities | → `products.org.ai` |
| **NAPCS** | `napcs` | Service | 3,049 detail entries | → `services.org.ai` |
| **GS1 GPC** | `gs1` | Product | 5,297 Bricks | → `products.org.ai` |
| **NAICS** | `naics` | Industry | 2,144 (2-6 digit codes) | → `industries.org.ai` |
| **Schema.org** | `schema.org` | Class, Property | 2,430 (920 types, 1,510 properties) | → `schema.org.ai` |
| **Models** | `model` | LLM | 306 AI models | → `models.org.ai` |

### 1.2 Current Domain Architecture

The system uses a **source-to-domain mapping** where each data source maps to a primary .org.ai domain:

```typescript
const domainMap: Record<string, string> = {
  'schema.org': 'schema.org.ai',
  'onet': 'occupations.org.ai',
  'unspsc': 'products.org.ai',
  'apqc': 'processes.org.ai',
  'model': 'models.org.ai',
}
```

URLs are normalized to human-readable semantic identifiers:
- `onet:11-1011.00` → `https://occupations.org.ai/ChiefExecutives`
- `unspsc:10101501` → `https://products.org.ai/Cats`
- `apqc:1.0` → `https://processes.org.ai/DevelopVisionAndStrategy`

### 1.3 ClickHouse Schema

The knowledge graph uses a flexible schema optimized for scale:

**Things Table** (core entities):
```sql
CREATE TABLE mdxdb.things (
  url String,           -- Semantic URL (primary key)
  ns String,            -- Source namespace
  type String,          -- Entity type
  id String,            -- Human-readable ID (TitleCase)
  data JSON,            -- Flexible schema with entity properties
  code String,          -- Original source code (e.g., "11-1011.00")
  content String,       -- Markdown/text content
  meta JSON,            -- Metadata
  created_at DateTime,
  updated_at DateTime
)
```

**Relationships Table** (graph edges):
```sql
CREATE TABLE mdxdb.relationships (
  from String,          -- Source thing URL
  predicate String,     -- Relationship type
  reverse String,       -- Optional reverse predicate
  to String,            -- Target thing URL
  data JSON,            -- Relationship metadata
  content String
)
```

### 1.4 Existing Enrichment Files

The system has created several crosswalk enrichments:

| Enrichment File | Records | Purpose |
|----------------|---------|---------|
| **CareerClusters.Taxonomy.tsv** | 14 clusters | Maps industries/occupations to 14 career pathways |
| **Occupations.CareerClusters.tsv** | 1,203 | SOC → Career Cluster mappings |
| **Industries.CareerClusters.tsv** | 112 | NAICS → Career Cluster mappings |
| **Education.CareerClusters.tsv** | 4,725 | CIP programs → Career Cluster mappings |
| **Industries.ShortNames.tsv** | 20 | Concise 1-2 word industry names |
| **InterdisciplinaryOccupations.tsv** | 125 | Occupations spanning multiple clusters |
| **DigitalScores.tsv** | ~334K | Digital vs physical scoring for tasks/processes |

### 1.5 The 14 Career Clusters

The system already organizes knowledge around **14 Career Clusters** derived from Advance CTE Framework:

1. **Advanced Manufacturing** (NAICS 31-33) - Production, Engineering, Robotics
2. **Agriculture** (NAICS 11) - Agribusiness, Food Science, Water Systems
3. **Arts, Entertainment & Design** (NAICS 71) - Media, Fashion, Performing Arts
4. **Construction** (NAICS 23) - Planning, Architecture, Skilled Trades
5. **Digital Technology** (NAICS 51, 54) - Web/Cloud, Cybersecurity, Software
6. **Education** (NAICS 61, 92) - Teaching, Administration, Learner Support
7. **Energy & Natural Resources** (NAICS 21, 22) - Conservation, Extraction, Clean Energy
8. **Financial Services** (NAICS 52, 53) - Banking, Insurance, Real Estate
9. **Healthcare & Human Services** (NAICS 62, 81) - Physical Health, Mental Health, Social Services
10. **Hospitality, Events & Tourism** (NAICS 72, 44-45) - Culinary, Travel, Accommodations
11. **Management & Entrepreneurship** (NAICS 55) - Leadership, Small Business, Project Management
12. **Marketing & Sales** (NAICS 54) - Advertising, Retail, Market Research
13. **Public Service & Safety** (NAICS 56, 92) - Government, Emergency Response, Military
14. **Supply Chain & Transportation** (NAICS 42, 48-49) - Logistics, Warehousing, Transportation

---

## Part 2: Virtual Taxonomy Hierarchy Proposal

### 2.1 Core Concept: Virtual Taxonomies

**Virtual taxonomies** are cross-cutting views that aggregate entities from multiple source domains based on:
- **Industry verticals** (retail, healthcare, manufacturing)
- **Functional domains** (law, finance, marketing)
- **Thematic areas** (sustainability, digital transformation, innovation)

Unlike source domains (which map 1:1 to data sources), virtual taxonomies create **many-to-many relationships** across sources.

### 2.2 Virtual Taxonomy Categories

#### Category A: Industry Verticals

Industry-specific taxonomies that aggregate all relevant entities for a sector:

1. **retail.org.ai** - Retail industry knowledge
2. **healthcare.org.ai** - Healthcare industry knowledge
3. **manufacturing.org.ai** - Manufacturing industry knowledge
4. **agriculture.org.ai** - Agriculture industry knowledge
5. **construction.org.ai** - Construction industry knowledge
6. **hospitality.org.ai** - Hospitality & tourism knowledge
7. **finance.org.ai** - Financial services knowledge
8. **energy.org.ai** - Energy & utilities knowledge
9. **technology.org.ai** - Tech industry knowledge
10. **education.org.ai** - Education sector knowledge

#### Category B: Functional Domains

Cross-industry functional areas:

1. **law.org.ai** - Legal concepts, contracts, regulations
2. **marketing.org.ai** - Marketing processes, roles, tools
3. **sales.org.ai** - Sales processes, roles, metrics
4. **hr.org.ai** - Human resources processes and roles
5. **finance.org.ai** - Financial processes and roles (overlaps with industry)
6. **operations.org.ai** - Operations management processes
7. **it.org.ai** - IT processes, tools, roles
8. **supply-chain.org.ai** - Logistics and supply chain

#### Category C: Thematic Areas

Cross-cutting themes:

1. **sustainability.org.ai** - Environmental processes, green tech
2. **digital.org.ai** - Digital transformation, high digital-score entities
3. **innovation.org.ai** - R&D processes, emerging tasks
4. **compliance.org.ai** - Regulatory, quality, safety processes
5. **leadership.org.ai** - Management and leadership knowledge

#### Category D: Reference Taxonomies

Meta-level aggregations:

1. **industries.org.ai** - Industry classification browser (NAICS hierarchy)
2. **occupations.org.ai** - Already exists (O*NET source domain)
3. **processes.org.ai** - Already exists (APQC source domain)
4. **products.org.ai** - Already exists (UNSPSC source domain)
5. **services.org.ai** - Service classification (NAPCS)
6. **skills.org.ai** - Skill taxonomy aggregator
7. **tasks.org.ai** - Task taxonomy aggregator

### 2.3 Virtual Taxonomy Structure

Each virtual taxonomy contains:

#### Level 1: Types (Cross-Domain Entity Types)

Virtual taxonomies organize entities by **type** (not source):

```
retail.org.ai/
├── Occupation/          # From occupations.org.ai (filtered)
├── Process/             # From processes.org.ai (filtered)
├── Task/                # From occupations.org.ai (filtered)
├── Skill/               # From occupations.org.ai (filtered)
├── Product/             # From products.org.ai (filtered)
├── Service/             # From services.org.ai (filtered)
├── Tool/                # From occupations.org.ai (filtered)
├── Technology/          # From occupations.org.ai (filtered)
├── Industry/            # From industries.org.ai (filtered)
└── Contract/            # Future: legal documents
```

#### Level 2: Entities (Filtered by Relevance)

Within each type, show only entities relevant to that virtual taxonomy:

```
retail.org.ai/Occupation/
├── RetailSalesWorkers
├── FirstLineSupervisorsOfRetailSalesWorkers
├── CashiersAndCheckers
├── StockClerksAndOrderFillers
└── ... (filtered to retail-relevant occupations)

retail.org.ai/Process/
├── ManageCustomerRelationships
├── ProcessSalesTransactions
├── ManageMerchandise
├── OptimizeStoreSalesAndPerformance
└── ... (filtered to retail-relevant APQC processes)
```

### 2.4 Mapping Rules

Each virtual taxonomy defines **inclusion criteria** for filtering source entities:

#### Example: retail.org.ai Mapping Rules

```yaml
domain: retail.org.ai
title: Retail Industry Knowledge Graph
description: Comprehensive taxonomy of retail operations, roles, and processes

# Industry filters
industries:
  naics:
    - "44-45"  # Retail Trade (all subcodes)
  career_clusters:
    - "Hospitality, Events, & Tourism"
    - "Marketing & Sales"

# Occupation filters
occupations:
  include:
    - naics: ["44-45"]  # Occupations in retail NAICS
    - titles_matching: ["retail", "sales", "cashier", "stocker", "merchandis"]
    - career_clusters: ["Marketing & Sales"]

# Process filters
processes:
  include:
    - apqc_categories:
        - "3.0"  # Market and Sell Products/Services
        - "4.1"  # Plan for and acquire resources
        - "4.2"  # Procure materials and services
    - keywords: ["retail", "merchandis", "customer", "sales", "inventory"]
    - industry_variants: ["Retail"]

# Product filters
products:
  include:
    - unspsc_segments: ["44", "45", "46", "53"]  # Consumer goods
    - keywords: ["retail", "consumer", "merchandise"]

# Task filters
tasks:
  include:
    - from_occupations: [retail-filtered occupations]
    - keywords: ["customer", "sales", "merchandis", "inventory", "checkout"]
```

#### Example: law.org.ai Mapping Rules

```yaml
domain: law.org.ai
title: Legal Knowledge Graph
description: Legal concepts, processes, contracts, and regulatory compliance

# Occupation filters
occupations:
  include:
    - soc_codes: ["23-0000"]  # Legal occupations
    - titles_matching: ["lawyer", "attorney", "paralegal", "judge", "legal"]
    - career_clusters: ["Public Service & Safety"]

# Process filters
processes:
  include:
    - apqc_categories:
        - "2.1"  # Manage legal and ethical issues
        - "2.2"  # Manage risk
        - "2.3"  # Manage regulatory compliance
    - keywords: ["legal", "compliance", "regulatory", "contract", "litigation"]

# Task filters
tasks:
  include:
    - from_occupations: [legal-filtered occupations]
    - dwa_matching: ["Evaluating Information to Determine Compliance"]
    - keywords: ["legal", "contract", "compliance", "regulation", "law"]

# Service filters (future)
services:
  include:
    - napcs_codes: ["5411"]  # Legal services
```

#### Example: sustainability.org.ai Mapping Rules

```yaml
domain: sustainability.org.ai
title: Sustainability & Environmental Knowledge Graph
description: Environmental processes, green technology, and sustainable practices

# Occupation filters
occupations:
  include:
    - titles_matching: ["environmental", "sustainability", "conservation", "renewable"]
    - career_clusters: ["Energy & Natural Resources"]

# Process filters
processes:
  include:
    - keywords: ["environmental", "sustainability", "green", "renewable", "carbon", "waste"]
    - digital_scores: ["> 0.7"]  # Favor digital/automated processes

# Task filters
tasks:
  include:
    - keywords: ["environmental", "sustainability", "conservation", "emissions"]
    - emerging_tasks: true  # Include O*NET emerging tasks

# Product filters
products:
  include:
    - keywords: ["solar", "wind", "renewable", "recycl", "sustainable", "organic"]
    - unspsc_classes: ["26", "39"]  # Renewable energy equipment
```

### 2.5 Cross-Domain Relationships

Virtual taxonomies expose relationships across source domains:

```
retail.org.ai/RetailSalesWorkers (Occupation)
├── requires → CustomerService (Skill)
├── performs → GreetCustomers (Task)
├── uses → PointOfSaleSystem (Technology)
├── worksIn → RetailTrade (Industry)
├── executes → ProcessSalesTransactions (Process)
└── sells → ConsumerProducts (Product)
```

These relationships are derived from:
- **O*NET relationships**: Occupation → Skills, Tasks, Tools, Knowledge
- **APQC relationships**: Process → Sub-processes
- **Industry-Occupation Matrix**: Industry ↔ Occupation (BLS data)
- **UNSPSC hierarchy**: Segment → Family → Class → Commodity
- **Custom enrichments**: Career cluster mappings, digital scores

---

## Part 3: Proposed YAML Frontmatter Structure

Each virtual taxonomy is defined by a YAML configuration file:

### 3.1 Taxonomy Definition Schema

```yaml
# File: .taxonomies/retail.org.ai.yaml

# Basic metadata
domain: retail.org.ai
title: Retail Industry Knowledge Graph
tagline: Operations, Occupations, and Processes for Retail
description: |
  Comprehensive taxonomy of retail industry knowledge, including
  occupations, business processes, products, services, and skills
  specific to retail operations.

# Visual identity
icon: ShoppingCart
color: "#E74C3C"
theme: retail

# Parent/child relationships
category: industry-vertical
parent: null
related:
  - hospitality.org.ai
  - marketing.org.ai
  - supply-chain.org.ai

# Source domain filters
sources:
  # Industries (NAICS)
  industries:
    include:
      naics_codes: ["44-45"]
      career_clusters: ["Hospitality, Events, & Tourism", "Marketing & Sales"]

  # Occupations (O*NET)
  occupations:
    include:
      naics_codes: ["44-45"]
      career_clusters: ["Marketing & Sales"]
      title_keywords: ["retail", "sales", "cashier", "stocker", "merchandis"]
      soc_major_groups: ["41"]  # Sales occupations
    exclude:
      soc_codes: ["41-9000"]  # Exclude some generic sales

  # Processes (APQC)
  processes:
    include:
      categories: ["3.0", "4.1", "4.2"]
      industry_variants: ["Retail"]
      keywords: ["retail", "merchandis", "customer", "sales", "inventory", "checkout"]

  # Products (UNSPSC)
  products:
    include:
      segments: ["44", "45", "46", "53"]
      keywords: ["retail", "consumer", "merchandise"]

  # Services (NAPCS)
  services:
    include:
      codes: ["44", "45"]
      keywords: ["retail"]

  # Tasks (O*NET)
  tasks:
    include:
      from_occupations: auto  # Auto-include from filtered occupations
      keywords: ["customer", "sales", "merchandis", "inventory"]
      digital_scores: [0.0, 1.0]  # All digital scores

  # Skills (O*NET)
  skills:
    include:
      from_occupations: auto
      keywords: ["customer", "sales", "persuasion"]

  # Technologies & Tools (O*NET)
  technologies:
    include:
      from_occupations: auto
      keywords: ["pos", "point of sale", "inventory", "retail"]

# Entity type structure
types:
  - name: Occupation
    source: occupations.org.ai
    icon: Users
    count_estimate: 50

  - name: Process
    source: processes.org.ai
    icon: GitBranch
    count_estimate: 200

  - name: Task
    source: occupations.org.ai
    icon: CheckSquare
    count_estimate: 500

  - name: Skill
    source: occupations.org.ai
    icon: Award
    count_estimate: 100

  - name: Product
    source: products.org.ai
    icon: Package
    count_estimate: 5000

  - name: Service
    source: services.org.ai
    icon: Briefcase
    count_estimate: 50

  - name: Tool
    source: occupations.org.ai
    icon: Tool
    count_estimate: 100

# Navigation and UI
navigation:
  primary:
    - Occupations
    - Processes
    - Products
  secondary:
    - Tasks
    - Skills
    - Tools
    - Technologies

# Search and discovery
tags:
  - retail
  - commerce
  - sales
  - merchandising
  - customer-service

# Metrics and analytics
metrics:
  enabled: true
  track:
    - entity_count_by_type
    - relationship_density
    - digital_score_distribution
    - wage_statistics
```

### 3.2 Additional Example Configurations

#### industries.org.ai (Reference Taxonomy)

```yaml
domain: industries.org.ai
title: Industry Classification Reference
tagline: NAICS Industry Taxonomy
category: reference
type: hierarchical

sources:
  industries:
    include:
      naics_codes: ["*"]  # All NAICS codes
    hierarchy:
      levels:
        - sector (2-digit)
        - subsector (3-digit)
        - industry_group (4-digit)
        - industry (5-digit)
        - national_industry (6-digit)

visualization:
  default_view: tree
  show_hierarchy: true
  enable_breadcrumbs: true
```

#### law.org.ai (Functional Domain)

```yaml
domain: law.org.ai
title: Legal Knowledge Graph
tagline: Legal Concepts, Contracts, and Compliance
category: functional-domain

sources:
  occupations:
    include:
      soc_major_groups: ["23"]  # Legal occupations
      title_keywords: ["legal", "lawyer", "attorney", "paralegal", "judge"]

  processes:
    include:
      categories: ["2.1", "2.2", "2.3"]  # Legal, risk, compliance
      keywords: ["legal", "compliance", "regulatory", "contract"]

  tasks:
    include:
      dwa_categories: ["Evaluating Information to Determine Compliance"]
      keywords: ["legal", "contract", "compliance", "regulation"]

# Future: Custom entity types
custom_types:
  - name: Contract
    description: Legal contract templates and clauses
    source: future

  - name: Regulation
    description: Legal regulations and requirements
    source: future

  - name: Case
    description: Legal case references
    source: future
```

#### digital.org.ai (Thematic Area)

```yaml
domain: digital.org.ai
title: Digital Transformation Knowledge
tagline: Digital-First Processes, Roles, and Technologies
category: thematic

sources:
  occupations:
    include:
      digital_scores: [0.8, 1.0]  # Highly digital occupations
      career_clusters: ["Digital Technology"]
      title_keywords: ["digital", "software", "data", "cyber", "cloud"]

  processes:
    include:
      digital_scores: [0.8, 1.0]  # Highly digital processes
      keywords: ["digital", "automation", "software", "analytics", "ai"]

  tasks:
    include:
      digital_scores: [0.8, 1.0]
      emerging_tasks: true  # Include emerging digital tasks

  technologies:
    include:
      keywords: ["cloud", "ai", "machine learning", "analytics", "automation"]

metrics:
  enabled: true
  highlight:
    - average_digital_score
    - emerging_task_ratio
    - automation_potential
```

---

## Part 4: Implementation Recommendations

### 4.1 Storage Architecture

#### Option A: Materialized Views (Recommended for ClickHouse)

Create materialized views for each virtual taxonomy:

```sql
-- Example: retail.org.ai occupations view
CREATE MATERIALIZED VIEW retail_occupations AS
SELECT
  t.url,
  t.ns,
  t.type,
  t.id,
  t.data,
  'retail.org.ai' as virtual_domain
FROM mdxdb.things t
JOIN mdxdb.things industries ON industries.ns = 'naics'
WHERE
  t.ns = 'onet'
  AND t.type = 'Occupation'
  AND (
    -- NAICS filter
    JSONExtractString(t.data, 'naicsCode') LIKE '44%'
    OR JSONExtractString(t.data, 'naicsCode') LIKE '45%'
    -- Title keywords
    OR t.id ILIKE '%retail%'
    OR t.id ILIKE '%sales%'
    OR t.id ILIKE '%cashier%'
  )
```

#### Option B: Query-Time Filtering (Recommended for SQLite)

Generate taxonomy views at query time using stored filter rules:

```typescript
// .taxonomies/loader.ts
export async function getTaxonomyEntities(
  domain: string,
  type: string
): Promise<Thing[]> {
  const config = loadTaxonomyConfig(domain)
  const filters = config.sources[type.toLowerCase()]

  return db
    .select()
    .from(things)
    .where(buildFilterConditions(filters))
}
```

#### Option C: Hybrid Approach (Best Performance)

- **Materialized views** for large, stable taxonomies (industries.org.ai)
- **Query-time filtering** for dynamic taxonomies (sustainability.org.ai)
- **Cached results** with TTL for frequently accessed views

### 4.2 URL Structure

Virtual taxonomy URLs should follow the pattern:

```
https://[virtual-domain].org.ai/[Type]/[EntityName]
```

Examples:
- `https://retail.org.ai/Occupation/RetailSalesWorkers`
- `https://retail.org.ai/Process/ProcessSalesTransactions`
- `https://law.org.ai/Occupation/Lawyers`
- `https://sustainability.org.ai/Task/MonitorEnvironmentalImpact`

These URLs **redirect** or **alias** to the canonical source URLs:
- `retail.org.ai/Occupation/RetailSalesWorkers` → `occupations.org.ai/RetailSalesWorkers`

Implementation:
```typescript
// Canonical URL (stored in database)
const canonical = "https://occupations.org.ai/RetailSalesWorkers"

// Virtual URLs (generated dynamically)
const virtualURLs = [
  "https://retail.org.ai/Occupation/RetailSalesWorkers",
  "https://marketing.org.ai/Occupation/RetailSalesWorkers",
]

// Store in meta field
{
  url: canonical,
  meta: {
    virtualTaxonomies: ["retail.org.ai", "marketing.org.ai"],
    canonicalURL: canonical
  }
}
```

### 4.3 Metadata Enrichment

Extend the `things.meta` JSON field to track virtual taxonomy memberships:

```typescript
interface ThingMeta {
  sourceURL?: string          // Original source URL
  canonicalURL?: string        // Canonical .org.ai URL
  virtualTaxonomies?: string[] // List of virtual taxonomies this belongs to
  taxonomyScores?: {           // Relevance scores for each taxonomy
    [domain: string]: number   // 0.0 - 1.0
  }
  taxonomyKeywords?: {         // Keywords that matched for inclusion
    [domain: string]: string[]
  }
}
```

Example:
```json
{
  "url": "https://occupations.org.ai/RetailSalesWorkers",
  "meta": {
    "sourceURL": "onet:41-2031.00",
    "canonicalURL": "https://occupations.org.ai/RetailSalesWorkers",
    "virtualTaxonomies": [
      "retail.org.ai",
      "marketing.org.ai",
      "hospitality.org.ai"
    ],
    "taxonomyScores": {
      "retail.org.ai": 1.0,
      "marketing.org.ai": 0.7,
      "hospitality.org.ai": 0.3
    },
    "taxonomyKeywords": {
      "retail.org.ai": ["retail", "sales", "customer"],
      "marketing.org.ai": ["sales", "customer"]
    }
  }
}
```

### 4.4 Navigation and Discovery

#### Sidebar Structure for Virtual Taxonomies

```
retail.org.ai
├── Overview
├── Occupations (50)
│   ├── RetailSalesWorkers
│   ├── FirstLineSupervisors...
│   └── ... and 45 more
├── Processes (200)
│   ├── Market and Sell
│   │   ├── ProcessSalesTransactions
│   │   └── ManageCustomerRelationships
│   └── Manage Merchandise
│       ├── ReceiveMerchandise
│       └── DisplayMerchandise
├── Products (5,000)
│   └── ... (hierarchical UNSPSC view)
├── Skills (100)
├── Tasks (500)
└── Tools (100)
```

#### Homepage for Virtual Taxonomies

Each virtual taxonomy gets a landing page:

```markdown
# Retail Industry Knowledge Graph

## Overview
Comprehensive taxonomy of retail operations, from occupations and
processes to products and skills.

## Statistics
- **50 Occupations** spanning retail operations
- **200 Business Processes** from APQC
- **5,000+ Products** from UNSPSC
- **500 Tasks** performed in retail
- **100 Skills** required for retail success

## Featured Content
### Top Occupations
- Retail Sales Workers
- First-Line Supervisors of Retail Sales Workers
- Cashiers

### Key Processes
- Process Sales Transactions
- Manage Customer Relationships
- Optimize Store Sales and Performance

### Related Taxonomies
- [Marketing & Sales](https://marketing.org.ai)
- [Supply Chain](https://supply-chain.org.ai)
- [Hospitality](https://hospitality.org.ai)
```

### 4.5 Query API

Provide programmatic access to virtual taxonomies:

```typescript
// Get all entities in a virtual taxonomy
GET /api/taxonomies/retail.org.ai/entities

// Get specific type within taxonomy
GET /api/taxonomies/retail.org.ai/Occupation

// Get entity with all its virtual taxonomy memberships
GET /api/taxonomies/entity?url=occupations.org.ai/RetailSalesWorkers

// Search across virtual taxonomy
GET /api/taxonomies/retail.org.ai/search?q=customer+service

// Get relationships within taxonomy
GET /api/taxonomies/retail.org.ai/relationships
```

### 4.6 Build Process

```bash
# 1. Define taxonomy configurations
.taxonomies/
├── retail.org.ai.yaml
├── law.org.ai.yaml
├── sustainability.org.ai.yaml
├── industries.org.ai.yaml
└── ... (more configurations)

# 2. Generate taxonomy metadata
tsx .scripts/build-taxonomies.ts

# 3. Update things.meta with virtual taxonomy memberships
tsx .scripts/enrich-virtual-taxonomies.ts

# 4. (Optional) Create materialized views in ClickHouse
tsx .scripts/create-taxonomy-views.ts

# 5. Generate static pages for each taxonomy
tsx .scripts/generate-taxonomy-pages.ts
```

### 4.7 Migration Path

**Phase 1: Foundation** (Week 1)
1. Create taxonomy YAML schema and validator
2. Define 3-5 pilot taxonomies (retail, law, sustainability)
3. Implement query-time filtering for SQLite
4. Build taxonomy homepage components

**Phase 2: Core Taxonomies** (Week 2-3)
1. Define all 20-30 virtual taxonomies
2. Implement taxonomy scoring algorithm
3. Enrich things.meta with virtual taxonomy data
4. Create navigation components

**Phase 3: Optimization** (Week 4)
1. Create ClickHouse materialized views
2. Implement caching layer
3. Add search and filtering
4. Performance testing

**Phase 4: Advanced Features** (Future)
1. AI-powered taxonomy recommendations
2. Custom user taxonomies
3. Taxonomy analytics and metrics
4. Cross-taxonomy graph visualization

---

## Part 5: Specific Taxonomy Proposals

### 5.1 Priority Virtual Taxonomies (Launch Set)

#### Industry Verticals (8 taxonomies)
1. **retail.org.ai** - Retail trade operations
2. **healthcare.org.ai** - Healthcare delivery and services
3. **manufacturing.org.ai** - Production and assembly
4. **construction.org.ai** - Building and infrastructure
5. **hospitality.org.ai** - Hotels, restaurants, events
6. **finance.org.ai** - Banking, insurance, investments
7. **technology.org.ai** - Software, IT, telecom
8. **agriculture.org.ai** - Farming, food production

#### Functional Domains (5 taxonomies)
9. **law.org.ai** - Legal, compliance, regulatory
10. **marketing.org.ai** - Marketing, advertising, branding
11. **hr.org.ai** - Human resources, talent management
12. **operations.org.ai** - Operations management
13. **supply-chain.org.ai** - Logistics, procurement

#### Thematic Areas (3 taxonomies)
14. **sustainability.org.ai** - Environmental, green tech
15. **digital.org.ai** - Digital transformation
16. **innovation.org.ai** - R&D, emerging technologies

#### Reference Taxonomies (3 taxonomies)
17. **industries.org.ai** - NAICS hierarchy browser
18. **skills.org.ai** - Skill taxonomy aggregator
19. **tasks.org.ai** - Task taxonomy aggregator

### 5.2 Detailed Taxonomy: retail.org.ai

**Estimated Entity Counts:**
- Occupations: ~50 (SOC codes 41-xxxx, plus some 43-xxxx and 53-xxxx)
- Processes: ~200 (APQC category 3.x plus retail variants)
- Products: ~5,000 (UNSPSC segments 44-46, 53)
- Services: ~50 (NAPCS codes 44-45)
- Tasks: ~500 (from retail occupations)
- Skills: ~100 (from retail occupations)
- Tools: ~50 (POS systems, inventory software)

**Key Occupations:**
- Retail Salespersons (41-2031)
- First-Line Supervisors of Retail Sales Workers (41-1011)
- Cashiers (41-2011)
- Stock Clerks and Order Fillers (43-5081)
- Retail Buyers (13-1022)
- Merchandise Displayers (27-1026)

**Key Processes (APQC):**
- 3.1 Understand markets, customers, and capabilities
- 3.2 Develop marketing strategy
- 3.3 Develop sales strategy
- 3.4 Develop and manage marketing plans
- 3.5 Develop and manage sales plans
- 4.1 Plan for and acquire resources
- 4.2 Procure materials and services

**Related Taxonomies:**
- marketing.org.ai (sales, customer engagement)
- supply-chain.org.ai (inventory, logistics)
- hospitality.org.ai (customer service)

### 5.3 Detailed Taxonomy: law.org.ai

**Estimated Entity Counts:**
- Occupations: ~40 (SOC major group 23-xxxx)
- Processes: ~150 (APQC categories 2.1, 2.2, 2.3)
- Tasks: ~400 (from legal occupations)
- Skills: ~80 (legal research, writing, analysis)
- Services: ~100 (legal services NAPCS)

**Key Occupations:**
- Lawyers (23-1011)
- Paralegals and Legal Assistants (23-2011)
- Judges (23-1021)
- Law Clerks (23-2092)
- Legal Secretaries (43-6012)
- Compliance Officers (13-1041)

**Key Processes (APQC):**
- 2.1 Manage legal and ethical issues
- 2.2 Manage environmental health and safety
- 2.3 Manage security and continuity
- 2.4 Manage public relations program
- 10.1 Manage legal and compliance

**Future Custom Types:**
- Contract templates
- Regulations (by jurisdiction)
- Legal precedents
- Compliance frameworks

### 5.4 Detailed Taxonomy: sustainability.org.ai

**Estimated Entity Counts:**
- Occupations: ~60 (environmental scientists, sustainability officers)
- Processes: ~100 (environmental management, green processes)
- Tasks: ~300 (sustainability-focused tasks)
- Products: ~1,000 (renewable energy, recycling, green tech)
- Technologies: ~50 (environmental monitoring, clean tech)

**Key Occupations:**
- Environmental Scientists and Specialists (19-2041)
- Chief Sustainability Officers (11-1011.03)
- Conservation Scientists (19-1031)
- Environmental Engineers (17-2081)
- Solar Energy Installation Managers (11-9199.09)

**Key Processes:**
- Environmental impact assessment
- Sustainability reporting
- Carbon footprint management
- Renewable energy implementation
- Waste reduction programs

**Filters:**
- Digital scores > 0.7 (favor automated/digital processes)
- Emerging tasks (new sustainability roles)
- Green technology products
- Environmental keywords

---

## Part 6: Data Model for Virtual Taxonomies

### 6.1 Taxonomy Configuration Schema (TypeScript)

```typescript
interface VirtualTaxonomy {
  // Metadata
  domain: string                    // e.g., "retail.org.ai"
  title: string                     // Human-readable title
  tagline?: string                  // Short description
  description: string               // Full description
  category: TaxonomyCategory        // Classification
  icon?: string                     // Icon name (lucide)
  color?: string                    // Brand color

  // Hierarchy
  parent?: string                   // Parent taxonomy domain
  children?: string[]               // Child taxonomy domains
  related?: string[]                // Related taxonomy domains

  // Source filters
  sources: {
    [entityType: string]: SourceFilter
  }

  // Entity types
  types: EntityTypeConfig[]

  // Navigation
  navigation?: NavigationConfig

  // UI and search
  tags?: string[]
  metrics?: MetricsConfig
}

interface SourceFilter {
  include?: FilterCriteria
  exclude?: FilterCriteria
  score?: ScoringCriteria
}

interface FilterCriteria {
  // Code-based filters
  codes?: string[]                  // Exact codes
  code_prefixes?: string[]          // Code prefixes

  // Keyword filters
  keywords?: string[]               // Text matching
  title_keywords?: string[]         // Title matching

  // Taxonomy filters
  career_clusters?: string[]
  naics_codes?: string[]
  soc_codes?: string[]
  unspsc_segments?: string[]

  // Score-based filters
  digital_scores?: [number, number] // Min-max range

  // Relationship filters
  from_occupations?: 'auto' | string[]
  from_industries?: 'auto' | string[]

  // Special flags
  emerging_tasks?: boolean
  industry_variants?: string[]
}

type TaxonomyCategory =
  | 'industry-vertical'
  | 'functional-domain'
  | 'thematic-area'
  | 'reference'

interface EntityTypeConfig {
  name: string                      // e.g., "Occupation"
  source: string                    // Source domain
  icon?: string
  count_estimate?: number
}
```

### 6.2 Virtual Taxonomy Table (ClickHouse)

```sql
CREATE TABLE mdxdb.virtual_taxonomies (
  domain String,                    -- e.g., "retail.org.ai"
  entity_url String,                -- Thing URL
  entity_type String,               -- Entity type
  relevance_score Float32,          -- 0.0 - 1.0
  matched_keywords Array(String),   -- Keywords that matched
  filter_path String,               -- Which filter matched
  created_at DateTime
)
ENGINE = MergeTree()
ORDER BY (domain, entity_type, relevance_score)
SETTINGS index_granularity = 8192
```

### 6.3 Taxonomy Membership Tracking

Update `things.meta` during enrichment:

```typescript
async function enrichVirtualTaxonomies(thing: Thing): Promise<Thing> {
  const taxonomies = await findMatchingTaxonomies(thing)

  return {
    ...thing,
    meta: {
      ...thing.meta,
      virtualTaxonomies: taxonomies.map(t => t.domain),
      taxonomyScores: Object.fromEntries(
        taxonomies.map(t => [t.domain, t.relevanceScore])
      ),
      taxonomyKeywords: Object.fromEntries(
        taxonomies.map(t => [t.domain, t.matchedKeywords])
      ),
    }
  }
}
```

---

## Part 7: Benefits and Use Cases

### 7.1 Benefits of Virtual Taxonomies

**1. Industry-Specific Discovery**
- Users exploring retail careers can see all retail occupations, processes, and tools in one place
- No need to understand the difference between O*NET, APQC, UNSPSC

**2. Cross-Domain Insights**
- See how occupations, processes, and products relate within a domain
- Example: "What tools do retail sales workers use?" → Show technologies from O*NET

**3. Vertical-Specific Analytics**
- Industry wage comparisons: "What do retail workers earn vs. manufacturing?"
- Digital transformation tracking: "How digital is the retail industry?"

**4. Improved Navigation**
- Domain experts navigate by industry, not by data source
- Lawyers browse law.org.ai, not across 5 different source domains

**5. Flexible Aggregation**
- Same occupation can appear in multiple virtual taxonomies
- Example: "Software Developer" in technology.org.ai, digital.org.ai, innovation.org.ai

### 7.2 Use Cases

**Use Case 1: Career Explorer**
```
User: High school student exploring retail careers

Journey:
1. Visit retail.org.ai
2. Browse Occupations section
3. Click "Retail Sales Workers"
4. See:
   - Job description (O*NET)
   - Required skills (O*NET)
   - Tasks performed (O*NET)
   - Tools used (O*NET)
   - Processes involved in (APQC)
   - Products sold (UNSPSC)
   - Wage data (BLS)
   - Education pathways (Career Clusters)
```

**Use Case 2: Business Analyst**
```
User: Consultant analyzing retail digital transformation

Journey:
1. Visit digital.org.ai
2. Filter by Industry: Retail
3. See digital score distribution
4. Identify high-digital vs. low-digital processes
5. Export data for analysis
6. Cross-reference with retail.org.ai for industry context
```

**Use Case 3: Compliance Officer**
```
User: Corporate compliance officer

Journey:
1. Visit law.org.ai
2. Browse Processes > Regulatory Compliance
3. Find relevant APQC processes
4. See which occupations perform these (O*NET)
5. Identify required skills and training
6. Cross-reference with sustainability.org.ai for environmental compliance
```

**Use Case 4: Procurement Manager**
```
User: Retail procurement manager

Journey:
1. Visit supply-chain.org.ai
2. Browse Processes > Procurement
3. Find "Procure materials and services" (APQC)
4. See related products (UNSPSC)
5. Identify tools needed (O*NET)
6. Cross-reference with retail.org.ai for retail-specific variants
```

---

## Part 8: Next Steps and Recommendations

### 8.1 Immediate Actions (Week 1)

1. **Create taxonomy schema validator**
   - TypeScript interfaces for taxonomy config
   - YAML schema validation with Zod
   - Error handling for invalid configs

2. **Define 5 pilot taxonomies**
   - retail.org.ai
   - law.org.ai
   - sustainability.org.ai
   - industries.org.ai (reference)
   - digital.org.ai

3. **Build taxonomy loader**
   - Read YAML configurations
   - Parse filter rules
   - Generate SQL/query filters

4. **Implement query-time filtering**
   - Start with SQLite (simpler)
   - Filter things based on taxonomy rules
   - Return filtered entity lists

### 8.2 Short-term Goals (Weeks 2-4)

1. **Extend to all priority taxonomies**
   - Define remaining 15-20 taxonomies
   - Validate filter rules with sample queries
   - Document each taxonomy's purpose

2. **Enrich metadata**
   - Run taxonomy matching algorithm
   - Update things.meta with virtual taxonomy memberships
   - Store relevance scores

3. **Build UI components**
   - Taxonomy homepage templates
   - Sidebar navigation for virtual taxonomies
   - Entity pages showing taxonomy memberships

4. **Performance optimization**
   - Create ClickHouse materialized views
   - Implement caching layer
   - Measure query performance

### 8.3 Medium-term Goals (Months 2-3)

1. **Advanced filtering**
   - Relevance scoring algorithm
   - Machine learning for taxonomy suggestions
   - User-defined custom filters

2. **Cross-taxonomy features**
   - Graph visualization across taxonomies
   - Relationship explorer
   - Taxonomy comparison tools

3. **Analytics and metrics**
   - Taxonomy statistics dashboards
   - Entity distribution charts
   - Digital score analytics

4. **API and integration**
   - RESTful API for taxonomy access
   - GraphQL endpoint
   - Export formats (CSV, JSON, RDF)

### 8.4 Long-term Vision (6+ months)

1. **AI-powered taxonomies**
   - Automatic taxonomy generation
   - Entity classification using LLMs
   - Semantic similarity matching

2. **User-generated taxonomies**
   - Allow users to create custom taxonomies
   - Share and collaborate on taxonomies
   - Community-curated collections

3. **Industry partnerships**
   - Partner with industry associations
   - Validate taxonomies with domain experts
   - Expand to specialized domains (legal, medical)

4. **Knowledge graph queries**
   - SPARQL-like query language
   - Natural language queries
   - Complex relationship traversals

---

## Appendix A: Complete Taxonomy List (30 Taxonomies)

### Industry Verticals (14)
1. retail.org.ai
2. healthcare.org.ai
3. manufacturing.org.ai
4. construction.org.ai
5. hospitality.org.ai
6. finance.org.ai
7. technology.org.ai
8. agriculture.org.ai
9. energy.org.ai
10. transportation.org.ai
11. real-estate.org.ai
12. media.org.ai
13. telecom.org.ai
14. automotive.org.ai

### Functional Domains (8)
15. law.org.ai
16. marketing.org.ai
17. sales.org.ai
18. hr.org.ai
19. finance.org.ai (overlaps with industry)
20. operations.org.ai
21. it.org.ai
22. supply-chain.org.ai

### Thematic Areas (5)
23. sustainability.org.ai
24. digital.org.ai
25. innovation.org.ai
26. compliance.org.ai
27. leadership.org.ai

### Reference Taxonomies (3)
28. industries.org.ai (NAICS browser)
29. skills.org.ai
30. tasks.org.ai

---

## Appendix B: Sample Queries

### Query 1: Get all retail occupations
```sql
SELECT * FROM mdxdb.things
WHERE ns = 'onet'
  AND type = 'Occupation'
  AND (
    JSONExtractString(data, 'naicsCode') LIKE '44%'
    OR JSONExtractString(data, 'naicsCode') LIKE '45%'
    OR id ILIKE '%retail%'
  )
```

### Query 2: Get sustainability processes
```sql
SELECT * FROM mdxdb.things
WHERE ns = 'apqc'
  AND type = 'Process'
  AND (
    JSONExtractString(data, 'name') ILIKE '%environmental%'
    OR JSONExtractString(data, 'name') ILIKE '%sustainability%'
    OR JSONExtractString(data, 'elementDescription') ILIKE '%green%'
  )
```

### Query 3: Get high-digital retail tasks
```sql
SELECT t.* FROM mdxdb.things t
JOIN mdxdb.things occ ON occ.ns = 'onet' AND occ.type = 'Occupation'
WHERE t.ns = 'onet'
  AND t.type = 'Task'
  AND JSONExtractFloat(t.meta, 'digitalScore') > 0.8
  AND (
    JSONExtractString(occ.data, 'naicsCode') LIKE '44%'
    OR JSONExtractString(occ.data, 'naicsCode') LIKE '45%'
  )
```

---

## Appendix C: Estimated Storage Requirements

| Component | Size Estimate |
|-----------|---------------|
| Taxonomy YAML configs | < 1 MB |
| Virtual taxonomy table | ~50 MB (for 30 taxonomies × 300K entities avg) |
| Enriched things.meta | +10-20% to things table |
| Materialized views | 2-5x source data (denormalized) |
| **Total overhead** | **~100-200 MB** |

With ClickHouse compression (4-10x), actual storage impact minimal.

---

## Conclusion

This research proposes a **comprehensive virtual taxonomy system** that enables industry-specific, functional, and thematic views across the graph.org.ai knowledge graph. The system:

1. **Leverages existing data** (O*NET, APQC, UNSPSC, NAICS, etc.)
2. **Creates meaningful aggregations** (retail, law, sustainability)
3. **Enables cross-domain discovery** (occupations + processes + products)
4. **Supports flexible filtering** (YAML-based configurations)
5. **Scales efficiently** (ClickHouse materialized views)

The proposed 30 virtual taxonomies cover major industry verticals, functional domains, thematic areas, and reference collections, providing users with intuitive navigation and discovery across the 321,780+ entity knowledge graph.

**Recommended next step**: Implement 5 pilot taxonomies (retail, law, sustainability, industries, digital) to validate the approach before scaling to all 30 taxonomies.

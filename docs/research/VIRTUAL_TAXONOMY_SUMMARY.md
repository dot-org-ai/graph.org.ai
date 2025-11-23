# Virtual Taxonomy Implementation Summary

**Date**: 2025-11-22
**Status**: Research Complete, Ready for Implementation

---

## Overview

This project proposes a **virtual taxonomy system** for graph.org.ai that creates industry-specific, functional, and thematic views across the knowledge graph's 321,780+ entities from 8 data sources.

## What Are Virtual Taxonomies?

Virtual taxonomies are **cross-cutting aggregations** that organize entities from multiple source domains (O*NET, APQC, UNSPSC, etc.) into domain-specific collections.

**Example**: `retail.org.ai` aggregates:
- Retail occupations (from O*NET)
- Retail processes (from APQC)
- Retail products (from UNSPSC)
- Retail-specific skills, tasks, and tools

**Key Insight**: The same entity can appear in multiple virtual taxonomies. For example, "Software Developer" appears in:
- `technology.org.ai` (industry vertical)
- `digital.org.ai` (thematic area)
- `innovation.org.ai` (thematic area)

## Current State

### Source Domains (Existing)
The system already has these source-based domains:

| Domain | Source | Entity Count |
|--------|--------|--------------|
| `occupations.org.ai` | O*NET | ~900K entities (1,016 occupations, 18,797 tasks, etc.) |
| `processes.org.ai` | APQC | 49,095 processes |
| `products.org.ai` | UNSPSC | 158,464 commodities |
| `services.org.ai` | NAPCS | 3,049 services |
| `industries.org.ai` | NAICS | 2,144 industries |
| `schema.org.ai` | Schema.org | 2,430 types/properties |
| `models.org.ai` | OpenRouter | 306 AI models |

### Existing Infrastructure
- ClickHouse database with `things` and `relationships` tables
- Semantic URLs: `https://[domain].org.ai/[EntityName]`
- Domain mapping in `build-things-db.ts`
- Career Cluster enrichments (14 clusters, 1,203 occupation mappings)
- Digital scores for tasks and processes

## Proposed Virtual Taxonomies (30 Total)

### Category A: Industry Verticals (14)
1. **retail.org.ai** - Retail trade operations
2. **healthcare.org.ai** - Healthcare delivery
3. **manufacturing.org.ai** - Production and assembly
4. **construction.org.ai** - Building and infrastructure
5. **hospitality.org.ai** - Hotels, restaurants, events
6. **finance.org.ai** - Banking, insurance, investments
7. **technology.org.ai** - Software, IT, telecom
8. **agriculture.org.ai** - Farming, food production
9. **energy.org.ai** - Energy and utilities
10. **transportation.org.ai** - Logistics and transit
11. **real-estate.org.ai** - Property and leasing
12. **media.org.ai** - Broadcasting and publishing
13. **telecom.org.ai** - Telecommunications
14. **automotive.org.ai** - Vehicle manufacturing

### Category B: Functional Domains (8)
15. **law.org.ai** - Legal, compliance, regulatory
16. **marketing.org.ai** - Marketing, advertising, branding
17. **sales.org.ai** - Sales processes and roles
18. **hr.org.ai** - Human resources, talent management
19. **operations.org.ai** - Operations management
20. **it.org.ai** - IT processes and roles
21. **supply-chain.org.ai** - Logistics, procurement
22. **finance.org.ai** - Financial processes (overlaps with industry)

### Category C: Thematic Areas (5)
23. **sustainability.org.ai** - Environmental, green tech
24. **digital.org.ai** - Digital transformation
25. **innovation.org.ai** - R&D, emerging technologies
26. **compliance.org.ai** - Regulatory, quality, safety
27. **leadership.org.ai** - Management and leadership

### Category D: Reference Taxonomies (3)
28. **industries.org.ai** - NAICS hierarchy browser (already exists as source)
29. **skills.org.ai** - Skill taxonomy aggregator
30. **tasks.org.ai** - Task taxonomy aggregator

## Implementation Architecture

### 1. Configuration Files

Each taxonomy is defined by a YAML file in `.taxonomies/configs/`:

```yaml
domain: retail.org.ai
title: Retail Industry Knowledge Graph
category: industry-vertical

sources:
  occupations:
    include:
      naics_codes: ["44-45"]
      title_keywords: ["retail", "sales", "cashier"]

  processes:
    include:
      categories: ["3.0", "4.1", "4.2"]
      keywords: ["retail", "merchandising", "customer"]
```

### 2. Metadata Enrichment

Extend `things.meta` JSON field to track taxonomy memberships:

```json
{
  "url": "https://occupations.org.ai/RetailSalesWorkers",
  "meta": {
    "virtualTaxonomies": ["retail.org.ai", "marketing.org.ai"],
    "taxonomyScores": {
      "retail.org.ai": 1.0,
      "marketing.org.ai": 0.7
    }
  }
}
```

### 3. Query Strategy

**Option A**: Materialized Views (ClickHouse)
```sql
CREATE MATERIALIZED VIEW retail_occupations AS
SELECT * FROM mdxdb.things
WHERE (filters...)
```

**Option B**: Query-Time Filtering (SQLite)
```typescript
const filters = loadTaxonomyConfig('retail.org.ai')
const entities = db.select().where(buildFilters(filters))
```

**Recommended**: Hybrid approach - materialized views for large/stable taxonomies, query-time for dynamic ones.

### 4. URL Structure

Virtual taxonomy URLs alias to canonical URLs:

```
# Virtual URL (user-facing)
https://retail.org.ai/Occupation/RetailSalesWorkers

# Canonical URL (stored in database)
https://occupations.org.ai/RetailSalesWorkers

# Both resolve to the same entity
```

## Files Created

### Research & Documentation
1. **`/VIRTUAL_TAXONOMY_RESEARCH.md`** (22,000 words)
   - Complete analysis of current data structure
   - Detailed taxonomy proposals
   - Implementation recommendations
   - Sample queries and use cases

2. **`/.taxonomies/README.md`** (Implementation guide)
   - Quick start instructions
   - Configuration reference
   - API documentation
   - Troubleshooting guide

### Sample Configurations
3. **`/.taxonomies/configs/retail.org.ai.yaml`**
   - Complete retail taxonomy configuration
   - Filters for all entity types
   - ~50 occupations, ~200 processes, ~5,000 products

4. **`/.taxonomies/configs/law.org.ai.yaml`**
   - Legal/compliance taxonomy
   - ~40 occupations, ~150 processes
   - Future custom types (contracts, regulations)

5. **`/.taxonomies/configs/sustainability.org.ai.yaml`**
   - Environmental/green tech taxonomy
   - ~60 occupations, ~100 processes
   - Emphasis on digital/automated processes
   - Emerging tasks tracking

## Key Features

### 1. Multi-Source Aggregation
A single taxonomy pulls from multiple sources:
- Occupations (O*NET)
- Processes (APQC)
- Products (UNSPSC)
- Services (NAPCS)
- Industries (NAICS)

### 2. Flexible Filtering
YAML configs support multiple filter types:
- **Code-based**: NAICS codes, SOC codes, UNSPSC segments
- **Keyword-based**: Title matching, description matching
- **Taxonomy-based**: Career clusters, industry variants
- **Score-based**: Digital scores, wage percentiles
- **Relationship-based**: Auto-include from filtered entities

### 3. Relevance Scoring
Each entity gets a relevance score (0.0-1.0) for each taxonomy:
- 1.0 = Perfect match (exact code)
- 0.8-0.9 = Strong match (keyword + cluster)
- 0.6-0.7 = Moderate match (related/secondary)

### 4. Cross-Domain Navigation
Users can explore relationships across entity types:
```
retail.org.ai/RetailSalesWorkers (Occupation)
├── requires → CustomerService (Skill)
├── performs → GreetCustomers (Task)
├── uses → PointOfSaleSystem (Technology)
├── worksIn → RetailTrade (Industry)
├── executes → ProcessSalesTransactions (Process)
└── sells → ConsumerProducts (Product)
```

## Benefits

### For Users
1. **Simplified Discovery**: Browse by industry, not by data source
2. **Contextual Information**: See all related entities in one place
3. **Career Exploration**: Explore jobs, skills, tasks together
4. **Industry Analysis**: Compare industries across multiple dimensions

### For Business
1. **Vertical-Specific Views**: Industry analysts get focused datasets
2. **Compliance Tracking**: Legal/compliance teams find all relevant processes
3. **Market Research**: Product teams see industry-specific products
4. **Talent Management**: HR teams understand role requirements

### For Platform
1. **SEO Optimization**: Industry-specific landing pages
2. **User Engagement**: Intuitive navigation paths
3. **Data Monetization**: Premium industry reports
4. **Partnership Opportunities**: Industry association collaborations

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [x] Research complete
- [ ] Create taxonomy schema (TypeScript/Zod)
- [ ] Build YAML validator
- [ ] Define 5 pilot taxonomies (retail, law, sustainability, industries, digital)
- [ ] Implement query-time filtering

### Phase 2: Core Taxonomies (Weeks 2-3)
- [ ] Define all 30 virtual taxonomies
- [ ] Implement taxonomy scoring algorithm
- [ ] Enrich things.meta with virtual taxonomy data
- [ ] Build UI components (homepage, sidebar)

### Phase 3: Optimization (Week 4)
- [ ] Create ClickHouse materialized views
- [ ] Implement caching layer
- [ ] Add search and filtering
- [ ] Performance testing

### Phase 4: Launch (Month 2)
- [ ] Deploy to production
- [ ] SEO optimization
- [ ] Analytics tracking
- [ ] User feedback collection

## Example Use Cases

### Use Case 1: Career Explorer
**User**: High school student exploring retail careers

**Journey**:
1. Visit `retail.org.ai`
2. Browse "Occupations" → "Retail Sales Workers"
3. See job description, skills, tasks, tools, wages
4. Explore related processes and products
5. Check education pathways

### Use Case 2: Compliance Officer
**User**: Corporate compliance officer

**Journey**:
1. Visit `law.org.ai`
2. Browse "Processes" → "Regulatory Compliance"
3. Find relevant APQC processes
4. See which occupations perform these
5. Cross-reference with `sustainability.org.ai` for environmental compliance

### Use Case 3: Business Analyst
**User**: Consultant analyzing retail digital transformation

**Journey**:
1. Visit `digital.org.ai`
2. Filter by Industry: Retail
3. See digital score distribution
4. Identify high vs. low digital processes
5. Export data for analysis

## Next Steps

### Immediate Actions
1. Review research documents
2. Validate approach with stakeholders
3. Prioritize pilot taxonomies (recommend: retail, law, sustainability)
4. Set up `.taxonomies/` directory structure
5. Create TypeScript schema definitions

### Week 1 Deliverables
- Taxonomy schema validator
- YAML config parser
- Query builder for filters
- Sample entity lists from 3 pilot taxonomies

### Success Metrics
- Entity coverage per taxonomy (>80% of relevant entities)
- Query performance (<100ms for taxonomy pages)
- User engagement (time on taxonomy pages)
- Cross-taxonomy navigation (click-through rates)

## Resources

### Documentation
- [Full Research Report](./VIRTUAL_TAXONOMY_RESEARCH.md) - Complete analysis and proposals
- [Implementation Guide](/.taxonomies/README.md) - Developer documentation
- [Sample Configurations](/.taxonomies/configs/) - YAML examples

### Key Technologies
- **ClickHouse**: Materialized views for large taxonomies
- **YAML**: Human-readable taxonomy configurations
- **TypeScript**: Type-safe configuration parsing
- **Zod**: Schema validation

### Data Sources Referenced
- O*NET (occupations, tasks, skills)
- APQC (business processes)
- UNSPSC (products)
- NAPCS (services)
- NAICS (industries)
- Career Clusters (crosswalks)
- Digital Scores (enrichments)

## Questions & Answers

**Q: How is this different from source domains?**
A: Source domains (occupations.org.ai, processes.org.ai) map 1:1 to data sources. Virtual taxonomies aggregate across multiple sources based on themes/industries.

**Q: Can entities belong to multiple taxonomies?**
A: Yes! "Software Developer" can be in technology.org.ai, digital.org.ai, and innovation.org.ai.

**Q: How are taxonomies defined?**
A: YAML configuration files with filters (codes, keywords, scores) that select entities from source domains.

**Q: What about performance?**
A: Use materialized views in ClickHouse for large/stable taxonomies, query-time filtering for dynamic ones, and caching for frequently accessed views.

**Q: Can users create custom taxonomies?**
A: Future feature - initial implementation uses curated taxonomies defined by YAML configs.

---

## Conclusion

The virtual taxonomy system provides a powerful, flexible framework for organizing the knowledge graph into industry-specific, functional, and thematic views. With 30 proposed taxonomies covering major verticals and domains, users can navigate the 321,780+ entity graph in intuitive, contextual ways.

**Recommended next step**: Implement 5 pilot taxonomies (retail, law, sustainability, industries, digital) to validate the approach before scaling to all 30 taxonomies.

---

**Generated by**: Claude Code
**Total Research**: ~35,000 words across 5 documents
**Sample Configurations**: 3 complete YAML files
**Implementation Ready**: Yes

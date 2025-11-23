# Virtual Taxonomies Implementation Guide

This directory contains YAML configuration files for virtual taxonomies that aggregate entities from multiple source domains.

## Quick Start

```bash
# 1. Define a new taxonomy
cp templates/industry-vertical.yaml retail.org.ai.yaml

# 2. Edit the configuration
vim retail.org.ai.yaml

# 3. Validate the configuration
tsx scripts/validate-taxonomy.ts retail.org.ai.yaml

# 4. Generate taxonomy metadata
tsx scripts/build-taxonomies.ts

# 5. Test the taxonomy
tsx scripts/test-taxonomy.ts retail.org.ai
```

## Directory Structure

```
.taxonomies/
├── README.md                          # This file
├── schema.ts                          # TypeScript schema definitions
├── templates/                         # Template YAML files
│   ├── industry-vertical.yaml
│   ├── functional-domain.yaml
│   ├── thematic-area.yaml
│   └── reference.yaml
├── scripts/                           # Build and validation scripts
│   ├── validate-taxonomy.ts
│   ├── build-taxonomies.ts
│   ├── test-taxonomy.ts
│   └── generate-taxonomy-pages.ts
└── configs/                           # Actual taxonomy configurations
    ├── retail.org.ai.yaml
    ├── law.org.ai.yaml
    ├── sustainability.org.ai.yaml
    ├── industries.org.ai.yaml
    └── ... (more taxonomies)
```

## Configuration File Structure

Each taxonomy is defined by a YAML file with the following sections:

### 1. Metadata
```yaml
domain: retail.org.ai
title: Retail Industry Knowledge Graph
tagline: Operations, Occupations, and Processes for Retail
description: |
  Comprehensive taxonomy of retail industry knowledge
category: industry-vertical
icon: ShoppingCart
color: "#E74C3C"
```

### 2. Relationships
```yaml
parent: null
related:
  - hospitality.org.ai
  - marketing.org.ai
  - supply-chain.org.ai
```

### 3. Source Filters
```yaml
sources:
  occupations:
    include:
      naics_codes: ["44-45"]
      career_clusters: ["Marketing & Sales"]
      title_keywords: ["retail", "sales", "cashier"]
```

### 4. Entity Types
```yaml
types:
  - name: Occupation
    source: occupations.org.ai
    icon: Users
    count_estimate: 50
```

## Filter Criteria Reference

### Code-Based Filters
```yaml
include:
  codes: ["11-1011.00", "41-2031.00"]           # Exact codes
  code_prefixes: ["44", "45", "41"]             # Code prefixes
  naics_codes: ["44-45"]                        # NAICS codes
  soc_codes: ["41-2031"]                        # SOC codes
  soc_major_groups: ["41"]                      # SOC major groups
  unspsc_segments: ["44", "45"]                 # UNSPSC segments
```

### Keyword Filters
```yaml
include:
  keywords: ["retail", "sales", "customer"]     # Any field
  title_keywords: ["retail", "cashier"]         # Title/name only
  description_keywords: ["customer service"]    # Description only
```

### Taxonomy Filters
```yaml
include:
  career_clusters:
    - "Marketing & Sales"
    - "Hospitality, Events, & Tourism"
  industry_variants: ["Retail"]                 # APQC industry variants
```

### Score-Based Filters
```yaml
include:
  digital_scores: [0.8, 1.0]                    # Range: 0.0 - 1.0
  wage_percentile: [75, 100]                    # Top 25% wages
```

### Relationship Filters
```yaml
include:
  from_occupations: auto                        # Auto from filtered occupations
  from_industries: ["44-45"]                    # From specific industries
  from_processes: ["3.0", "4.1"]                # From APQC categories
```

### Special Flags
```yaml
include:
  emerging_tasks: true                          # O*NET emerging tasks only
  industry_variants: ["Retail", "Consumer Products"]
```

## Examples

See the `configs/` directory for complete examples:
- `retail.org.ai.yaml` - Industry vertical
- `law.org.ai.yaml` - Functional domain
- `sustainability.org.ai.yaml` - Thematic area
- `industries.org.ai.yaml` - Reference taxonomy

## Building Taxonomies

### Development Workflow

1. **Create configuration**
   ```bash
   cp templates/industry-vertical.yaml configs/myindustry.org.ai.yaml
   ```

2. **Validate**
   ```bash
   tsx scripts/validate-taxonomy.ts configs/myindustry.org.ai.yaml
   ```

3. **Test with sample data**
   ```bash
   tsx scripts/test-taxonomy.ts myindustry.org.ai --limit 10
   ```

4. **Build all taxonomies**
   ```bash
   tsx scripts/build-taxonomies.ts
   ```

5. **Generate pages**
   ```bash
   tsx scripts/generate-taxonomy-pages.ts
   ```

### Production Workflow

```bash
# Full rebuild
tsx scripts/build-taxonomies.ts --all

# Incremental update (single taxonomy)
tsx scripts/build-taxonomies.ts --taxonomy retail.org.ai

# Update metadata only (fast)
tsx scripts/build-taxonomies.ts --metadata-only

# Generate materialized views in ClickHouse
tsx scripts/create-taxonomy-views.ts
```

## Testing

```bash
# Validate all configs
npm run validate:taxonomies

# Test a specific taxonomy
npm run test:taxonomy -- retail.org.ai

# Check entity counts
npm run taxonomy:stats

# Preview taxonomy sidebar
npm run taxonomy:preview -- retail.org.ai
```

## Best Practices

### 1. Naming Conventions
- Domain names: `lowercase-hyphenated.org.ai`
- Use industry names for verticals: `retail.org.ai`, `healthcare.org.ai`
- Use function names for domains: `law.org.ai`, `marketing.org.ai`
- Use adjectives for themes: `digital.org.ai`, `sustainability.org.ai`

### 2. Filter Design
- Start broad, refine iteratively
- Use multiple filter types (codes + keywords)
- Test filters on sample data first
- Document rationale in comments

### 3. Relevance Scoring
- Higher score = stronger match
- Use 1.0 for exact code matches
- Use 0.7-0.9 for keyword matches
- Use 0.5-0.7 for related/secondary matches

### 4. Entity Counts
- Estimate counts before building
- Aim for 10-1000 entities per type
- Too few = not useful, too many = overwhelming
- Use hierarchical organization for large sets

### 5. Taxonomy Relationships
- Link related taxonomies
- Avoid circular references
- Maximum 2 levels of hierarchy
- Cross-reference complementary domains

## Advanced Features

### Custom Scoring Functions

```yaml
sources:
  occupations:
    include:
      naics_codes: ["44-45"]
    score:
      function: weighted_average
      weights:
        naics_match: 0.5
        keyword_match: 0.3
        career_cluster: 0.2
```

### Composite Filters

```yaml
sources:
  occupations:
    include:
      all_of:  # AND logic
        - naics_codes: ["44-45"]
        - digital_scores: [0.5, 1.0]
      any_of:  # OR logic
        - title_keywords: ["retail"]
        - career_clusters: ["Marketing & Sales"]
```

### Dynamic Filtering

```yaml
sources:
  tasks:
    include:
      from_occupations: auto  # Automatically include tasks from filtered occupations
      filter_function: |
        (task) => {
          return task.data.digitalScore > 0.7
            && task.meta.emerging === true
        }
```

## Troubleshooting

### Issue: No entities found
- Check filter criteria are not too restrictive
- Verify source data exists
- Test filters individually
- Check for typos in codes/keywords

### Issue: Too many entities
- Add exclusion filters
- Narrow keyword matches
- Increase minimum score threshold
- Use code prefixes instead of wildcards

### Issue: Wrong entities included
- Review keyword matches (too broad?)
- Add exclusion filters for false positives
- Refine code ranges
- Check career cluster mappings

### Issue: Slow query performance
- Create materialized views
- Add indexes on filter fields
- Use code-based filters (faster than keywords)
- Cache frequently accessed taxonomies

## API Reference

### TypeScript API

```typescript
import { loadTaxonomy, getTaxonomyEntities } from '@/taxonomies'

// Load taxonomy config
const retail = await loadTaxonomy('retail.org.ai')

// Get filtered entities
const occupations = await getTaxonomyEntities('retail.org.ai', 'Occupation')

// Get entity with taxonomy memberships
const thing = await getThingWithTaxonomies(url)
console.log(thing.meta.virtualTaxonomies)  // ['retail.org.ai', 'marketing.org.ai']

// Search within taxonomy
const results = await searchTaxonomy('retail.org.ai', 'customer service')
```

### REST API

```bash
# Get taxonomy metadata
GET /api/taxonomies/retail.org.ai

# Get entities by type
GET /api/taxonomies/retail.org.ai/Occupation

# Search within taxonomy
GET /api/taxonomies/retail.org.ai/search?q=customer

# Get entity's taxonomies
GET /api/taxonomies/entity?url=occupations.org.ai/RetailSalesWorkers
```

## Contributing

1. Fork and create a branch
2. Add/modify taxonomy YAML
3. Run validation and tests
4. Submit PR with:
   - Rationale for taxonomy
   - Sample entity counts
   - Test results

## Resources

- [Virtual Taxonomy Research Report](../VIRTUAL_TAXONOMY_RESEARCH.md)
- [Schema Documentation](./schema.ts)
- [Filter Reference](./FILTERS.md)
- [Examples](./configs/)

## Support

For questions or issues:
1. Check existing taxonomy examples
2. Review filter reference
3. Run test scripts
4. Open GitHub issue

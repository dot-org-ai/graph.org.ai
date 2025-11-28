# graph.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

A comprehensive semantic knowledge graph and ontology ecosystem for AI-powered applications.

## Overview

graph.org.ai is a hierarchical ontology system that organizes concepts, entities, and relationships across multiple domains. Each domain is represented by a `.org.ai` subdomain with its own type definitions, MDX documentation, and cross-references.

## Quick Start

```bash
# Install dependencies
pnpm install

# Ingest raw source data
pnpm ingest

# Generate normalized data files
pnpm generate

# Run tests
pnpm test
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm ingest` | Ingest raw data from external sources to `.source/` |
| `pnpm generate` | Generate normalized TSV files in `.data/` |
| `pnpm ingest-db` | Load data into database (SQLite/ClickHouse) |
| `pnpm export` | Export data from ClickHouse to TSV |
| `pnpm enrich` | Add digital scores to entity files |
| `pnpm test` | Run test suite |

## Directory Structure

```
graph.org.ai/
├── .org.ai/           # Domain ontologies (109 domains)
├── .source/           # Raw source data from standards bodies
├── .data/             # Normalized TSV data files
├── .enrichment/       # Enrichment mappings (digital scores, domain mappings)
├── .scripts/          # Data processing scripts
├── .mdxdb/            # MDX database engine
└── workers/           # Cloudflare Workers
```

## Domain Hierarchy

### Core Ontology

| Domain | Description | Types |
|--------|-------------|-------|
| [graph.org.ai](/.org.ai/graph.org.ai) | Root knowledge graph | Concept |
| [schema.org.ai](/.org.ai/schema.org.ai) | Schema.org type system | Type, Property |
| [nouns.org.ai](/.org.ai/nouns.org.ai) | Core noun taxonomy | Noun |
| [verbs.org.ai](/.org.ai/verbs.org.ai) | Verb taxonomy | Verb |
| [language.org.ai](/.org.ai/language.org.ai) | Natural language | Adverb, Conjunction, Determiner, Preposition, Pronoun |

### Work & Occupations (ONET)

| Domain | Description | Types |
|--------|-------------|-------|
| [onet.org.ai](/.org.ai/onet.org.ai) | O*NET occupational data | Occupation, WorkActivity, WorkContext, WorkStyle, WorkValue, Tool, Technology |
| [occupations.org.ai](/.org.ai/occupations.org.ai) | Occupations | Occupation |
| [jobs.org.ai](/.org.ai/jobs.org.ai) | Job titles | Job |
| [skills.org.ai](/.org.ai/skills.org.ai) | Skills | Skill |
| [abilities.org.ai](/.org.ai/abilities.org.ai) | Abilities | Ability |
| [knowledge.org.ai](/.org.ai/knowledge.org.ai) | Knowledge domains | Knowledge |
| [tasks.org.ai](/.org.ai/tasks.org.ai) | Tasks | Task |

### Business & Industry

| Domain | Description | Types |
|--------|-------------|-------|
| [business.org.ai](/.org.ai/business.org.ai) | Business entities | BusinessType, Department, LegalStructure, RevenueModel, BusinessProcess |
| [naics.org.ai](/.org.ai/naics.org.ai) | Industry classification | Industry |
| [industries.org.ai](/.org.ai/industries.org.ai) | Industries | Industry |
| [apqc.org.ai](/.org.ai/apqc.org.ai) | Process framework | Process |

### Products & Services

| Domain | Description | Types |
|--------|-------------|-------|
| [products.org.ai](/.org.ai/products.org.ai) | Products (UNSPSC/GPC) | Product |
| [services.org.ai](/.org.ai/services.org.ai) | Services (NAPCS) | Service, ServiceClass, ServiceGroup |
| [standards.org.ai](/.org.ai/standards.org.ai) | Standards reference | Standard |
| [gs1.org.ai](/.org.ai/gs1.org.ai) | GS1 product codes | Product |

### Technology & AI

| Domain | Description | Types |
|--------|-------------|-------|
| [tech.org.ai](/.org.ai/tech.org.ai) | Technology | Developer Tools, Devices, IoT |
| [models.org.ai](/.org.ai/models.org.ai) | AI/ML models | AIModel |
| [agents.org.ai](/.org.ai/agents.org.ai) | AI agents | Agent |
| [apps.org.ai](/.org.ai/apps.org.ai) | Applications | App, Category |
| [integrations.org.ai](/.org.ai/integrations.org.ai) | Integration services | Integration, App |

### Actions & Events

| Domain | Description | Types |
|--------|-------------|-------|
| [actions.org.ai](/.org.ai/actions.org.ai) | Actions (verb.Noun) | Action |
| [events.org.ai](/.org.ai/events.org.ai) | Events (Noun.verbed) | Event |
| [activities.org.ai](/.org.ai/activities.org.ai) | Activities | Activity |

### Geography & Places

| Domain | Description | Types |
|--------|-------------|-------|
| [places.org.ai](/.org.ai/places.org.ai) | Geographic locations | Country, State |

### Education

| Domain | Description | Types |
|--------|-------------|-------|
| [education.org.ai](/.org.ai/education.org.ai) | Education programs | Career, EducationProgram |

## Data Sources

| Source | Description | Domain |
|--------|-------------|--------|
| O*NET | Occupational Information Network | onet.org.ai |
| NAICS | North American Industry Classification | naics.org.ai |
| NAPCS | North American Product Classification | services.org.ai |
| UNSPSC | UN Standard Products and Services Code | products.org.ai |
| GS1/GPC | Global Product Classification | gs1.org.ai |
| APQC PCF | Process Classification Framework | apqc.org.ai |
| Schema.org | Web schema types | schema.org.ai |
| GeoNames | Geographic database | places.org.ai |

## Type System

All entities follow a consistent structure:

```typescript
interface Entity {
  '@type': string          // Type name (e.g., 'Occupation')
  '@id': string            // Full URL (e.g., 'https://onet.org.ai/Occupation/SoftwareEngineer')
  name: string             // Human-readable name
  description?: string     // Description
  code?: string            // Standard code (e.g., SOC code)
  sameAs?: string          // Cross-reference to standard
}
```

## URL Structure

Entity URLs follow the pattern:
```
https://{domain}/{Type}/{Identifier}
```

Examples:
- `https://onet.org.ai/Occupation/Software_Developer`
- `https://products.org.ai/Product/43201601`
- `https://models.org.ai/AIModel/Claude35Sonnet`

## Cross-References

Entities link to standards via `sameAs`:

```typescript
// products.org.ai entity
{
  "@type": "Product",
  "@id": "https://products.org.ai/Product/43201601",
  "name": "Desktop Computer",
  "sameAs": "https://standards.org.ai/unspsc/43201601"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add domain documentation in `.org.ai/{domain}/`
4. Update data processing in `.scripts/`
5. Submit a pull request

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Data derived from public standards (ONET, NAICS, etc.) retains original licensing.

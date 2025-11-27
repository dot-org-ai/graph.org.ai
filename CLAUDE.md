# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Data pipeline (run from root)
pnpm ingest          # Download raw data from external sources to .source/
pnpm generate        # Generate normalized TSV files in .data/
pnpm ingest-db       # Load data into database (SQLite or ClickHouse)
pnpm export          # Export data from ClickHouse to TSV
pnpm enrich          # Add digital scores to entity files

# Run scripts directly (from .scripts/)
tsx ingest.ts
tsx generate-data.ts
tsx ingest-db.ts sqlite      # Build to SQLite
tsx ingest-db.ts clickhouse  # Build to ClickHouse
tsx build-all.ts             # Full pipeline

# Turbo commands
pnpm dev             # Start development
pnpm build           # Build all packages
pnpm lint            # Lint all packages
pnpm type-check      # Type check all packages

# Testing
pnpm test            # Run vitest
pnpm test:watch      # Watch mode
```

## Architecture

### Data Pipeline

```
External APIs → .source/ (raw TSV) → .data/ (normalized TSV) → Database (SQLite/ClickHouse)
```

1. **Ingest** (`.scripts/ingest.ts`): Downloads from O*NET, NAICS, UNSPSC, Schema.org into `.source/`
2. **Generate** (`.scripts/generate-data.ts`): Transforms to normalized TSV in `.data/`
3. **Database** (`.scripts/ingest-db.ts`): Loads into SQLite (dev) or ClickHouse (prod)

### Entity URL Pattern

```
https://{domain}/{Type}/{Identifier}
```
Examples: `https://onet.org.ai/Occupation/Software_Developer`, `https://models.org.ai/AIModel/Claude35Sonnet`

### Key Directories

- `.org.ai/` - 109 domain ontologies with README.md and [Type].mdx templates
- `.source/` - Raw TSV from external sources
- `.data/` - Normalized TSV with columns: `url`, `ns`, `type`, `id`, `name`, `description`, `code`
- `.enrichment/` - Mapping files (domain-ontology.tsv maps types to canonical domains)
- `.scripts/` - Data processing scripts (tsx)
- `.mdxdb/` - Database engine with Drizzle schema for SQLite/ClickHouse

### Storage Backends

- **SQLite** (`.mdxdb/source.db`): Local development
- **ClickHouse** (`mdxdb` database): Production with vector search

Schema in `.mdxdb/schema.ts`: `things`, `relationships`, `searches` tables

### Namespace Ownership

Only use domains we own. For external standards, use primary domain with `sameAs` link:
- Products: `products.org.ai` with `sameAs: standards.org.ai/unspsc/{code}`
- Services: `services.org.ai` with `sameAs: standards.org.ai/napcs/{code}`
- AI Models: `models.org.ai` (not `ai.org.ai`)
- Work Activities: `activities.org.ai` with `sameAs: onet.org.ai/WorkActivities/{code}`
- Work Context: `context.org.ai` with `sameAs: onet.org.ai/WorkContexts/{code}`

**Domain naming rules:**
- We don't own compound domains like `WorkActivities.org.ai` - use simple names like `activities.org.ai`
- If subdomains are needed, use dot notation: `Work.Activities.org.ai`
- Standard-specific codes go in subdirectories: `onet.org.ai/WorkActivities/`, `standards.org.ai/napcs/`

---

## Domain Ontology

.org.ai is an ontology of Language: Nouns, Verbs, People, Places, Things, Ideas, and Semantics.

### Graph.org.ai

- Language.org.ai
  - Nouns.org.ai subclass of `rdfs:Class` and `schema.org/Class` that adds `digital` to base `Properties`, and adds `actions` and `events`
  - Verbs.org.ai connects `action` (create), `actor` (creator), `act` (creates), `activity` (creating), `result` (creation), `event` (created), `inverse` (delete, destroy)
  - Semantics.org.ai establishes rules and patterns around `Subject.predicate.Object` statements with optional `.preposition.Object` and other modifiers and control flow (`.if`/`.while`/`forEach`)
- Standards.org.ai
  - Schema.org.ai
  - ONET.org.ai
  - SOC.org.ai
  - GS1.org.ai
  - APQC.org.ai
  - NAICS.org.ai
  - Wikipedia.org.ai
- People.org.ai
- Places.org.ai
- Things.org.ai
- Ideas.org.ai
- Agents.org.ai
  - Triggers.org.ai
  - Searches.org.ai
  - Actions.org.ai
  - Tools.org.ai
  - MCP.org.ai
  - AGENTS.md.org.ai
  - TODO.md.org.ai
- Physical.org.ai
- Digital.org.ai
- Products.org.ai
- Services.org.ai
- Business.org.ai
- Industries.org.ai
- Occupations.org.ai
- Code.org.ai
  - MDX.org.ai
- APIs.org.ai
- Apps.org.ai

### Schema.org.ai

Schema.org.ai is an AI-optimized extension of Schema.org with a new `digital` property on the base `Thing` (`1.0` is purely digital, `0.0` is purely physical, something in between is hybrid, and null means it could be either digital or physical), and a variety of new classes, including Noun, Verb, Agent, Tool, LandingPage, etc.

### MDX.org.ai

MDX.org.ai is a URL-based file format optimized for both AI Agents & Humans:
- Structured Data (YAML-LD)
- Unstructured Content (Markdown)
- Executable Code (JS/TS ES Modules)
- UI Components (JSX/React)

```mdx
---
$id: https://example.com
$type: https://mdx.org.ai/Site
title: Example Domain
description: This domain is for use in illustrative examples in documents
---

# {title}

{description}. You may use this domain in literature without prior coordination or asking for permission.

[More information...](https://www.iana.org/domains/example)
```

#### MDXLD Properties

- `$id` - unique identifier for the MDXLD document (URL or requires `$context`)
- `$type` - reference to the Noun (`rdfs:Class`) that this Thing is an instance of
- `$context` - base URL for `$id` and `$type` if not URLs
- `code` - `import` and `export` statements for ES Module
- `component` - JSX function of the MDX file
- `data` - rest of YAML frontmatter
- `content` - Markdown content

#### MDX Packages

- `mdxld` - `parse`, `stringify`, `validate` with flat/expanded shapes, `relationships` extraction
- `mdxai` - CLI for `forEach`, `generate`, `enrich`, `edit`
- `mdxdb` - Graph of MDX documents (`Things` + `Relationships`) with `list`, `search`, `get`, `set`, `delete`
  - `@mdxdb/fs`, `@mdxdb/api`, `@mdxdb/sqlite`, `@mdxdb/postgres`, `@mdxdb/mongodb`, `@mdxdb/clickhouse`
- `mdxui` - `@mdxui/markdown`, `@mdxui/json`, `@mdxui/slack`

When encountering bugs in mdx* packages, create a unit test to reproduce the bug, then fix it.

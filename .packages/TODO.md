# Project Plan: MDX-based Data System

## Phase 1: Ontology Design & Fixtures
- [x] **Core Domains**: Industries, Occupations, Tasks, Tech, Tools, Products, Services, Processes.
- [x] **Standards**: GS1, Schema.org templates.
- [x] **Integrations**: Templates for Apps and Services.

## Phase 2: Infrastructure
- [x] **Packages**: `mdxld`, `mdxdb` (with dotenv, mcp), `@mdxui/markdown`, `mdxai`.
- [x] **CLI**: `mdxdb ingest`, `watch`, `mcp`.
- [x] **Rendering**: Markdown output with preserved component tags.

## Phase 3: Data Ingestion
- [x] **Occupations**: 1,016 items.
- [x] **Tasks**: 18,797 items.
- [x] **Tech**: 8,728 items.
- [x] **Tools**: 4,127 items.
- [x] **Products**: 745 items.
- [x] **Services**: 45 items.
- [ ] **Integrations**: Pending `INTEGRATIONS_URL` environment variable setup and execution.

## Phase 4: Future Work
- [ ] **Relationship Linking**: Implement reverse updates or graph linking logic in `mdxdb`.
- [ ] **AI Curation**: Use `mdxai` to generate descriptions or missing data.
- [ ] **App Development**: Build a frontend using `mdxdb` MCP or direct access.
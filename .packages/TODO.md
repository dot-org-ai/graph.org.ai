# Project Plan: MDX-based Data System

## Phase 1: Core Infrastructure
- [x] **`mdxld`**: Core MDX-LD parsing/stringify/validation.
- [x] **`@mdxui/markdown`**: MDX renderer.
- [x] **`mdxdb`**:
    - [x] Filesystem adapter.
    - [x] CLI (watch, ingest).
    - [ ] **MCP Server**: Add stdio-based Model Context Protocol server.
- [x] **`mdxai`**: AI enrichment CLI.

## Phase 2: Data Ingestion Strategy
### Layer 1: Raw Standards Ingestion
Ingest data "as-is" (or lightly normalized) into provider-specific namespaces.
- [ ] **Standards.org.ai/ONET** (was Occupations.org.ai directly)
- [ ] **Standards.org.ai/NAICS**
- [ ] **Standards.org.ai/UNSPSC**
- [ ] **Standards.org.ai/GS1**
- [ ] **Standards.org.ai/Schema.org**

### Layer 2: Canonical Ontology & Curation
Aggregate and transform raw data into the primary graph.
- [ ] **Verbs/Actions Engine**:
    - Aggregation from ONET, GS1, Schema, APQC.
    - NLP Conjugation (Action/Activity/Event).
- [ ] **Occupations**: Aggregated from ONET + others.
- [ ] **Industries**: Aggregated from NAICS.

## Phase 3: Implementation Steps
1.  **MCP Server**: Enable LLM tools to query `mdxdb` directly.
2.  **Refactor Folders**: Move current `Occupations.org.ai` etc. to `Standards.org.ai/...`.
3.  **Raw Ingestion Templates**: Create templates for raw loading.
4.  **Transformation Scripts**: Implement `mdxdb generate` scripts for the Cartesian products and aggregation.
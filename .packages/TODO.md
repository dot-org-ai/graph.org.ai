# Project Plan: MDX-based Data System

## Phase 1: Ontology Design & Fixtures
Create the structure and example `.mdx` files for the core domains. These files will serve as the design specification and test fixtures for the software packages.

- [x] **Industries.org.ai** (NAICS)
    - [x] `[Sector].mdx`
- [x] **Occupations.org.ai** (O*NET)
    - [x] `[Occupation].mdx`
- [x] **Tasks.org.ai** (O*NET)
    - [x] `[Task].mdx`
- [x] **Processes.org.ai** (APQC)
    - [x] `[Process].mdx`
- [x] **Products.org.ai** (UNSPSC)
    - [x] `[Product].mdx`
- [x] **Services.org.ai** (UNSPSC)
    - [x] `[Service].mdx`
- [x] **Activities.org.ai** (O*NET)
    - [x] `[Activity].mdx`
- [x] **Tech.org.ai** (O*NET)
    - [x] `[Tech].mdx`
- [x] **Tools.org.ai** (O*NET)
    - [x] `[Tool].mdx`
- [ ] **GS1 Standards** (CBV/EPCIS + IDs)
    - [ ] Define templates for Events and ID types (GTIN, GLN, SSCC, etc.).
- [ ] **Schema.org**
    - [ ] Define `[Type].mdx` and `[Property].mdx`.

## Phase 2: Package Implementation & Testing

### Global Config
- [ ] **Style**: Configure Prettier (no semicolons).

### 1. `mdxld`
- [x] Core logic (parse, stringify, validate)
- [ ] **Tests**: Fix regex for frontmatter parsing, ensure tests pass non-interactively.

### 2. `@mdxui/markdown`
- [ ] **Implementation**: Render MDX components to Markdown.
- [ ] **Tests**: Verify `<Tasks occupation={...} />` renders to `## Tasks` + Table using the fixtures.

### 3. `mdxdb`
- [ ] **Interface Updates**:
    - `list(globPattern)`
    - `search(query)` (grep/mongo-style)
    - `get(id)`
    - `set(id, data)`
    - `delete(id)`
- [ ] **Implementation**: Filesystem adapter, Relationship management.
- [ ] **Tests**: 
    - Load the Ontology folders as Collections.
    - Test CRUD operations.
    - Verify bidirectional updates between Occupations and Tasks.

### 4. `mdxai`
- [ ] **Implementation**: CLI for generation/enrichment.
- [ ] **Tests**: 
    - `mdxai enrich` using `CSV.fetch` from O*NET URLs defined in the fixtures.

## Phase 3: Data Ingestion
- [ ] Populate the Ontology folders with actual data (O*NET, NAICS, etc.) using `mdxai`.

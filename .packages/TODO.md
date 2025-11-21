# Project Plan: MDX-based Data System

## Overview
This project involves creating a suite of TypeScript packages to manage, render, and enrich MDX-based data with JSON-LD/YAML-LD semantics.

## Packages

### 1. `mdxld`
- **Purpose**: Handle MDX + JSON-LD/YAML-LD parsing, stringification, and validation.
- **Key Features**:
  - Supports valid variable names for LD keys: `$id`, `$type`, `$context`.
  - **Functions**: `parse`, `stringify`, `validate`.
  - **Shapes**:
    - **Flat**: Uses `$id`, `$type`, `$context`, `$code`, `$content` mixed into the data object.
    - **Expanded**: Uses `id`, `type`, `context`, `code`, `content` as distinct properties.

### 2. `@mdxui/markdown`
- **Purpose**: Render/evaluate MDX content specifically into Markdown format.
- **Key Features**:
  - Evaluates MDX components.
  - Outputs clean Markdown.

### 3. `mdxdb` (Core & Interfaces)
- **Purpose**: Expose local `.md` and `.mdx` files as a database (Collections & Documents).
- **Key Features**:
  - **Schema Definition**: MDX files describe their own data shape and relationships.
  - **Relationship Management**: 
    - Renders relationships as components (e.g., `<Tasks occupation={name} />` renders `## Tasks` + Table).
    - Bidirectional updates (e.g., updating a Task's occupations updates the Occupation's tasks).
  - **API**: `db.Collection.create()`, `db.Collection.update()`, etc.

### 4. `mdxdb/fs`
- **Purpose**: Filesystem adapter/implementation for `mdxdb`.
- **Key Features**:
  - Reads/Writes to local file system.
  - Handles file parsing via `mdxld`.

### 5. `mdxai`
- **Purpose**: AI-driven content generation and data enrichment.
- **Key Features**:
  - **CLI Commands**:
    - `mdxai generate`: Create new content.
    - `mdxai enrich`: Enhance existing data.
  - **Integration**: Uses `mdxdb` for data access and `mdxld` for validation.
  - **Data Sourcing**:
    - Supports fetching external data in MDX (e.g., `export const items = CSV.fetch(...)`).
    - Integrates `lodash-es` and `PapaParse` into the MDX evaluation scope for data manipulation.

## Implementation Steps

- [ ] **Setup**: Initialize `.packages` structure and workspace configuration.
- [ ] **mdxld**: Implement parsing/stringifying logic and type definitions.
- [ ] **@mdxui/markdown**: Implement MDX to Markdown rendering logic.
- [ ] **mdxdb**: Define core interfaces and relationship logic.
- [ ] **mdxdb/fs**: Implement filesystem IO and integration with `mdxld`.
- [ ] **mdxai**: Build CLI tool and integrate AI generation/enrichment logic.
- [ ] **Integration**: Wire up global context (Lodash, PapaParse) for MDX evaluation.

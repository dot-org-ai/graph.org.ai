# .org.ai

.org.ai is an ontology of Language: Nouns, Verbs, People, Places, Things, Ideas, and Semantics.

## Graph.org.ai

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

## Language.org.ai


## Schema.org.ai

Schema.org.ai is an AI-optimized extension of Schema.org with a new `digital` property on the base `Thing` ( `1.0` is purely digital, `0.0` is purely physical, something in between is hybrid, and null means it could be either digital or physical), and a variety of new classes, including Noun, Verb, Agent, Tool, LandingPage, etc.


## MDX.org.ai

MDX.org.ai is all about creating a new URL-based file format optimized for both AI Agents & Humans: 
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
 
{description}. You may use this
domain in literature without prior coordination or asking for permission.
 
[More information...](https://www.iana.org/domains/example)
```

### Properties

- `$id` is the unique identifier for the MDXLD document. If it is not a URL then `$context` is required.
- `$type` is the reference to the Noun (i.e. `rfds:Class`) that this Thing (i.e. `rdfs:Resource`) is an instance of. If it is not a URL then `$context` is required.
- `$context` provides the base URL for `$id` and `$type` if those are not URLs, and can also provide additional context to both Humans and Agents about the document.
- `code` contains the `import` and `export` statements that in addition to the default export (i.e. the `component`) make up the ES Module for this document.
- `component` is the JSX function of the MDX file itself, that evaluates code like `{name}` or `{1+2}` or `<Hero headline='Simplify your development process'>`
- `data` is the rest of the YAML frontmatter
- `content` is the Markdown content

### Components

In MDXLD, every `$type` can be a JSX component, like:

- `<Business/>`
- `<App/>`
- `<API/>`

### MDX Packages:
- `mdxld` provides `parse`, `stringify`, `validate` with flat and expanded shapes, `relationships` extraction, and optional `ast` support
- `mdxai` provides exports and a CLI for `forEach`, `generate`, `enrich`, `edit`, 
- `mdxdb` is a Graph of MDX documents (`Things` + `Relationships`) with functions, CLI, and MCP to `list` (glob), `search` (grep), `get`, `set`, `delete` based on URLs not files
  - `@mdxdb/fs` requires Node and manages the mismatch between file systems and URLs by unifying the `/PathName` path with both the `/PathName/` folder and `/PathName.mdx` file
  - `@mdxdb/api` exposes a REST & RPC (Websockets with HTTP fallback) API for an backing store (database or fs) that runs on Node or Edge Workers
  - `@mdxdb/sqlite` 
  - `@mdxdb/postgres` 
  - `@mdxdb/mongodb` 
  - `@mdxdb/clickhouse` 
- `mdxe`
- `mdxui`   
  - `@mdxui/markdown` 
  - `@mdxui/json` 
  - `@mdxui/slack` 

- anytime you come across a bug in the one of the mdx* packages, you should create a unit test to repro the bug and then fix it
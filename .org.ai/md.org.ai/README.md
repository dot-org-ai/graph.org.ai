---
$id: https://md.org.ai
$context: https://md.org.ai
name: md.org.ai
parent: markdown.org.ai
license: CC-BY-SA-4.0
---

# md.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Standard Markdown file format conventions and specifications.

## Overview

This repository contains MDX documentation for md.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [markdown.org.ai](https://markdown.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [markdown.org.ai](https://markdown.org.ai)
                └── **md.org.ai**

## Types

- [`MarkdownFile`](https://md.org.ai/MarkdownFile)

## Properties

- [`frontmatter`](https://md.org.ai/frontmatter)
- [`content`](https://md.org.ai/content)

## Structure

```
md.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [MarkdownFile].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { MarkdownFile, things } from 'md.org.ai'
```

### Use in MDX

```mdx
---
$type: https://md.org.ai/MarkdownFile
name: Example
---

# Example MarkdownFile
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

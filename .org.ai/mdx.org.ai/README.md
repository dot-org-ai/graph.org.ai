---
$id: https://mdx.org.ai
$context: https://mdx.org.ai
name: mdx.org.ai
parent: markdown.org.ai
license: CC-BY-SA-4.0
---

# mdx.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

MDXLD standard: YAML-LD embedded in MDX for structured data + content + code + UI.

## Overview

This repository contains MDX documentation for mdx.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [markdown.org.ai](https://markdown.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [markdown.org.ai](https://markdown.org.ai)
                └── **mdx.org.ai**

## Types

- [`MDXLD`](https://mdx.org.ai/MDXLD)

## Structure

```
mdx.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [MDXLD].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { MDXLD, things } from 'mdx.org.ai'
```

### Use in MDX

```mdx
---
$type: https://mdx.org.ai/MDXLD
name: Example
---

# Example MDXLD
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

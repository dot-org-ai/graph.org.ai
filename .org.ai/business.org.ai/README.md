---
$id: https://business.org.ai
$context: https://business.org.ai
name: business.org.ai
parent: things.org.ai
license: CC-BY-SA-4.0
---

# business.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Commercial entities and concepts.

## Overview

This repository contains MDX documentation for business.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [schema.org.ai/Business](https://schema.org.ai/Business)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── **business.org.ai**

## Types

- [`Business`](https://business.org.ai/Business)

## Structure

```
business.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Business].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Business, things } from 'business.org.ai'
```

### Use in MDX

```mdx
---
$type: https://business.org.ai/Business
name: Example
---

# Example Business
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---
$id: https://companies.org.ai
$context: https://companies.org.ai
name: companies.org.ai
parent: business.org.ai
license: CC-BY-SA-4.0
---

# companies.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Registered corporate entities.

## Overview

This repository contains MDX documentation for companies.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai) > [schema.org.ai/Organization](https://schema.org.ai/Organization)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [business.org.ai](https://business.org.ai)
                └── **companies.org.ai**

## Types

- [`Company`](https://companies.org.ai/Company)
- [`Corporation`](https://companies.org.ai/Corporation)

## Structure

```
companies.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Company].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Company, Corporation, things } from 'companies.org.ai'
```

### Use in MDX

```mdx
---
$type: https://companies.org.ai/Company
name: Example
---

# Example Company
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---
$id: https://vc.org.ai
$context: https://vc.org.ai
name: vc.org.ai
parent: finance.org.ai
license: CC-BY-SA-4.0
---

# vc.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Venture Capital.

## Overview

This repository contains MDX documentation for vc.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai) > [finance.org.ai](https://finance.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [business.org.ai](https://business.org.ai)
                └── [finance.org.ai](https://finance.org.ai)
                    └── **vc.org.ai**

## Types

- [`Investment`](https://vc.org.ai/Investment)

## Structure

```
vc.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Investment].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Investment, things } from 'vc.org.ai'
```

### Use in MDX

```mdx
---
$type: https://vc.org.ai/Investment
name: Example
---

# Example Investment
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

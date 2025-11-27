---
$id: https://tech.org.ai
$context: https://tech.org.ai
name: tech.org.ai
parent: things.org.ai
license: CC-BY-SA-4.0
---

# tech.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Technology stacks and software.

## Overview

This repository contains MDX documentation for tech.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [schema.org.ai/Technology](https://schema.org.ai/Technology)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── **tech.org.ai**

## Types

- [`Technology`](https://tech.org.ai/Technology)
- [`Stack`](https://tech.org.ai/Stack)

## Structure

```
tech.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Technology].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Technology, Stack, things } from 'tech.org.ai'
```

### Use in MDX

```mdx
---
$type: https://tech.org.ai/Technology
name: Example
---

# Example Technology
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

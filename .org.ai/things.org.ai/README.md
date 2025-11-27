---
$id: https://things.org.ai
$context: https://things.org.ai
name: things.org.ai
parent: schema.org.ai
license: CC-BY-SA-4.0
---

# things.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

The most generic type of item.

## Overview

This repository contains MDX documentation for things.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [schema.org.ai/Thing](https://schema.org.ai/Thing)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── **things.org.ai**

## Types

- [`Thing`](https://things.org.ai/Thing)

## Structure

```
things.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Thing].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Thing, things } from 'things.org.ai'
```

### Use in MDX

```mdx
---
$type: https://things.org.ai/Thing
name: Example
---

# Example Thing
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

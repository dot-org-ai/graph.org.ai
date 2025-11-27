---
$id: https://places.org.ai
$context: https://places.org.ai
name: places.org.ai
parent: things.org.ai
license: CC-BY-SA-4.0
---

# places.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Entities that have a somewhat fixed, physical extension. Includes GeoNames data.

## Overview

This repository contains MDX documentation for places.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [schema.org.ai/Place](https://schema.org.ai/Place)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── **places.org.ai**

## Types

- [`Place`](https://places.org.ai/Place)
- [`Location`](https://places.org.ai/Location)

## Structure

```
places.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Place].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Place, Location, things } from 'places.org.ai'
```

### Use in MDX

```mdx
---
$type: https://places.org.ai/Place
name: Example
---

# Example Place
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

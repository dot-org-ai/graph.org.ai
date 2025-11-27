---
$id: https://vehicles.org.ai
$context: https://vehicles.org.ai
name: vehicles.org.ai
parent: tools.org.ai
license: CC-BY-SA-4.0
---

# vehicles.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for vehicles.

## Overview

This repository contains MDX documentation for vehicles.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [tools.org.ai](https://tools.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [tools.org.ai](https://tools.org.ai)
                └── **vehicles.org.ai**

## Structure

```
vehicles.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Vehicles].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Vehicles, things } from 'vehicles.org.ai'
```

### Use in MDX

```mdx
---
$type: https://vehicles.org.ai/Vehicles
name: Example
---

# Example Vehicles
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---
$id: https://units.org.ai
$context: https://units.org.ai
name: units.org.ai
parent: things.org.ai
license: CC-BY-SA-4.0
---

# units.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for units.

## Overview

This repository contains MDX documentation for units.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── **units.org.ai**

## Structure

```
units.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Units].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Units, things } from 'units.org.ai'
```

### Use in MDX

```mdx
---
$type: https://units.org.ai/Units
name: Example
---

# Example Units
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

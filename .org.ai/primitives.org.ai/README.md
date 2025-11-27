---
$id: https://primitives.org.ai
$context: https://primitives.org.ai
name: primitives.org.ai
parent: graph.org.ai
license: CC-BY-SA-4.0
---

# primitives.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for primitives.

## Overview

This repository contains MDX documentation for primitives.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── **primitives.org.ai**

## Structure

```
primitives.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Primitives].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Primitives, things } from 'primitives.org.ai'
```

### Use in MDX

```mdx
---
$type: https://primitives.org.ai/Primitives
name: Example
---

# Example Primitives
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

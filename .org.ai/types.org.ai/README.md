---
$id: https://types.org.ai
$context: https://types.org.ai
name: types.org.ai
parent: schema.org.ai
license: CC-BY-SA-4.0
---

# types.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Global type definitions.

## Overview

This repository contains MDX documentation for types.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── **types.org.ai**

## Structure

```
types.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Types].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Types, things } from 'types.org.ai'
```

### Use in MDX

```mdx
---
$type: https://types.org.ai/Types
name: Example
---

# Example Types
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

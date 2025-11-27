---
$id: https://enterprises.org.ai
$context: https://enterprises.org.ai
name: enterprises.org.ai
parent: business.org.ai
license: CC-BY-SA-4.0
---

# enterprises.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for enterprises.

## Overview

This repository contains MDX documentation for enterprises.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [business.org.ai](https://business.org.ai)
                └── **enterprises.org.ai**

## Structure

```
enterprises.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Enterprises].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Enterprises, things } from 'enterprises.org.ai'
```

### Use in MDX

```mdx
---
$type: https://enterprises.org.ai/Enterprises
name: Example
---

# Example Enterprises
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

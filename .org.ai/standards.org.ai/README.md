---
$id: https://standards.org.ai
$context: https://standards.org.ai
name: standards.org.ai
parent: knowledge.org.ai
license: CC-BY-SA-4.0
---

# standards.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

International standards and classification systems not owned by platform.

## Overview

This repository contains MDX documentation for standards.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── **standards.org.ai**

## Structure

```
standards.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Standards].mdx     # Type template
├── napcs/              # NAPCS service classification codes
│   └── README.md
├── unspsc/             # UNSPSC product classification codes
│   └── README.md
└── ...
```

## Subdirectories

| Standard | Description | Primary Domain |
|----------|-------------|----------------|
| [napcs/](./napcs/) | North American Product Classification System | [services.org.ai](https://services.org.ai) |
| [unspsc/](./unspsc/) | United Nations Standard Products and Services Code | [products.org.ai](https://products.org.ai) |

These subdirectories contain reference data for international standards. The primary ontologies live in their respective domains, with `sameAs` links pointing to these standard codes.

## Usage

### Import as NPM Package

```typescript
import { Standards, things } from 'standards.org.ai'
```

### Use in MDX

```mdx
---
$type: https://standards.org.ai/Standards
name: Example
---

# Example Standards
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

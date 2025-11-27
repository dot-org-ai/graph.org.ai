---
$id: https://materials.org.ai
$context: https://materials.org.ai
name: materials.org.ai
parent: science.org.ai
license: CC-BY-SA-4.0
---

# materials.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for materials.

## Overview

This repository contains MDX documentation for materials.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai) > [science.org.ai](https://science.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── [science.org.ai](https://science.org.ai)
                    └── **materials.org.ai**

## Structure

```
materials.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Materials].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Materials, things } from 'materials.org.ai'
```

### Use in MDX

```mdx
---
$type: https://materials.org.ai/Materials
name: Example
---

# Example Materials
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

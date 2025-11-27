---
$id: https://genes.org.ai
$context: https://genes.org.ai
name: genes.org.ai
parent: science.org.ai
license: CC-BY-SA-4.0
---

# genes.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for genes.

## Overview

This repository contains MDX documentation for genes.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai) > [science.org.ai](https://science.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── [science.org.ai](https://science.org.ai)
                    └── **genes.org.ai**

## Structure

```
genes.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Genes].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Genes, things } from 'genes.org.ai'
```

### Use in MDX

```mdx
---
$type: https://genes.org.ai/Genes
name: Example
---

# Example Genes
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

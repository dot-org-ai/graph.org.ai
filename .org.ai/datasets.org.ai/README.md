---
$id: https://datasets.org.ai
$context: https://datasets.org.ai
name: datasets.org.ai
parent: knowledge.org.ai
license: CC-BY-SA-4.0
---

# datasets.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Structured collections of data.

## Overview

This repository contains MDX documentation for datasets.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai) > [schema.org.ai/Dataset](https://schema.org.ai/Dataset)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── **datasets.org.ai**

## Types

- [`Dataset`](https://datasets.org.ai/Dataset)

## Structure

```
datasets.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Dataset].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Dataset, things } from 'datasets.org.ai'
```

### Use in MDX

```mdx
---
$type: https://datasets.org.ai/Dataset
name: Example
---

# Example Dataset
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

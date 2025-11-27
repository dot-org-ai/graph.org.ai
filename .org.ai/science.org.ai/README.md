---
$id: https://science.org.ai
$context: https://science.org.ai
name: science.org.ai
parent: knowledge.org.ai
license: CC-BY-SA-4.0
---

# science.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Systematic enterprise that builds and organizes knowledge.

## Overview

This repository contains MDX documentation for science.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai) > [schema.org.ai/Science](https://schema.org.ai/Science)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── **science.org.ai**

## Types

- [`Science`](https://science.org.ai/Science)

## Structure

```
science.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Science].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Science, things } from 'science.org.ai'
```

### Use in MDX

```mdx
---
$type: https://science.org.ai/Science
name: Example
---

# Example Science
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

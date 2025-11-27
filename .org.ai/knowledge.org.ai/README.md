---
$id: https://knowledge.org.ai
$context: https://knowledge.org.ai
name: knowledge.org.ai
parent: things.org.ai
license: CC-BY-SA-4.0
---

# knowledge.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Abstract information and concepts.

## Overview

This repository contains MDX documentation for knowledge.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [schema.org.ai/Knowledge](https://schema.org.ai/Knowledge)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── **knowledge.org.ai**

## Types

- [`Knowledge`](https://knowledge.org.ai/Knowledge)

## Structure

```
knowledge.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Knowledge].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Knowledge, things } from 'knowledge.org.ai'
```

### Use in MDX

```mdx
---
$type: https://knowledge.org.ai/Knowledge
name: Example
---

# Example Knowledge
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

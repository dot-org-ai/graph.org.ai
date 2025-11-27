---
$id: https://ideas.org.ai
$context: https://ideas.org.ai
name: ideas.org.ai
parent: knowledge.org.ai
license: CC-BY-SA-4.0
---

# ideas.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for ideas.

## Overview

This repository contains MDX documentation for ideas.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── **ideas.org.ai**

## Structure

```
ideas.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Ideas].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Ideas, things } from 'ideas.org.ai'
```

### Use in MDX

```mdx
---
$type: https://ideas.org.ai/Ideas
name: Example
---

# Example Ideas
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---
$id: https://context.org.ai
$context: https://context.org.ai
name: context.org.ai
parent: agents.org.ai
license: CC-BY-SA-4.0
---

# context.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for context.

## Overview

This repository contains MDX documentation for context.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [nouns.org.ai](https://nouns.org.ai) > [agents.org.ai](https://agents.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [nouns.org.ai](https://nouns.org.ai)
            └── [agents.org.ai](https://agents.org.ai)
                └── **context.org.ai**

## Structure

```
context.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Context].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Context, things } from 'context.org.ai'
```

### Use in MDX

```mdx
---
$type: https://context.org.ai/Context
name: Example
---

# Example Context
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

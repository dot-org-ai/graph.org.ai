---
$id: https://triggers.org.ai
$context: https://triggers.org.ai
name: triggers.org.ai
parent: agents.org.ai
license: CC-BY-SA-4.0
---

# triggers.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for triggers.

## Overview

This repository contains MDX documentation for triggers.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [nouns.org.ai](https://nouns.org.ai) > [agents.org.ai](https://agents.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [nouns.org.ai](https://nouns.org.ai)
            └── [agents.org.ai](https://agents.org.ai)
                └── **triggers.org.ai**

## Structure

```
triggers.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Triggers].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Triggers, things } from 'triggers.org.ai'
```

### Use in MDX

```mdx
---
$type: https://triggers.org.ai/Triggers
name: Example
---

# Example Triggers
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

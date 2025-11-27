---
$id: https://actions.org.ai
$context: https://actions.org.ai
name: actions.org.ai
parent: verbs.org.ai
license: CC-BY-SA-4.0
---

# actions.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Something done by an agent.

## Overview

This repository contains MDX documentation for actions.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [verbs.org.ai](https://verbs.org.ai) > [schema.org.ai/Action](https://schema.org.ai/Action)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [verbs.org.ai](https://verbs.org.ai)
            └── **actions.org.ai**

## Types

- [`Action`](https://actions.org.ai/Action)

## Structure

```
actions.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Action].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Action, things } from 'actions.org.ai'
```

### Use in MDX

```mdx
---
$type: https://actions.org.ai/Action
name: Example
---

# Example Action
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

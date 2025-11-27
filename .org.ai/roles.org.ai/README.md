---
$id: https://roles.org.ai
$context: https://roles.org.ai
name: roles.org.ai
parent: agents.org.ai
license: CC-BY-SA-4.0
---

# roles.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Capabilities and functions assigned to agents.

## Overview

This repository contains MDX documentation for roles.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [nouns.org.ai](https://nouns.org.ai) > [agents.org.ai](https://agents.org.ai) > [schema.org.ai/Role](https://schema.org.ai/Role)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [nouns.org.ai](https://nouns.org.ai)
            └── [agents.org.ai](https://agents.org.ai)
                └── **roles.org.ai**

## Types

- [`Role`](https://roles.org.ai/Role)

## Structure

```
roles.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Role].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Role, things } from 'roles.org.ai'
```

### Use in MDX

```mdx
---
$type: https://roles.org.ai/Role
name: Example
---

# Example Role
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

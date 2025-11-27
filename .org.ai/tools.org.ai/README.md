---
$id: https://tools.org.ai
$context: https://tools.org.ai
name: tools.org.ai
parent: things.org.ai
license: CC-BY-SA-4.0
---

# tools.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Instruments used to perform actions.

## Overview

This repository contains MDX documentation for tools.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [schema.org.ai/Tool](https://schema.org.ai/Tool)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── **tools.org.ai**

## Types

- [`Tool`](https://tools.org.ai/Tool)

## Structure

```
tools.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Tool].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Tool, things } from 'tools.org.ai'
```

### Use in MDX

```mdx
---
$type: https://tools.org.ai/Tool
name: Example
---

# Example Tool
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

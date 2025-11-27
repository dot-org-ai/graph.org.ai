---
$id: https://soc.org.ai
$context: https://soc.org.ai
name: soc.org.ai
parent: knowledge.org.ai
license: CC-BY-SA-4.0
---

# soc.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Standard Occupational Classification.

## Overview

This repository contains MDX documentation for soc.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── **soc.org.ai**

## Enums

- [`SOCCode`](https://soc.org.ai/SOCCode)

## Structure

```
soc.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Soc].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Soc, things } from 'soc.org.ai'
```

### Use in MDX

```mdx
---
$type: https://soc.org.ai/Soc
name: Example
---

# Example Soc
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

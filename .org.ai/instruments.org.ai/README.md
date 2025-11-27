---
$id: https://instruments.org.ai
$context: https://instruments.org.ai
name: instruments.org.ai
parent: things.org.ai
license: CC-BY-SA-4.0
---

# instruments.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for instruments.

## Overview

This repository contains MDX documentation for instruments.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── **instruments.org.ai**

## Structure

```
instruments.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Instruments].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Instruments, things } from 'instruments.org.ai'
```

### Use in MDX

```mdx
---
$type: https://instruments.org.ai/Instruments
name: Example
---

# Example Instruments
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

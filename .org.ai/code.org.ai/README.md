---
$id: https://code.org.ai
$context: https://code.org.ai
name: code.org.ai
parent: tech.org.ai
license: CC-BY-SA-4.0
---

# code.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for code.

## Overview

This repository contains MDX documentation for code.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [tech.org.ai](https://tech.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [tech.org.ai](https://tech.org.ai)
                └── **code.org.ai**

## Structure

```
code.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Code].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Code, things } from 'code.org.ai'
```

### Use in MDX

```mdx
---
$type: https://code.org.ai/Code
name: Example
---

# Example Code
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---
$id: https://semantics.org.ai
$context: https://semantics.org.ai
name: semantics.org.ai
parent: language.org.ai
license: CC-BY-SA-4.0
---

# semantics.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for semantics.

## Overview

This repository contains MDX documentation for semantics.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [language.org.ai](https://language.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [language.org.ai](https://language.org.ai)
                └── **semantics.org.ai**

## Structure

```
semantics.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Semantics].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Semantics, things } from 'semantics.org.ai'
```

### Use in MDX

```mdx
---
$type: https://semantics.org.ai/Semantics
name: Example
---

# Example Semantics
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

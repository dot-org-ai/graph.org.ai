---
$id: https://law.org.ai
$context: https://law.org.ai
name: law.org.ai
parent: knowledge.org.ai
license: CC-BY-SA-4.0
---

# law.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Legal systems and legislation.

## Overview

This repository contains MDX documentation for law.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai) > [schema.org.ai/Legislation](https://schema.org.ai/Legislation)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── **law.org.ai**

## Types

- [`Legislation`](https://law.org.ai/Legislation)

## Structure

```
law.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Legislation].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Legislation, things } from 'law.org.ai'
```

### Use in MDX

```mdx
---
$type: https://law.org.ai/Legislation
name: Example
---

# Example Legislation
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

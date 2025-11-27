---
$id: https://gdpval.org.ai
$context: https://gdpval.org.ai
name: gdpval.org.ai
parent: agi.org.ai
license: CC-BY-SA-4.0
---

# gdpval.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for gdpval.

## Overview

This repository contains MDX documentation for gdpval.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [nouns.org.ai](https://nouns.org.ai) > [agents.org.ai](https://agents.org.ai) > [agi.org.ai](https://agi.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [nouns.org.ai](https://nouns.org.ai)
            └── [agents.org.ai](https://agents.org.ai)
                └── [agi.org.ai](https://agi.org.ai)
                    └── **gdpval.org.ai**

## Structure

```
gdpval.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Gdpval].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Gdpval, things } from 'gdpval.org.ai'
```

### Use in MDX

```mdx
---
$type: https://gdpval.org.ai/Gdpval
name: Example
---

# Example Gdpval
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

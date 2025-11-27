---
$id: https://contracts.org.ai
$context: https://contracts.org.ai
name: contracts.org.ai
parent: law.org.ai
license: CC-BY-SA-4.0
---

# contracts.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for contracts.

## Overview

This repository contains MDX documentation for contracts.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai) > [law.org.ai](https://law.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── [law.org.ai](https://law.org.ai)
                    └── **contracts.org.ai**

## Structure

```
contracts.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Contracts].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Contracts, things } from 'contracts.org.ai'
```

### Use in MDX

```mdx
---
$type: https://contracts.org.ai/Contracts
name: Example
---

# Example Contracts
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

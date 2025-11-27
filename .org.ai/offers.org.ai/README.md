---
$id: https://offers.org.ai
$context: https://offers.org.ai
name: offers.org.ai
parent: business.org.ai
license: CC-BY-SA-4.0
---

# offers.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for offers.

## Overview

This repository contains MDX documentation for offers.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [business.org.ai](https://business.org.ai)
                └── **offers.org.ai**

## Structure

```
offers.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Offers].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Offers, things } from 'offers.org.ai'
```

### Use in MDX

```mdx
---
$type: https://offers.org.ai/Offers
name: Example
---

# Example Offers
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

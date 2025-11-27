---
$id: https://design.org.ai
$context: https://design.org.ai
name: design.org.ai
parent: media.org.ai
license: CC-BY-SA-4.0
---

# design.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for design.

## Overview

This repository contains MDX documentation for design.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [media.org.ai](https://media.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [media.org.ai](https://media.org.ai)
                └── **design.org.ai**

## Structure

```
design.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Design].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Design, things } from 'design.org.ai'
```

### Use in MDX

```mdx
---
$type: https://design.org.ai/Design
name: Example
---

# Example Design
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

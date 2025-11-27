---
$id: https://engineering.org.ai
$context: https://engineering.org.ai
name: engineering.org.ai
parent: work.org.ai
license: CC-BY-SA-4.0
---

# engineering.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for engineering.

## Overview

This repository contains MDX documentation for engineering.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai) > [work.org.ai](https://work.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [business.org.ai](https://business.org.ai)
                └── [work.org.ai](https://work.org.ai)
                    └── **engineering.org.ai**

## Structure

```
engineering.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Engineering].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Engineering, things } from 'engineering.org.ai'
```

### Use in MDX

```mdx
---
$type: https://engineering.org.ai/Engineering
name: Example
---

# Example Engineering
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

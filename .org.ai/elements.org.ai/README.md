---
$id: https://elements.org.ai
$context: https://elements.org.ai
name: elements.org.ai
parent: science.org.ai
license: CC-BY-SA-4.0
---

# elements.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for elements.

## Overview

This repository contains MDX documentation for elements.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai) > [science.org.ai](https://science.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── [science.org.ai](https://science.org.ai)
                    └── **elements.org.ai**

## Structure

```
elements.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Elements].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Elements, things } from 'elements.org.ai'
```

### Use in MDX

```mdx
---
$type: https://elements.org.ai/Elements
name: Example
---

# Example Elements
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

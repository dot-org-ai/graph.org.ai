---
$id: https://wikipedia.org.ai
$context: https://wikipedia.org.ai
name: wikipedia.org.ai
parent: wiki.org.ai
license: CC-BY-SA-4.0
---

# wikipedia.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for wikipedia.

## Overview

This repository contains MDX documentation for wikipedia.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai) > [wiki.org.ai](https://wiki.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── [wiki.org.ai](https://wiki.org.ai)
                    └── **wikipedia.org.ai**

## Structure

```
wikipedia.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Wikipedia].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Wikipedia, things } from 'wikipedia.org.ai'
```

### Use in MDX

```mdx
---
$type: https://wikipedia.org.ai/Wikipedia
name: Example
---

# Example Wikipedia
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

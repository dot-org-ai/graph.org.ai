---
$id: https://wiki.org.ai
$context: https://wiki.org.ai
name: wiki.org.ai
parent: knowledge.org.ai
license: CC-BY-SA-4.0
---

# wiki.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for wiki.

## Overview

This repository contains MDX documentation for wiki.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── **wiki.org.ai**

## Structure

```
wiki.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Wiki].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Wiki, things } from 'wiki.org.ai'
```

### Use in MDX

```mdx
---
$type: https://wiki.org.ai/Wiki
name: Example
---

# Example Wiki
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---
$id: https://searches.org.ai
$context: https://searches.org.ai
name: searches.org.ai
parent: agents.org.ai
license: CC-BY-SA-4.0
---

# searches.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for searches.

## Overview

This repository contains MDX documentation for searches.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [nouns.org.ai](https://nouns.org.ai) > [agents.org.ai](https://agents.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [nouns.org.ai](https://nouns.org.ai)
            └── [agents.org.ai](https://agents.org.ai)
                └── **searches.org.ai**

## Structure

```
searches.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Searches].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Searches, things } from 'searches.org.ai'
```

### Use in MDX

```mdx
---
$type: https://searches.org.ai/Searches
name: Example
---

# Example Searches
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

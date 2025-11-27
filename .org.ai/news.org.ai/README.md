---
$id: https://news.org.ai
$context: https://news.org.ai
name: news.org.ai
parent: media.org.ai
license: CC-BY-SA-4.0
---

# news.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for news.

## Overview

This repository contains MDX documentation for news.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [media.org.ai](https://media.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [media.org.ai](https://media.org.ai)
                └── **news.org.ai**

## Structure

```
news.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [News].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { News, things } from 'news.org.ai'
```

### Use in MDX

```mdx
---
$type: https://news.org.ai/News
name: Example
---

# Example News
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

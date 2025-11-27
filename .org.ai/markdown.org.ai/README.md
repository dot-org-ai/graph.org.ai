---
$id: https://markdown.org.ai
$context: https://markdown.org.ai
name: markdown.org.ai
parent: things.org.ai
license: CC-BY-SA-4.0
---

# markdown.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for markdown.

## Overview

This repository contains MDX documentation for markdown.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── **markdown.org.ai**

## Structure

```
markdown.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Markdown].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Markdown, things } from 'markdown.org.ai'
```

### Use in MDX

```mdx
---
$type: https://markdown.org.ai/Markdown
name: Example
---

# Example Markdown
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

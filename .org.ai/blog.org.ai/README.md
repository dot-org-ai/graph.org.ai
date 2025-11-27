---
$id: https://blog.org.ai
$context: https://blog.org.ai
name: blog.org.ai
parent: media.org.ai
license: CC-BY-SA-4.0
---

# blog.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for blog.

## Overview

This repository contains MDX documentation for blog.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [media.org.ai](https://media.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [media.org.ai](https://media.org.ai)
                └── **blog.org.ai**

## Structure

```
blog.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Blog].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Blog, things } from 'blog.org.ai'
```

### Use in MDX

```mdx
---
$type: https://blog.org.ai/Blog
name: Example
---

# Example Blog
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

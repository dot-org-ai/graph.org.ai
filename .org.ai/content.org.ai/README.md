---
$id: https://content.org.ai
$context: https://content.org.ai
name: content.org.ai
parent: media.org.ai
license: CC-BY-SA-4.0
---

# content.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Media content.

## Overview

This repository contains MDX documentation for content.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [media.org.ai](https://media.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [media.org.ai](https://media.org.ai)
                └── **content.org.ai**

## Types

- [`MediaObject`](https://content.org.ai/MediaObject)

## Structure

```
content.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [MediaObject].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { MediaObject, things } from 'content.org.ai'
```

### Use in MDX

```mdx
---
$type: https://content.org.ai/MediaObject
name: Example
---

# Example MediaObject
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

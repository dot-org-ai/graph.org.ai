---
$id: https://readme.md.org.ai
$context: https://readme.md.org.ai
name: readme.md.org.ai
parent: markdown.org.ai
license: CC-BY-SA-4.0
---

# readme.md.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Standard specification for README.md files, describing projects and domains.

## Overview

This repository contains MDX documentation for readme.md.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [markdown.org.ai](https://markdown.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [markdown.org.ai](https://markdown.org.ai)
                └── **readme.md.org.ai**

## Types

- [`Readme`](https://readme.md.org.ai/Readme)

## Structure

```
readme.md.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Readme].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Readme, things } from 'readme.md.org.ai'
```

### Use in MDX

```mdx
---
$type: https://readme.md.org.ai/Readme
name: Example
---

# Example Readme
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

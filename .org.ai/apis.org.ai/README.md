---
$id: https://apis.org.ai
$context: https://apis.org.ai
name: apis.org.ai
parent: tech.org.ai
license: CC-BY-SA-4.0
---

# apis.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Application Programming Interfaces.

## Overview

This repository contains MDX documentation for apis.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [tech.org.ai](https://tech.org.ai) > [schema.org.ai/WebAPI](https://schema.org.ai/WebAPI)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [tech.org.ai](https://tech.org.ai)
                └── **apis.org.ai**

## Types

- [`WebAPI`](https://apis.org.ai/WebAPI)

## Structure

```
apis.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [WebAPI].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { WebAPI, things } from 'apis.org.ai'
```

### Use in MDX

```mdx
---
$type: https://apis.org.ai/WebAPI
name: Example
---

# Example WebAPI
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

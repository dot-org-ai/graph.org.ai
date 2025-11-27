---
$id: https://functions.org.ai
$context: https://functions.org.ai
name: functions.org.ai
parent: nouns.org.ai
license: CC-BY-SA-4.0
---

# functions.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Functional units of execution or logic.

## Overview

This repository contains MDX documentation for functions.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [nouns.org.ai](https://nouns.org.ai) > [schema.org.ai/Function](https://schema.org.ai/Function)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [nouns.org.ai](https://nouns.org.ai)
            └── **functions.org.ai**

## Types

- [`CodeFunction`](https://functions.org.ai/CodeFunction)
- [`GenerativeFunction`](https://functions.org.ai/GenerativeFunction)
- [`AgenticFunction`](https://functions.org.ai/AgenticFunction)
- [`HumanFunction`](https://functions.org.ai/HumanFunction)

## Structure

```
functions.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [CodeFunction].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { CodeFunction, GenerativeFunction, AgenticFunction, HumanFunction, things } from 'functions.org.ai'
```

### Use in MDX

```mdx
---
$type: https://functions.org.ai/CodeFunction
name: Example
---

# Example CodeFunction
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---
$id: https://people.org.ai
$context: https://people.org.ai
name: people.org.ai
parent: agents.org.ai
license: CC-BY-SA-4.0
---

# people.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Human beings.

## Overview

This repository contains MDX documentation for people.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [nouns.org.ai](https://nouns.org.ai) > [agents.org.ai](https://agents.org.ai) > [schema.org.ai/Person](https://schema.org.ai/Person)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [nouns.org.ai](https://nouns.org.ai)
            └── [agents.org.ai](https://agents.org.ai)
                └── **people.org.ai**

## Types

- [`Person`](https://people.org.ai/Person)

## Structure

```
people.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Person].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Person, things } from 'people.org.ai'
```

### Use in MDX

```mdx
---
$type: https://people.org.ai/Person
name: Example
---

# Example Person
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---
$id: https://organizations.org.ai
$context: https://organizations.org.ai
name: organizations.org.ai
parent: agents.org.ai
license: CC-BY-SA-4.0
---

# organizations.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Structured groups of people.

## Overview

This repository contains MDX documentation for organizations.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [nouns.org.ai](https://nouns.org.ai) > [agents.org.ai](https://agents.org.ai) > [schema.org.ai/Organization](https://schema.org.ai/Organization)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [nouns.org.ai](https://nouns.org.ai)
            └── [agents.org.ai](https://agents.org.ai)
                └── **organizations.org.ai**

## Types

- [`Organization`](https://organizations.org.ai/Organization)

## Structure

```
organizations.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Organization].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Organization, things } from 'organizations.org.ai'
```

### Use in MDX

```mdx
---
$type: https://organizations.org.ai/Organization
name: Example
---

# Example Organization
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---
$id: https://agents.org.ai
$context: https://agents.org.ai
name: agents.org.ai
parent: nouns.org.ai
license: CC-BY-SA-4.0
---

# agents.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Autonomous or semi-autonomous actors.

## Overview

This repository contains MDX documentation for agents.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [nouns.org.ai](https://nouns.org.ai) > [schema.org.ai/Agent](https://schema.org.ai/Agent)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [nouns.org.ai](https://nouns.org.ai)
            └── **agents.org.ai**

## Types

- [`Agent`](https://agents.org.ai/Agent)

## Structure

```
agents.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Agent].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Agent, things } from 'agents.org.ai'
```

### Use in MDX

```mdx
---
$type: https://agents.org.ai/Agent
name: Example
---

# Example Agent
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

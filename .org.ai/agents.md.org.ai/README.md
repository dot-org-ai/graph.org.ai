---
$id: https://agents.md.org.ai
$context: https://agents.md.org.ai
name: agents.md.org.ai
parent: markdown.org.ai
license: CC-BY-SA-4.0
---

# agents.md.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Standard specification for AGENTS.md files, defining agent profiles and capabilities.

## Overview

This repository contains MDX documentation for agents.md.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [markdown.org.ai](https://markdown.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [markdown.org.ai](https://markdown.org.ai)
                └── **agents.md.org.ai**

## Types

- [`AgentProfile`](https://agents.md.org.ai/AgentProfile)

## Structure

```
agents.md.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [AgentProfile].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { AgentProfile, things } from 'agents.md.org.ai'
```

### Use in MDX

```mdx
---
$type: https://agents.md.org.ai/AgentProfile
name: Example
---

# Example AgentProfile
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

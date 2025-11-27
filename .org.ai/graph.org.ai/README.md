---
$id: https://graph.org.ai
$context: https://graph.org.ai
name: graph.org.ai
parent: graph.org.ai
license: CC-BY-SA-4.0
---

# graph.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

The meta-graph definition and core ontology for the .org.ai ecosystem.

## Overview

This repository contains MDX documentation for graph.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── **graph.org.ai**

## Types

- [`Graph`](https://graph.org.ai/Graph)
- [`Ontology`](https://graph.org.ai/Ontology)
- [`Schema`](https://graph.org.ai/Schema)

## Structure

```
graph.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Graph].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Graph, Ontology, Schema, things } from 'graph.org.ai'
```

### Use in MDX

```mdx
---
$type: https://graph.org.ai/Graph
name: Example
---

# Example Graph
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

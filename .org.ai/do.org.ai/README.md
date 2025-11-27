---
$id: https://do.org.ai
$context: https://do.org.ai
name: do.org.ai
parent: graph.org.ai
license: CC-BY-SA-4.0
---

# do.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for do.

## Overview

This repository contains MDX documentation for do.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── **do.org.ai**

## Structure

```
do.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Do].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Do, things } from 'do.org.ai'
```

### Use in MDX

```mdx
---
$type: https://do.org.ai/Do
name: Example
---

# Example Do
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

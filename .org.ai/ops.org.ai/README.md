---
$id: https://ops.org.ai
$context: https://ops.org.ai
name: ops.org.ai
parent: work.org.ai
license: CC-BY-SA-4.0
---

# ops.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for ops.

## Overview

This repository contains MDX documentation for ops.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai) > [work.org.ai](https://work.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [business.org.ai](https://business.org.ai)
                └── [work.org.ai](https://work.org.ai)
                    └── **ops.org.ai**

## Structure

```
ops.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Ops].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Ops, things } from 'ops.org.ai'
```

### Use in MDX

```mdx
---
$type: https://ops.org.ai/Ops
name: Example
---

# Example Ops
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

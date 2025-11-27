---
$id: https://reports.org.ai
$context: https://reports.org.ai
name: reports.org.ai
parent: media.org.ai
license: CC-BY-SA-4.0
---

# reports.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for reports.

## Overview

This repository contains MDX documentation for reports.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [media.org.ai](https://media.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [media.org.ai](https://media.org.ai)
                └── **reports.org.ai**

## Structure

```
reports.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Reports].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Reports, things } from 'reports.org.ai'
```

### Use in MDX

```mdx
---
$type: https://reports.org.ai/Reports
name: Example
---

# Example Reports
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

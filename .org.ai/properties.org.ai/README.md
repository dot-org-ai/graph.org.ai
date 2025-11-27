---
$id: https://properties.org.ai
$context: https://properties.org.ai
name: properties.org.ai
parent: schema.org.ai
license: CC-BY-SA-4.0
---

# properties.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Global property definitions.

## Overview

This repository contains MDX documentation for properties.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── **properties.org.ai**

## Structure

```
properties.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Properties].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Properties, things } from 'properties.org.ai'
```

### Use in MDX

```mdx
---
$type: https://properties.org.ai/Properties
name: Example
---

# Example Properties
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

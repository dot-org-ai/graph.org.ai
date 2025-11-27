---
$id: https://activities.org.ai
$context: https://activities.org.ai
name: activities.org.ai
parent: actions.org.ai
license: CC-BY-SA-4.0
---

# activities.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Standardized definitions of ongoing actions and processes.

## Overview

This repository contains MDX documentation for activities.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [verbs.org.ai](https://verbs.org.ai) > [actions.org.ai](https://actions.org.ai) > [schema.org.ai/Activity](https://schema.org.ai/Activity)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [verbs.org.ai](https://verbs.org.ai)
            └── [actions.org.ai](https://actions.org.ai)
                └── **activities.org.ai**

## Types

- [`Activity`](https://activities.org.ai/Activity)

## Structure

```
activities.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Activity].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Activity, things } from 'activities.org.ai'
```

### Use in MDX

```mdx
---
$type: https://activities.org.ai/Activity
name: Example
---

# Example Activity
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

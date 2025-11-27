---
$id: https://skills.org.ai
$context: https://skills.org.ai
name: skills.org.ai
parent: knowledge.org.ai
license: CC-BY-SA-4.0
---

# skills.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Abilities required for tasks.

## Overview

This repository contains MDX documentation for skills.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai) > [schema.org.ai/Skill](https://schema.org.ai/Skill)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── **skills.org.ai**

## Types

- [`Skill`](https://skills.org.ai/Skill)

## Structure

```
skills.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Skill].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Skill, things } from 'skills.org.ai'
```

### Use in MDX

```mdx
---
$type: https://skills.org.ai/Skill
name: Example
---

# Example Skill
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

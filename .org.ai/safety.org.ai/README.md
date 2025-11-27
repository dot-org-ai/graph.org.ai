---
$id: https://safety.org.ai
$context: https://safety.org.ai
name: safety.org.ai
parent: agi.org.ai
license: CC-BY-SA-4.0
---

# safety.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for safety.

## Overview

This repository contains MDX documentation for safety.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [nouns.org.ai](https://nouns.org.ai) > [agents.org.ai](https://agents.org.ai) > [agi.org.ai](https://agi.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [nouns.org.ai](https://nouns.org.ai)
            └── [agents.org.ai](https://agents.org.ai)
                └── [agi.org.ai](https://agi.org.ai)
                    └── **safety.org.ai**

## Structure

```
safety.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Safety].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Safety, things } from 'safety.org.ai'
```

### Use in MDX

```mdx
---
$type: https://safety.org.ai/Safety
name: Example
---

# Example Safety
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---
$id: https://todo.md.org.ai
$context: https://todo.md.org.ai
name: todo.md.org.ai
parent: markdown.org.ai
license: CC-BY-SA-4.0
---

# todo.md.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Standard specification for TODO.md files, tracking tasks and status.

## Overview

This repository contains MDX documentation for todo.md.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [markdown.org.ai](https://markdown.org.ai)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [markdown.org.ai](https://markdown.org.ai)
                └── **todo.md.org.ai**

## Types

- [`Todo`](https://todo.md.org.ai/Todo)
- [`Task`](https://todo.md.org.ai/Task)

## Structure

```
todo.md.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Todo].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Todo, Task, things } from 'todo.md.org.ai'
```

### Use in MDX

```mdx
---
$type: https://todo.md.org.ai/Todo
name: Example
---

# Example Todo
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

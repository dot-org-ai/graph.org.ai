---
$id: https://courses.org.ai
$context: https://courses.org.ai
name: courses.org.ai
parent: education.org.ai
license: CC-BY-SA-4.0
---

# courses.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for courses.

## Overview

This repository contains MDX documentation for courses.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai) > [education.org.ai](https://education.org.ai) > [schema.org.ai/Course](https://schema.org.ai/Course)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── [education.org.ai](https://education.org.ai)
                    └── **courses.org.ai**

## Structure

```
courses.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Courses].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Courses, things } from 'courses.org.ai'
```

### Use in MDX

```mdx
---
$type: https://courses.org.ai/Courses
name: Example
---

# Example Courses
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

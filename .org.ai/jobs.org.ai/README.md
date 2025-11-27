---
$id: https://jobs.org.ai
$context: https://jobs.org.ai
name: jobs.org.ai
parent: work.org.ai
license: CC-BY-SA-4.0
---

# jobs.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Employment roles and listings.

## Overview

This repository contains MDX documentation for jobs.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai) > [work.org.ai](https://work.org.ai) > [schema.org.ai/JobPosting](https://schema.org.ai/JobPosting)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [business.org.ai](https://business.org.ai)
                └── [work.org.ai](https://work.org.ai)
                    └── **jobs.org.ai**

## Types

- [`JobPosting`](https://jobs.org.ai/JobPosting)
- [`Role`](https://jobs.org.ai/Role)

## Structure

```
jobs.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [JobPosting].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { JobPosting, Role, things } from 'jobs.org.ai'
```

### Use in MDX

```mdx
---
$type: https://jobs.org.ai/JobPosting
name: Example
---

# Example JobPosting
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---
$id: https://{{domain}}
$context: https://{{domain}}
name: {{domain}}
license: CC-BY-SA-4.0
---

# {{domain}}

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

{{description}}

## Overview

This repository contains MDX documentation for {{domain}}, part of the .org.ai ontology ecosystem.

**Parent**: [{{parent}}](https://{{parent}})

## Types

{{#each types}}
- **[`{{this}}`](things/{{this}}.mdx)** - {{description}}
{{/each}}

## Properties

{{#each properties}}
- **`{{name}}`** - {{description}}
{{/each}}

## Enums

{{#each enums}}
- **`{{name}}`** - {{description}}
{{/each}}

## Data Sources

{{sources}}

## Usage

### Import as NPM Package

```typescript
import { {{types.[0]}} } from '@org.ai/{{domainName}}'
```

### Use in MDX

```mdx
---
$type: {{types.[0]}}
name: Example
---

# {{types.[0]}} Example
```

## Structure

```
{{domain}}/
├── README.md           # This file
├── package/           # NPM package structure
├── scripts/           # Build and generation scripts
├── site/             # Documentation site
└── things/           # MDX entity definitions
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## Attribution

{{attribution}}

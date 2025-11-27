---
$id: https://events.org.ai
$context: https://events.org.ai
name: events.org.ai
parent: verbs.org.ai
license: CC-BY-SA-4.0
---

# events.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Unified event model connecting verbs to 5W+H (Who, What, Where, When, Why, How), extending EPCIS.

## Overview

This repository contains MDX documentation for events.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [verbs.org.ai](https://verbs.org.ai) > [schema.org.ai/Event](https://schema.org.ai/Event)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [verbs.org.ai](https://verbs.org.ai)
            └── **events.org.ai**

## Types

- [`Event`](https://events.org.ai/Event)

## Properties

- [`who`](https://events.org.ai/who)
- [`what`](https://events.org.ai/what)
- [`where`](https://events.org.ai/where)
- [`when`](https://events.org.ai/when)
- [`why`](https://events.org.ai/why)
- [`how`](https://events.org.ai/how)

## Structure

```
events.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Event].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Event, things } from 'events.org.ai'
```

### Use in MDX

```mdx
---
$type: https://events.org.ai/Event
name: Example
---

# Example Event
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

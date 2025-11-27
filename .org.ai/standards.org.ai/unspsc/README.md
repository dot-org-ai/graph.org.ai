---
$id: https://standards.org.ai/unspsc
$context: https://standards.org.ai
name: UNSPSC (United Nations Standard Products and Services Code)
parent: standards.org.ai
license: CC-BY-4.0
---

# UNSPSC - United Nations Standard Products and Services Code

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

Reference documentation for UNSPSC product classification codes.

## Overview

UNSPSC is a hierarchical classification system for products and services maintained by GS1 US for the United Nations Development Programme (UNDP). This subdirectory provides reference mappings to the official UNSPSC standard.

**Note**: This is reference data linking to the official UNSPSC standard. The primary product ontology lives at [products.org.ai](https://products.org.ai).

## Hierarchy

UNSPSC uses a 4-level hierarchy:

| Level | Digits | Example |
|-------|--------|---------|
| Segment | 2 | 43 - Information Technology |
| Family | 4 | 4320 - Computer Equipment |
| Class | 6 | 432016 - Computers |
| Commodity | 8 | 43201601 - Desktop computers |

## Structure

```
standards.org.ai/unspsc/
├── README.md           # This file
└── [Code].mdx          # Individual UNSPSC code references
```

## Usage

Product entities in [products.org.ai](https://products.org.ai) reference UNSPSC codes via the `sameAs` property:

```typescript
// products.org.ai entity
{
  "@type": "Product",
  "@id": "https://products.org.ai/Product/43201601",
  "name": "Desktop Computer",
  "sameAs": "https://standards.org.ai/unspsc/43201601"
}
```

## Cross-References

| System | Mapping |
|--------|---------|
| [products.org.ai](https://products.org.ai) | Primary product ontology |
| [gs1.org.ai](https://gs1.org.ai) | GPC product classification |
| [UNSPSC Official](https://www.unspsc.org/) | Official UNSPSC registry |

## License

UNSPSC is licensed under CC BY 4.0 by GS1 US for UNDP.

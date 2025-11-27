---
$id: https://standards.org.ai/napcs
$context: https://standards.org.ai
name: NAPCS (North American Product Classification System)
parent: standards.org.ai
license: Public Domain
---

# NAPCS - North American Product Classification System

[![License: Public Domain](https://img.shields.io/badge/License-Public%20Domain-green.svg)](https://creativecommons.org/publicdomain/zero/1.0/)

Reference documentation for NAPCS service classification codes.

## Overview

NAPCS is a comprehensive classification system for products and services developed jointly by the statistical agencies of Canada, Mexico, and the United States. This subdirectory provides reference mappings to the official NAPCS standard.

**Note**: This is reference data linking to the official NAPCS standard. The primary service ontology lives at [services.org.ai](https://services.org.ai).

## Structure

```
standards.org.ai/napcs/
├── README.md           # This file
└── [Code].mdx          # Individual NAPCS code references
```

## Usage

Service entities in [services.org.ai](https://services.org.ai) reference NAPCS codes via the `sameAs` property:

```typescript
// services.org.ai entity
{
  "@type": "Service",
  "@id": "https://services.org.ai/Service/561110",
  "name": "Office Administrative Services",
  "sameAs": "https://standards.org.ai/napcs/561110"
}
```

## Cross-References

| System | Mapping |
|--------|---------|
| [services.org.ai](https://services.org.ai) | Primary service ontology |
| [naics.org.ai](https://naics.org.ai) | Industry classification |
| [NAPCS Official](https://www.census.gov/naics/) | US Census Bureau NAPCS |

## License

NAPCS codes are public domain, developed by US, Canadian, and Mexican statistical agencies.

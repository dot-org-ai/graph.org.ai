---
$id: https://transport.org.ai
$context: https://transport.org.ai
name: transport.org.ai
parent: business.org.ai
license: CC-BY-SA-4.0
---

# transport.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for transport.

## Overview

This repository contains MDX documentation for transport.org.ai, focusing on passenger transportation systems, services, and mobility solutions. This domain covers the movement of people (distinct from logistics.org.ai which covers freight and goods).

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai)

### Passenger Transportation Overview

Transport.org.ai encompasses all modes and services for moving people, including:

- **Public Transit** (NAICS 485): Buses, subways, light rail, commuter rail systems
- **Air Transportation** (NAICS 481): Commercial airlines, passenger aviation
- **Rail Travel** (NAICS 482): Passenger rail, high-speed rail, intercity services
- **Ride Hailing**: On-demand rideshare platforms (Uber, Lyft), taxi services
- **Car Rental** (NAICS 5321): Vehicle rental, car sharing services
- **Mobility as a Service (MaaS)**: Integrated multimodal transportation platforms
- **Micromobility**: E-scooters, bike sharing, last-mile solutions

### Industry Classifications

This domain primarily covers NAICS sectors:

- **NAICS 485** - Transit and Ground Passenger Transportation
  - 4851: Urban transit systems
  - 4852: Interurban and rural bus transportation
  - 4853: Taxi and limousine service
  - 4854: School and employee bus transportation
  - 4855: Charter bus industry
  - 4859: Other transit and ground passenger transportation

- **NAICS 481** - Air Transportation
  - 4811: Scheduled air transportation
  - 4812: Nonscheduled air transportation

- **NAICS 482** - Rail Transportation
  - 4821: Rail transportation (passenger)

- **NAICS 5321** - Automotive Equipment Rental and Leasing
  - 53211: Passenger car rental and leasing
  - 53212: Truck, utility trailer, and RV rental and leasing

### Cross-References

- **[naics.org.ai](https://naics.org.ai)**: Industry classification codes and standards
- **[vehicles.org.ai](https://vehicles.org.ai)**: Transportation vehicles and equipment
- **[logistics.org.ai](https://logistics.org.ai)**: Freight and goods transportation (distinct from passenger)
- **[business.org.ai](https://business.org.ai)**: General business operations and services
- **[technology.org.ai](https://technology.org.ai)**: Transportation technology and platforms

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [business.org.ai](https://business.org.ai)
                └── **transport.org.ai**

## Structure

```
transport.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Transport].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Transport, things } from 'transport.org.ai'
```

### Use in MDX

```mdx
---
$type: https://transport.org.ai/Transport
name: Example
---

# Example Transport
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

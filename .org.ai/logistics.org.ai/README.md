---
$id: https://logistics.org.ai
$context: https://logistics.org.ai
name: logistics.org.ai
parent: business.org.ai
license: CC-BY-SA-4.0
---

# logistics.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for logistics.

## Overview

This repository contains MDX documentation for logistics.org.ai, part of the .org.ai ontology ecosystem. It provides comprehensive coverage of the transportation and warehousing industry based on NAICS Sector 48-49.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai)

### Logistics and Supply Chain

Logistics encompasses the planning, execution, and control of the movement and storage of goods, services, and information throughout the supply chain. This includes:

- **Transportation**: Moving goods via air, rail, water, truck, pipeline, and multimodal methods
- **Warehousing**: Storage, distribution centers, fulfillment operations, and inventory management
- **Supply Chain Management**: End-to-end coordination from sourcing to final delivery
- **Last Mile Delivery**: Final leg of delivery to end customers
- **Logistics Technology**: TMS (Transportation Management Systems), WMS (Warehouse Management Systems), and supply chain visibility platforms

The global logistics market represents over $8 trillion annually, with continued growth driven by e-commerce, globalization, and supply chain digitalization.

## NAICS Sector 48-49: Transportation and Warehousing

This domain aligns with the North American Industry Classification System (NAICS) Sector 48-49, which includes establishments providing transportation of passengers and cargo, warehousing and storage, and services incidental to these modes of transportation.

### NAICS Hierarchy

- **481 - Air Transportation**
  - 4811 Scheduled Air Transportation
  - 4812 Nonscheduled Air Transportation

- **482 - Rail Transportation**
  - 4821 Rail Transportation

- **483 - Water Transportation**
  - 4831 Deep Sea, Coastal, and Great Lakes Water Transportation
  - 4832 Inland Water Transportation

- **484 - Truck Transportation**
  - 4841 General Freight Trucking
  - 4842 Specialized Freight Trucking

- **485 - Transit and Ground Passenger Transportation**
  - 4851 Urban Transit Systems
  - 4852 Interurban and Rural Bus Transportation
  - 4853 Taxi and Limousine Service
  - 4854 School and Employee Bus Transportation
  - 4855 Charter Bus Industry
  - 4859 Other Transit and Ground Passenger Transportation

- **486 - Pipeline Transportation**
  - 4861 Pipeline Transportation of Crude Oil
  - 4862 Pipeline Transportation of Natural Gas
  - 4869 Other Pipeline Transportation

- **487 - Scenic and Sightseeing Transportation**
  - 4871 Scenic and Sightseeing Transportation, Land
  - 4872 Scenic and Sightseeing Transportation, Water
  - 4879 Scenic and Sightseeing Transportation, Other

- **488 - Support Activities for Transportation**
  - 4881 Support Activities for Air Transportation
  - 4882 Support Activities for Rail Transportation
  - 4883 Support Activities for Water Transportation
  - 4884 Support Activities for Road Transportation
  - 4885 Freight Transportation Arrangement
  - 4889 Other Support Activities for Transportation

- **491 - Postal Service**
  - 4911 Postal Service

- **492 - Couriers and Messengers**
  - 4921 Couriers and Express Delivery Services
  - 4922 Local Messengers and Local Delivery

- **493 - Warehousing and Storage**
  - 4931 Warehousing and Storage

## APQC Process Classification Framework (PCF)

This domain maps to **Category 4.0: Deliver Physical Products** in the APQC Process Classification Framework:

- **4.1** Plan for and align supply chain resources
- **4.2** Procure materials and services
- **4.3** Produce/Manufacture/Deliver product
- **4.4** Deliver products
  - 4.4.1 Plan and manage inbound material
  - 4.4.2 Operate warehousing
  - 4.4.3 Operate outbound transportation
  - 4.4.4 Manage returns, recalls, and reverse logistics
- **4.5** Manage logistics and warehousing

## Cross-References

- **[naics.org.ai](https://naics.org.ai)**: Complete NAICS classification system with industry codes and definitions
- **[apqc.org.ai](https://apqc.org.ai)**: APQC Process Classification Framework for business processes
- **[manufacturing.org.ai](https://manufacturing.org.ai)**: Manufacturing operations and supply chain integration
- **[business.org.ai](https://business.org.ai)**: Parent domain for business and commerce ontology

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [business.org.ai](https://business.org.ai)
                └── **logistics.org.ai**

## Structure

```
logistics.org.ai/
├── README.md           # This file
├── package.json        # NPM package config
├── index.ts            # Type & const exports
├── [Logistics].mdx  # Type template
└── ...
```

## Usage

### Import as NPM Package

```typescript
import { Logistics, things } from 'logistics.org.ai'
```

### Use in MDX

```mdx
---
$type: https://logistics.org.ai/Logistics
name: Example
---

# Example Logistics
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

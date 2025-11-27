---
$id: https://automotive.org.ai
$context: https://automotive.org.ai
name: automotive.org.ai
parent: industries.org.ai
license: CC-BY-SA-4.0
---

# automotive.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for automotive.

## Overview

This repository contains MDX documentation for automotive.org.ai, part of the .org.ai ontology ecosystem.

The automotive industry is a major economic sector encompassing the design, development, manufacturing, marketing, selling, repairing, and modification of motor vehicles. It represents one of the world's largest industries by revenue, employing millions of people globally and driving innovation in manufacturing, technology, sustainability, and mobility.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai) > [industries.org.ai](https://industries.org.ai)

## Industry Scope

The automotive industry spans the entire vehicle lifecycle and ecosystem:

### Manufacturing Sector
- **Vehicle Manufacturing** (NAICS 3361-3363): Design and production of passenger cars, light trucks, heavy-duty vehicles, buses, and specialty vehicles
- **Parts & Components** (NAICS 3363): Engine components, transmission systems, electrical systems, body parts, tires, and aftermarket accessories
- **Assembly Operations**: Final vehicle assembly, quality control, testing, and customization

### Distribution & Sales
- **New Vehicle Dealers** (NAICS 4411): Franchised dealerships selling new cars and trucks, typically representing specific manufacturers
- **Used Vehicle Dealers** (NAICS 4412): Independent and franchised dealers specializing in pre-owned vehicle sales
- **Parts & Accessories Stores** (NAICS 4413): Retail outlets selling replacement parts, performance upgrades, and vehicle accessories

### Service & Maintenance
- **Repair & Maintenance** (NAICS 8111): General automotive repair, specialized services (transmission, brakes, electrical), preventive maintenance
- **Body Shops & Painting**: Collision repair, custom painting, restoration services
- **Detailing & Care**: Vehicle cleaning, protection, and aesthetic enhancement

### Fleet & Mobility Services
- **Rental & Leasing** (NAICS 5321): Short-term rentals, long-term leases, corporate fleet solutions
- **Fleet Management**: Vehicle tracking, maintenance scheduling, fuel management, driver safety programs
- **Ride-Sharing & Mobility**: Transportation network companies, car-sharing services, autonomous vehicle operations

### Supporting Industries
- **Automotive Finance**: Loans, leases, insurance products specific to vehicles
- **Technology & Software**: Infotainment systems, autonomous driving, connected car platforms
- **Charging Infrastructure**: EV charging networks, battery swapping stations
- **Recycling & Disposal**: End-of-life vehicle processing, parts recycling, materials recovery

## Key Industry Trends

### Electrification
The transition from internal combustion engines to battery electric vehicles (BEVs), plug-in hybrids (PHEVs), and hydrogen fuel cell vehicles, driven by environmental regulations and consumer demand for sustainable transportation.

### Autonomous Vehicles
Development of self-driving technology ranging from advanced driver assistance systems (ADAS) to fully autonomous vehicles, transforming vehicle design, ownership models, and transportation infrastructure.

### Connected Vehicles
Integration of vehicles with IoT platforms, 5G networks, and cloud services enabling over-the-air updates, predictive maintenance, enhanced safety features, and new in-vehicle experiences.

### Mobility as a Service (MaaS)
Shift from vehicle ownership to mobility services, including ride-sharing, car-sharing, subscription models, and integrated multi-modal transportation platforms.

### Sustainable Manufacturing
Adoption of circular economy principles, sustainable materials, renewable energy in production, and carbon-neutral manufacturing processes to reduce environmental impact.

### Digital Transformation
Online vehicle sales, virtual showrooms, digital service scheduling, remote diagnostics, and data-driven decision-making across the automotive value chain.

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [business.org.ai](https://business.org.ai)
                └── [industries.org.ai](https://industries.org.ai)
                    └── **automotive.org.ai**
                        ├── VehicleManufacturing
                        ├── PartsManufacturing
                        ├── Dealerships
                        ├── PartsStores
                        ├── RepairMaintenance
                        └── FleetManagement

## Cross-References

This domain connects with:
- [naics.org.ai](https://naics.org.ai) - Industry classification codes (3361-3363, 4411-4413, 5321, 8111)
- [manufacturing.org.ai](https://manufacturing.org.ai) - Manufacturing processes and production systems
- [retail.org.ai](https://retail.org.ai) - Retail sales and distribution channels
- [products.org.ai](https://products.org.ai) - Vehicle models and automotive products
- [vehicles.org.ai](https://vehicles.org.ai) - Specific vehicle types and classifications
- [technology.org.ai](https://technology.org.ai) - Automotive technology and innovation
- [sustainability.org.ai](https://sustainability.org.ai) - Environmental impact and sustainable practices

## Types

This domain defines the following automotive industry types:

- **Automotive** - Base type for automotive industry entities
- **VehicleManufacturing** - Vehicle design, engineering, and production operations
- **PartsManufacturing** - Manufacturing of automotive parts and components
- **Dealerships** - New and used vehicle sales operations
- **PartsStores** - Retail automotive parts and accessories
- **RepairMaintenance** - Vehicle service and repair operations
- **FleetManagement** - Vehicle fleet and mobility service management

## Structure

```
automotive.org.ai/
├── README.md                  # This file
├── package.json              # NPM package config
├── index.ts                  # Type & const exports
├── [Automotive].mdx          # Base type template
├── VehicleManufacturing.mdx  # Vehicle manufacturing category
├── PartsManufacturing.mdx    # Parts manufacturing category
├── Dealerships.mdx           # Vehicle dealerships category
├── PartsStores.mdx           # Parts retail category
├── RepairMaintenance.mdx     # Service and repair category
└── FleetManagement.mdx       # Fleet and mobility category
```

## Usage

### Import as NPM Package

```typescript
import { Automotive, things } from 'automotive.org.ai'
```

### Use in MDX

```mdx
---
$type: https://automotive.org.ai/Automotive
name: Example
---

# Example Automotive
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

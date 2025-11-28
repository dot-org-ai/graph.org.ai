---
$id: https://construction.industries.org.ai
$context: https://construction.industries.org.ai
name: construction.org.ai
license: CC-BY-SA-4.0
---

# construction.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Comprehensive construction industry ontology covering residential, commercial, infrastructure, and specialty construction, along with construction technology and sustainable building practices.

## Overview

This repository contains MDX documentation for construction.org.ai, part of the .org.ai ontology ecosystem. It provides detailed coverage of the construction industry aligned with NAICS 23 (Construction) classification system.

**Parent**: [industries.org.ai](https://industries.org.ai)

## Industry Classification

**NAICS Division 23 - Construction** is organized into three main subsectors:

- **NAICS 236** - Construction of Buildings (Residential & Commercial)
- **NAICS 237** - Heavy and Civil Engineering Construction (Infrastructure)
- **NAICS 238** - Specialty Trade Contractors (Trade-specific services)

## Types

### Core Construction Sectors
- **[`ResidentialConstruction`](./ResidentialConstruction.mdx)** - Home building, renovations, residential projects
- **[`CommercialConstruction`](./CommercialConstruction.mdx)** - Office, retail, industrial buildings
- **[`InfrastructureConstruction`](./InfrastructureConstruction.mdx)** - Roads, bridges, utilities, civil engineering
- **[`SpecialtyTrades`](./SpecialtyTrades.mdx)** - Electrical, plumbing, HVAC, mechanical systems

### Emerging Areas
- **[`ConstructionTech`](./ConstructionTech.mdx)** - BIM, project management, drones, IoT, AI applications
- **[`GreenBuilding`](./GreenBuilding.mdx)** - LEED certification, sustainable construction, net-zero buildings

### Supporting Resources
- **[`Component`](./Components/[Component].mdx)** - Building materials and equipment
- **[`System`](./Systems/[System].mdx)** - Building systems (structural, electrical, HVAC, plumbing)
- **[`Service`](./Services/[Service].mdx)** - Construction services and professional services
- **[`Technology`](./Technologies/[Technology].mdx)** - Construction technology solutions
- **[`Standard`](./Standards/[Standard].mdx)** - Building codes, safety standards, industry standards

### Actions & Events
- **[`Action`](./Actions/[Action].mdx)** - Construction activities and processes
- **[`Event`](./Events/[Event].mdx)** - Project milestones and industry events

## Hierarchy

```
construction.org.ai/
├── ResidentialConstruction.mdx        # NAICS 236 - Building structures
├── CommercialConstruction.mdx         # Office, retail, industrial buildings
├── InfrastructureConstruction.mdx     # NAICS 237 - Civil engineering
├── SpecialtyTrades.mdx                # NAICS 238 - Specialty contractors
├── ConstructionTech.mdx               # Digital tools and innovation
├── GreenBuilding.mdx                  # Sustainable practices
├── Components/
│   └── [Component].mdx                # Building materials and equipment
├── Systems/
│   └── [System].mdx                   # Building systems
├── Services/
│   └── [Service].mdx                  # Professional services
├── Technologies/
│   └── [Technology].mdx               # Construction technology
├── Standards/
│   └── [Standard].mdx                 # Building codes and standards
├── Processes/
│   └── [Process].mdx                  # Construction processes
├── Actions/
│   └── [Action].mdx                   # Project activities
└── Events/
    └── [Event].mdx                    # Project events
```

## NAICS Alignment

### NAICS 236 - Construction of Buildings
- General residential building construction
- General commercial and industrial building construction
- Non-residential building construction
- Building finishing contractors
- Other building finishing contractors

### NAICS 237 - Heavy and Civil Engineering Construction
- Water and sewer line and related structures
- Oil and gas pipeline and related structures
- Power transmission line and related structures
- Telecommunications structures
- Highway, street and bridge construction
- Other heavy and civil engineering construction

### NAICS 238 - Specialty Trade Contractors
- Electrical contractors and other wiring installation contractors
- Plumbing, heating, and air-conditioning contractors
- Other specialty trade contractors
- Structural steel and precast concrete contractors
- Roofing contractors
- Siding contractors
- Tile and terrazzo contractors
- Concrete contractors
- Water well drilling contractors
- Painting and wall covering contractors
- Electrical contractors
- HVAC contractors
- Plumbing contractors
- And 20+ additional specialty classifications

## Data Sources

### Primary Sources
- **US Census Bureau** - NAICS definitions, industry data, construction put-in-place
- **Bureau of Labor Statistics** - Employment, wages, occupational data
- **McGraw-Hill Construction** - Industry analysis and forecasts
- **National Association of Home Builders (NAHB)** - Residential construction data
- **Associated General Contractors (AGC)** - Construction industry statistics

### Specialized Sources
- **International Building Code (IBC)** - Building standards
- **USGBC** - LEED certification and green building standards
- **NFPA** - Fire safety and electrical codes
- **American Society of Civil Engineers (ASCE)** - Infrastructure standards
- **OSHA** - Occupational safety and health standards
- **American Institute of Architects (AIA)** - Design and construction standards

### Technology & Innovation
- **Dodge Construction Network** - Construction market data
- **Autodesk**, **Trimble** - BIM and construction technology
- **O*NET OnLine** - Construction occupations and skills

## Relationships

### Connected Domains
- [`occupations.org.ai`](https://occupations.org.ai) - Construction workers, architects, engineers
- [`equipment.org.ai`](https://equipment.org.ai) - Construction equipment and machinery
- [`materials.org.ai`](https://materials.org.ai) - Building materials and supplies
- [`services.org.ai`](https://services.org.ai) - Construction and related services
- [`tech.org.ai`](https://tech.org.ai) - Construction technology and software
- [`standards.org.ai`](https://standards.org.ai) - Building codes and compliance standards
- [`healthcare.org.ai`](https://healthcare.org.ai) - Healthcare facility construction
- [`retail.org.ai`](https://retail.org.ai) - Retail facility construction
- [`finance.org.ai`](https://finance.org.ai) - Construction financing and project funding

## Key Metrics

### Industry Overview
- **US Construction Market Size**: ~$1.7 trillion (2023)
- **Employment**: ~11.4 million workers
- **Number of Establishments**: ~830,000 companies
- **Annual Growth Rate**: 3-5% average
- **Wage Average**: $60,000-$80,000 (varies by specialty)

### Subcategory Breakdown
- **Residential**: ~45% of market
- **Commercial**: ~30% of market
- **Infrastructure/Heavy Civil**: ~15% of market
- **Specialty Trades**: Distributed across all categories
- **Emerging Tech**: 2-5% annual growth

## Usage

### Import as NPM Package

```typescript
import {
  ResidentialConstruction,
  CommercialConstruction,
  InfrastructureConstruction,
  SpecialtyTrades,
  ConstructionTech,
  GreenBuilding
} from '@org.ai/construction'
```

### Use in MDX

```mdx
---
$type: ResidentialConstruction
naicsCode: "236115"
projectType: "Single Family Home"
region: "Northeast"
---

# Custom Home Construction Project

<ConstructionProjectOverview project={project} />
```

## Occupations

Key occupations in construction (from O*NET):

- Construction Managers
- General and Operations Managers
- Project Managers
- Electricians
- Plumbers
- HVAC Technicians
- Carpenters
- Heavy Equipment Operators
- Welders
- Civil Engineers
- Architects
- Safety Engineers

## Standards & Compliance

- **International Building Code (IBC)** - Primary building standard
- **NFPA 70 (NEC)** - National Electrical Code
- **ANSI** - American National Standards
- **ASHRAE** - HVAC standards
- **LEED** - Green building certification
- **OSHA** - Workplace safety standards
- **ADA** - Accessibility standards
- **State/Local Codes** - Jurisdiction-specific requirements

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## Attribution

- NAICS Classification: US Census Bureau
- Industry Data: McGraw-Hill Construction, BLS
- Standards: International Code Council, NFPA, ASHRAE, USGBC
- Occupations: O*NET OnLine

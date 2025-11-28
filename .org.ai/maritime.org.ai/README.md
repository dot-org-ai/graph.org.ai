---
$id: https://maritime.org.ai
$context: https://maritime.org.ai
name: maritime.org.ai
parent: logistics.org.ai
license: CC-BY-SA-4.0
---

# maritime.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for maritime shipping, ports, and offshore operations.

## Overview

This repository contains comprehensive MDX documentation for maritime.org.ai, a specialized domain covering the global maritime industry including ocean shipping, ports, shipbuilding, offshore operations, and maritime technology. Part of the larger .org.ai ontology ecosystem, maritime.org.ai provides detailed coverage of the transportation and logistics industry based on NAICS Sectors 483, 3366, and 4883.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai) > [logistics.org.ai](https://logistics.org.ai)

### Maritime Industry Overview

Maritime commerce moves over 90% of global trade by volume and 80% by value, transporting approximately 11 billion tons of cargo annually across ocean shipping networks connecting every continent. The maritime industry encompasses:

- **Shipping and Lines**: Container shipping, bulk carriers, tankers, and specialized vessels operated by global shipping lines
- **Port Operations**: Container terminals, bulk facilities, and multi-purpose ports handling cargo transfer and intermodal connections
- **Shipbuilding and Repair**: Vessel construction, marine engineering, and lifecycle maintenance at global shipyards
- **Offshore and Subsea**: Specialized support vessels, subsea engineering, and deepwater operations for oil/gas and renewable energy
- **Maritime Technology**: Automation, digitalization, autonomous vessels, and IoT platforms transforming operations

The global maritime economy represents over $1.5 trillion in value, with industry growth tied to international trade, commodity prices, energy transition, and technological innovation.

## NAICS Classification and Industry Codes

Maritime.org.ai aligns with multiple North American Industry Classification System (NAICS) codes reflecting the industry's diverse operational segments:

### NAICS 483 - Water Transportation

Primary classification for ocean shipping and maritime cargo transport.

#### 483111 - Deep Sea Freight Transportation
- International container vessel operations (Trans-Pacific, Trans-Atlantic, Asia-Europe routes)
- Conference lines and shipping alliances
- Ultra-large container vessels (ULCV) with 20,000+ TEU capacity
- Vessel charter services (time charter, voyage charter)

#### 483112 - Deep Sea Passenger Transportation
- Cruise line operations and leisure voyages
- Expedition cruising

#### 483113 - Coastal and Great Lakes Freight Transportation
- Domestic water transportation
- Jones Act shipping (US coastwise)
- Great Lakes bulk cargo
- Short-sea shipping and marine highways

#### 483114 - Coastal and Great Lakes Passenger Transportation
- Ferry and water taxi services

#### 4832 - Inland Water Transportation
- River and canal barge transportation
- Towboat and tugboat operations
- Inland bulk commodity transport

### NAICS 4831 - Deep Sea Freight Transportation (Bulk and Tankers)

Bulk carriers and tanker vessels transporting unpackaged cargo and liquids.

**Dry Bulk Carriers:**
- Capesize, Panamax, Supramax, Handymax vessels
- Iron ore, coal, grain, fertilizer commodities
- Baltic Dry Index (BDI) for rate benchmarking
- Vessel sizes: 15,000 to 400,000 DWT

**Tanker Vessels:**
- Oil tankers: VLCC (Very Large Crude Carrier), Suezmax, Aframax
- Product tankers: gasoline, diesel, jet fuel, heating oil
- Chemical tankers: specialized segregated tank configurations
- LNG and LPG carriers: cryogenic liquefied gas transport

### NAICS 4883 - Support Activities for Water Transportation

Port authorities, terminal operators, and maritime support services.

**Container Terminal Operations:**
- Ship-to-shore (STS) crane operations
- Automated stacking cranes (ASC) and guided vehicles (AGV)
- Gate operations and intermodal connections
- Modern facilities: 20-150+ moves per hour crane productivity

**Bulk Terminal Operations:**
- Dry bulk handling (shiploaders, conveyor systems, stockpiling)
- Liquid bulk (tanker manifold systems, pipeline connections)
- Heavy-lift and project cargo handling

**Port Infrastructure and Services:**
- Dredging and channel maintenance
- Vessel services (bunkering, waste reception, provisioning)
- Intermodal rail and truck connections
- Port security and regulatory compliance

**Global Port Leaders:**
- Shanghai (47.3 million TEU)
- Singapore (37.5 million TEU) - transshipment hub
- Ningbo-Zhoushan (33.4 million TEU)
- Rotterdam (14.5 million TEU) - European gateway
- Top 15 ports handle 60%+ of global container traffic

### NAICS 3366 - Ship and Boat Building

Commercial shipbuilding, marine engineering, and vessel repair.

**Shipbuilding Dominance:**
- South Korea (30-35% global share): Hyundai Heavy, Samsung, Daewoo
- China (35-40% global share): CSSC, China Merchants Heavy
- Japan (20-25% global share): Japan Marine United, Imabari

**Vessel Construction:**
- ULCV and mega-container ships: $300-350 million per vessel
- LNG carriers: $600-800 million per Q-Max vessel
- Bulk carriers and tankers: $100-200 million per vessel
- Specialized vessels: offshore, research, support ships

**Repair and Maintenance:**
- Dry dock operations for hull and propeller maintenance
- Ballast water treatment system (BWTS) retrofitting
- IMO 2020 scrubber installations
- Lifecycle extension and modernization

## APQC Process Classification Framework (PCF) Alignment

Maritime.org.ai maps to APQC Category 4.0 - Deliver Physical Products:

- **4.4.3 - Operate Outbound Transportation**: Maritime shipping and logistics
- **4.4.1 - Plan and Manage Inbound Material**: Port receiving and cargo handling
- **4.4.2 - Operate Warehousing**: Port warehousing and distribution
- **4.5 - Manage Logistics and Warehousing**: Supply chain coordination

## Directory Structure and Content

The maritime.org.ai domain provides specialized documentation across six key subcategories:

### 1. Container Shipping and Lines ([ContainerShipping.mdx](/ContainerShipping))
**NAICS: 4831** | **Scope**: International container shipping, vessel types, shipping lines, alliances, and container specifications

- Vessel types: ULCV (18,000-24,000 TEU), Post-Panamax (13,000+ TEU), Panamax (4,500 TEU), Feeder vessels (1,000-3,000 TEU)
- Top 10 global carriers: MSC, Maersk, COSCO, CMA CGM, Hapag-Lloyd, ONE, Evergreen, HMM, Yang Ming, ZIM
- Shipping alliances: 2M, Ocean Alliance, THE Alliance
- Service types: Liner services with published schedules, Voyage charters, Time charters
- Container types: Dry standard, High cube, Reefer, Tank containers, Flat racks, Specialized
- Freight pricing: Base ocean freight, BAF (bunker), CAF (currency), PSS (peak season), GRI (rate increase), War risk
- Technology trends: Slow steaming, Hull optimization, Wind-assisted propulsion, Alternative fuels (LNG, methanol, ammonia)

### 2. Bulk Shipping and Tankers ([BulkShipping.mdx](/BulkShipping))
**NAICS: 4831** | **Scope**: Dry bulk carriers, tankers, commodity transport, and liquid cargo

- **Dry Bulk Vessels**: Capesize (150,000-400,000 DWT), Panamax (60,000-80,000 DWT), Supramax (52,000-64,000 DWT), Handymax (40,000-60,000 DWT)
- **Major Commodities**: Iron ore (1.5B tons/yr), Coal (800M tons/yr), Grain (400M tons/yr), Phosphate, Bauxite, Sugar, Timber
- **Tanker Types**: VLCC (200,000-325,000 DWT), Suezmax (120,000-200,000 DWT), Aframax (80,000-120,000 DWT), Product tankers, Chemical tankers
- **LNG and LPG**: Cryogenic carriers at -162°C, Q-Flex (210,000-217,000 m³), Q-Max (265,000 m³)
- **Pricing**: Baltic Dry Index (BDI) for rate benchmarking, Worldscale system for tankers
- **Market Drivers**: Economic cycles, commodity prices, refinery utilization, geopolitical events

### 3. Port Operations and Terminal Management ([Ports.mdx](/Ports))
**NAICS: 4883** | **Scope**: Port authorities, terminal operators, cargo handling, and port infrastructure

- **Container Terminal Infrastructure**: Quay cranes (STS, 22-25 container rows), Automated stacking cranes (ASC), Automated guided vehicles (AGV)
- **Performance Metrics**: Berth productivity (120-150 CMPH), Crane productivity (25-35 GMPH), Vessel turnaround (24-48 hours), Container dwell time (<5 days)
- **Global Port Leaders**: Shanghai (47.3M TEU), Singapore (37.5M TEU), Ningbo-Zhoushan (33.4M TEU), Shenzhen (30M TEU), Qingdao (24M TEU)
- **Terminal Operators**: APM Terminals (Maersk), PSA International (Singapore), DP World (Dubai), Hutchison Ports, COSCO Shipping Ports
- **Automation**: Maasvlakte II (Rotterdam), Tuas Port (Singapore), TraPac (LA)
- **Digitalization**: Port Community Systems, Single Window submissions, TradeLens (blockchain), Real-time cargo tracking
- **Intermodal Connections**: On-dock rail, Near-dock facilities, Inland container depots, Truck drayage

### 4. Shipbuilding and Vessel Repair ([Shipbuilding.mdx](/Shipbuilding))
**NAICS: 3366** | **Scope**: Commercial vessel construction, maritime engineering, repair, and lifecycle management

- **Top Shipyards**: Hyundai Heavy Industries (HHI, Korea), Samsung Heavy (Korea), Daewoo Shipbuilding (Korea), China State Shipping (CSSC), Japan Marine United
- **Vessel Types**: ULCV container ships ($300-350M), LNG carriers ($600-800M), Bulk carriers ($100-150M), Tankers ($150-200M)
- **Construction Timeline**: 24-36 months for container ships, 36-48 months for specialized vessels
- **Repair Services**: Dry dock operations (2.5-5 year intervals), Hull maintenance, Scrubber retrofitting, BWTS installations
- **Supply Chain**: Main engines (Wärtsilä, MAN), Propulsion systems (Rolls-Royce), Automation (ABB, Siemens)
- **Labor**: Skilled trades, Naval architects, Project management
- **Financing**: Progress payments, Letter of credit, Performance bonds

### 5. Offshore Marine and Subsea Services ([OffshoreMarine.mdx](/OffshoreMarine))
**NAICS: 4831 (OSV operations)** | **Scope**: Offshore support vessels, subsea engineering, deepwater operations

- **Vessel Types**: Platform Supply Vessels (PSV, 3,000-5,000t), Anchor Handling Tug Supply (AHTS, 50-250t bollard pull), Construction Support Vessels (CSV, 5,000+ ton cranes)
- **Deepwater Capabilities**: Standard depth (200-1,500m), Extended range (1,500-3,000m), Extreme depth (3,000+ m)
- **Subsea Infrastructure**: Wellheads, Manifolds, Subsea pipelines, Control umbilicals
- **ROV Operations**: Remotely Operated Vehicles for inspection, maintenance, construction
- **Pipeline Installation**: S-lay, J-lay, Reel-lay methods for deepwater transport
- **Renewable Energy**: Wind turbine installation vessels (WTIV), Cable laying, Foundation installation
- **Market Trends**: Energy transition impact, OSV oversupply, Vessel conversions for renewable support
- **Companies**: Helix ESV, Horizon Offshore, Fugro, Aker Solutions, TechnipFMC

### 6. Maritime Technology and Digitalization ([MaritimeTech.mdx](/MaritimeTech))
**NAICS: 4831** | **Scope**: Automation, autonomous vessels, IoT, digitalization, and technology innovation

- **Autonomous Vessels**: SAE automation levels (1-4), Yara Birkeland (electric feeder), Mayflower (autonomous research), Remote Operation Centers (ROC)
- **Bridge Automation**: ECDIS, Collision avoidance, Dynamic route optimization, Autopilot systems
- **IoT and Monitoring**: Engine sensors, Cargo tracking, Predictive maintenance, Fuel efficiency optimization
- **Supply Chain Visibility**: Electronic bill of lading (e-B/L), TradeLens blockchain, GSBN, Digital freight platforms (Freightos, Flexport, Convoy)
- **Port Automation**: Automated stacking cranes (ASC), Lift-AGV vehicles, Remote-operated equipment
- **AI and Machine Learning**: Route optimization, Fuel prediction, Maintenance forecasting, Port scheduling
- **Compliance Systems**: IMO 2030/2050 tracking, Carbon Intensity Index (CII), EEXI monitoring
- **Cybersecurity**: Vessel network security, ISPS Code compliance, Threat management
- **Emerging Tech**: Edge computing, 5G maritime broadband, Quantum optimization, Extended reality (XR) training

## Cross-Domain References

Maritime.org.ai integrates closely with related ontology domains:

- **[logistics.org.ai](https://logistics.org.ai)**: Parent domain covering all transportation modes and supply chain management
- **[transport.org.ai](https://transport.org.ai)**: Complementary domain for passenger and intermodal transportation
- **[energy.org.ai](https://energy.org.ai)**: Oil and gas operations, renewable energy, LNG export/import
- **[manufacturing.org.ai](https://manufacturing.org.ai)**: Shipbuilding and vessel manufacturing
- **[equipment.org.ai](https://equipment.org.ai)**: Maritime equipment and systems
- **[naics.org.ai](https://naics.org.ai)**: Complete NAICS classification reference
- **[apqc.org.ai](https://apqc.org.ai)**: APQC Process Classification Framework
- **[business.org.ai](https://business.org.ai)**: Parent domain for business and commerce

## Hierarchy

```
graph.org.ai
├── schema.org.ai
│   └── things.org.ai
│       └── business.org.ai
│           └── logistics.org.ai
│               └── maritime.org.ai (THIS DOMAIN)
```

## Structure

```
maritime.org.ai/
├── README.md                      # This file
├── package.json                   # NPM package configuration
├── tsconfig.json                  # TypeScript configuration
├── index.ts                       # Type and constant exports
├── types.ts                       # Maritime type definitions
├── ContainerShipping.mdx          # Container shipping and lines
├── BulkShipping.mdx               # Dry bulk carriers and tankers
├── Ports.mdx                      # Port operations and terminals
├── Shipbuilding.mdx               # Vessel construction and repair
├── OffshoreMarine.mdx             # Offshore and subsea operations
└── MaritimeTech.mdx               # Maritime technology and digitalization
```

## Usage

### Import as NPM Package

```typescript
import { Maritime, things } from 'maritime.org.ai'
```

### Use in MDX

```mdx
---
$context: https://maritime.org.ai
$id: https://maritime.org.ai/ContainerShipping
$type: https://maritime.org.ai/Maritime
name: "Container Shipping"
naicsCode: "4831"
---

# Container Shipping

Container shipping moves over 140 million TEUs annually...
```

### Search and Retrieve

```typescript
import { search, get } from 'maritime.org.ai'

// Search maritime domains
const results = await search('container')

// Get specific item
const shipping = await get('ContainerShipping')
```

## Key Statistics

### Global Maritime Trade

- **Annual Cargo**: 11+ billion tons transported
- **Container Traffic**: 140+ million TEU annually
- **Dry Bulk**: 2+ billion tons
- **Oil and Gas**: 500+ million tons via tankers
- **Investment Value**: $1.5+ trillion industry

### Shipping Lines

- **Global Capacity**: 30+ million TEU across top carriers
- **Container Vessels**: 5,000+ oceangoing vessels
- **Mega-Vessels**: 500+ ULCV ships (20,000+ TEU)
- **Fleet Growth**: Modest new capacity, high replacements

### Ports

- **Major Container Ports**: 100+ ports handling 1M+ TEU annually
- **Global Port Traffic**: 500+ million containers annually
- **Top 3 Ports**: Shanghai, Singapore, Ningbo (100M+ TEU combined)
- **Port Investment**: $50B+ annually in infrastructure

### Shipbuilding

- **Annual Output**: 40-50 million CGT
- **Order Book**: 4,000+ vessels valued at $150B+
- **Average Timelines**: 2-4 years for construction
- **Employment**: 500,000+ shipyard workers globally

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

### Adding Content

When contributing new maritime domain documentation:

1. Follow MDX frontmatter format with `$id`, `$context`, `$type`, `name`, `naicsCode`
2. Include NAICS classification and APQC mapping
3. Reference related domains with cross-links
4. Provide data-backed statistics and examples
5. Link to external resources and authoritative sources

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Attribution is appreciated:
> Maritime.org.ai - Ontology for the global maritime shipping, ports, and offshore industry
> Licensed under CC BY-SA 4.0

## Sources and References

### Industry Organizations

- **International Maritime Organization (IMO)**: SOLAS, MARPOL, Environmental regulations
- **World Shipping Council**: Container shipping statistics and advocacy
- **BIMCO**: Shipping industry best practices and standards
- **American Association of Port Authorities (AAPA)**: Port industry advocacy (US/Canada)
- **International Association of Ports and Harbors (IAPH)**: Global port organization

### Market Intelligence

- **Clarkson Research**: Shipping market data and analysis
- **Alphaliner**: Container shipping intelligence
- **Lloyd's List**: Shipping news and market information
- **Splash**: Tanker and maritime news
- **Rystad Energy**: Offshore market analysis
- **Freightos**: Shipping rate benchmarks

### Standards and Classification

- **DNV-GL, Lloyds Register, Bureau Veritas**: Ship classification societies
- **NAICS 2022**: North American Industry Classification System
- **API, ISO, EN**: Technical and safety standards
- **World Bank**: Port performance and development statistics

## Support and Contact

For questions, issues, or contributions regarding maritime.org.ai:

- **Repository**: [github.com/dot-org-ai/maritime.org.ai](https://github.com/dot-org-ai/maritime.org.ai)
- **Issues**: Submit via GitHub issues for bugs or feature requests
- **Discussions**: Community forums for knowledge sharing

---

**Last Updated**: November 2024
**Version**: 0.0.1
**Status**: Active Development

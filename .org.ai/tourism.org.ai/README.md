---
$id: https://tourism.org.ai
$context: https://tourism.org.ai
name: tourism.org.ai
parent: business.org.ai
license: CC-BY-SA-4.0
---

# tourism.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for the tourism industry - travel services, accommodations, attractions, transportation, and destination management.

## Overview

The tourism industry encompasses all businesses and services supporting travel and tourism activities, including travel agencies, hotels, attractions, transportation, tour operators, and destination management. This domain covers NAICS codes 4800-5600 (Transportation and Travel Services) and related sectors, representing a $2+ trillion global industry with over 300 million direct and indirect employees.

This repository contains MDX documentation for tourism.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai)

## Industry Overview

The tourism industry is characterized by:
- **Global Scale**: $2+ trillion annual spending with 1.3 billion international arrivals
- **Service-Intensive**: High customer interaction and experience-driven value
- **Distributed Supply Chain**: Coordination of transportation, accommodation, attractions, and services
- **Seasonal Dynamics**: Strong seasonal patterns affecting demand and pricing
- **Technology Transformation**: Digital platforms revolutionizing discovery, booking, and delivery
- **Economic Impact**: Significant employment, infrastructure investment, and destination development
- **Post-Pandemic Recovery**: Strong recovery with shifts toward domestic and sustainable travel

## NAICS Classification Alignment

Tourism spans multiple NAICS classifications reflecting its diverse components:

### Primary Tourism NAICS Codes

#### Air Transportation (NAICS 481)
- **4811**: Scheduled Air Transportation (commercial airlines)
- **4812**: Nonscheduled Air Transportation (charter flights)
- **Significance**: Critical international and long-distance transport

#### Rail Transportation (NAICS 482)
- **4821**: Rail Transportation (Amtrak, regional rail)
- **4822**: Rail Transportation of Freight
- **Significance**: Growing segment especially for premium and regional travel

#### Water Transportation (NAICS 483)
- **4832**: Inland Water Passenger Transportation (cruise lines, river cruises)
- **Significance**: Cruise industry $150+ billion global market

#### Other Transportation (NAICS 485-487)
- **4851**: Taxi and Limousine Service
- **4852**: Motor Coach and Bus Transportation
- **4855**: Charter Bus Industry
- **Significance**: Ground transportation and tour operator services

#### Accommodation (NAICS 721)
- **7211**: Traveler Accommodation (hotels, motels, resorts)
- **7212**: RV Parks and Recreational Camps
- **7213**: Rooming and Boarding Houses
- **Significance**: $200+ billion U.S. market

#### Food Services (NAICS 722)
- **7223**: Special Food Services (catering, food service contractors)
- **7225**: Restaurants and Other Eating Places
- **Significance**: Food and beverage integral to tourism experience

#### Travel Services (NAICS 5615)
- **5615**: Travel Arrangement and Reservation Services (travel agencies, TMCs, OTAs)
- **Significance**: Distribution and coordination of travel services

#### Information Technology Services (NAICS 5415)
- **5415**: Computer and IT Services (travel technology, GDS, booking systems)
- **Significance**: Critical infrastructure for modern travel commerce

#### Professional Services (NAICS 541)
- **5411**: Professional Accounting Services
- **5412**: Legal Services
- **Significance**: Supporting services for tourism businesses

### Tourism Sector Hierarchy in NAICS

```
Transportation and Warehousing (48)
├── Air Transportation (481)
├── Rail Transportation (482)
├── Water Transportation (483)
├── Ground Passenger Transportation (485)
└── Scenic and Sightseeing Transportation (487)

Leisure and Hospitality (72)
├── Accommodation (721)
└── Food Services and Drinking Places (722)

Professional and Business Services (54)
├── Professional Services
├── Management Services
├── Computer and IT Services (5415)
└── Travel Arrangement Services (5615)

Retail Trade (44-45)
└── Activities related to tourism retail
```

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [business.org.ai](https://business.org.ai)
                └── **tourism.org.ai**
                    ├── [TravelAgencies](./TravelAgencies.mdx) (NAICS 5615 - Travel Services)
                    ├── [Destinations](./Destinations.mdx) (NAICS 7211 - Attractions & Accommodations)
                    ├── [CruiseIndustry](./CruiseIndustry.mdx) (NAICS 4832 - Water Transportation)
                    ├── [AdventureTourism](./AdventureTourism.mdx) (NAICS 7211 - Outdoor Recreation)
                    ├── [BusinessTravel](./BusinessTravel.mdx) (NAICS 5615 - Corporate Travel)
                    └── [TravelTech](./TravelTech.mdx) (NAICS 5415 - Travel Technology)

## Structure

```
tourism.org.ai/
├── README.md                    # This file
├── package.json                 # NPM package config
├── index.ts                     # Type & const exports
├── types.ts                     # TypeScript type definitions
├── tsconfig.json                # TypeScript configuration
├── TravelAgencies.mdx           # NAICS 5615 - Travel agencies, OTAs, TMCs
├── Destinations.mdx             # NAICS 7211 - DMOs, attractions, theme parks
├── CruiseIndustry.mdx           # NAICS 4832 - Cruise lines, maritime tourism
├── AdventureTourism.mdx         # NAICS 7211 - Adventure and eco-tourism
├── BusinessTravel.mdx           # NAICS 5615 - Corporate travel, MICE, conventions
└── TravelTech.mdx               # NAICS 5415 - Booking platforms, GDS, travel tech
```

## Key Tourism Segments

### Travel Distribution and Intermediaries (NAICS 5615)
**TravelAgencies.mdx** covers:
- Online Travel Agencies (OTAs): Booking.com, Expedia, Agoda, TripAdvisor
- Traditional Travel Agencies: Retail and corporate travel advisors
- Travel Management Companies (TMCs): Corporate travel program management
- Tour Operators: Package and customized tour providers
- Destination Management Companies: Local ground arrangements
- Business Model: Commission-based, service fee, markup revenue

### Destinations and Attractions (NAICS 7211)
**Destinations.mdx** covers:
- Destination Management Organizations (DMOs): National, regional, and local tourism boards
- Destination Types: Urban, beach, mountain, cultural, adventure, wellness destinations
- Attractions: Theme parks, museums, natural sites, cultural heritage
- Infrastructure: Hotels, restaurants, transportation, entertainment
- Economics: Visitor spending, economic impact, carrying capacity
- Market Trends: Overtourism, sustainable tourism, experience-seeking

### Cruise and Maritime Tourism (NAICS 4832)
**CruiseIndustry.mdx** covers:
- Cruise Lines: Ocean cruises, river cruises, expedition cruising
- Ship Types: Mega-ships, premium, luxury, expedition vessels
- Major Operators: Carnival, Royal Caribbean, Norwegian Cruise Line
- Operations: Itineraries, ports, onboard services, shore excursions
- Economics: Revenue streams (room fare + ancillaries), cost structure, profitability
- Market Segments: Mass market, premium, luxury, expedition

### Adventure and Eco-Tourism (NAICS 7211)
**AdventureTourism.mdx** covers:
- Activity Types: Trekking, water sports, mountaineering, wildlife viewing
- Tour Operators: Adventure specialists, eco-tourism providers
- Sustainability: Environmental and cultural conservation focus
- Market Growth: 10-15% annually, affluent and experience-seeking travelers
- Segments: Soft adventure to extreme expeditions, volunteer tourism
- Certifications: Rainforest Alliance, Green Globe, GSTC standards

### Business Travel and MICE (NAICS 5615)
**BusinessTravel.mdx** covers:
- Travel Management Companies: Corporate travel program administration
- Meetings and Conferences: Association, corporate, and trade events
- Incentive Travel: Rewarding employee and sales team performance
- Trade Shows: Industry-specific exhibitions and networking
- Economics: $1.2+ trillion global business travel + $600+ billion MICE
- Post-Pandemic: Hybrid events, virtual alternatives, domestic shift

### Travel Technology Infrastructure (NAICS 5415)
**TravelTech.mdx** covers:
- Global Distribution Systems (GDS): Amadeus, Sabre, Travelport
- Online Travel Agencies (OTAs): Technology platforms for booking
- Booking Engines: Hotel and airline direct booking systems
- Travel APIs: Real-time integration for diverse business models
- Metasearch: Price comparison and referral platforms
- Technology Trends: AI, dynamic packaging, blockchain, IoT integration

## Key Performance Indicators (KPIs)

### Industry-Level Metrics
- **Global Tourism Spending**: $2+ trillion annually
- **International Arrivals**: 1.3 billion annually (pre-pandemic)
- **Employment**: 300+ million direct and indirect jobs
- **Economic Impact**: 10%+ of global GDP
- **Growth Rate**: 5-8% annually (historical), 10-15% for adventure tourism

### Accommodation Metrics
- **Occupancy Rate**: Percentage of available rooms/beds occupied
- **Average Daily Rate (ADR)**: Average revenue per room per day
- **Revenue per Available Room (RevPAR)**: ADR × Occupancy rate
- **Guest Satisfaction Score (GSS)**: NPS and online review metrics
- **Cost per Occupied Room (CPOR)**: Operating costs per occupied unit

### Travel Agency/TMC Metrics
- **Booking Load Factor**: Percentage of tour capacity booked
- **Average Revenue per Booking**: Revenue per transaction
- **Customer Acquisition Cost (CAC)**: Cost to acquire new customer
- **Lifetime Value (LTV)**: Total revenue from customer relationship
- **Net Promoter Score (NPS)**: Customer satisfaction and loyalty

### Tourism Destination Metrics
- **Visitor Arrivals**: Total visitors to destination
- **Average Length of Stay (LOS)**: Nights per visitor
- **Average Spend per Visitor**: Total spending per traveler
- **Occupancy Rate**: Hotel room occupancy
- **Tourism Economic Impact**: Total economic contribution to destination

## Technology Systems

### Travel Distribution Systems
- **Global Distribution Systems (GDS)**: Amadeus, Sabre, Travelport
- **Online Travel Agencies (OTAs)**: Booking.com, Expedia, Agoda, TripAdvisor
- **Booking Engines**: SiteMinder, TravelClick, hotel direct booking
- **Metasearch Engines**: Kayak, Skyscanner, Google Hotels, Trivago
- **Travel APIs**: Amadeus, Skyscanner, Sabre, Travelport APIs

### Hospitality Management Systems
- **Property Management Systems (PMS)**: Oracle OPERA, Mews, Cloudbeds
- **Revenue Management Systems (RMS)**: IDeaS, Duetto, Rainmaker
- **Point of Sale (POS)**: Toast, Square, Micros, Clover
- **Channel Managers**: SiteMinder, TravelClick, RateGain, D-EDGE
- **Workforce Management**: HotSchedules, 7shifts, Deputy

### Booking and Corporate Travel
- **Travel Management Platforms**: Concur, TravelBank, Egencia
- **Expense Management**: Concur, Expensify, Abacus
- **Meeting Management**: Eventbrite, Splash, Regonline
- **Event Technology**: Zoom, Hopin, vFairs (hybrid/virtual events)

### Guest Experience and Analytics
- **Guest Wi-Fi**: Guest Wi-Fi platforms with analytics
- **Review Management**: TripAdvisor, Google Reviews, Reputation monitoring
- **Mobile Apps**: Property apps, activity booking, concierge services
- **Business Intelligence**: Revenue analytics, market data (STR, CBRE)

## Industry Segments by Revenue Scale

### Largest Segments (Pre-Pandemic)
1. **Accommodation**: $650+ billion (hotels, resorts, vacation rentals)
2. **Travel Agencies/OTAs**: $500+ billion (including merchant model GMV)
3. **Food & Beverage**: $400+ billion (tourism-related dining)
4. **Ground Transportation**: $250+ billion (car rental, coach, taxi)
5. **Air Transportation**: $200+ billion (passenger flights)
6. **Activities & Attractions**: $150+ billion (theme parks, museums, tours)
7. **Cruise Industry**: $150+ billion (cruise lines, maritime tourism)

## Cross-References

### Related Ontologies
- **[naics.org.ai](https://naics.org.ai)** - NAICS classification standards
  - [naics.org.ai/48](https://naics.org.ai/48) - Transportation and Warehousing
  - [naics.org.ai/481](https://naics.org.ai/481) - Air Transportation
  - [naics.org.ai/483](https://naics.org.ai/483) - Water Transportation
  - [naics.org.ai/72](https://naics.org.ai/72) - Accommodation and Food Services
  - [naics.org.ai/5615](https://naics.org.ai/5615) - Travel Services

- **[hospitality.org.ai](https://hospitality.org.ai)** - Accommodation and food services
- **[transport.org.ai](https://transport.org.ai)** - Transportation services
- **[entertainment.org.ai](https://entertainment.org.ai)** - Entertainment and attractions
- **[events.org.ai](https://events.org.ai)** - Event management and MICE
- **[retail.org.ai](https://retail.org.ai)** - Retail operations and commerce
- **[software.org.ai](https://software.org.ai)** - Software and technology platforms

### Standards & Frameworks
- **[apqc.org.ai](https://apqc.org.ai)** - Process Classification Framework
- **[iso.org.ai](https://iso.org.ai)** - International quality and safety standards
- **[onet.org.ai](https://onet.org.ai)** - Occupational classifications

### Industry Organizations and Standards
- **UNWTO**: United Nations World Tourism Organization
- **GBTA**: Global Business Travel Association
- **CLIA**: Cruise Lines International Association
- **ATTA**: Adventure Travel World Association
- **GSTC**: Global Sustainable Tourism Council
- **ATWS**: Adventure Travel World Summit

## Usage

### Import as NPM Package

```typescript
import { Tourism, things } from 'tourism.org.ai'
```

### Use in MDX

```mdx
---
$type: https://tourism.org.ai/Tourism
name: Example Tourism Service
naicsCode: "5615"
---

# Example Tourism Service
```

### Reference Links

All tourism domains include cross-references:

```markdown
- [tourism.org.ai](https://tourism.org.ai) - Tourism industry overview
- [hospitality.org.ai](https://hospitality.org.ai) - Hotels and food services
- [transport.org.ai](https://transport.org.ai) - Transportation services
- [events.org.ai](https://events.org.ai) - Event management and MICE
```

## Content Structure

Each MDX file in this domain includes:

### Frontmatter
```yaml
$context: https://tourism.org.ai
$id: https://tourism.org.ai/[SegmentName]
$type: https://tourism.org.ai/Tourism
name: "[Segment Name]"
naicsCode: "XXXX"
naicsDescription: "[NAICS Description]"
subsector: "[Subsector]"
description: "[Comprehensive description]"
```

### Content Sections
- **Overview**: Segment description and industry context
- **Market Segments**: Types of businesses and service models
- **Major Players**: Leading companies and organizations
- **Business Models**: Revenue models and economics
- **Operations**: Key processes and infrastructure
- **Technology**: Systems and digital transformation
- **Challenges & Trends**: Industry issues and emerging trends
- **Economics**: Market size, growth, profitability metrics
- **Quick Facts**: Key statistics and figures
- **Related Domains**: Cross-references to related ontologies

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

### Contributing Guidelines
- Follow existing MDX structure and formatting
- Include proper NAICS code alignment
- Add cross-references to related domains
- Include verified industry statistics
- Use professional, comprehensive tone
- Maintain consistent structure across files

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## Sources

### Industry Organizations
- United Nations World Tourism Organization (UNWTO)
- Global Business Travel Association (GBTA)
- Cruise Lines International Association (CLIA)
- Adventure Travel World Association (ATTA)
- Global Sustainable Tourism Council (GSTC)
- Meetings Professionals International (MPI)

### Research and Data
- PhoCusWright - Travel industry research
- Skift - Travel intelligence and news
- eMarketer - Digital travel trends
- Statista - Travel and tourism data
- Travel Association - Industry research
- STR (Smith Travel Research) - Hotel data
- CBRE Hotels - Commercial real estate research

### Regulatory and Classification
- U.S. Census Bureau - NAICS classifications
- Bureau of Labor Statistics - Employment data
- U.S. International Trade Commission - Trade data
- National Tourism Boards - Official tourism data

### Company Reports
- Booking Holdings and Expedia investor relations
- Amadeus, Sabre, Travelport GDS reports
- Carnival, Royal Caribbean, Norwegian Cruise Lines
- Major hotel brands and TMC company reports
- Tourism board and DMO publications

---
$id: https://hospitality.org.ai
$context: https://hospitality.org.ai
name: hospitality.org.ai
parent: business.org.ai
license: CC-BY-SA-4.0
---

# hospitality.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for the hospitality industry - accommodation and food services.

## Overview

The hospitality industry encompasses establishments that provide lodging, food services, and beverage services to customers. This domain covers NAICS Sector 72 (Accommodation and Food Services), representing a $1+ trillion industry with over 15 million employees in the United States.

This repository contains MDX documentation for hospitality.org.ai, part of the .org.ai ontology ecosystem.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [business.org.ai](https://business.org.ai)

## Industry Overview

The hospitality industry is characterized by:
- **Service-intensive operations** with high customer interaction
- **24/7 operations** requiring complex scheduling and staffing
- **Experience-driven value** where quality of service differentiates brands
- **Seasonal demand fluctuations** requiring revenue management strategies
- **Labor-intensive operations** with significant human capital requirements
- **Technology transformation** through PMS, POS, booking systems, and contactless services

### NAICS Sector 72: Accommodation and Food Services

The hospitality industry is organized under NAICS Sector 72, which divides into two major subsectors:

#### 721 - Accommodation
Establishments providing lodging or short-term accommodations:
- **7211** - Traveler Accommodation (hotels, motels, resorts, B&Bs)
- **7212** - RV Parks and Recreational Camps
- **7213** - Rooming and Boarding Houses

#### 722 - Food Services and Drinking Places
Establishments preparing meals, snacks, and beverages for immediate consumption:
- **7223** - Special Food Services (catering, food contractors, mobile food services)
- **7224** - Drinking Places (bars, taverns, nightclubs, brewpubs)
- **7225** - Restaurants and Other Eating Places (full-service, limited-service, cafeterias)

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [business.org.ai](https://business.org.ai)
                └── **hospitality.org.ai**
                    ├── [Hotels](./Hotels.mdx) (NAICS 7211)
                    ├── [Restaurants](./Restaurants.mdx) (NAICS 7225)
                    ├── [Bars](./Bars.mdx) (NAICS 7224)
                    ├── [Catering](./Catering.mdx) (NAICS 7223)
                    └── [TravelAccommodation](./TravelAccommodation.mdx)

## Structure

```
hospitality.org.ai/
├── README.md                   # This file
├── package.json                # NPM package config
├── index.ts                    # Type & const exports
├── types.ts                    # TypeScript type definitions
├── [Hospitality].mdx          # Type template
├── Hotels.mdx                  # NAICS 7211 - Hotels and lodging
├── Restaurants.mdx             # NAICS 7225 - Restaurants and eating places
├── Bars.mdx                    # NAICS 7224 - Drinking establishments
├── Catering.mdx                # NAICS 7223 - Special food services
└── TravelAccommodation.mdx     # Resorts, vacation rentals, B&Bs
```

## APQC Process Classification Framework for Hospitality

The hospitality industry follows specialized processes across operating models:

### Core Operating Processes

#### Guest Services (Accommodation)
- **Reservation Management**: Central reservation systems, channel management, booking engines
- **Front Desk Operations**: Check-in/check-out, room assignment, guest requests
- **Housekeeping Operations**: Room cleaning, turndown service, linen management
- **Concierge Services**: Guest assistance, activity booking, local recommendations
- **Guest Relations**: Complaint resolution, loyalty programs, personalized service

#### Food & Beverage Operations
- **Menu Planning**: Recipe development, seasonal menus, dietary accommodations
- **Kitchen Operations**: Food preparation, quality control, food safety compliance
- **Service Delivery**: Table service, counter service, room service
- **Bar Operations**: Beverage preparation, inventory control, responsible service
- **Banquet & Events**: Event planning, catering coordination, setup/breakdown

#### Revenue Management
- **Pricing Strategy**: Dynamic pricing, yield management, competitive analysis
- **Channel Management**: OTA relationships, direct booking optimization, GDS integration
- **Demand Forecasting**: Historical analysis, market trends, event impact
- **Inventory Optimization**: Room/table allocation, overbooking strategies
- **Promotional Planning**: Packages, seasonal offers, group rates

### Support Processes

#### Property Management
- **Facility Maintenance**: Preventive maintenance, repairs, renovations
- **Energy Management**: HVAC optimization, sustainability initiatives
- **Security Operations**: Access control, surveillance, emergency procedures
- **Safety & Sanitation**: Health codes, fire safety, food safety

#### Supply Chain
- **Procurement**: Vendor selection, contract negotiation, purchasing
- **Inventory Management**: Par levels, just-in-time delivery, waste reduction
- **Receiving & Storage**: Quality inspection, proper storage, rotation (FIFO)
- **Cost Control**: Portion control, recipe costing, waste tracking

#### Human Capital
- **Staffing & Scheduling**: Demand-based scheduling, shift management, labor cost optimization
- **Training & Development**: Service standards, safety training, skill development
- **Performance Management**: Quality monitoring, guest feedback, KPIs
- **Employee Relations**: Retention programs, workplace culture, benefits administration

## Technology Systems

### Property Management Systems (PMS)
Leading hotel management platforms:
- **Oracle OPERA**: Enterprise-grade PMS for hotels and resorts
- **Mews**: Cloud-based PMS for modern hotels
- **Cloudbeds**: All-in-one hospitality platform
- **RoomKey**: Integrated PMS and booking engine
- **innRoad**: PMS for independent properties

### Point of Sale (POS) Systems
Restaurant and F&B management:
- **Toast**: Restaurant-focused POS with integrated payments
- **Square**: Small business POS with low barriers to entry
- **Aloha**: NCR's hospitality POS platform
- **Micros (Oracle)**: Enterprise restaurant management
- **Clover**: Versatile POS for food service
- **Lightspeed**: Cloud POS for restaurants and retail

### Booking & Distribution
- **Central Reservation Systems (CRS)**: Direct booking management
- **Global Distribution Systems (GDS)**: Amadeus, Sabre, Travelport
- **Online Travel Agencies (OTA)**: Booking.com, Expedia, Airbnb
- **Channel Managers**: SiteMinder, TravelClick, RateGain
- **Metasearch**: Google Hotel Ads, TripAdvisor, Kayak

### Guest Experience
- **Mobile Apps**: Mobile check-in, digital keys, in-app ordering
- **Guest Wi-Fi**: Managed internet access with analytics
- **In-Room Technology**: Smart TVs, voice assistants, IoT controls
- **Contactless Services**: QR code menus, mobile payment, self-service kiosks
- **Review Management**: TripAdvisor, Google Reviews, reputation monitoring

### Operations & Analytics
- **Workforce Management**: HotSchedules, 7shifts, Deputy
- **Inventory Management**: MarketMan, BevSpot, BlueCart
- **Revenue Management Systems**: IDeaS, Duetto, Rainmaker
- **Business Intelligence**: STR reports, RevPAR analytics, labor cost analysis
- **Accounting**: Hotel-specific accounting, cost of goods sold (COGS) tracking

## Key Performance Indicators (KPIs)

### Accommodation Metrics
- **Occupancy Rate**: Rooms sold / Total rooms available
- **Average Daily Rate (ADR)**: Room revenue / Rooms sold
- **Revenue per Available Room (RevPAR)**: Total room revenue / Total rooms available
- **Revenue per Available Customer (RevPAC)**: Total revenue / Total guests
- **Length of Stay (LOS)**: Average nights per guest
- **Guest Satisfaction Score (GSS)**: Survey results, NPS
- **Online Reputation Score**: Aggregate review ratings
- **Cost per Occupied Room (CPOR)**: Operating costs / Occupied rooms

### Food & Beverage Metrics
- **Average Check**: Total revenue / Number of covers
- **Table Turn Rate**: Covers served / Number of tables
- **Food Cost Percentage**: COGS / Food sales (target: 28-35%)
- **Beverage Cost Percentage**: Beverage COGS / Beverage sales (target: 20-30%)
- **Labor Cost Percentage**: Labor costs / Total revenue (target: 30-35%)
- **Prime Cost**: COGS + Labor (target: <60%)
- **Revenue per Available Seat Hour (RevPASH)**: Revenue / (Seats × Operating hours)
- **Guest Satisfaction**: Service quality scores, online reviews

## Industry Segments

### Accommodation Types
- **Full-Service Hotels**: Complete amenities, F&B, meeting space, concierge
- **Limited-Service Hotels**: Essential amenities, minimal F&B, lower price point
- **Luxury Hotels**: Premium service, high-end amenities, personalized experiences
- **Boutique Hotels**: Unique design, intimate atmosphere, local character
- **Resorts**: Destination properties with comprehensive recreation and dining
- **Extended Stay**: Suite-style rooms, kitchenettes, weekly/monthly rates
- **Vacation Rentals**: Whole home rentals, private accommodations (Airbnb, Vrbo)
- **Bed & Breakfasts**: Owner-operated, breakfast included, residential setting

### Restaurant Types
- **Fine Dining**: Multi-course meals, extensive wine lists, formal service
- **Casual Dining**: Full-service, moderate prices, relaxed atmosphere (Applebee's, Chili's)
- **Fast Casual**: Counter service, higher quality than QSR, fresh ingredients (Chipotle, Panera)
- **Quick Service (QSR)**: Fast food, limited menu, speed and efficiency (McDonald's, Subway)
- **Fast Fine**: Upscale quick service, quality ingredients, efficient operations
- **Ghost Kitchens**: Delivery-only operations, no dining room, optimized for takeout
- **Food Halls**: Multiple vendors, shared seating, curated food experiences

## Cross-References

### Related Ontologies
- **[naics.org.ai/72](https://naics.org.ai/72)** - NAICS Sector 72: Accommodation and Food Services
- **[industries.org.ai](https://industries.org.ai)** - Industry classifications and standards
- **[retail.org.ai](https://retail.org.ai)** - Retail operations and consumer services
- **[food.org.ai](https://food.org.ai)** - Food products, ingredients, and cuisines
- **[tourism.org.ai](https://tourism.org.ai)** - Travel and tourism industry
- **[events.org.ai](https://events.org.ai)** - Event planning and management
- **[real-estate.org.ai](https://real-estate.org.ai)** - Commercial property and facilities

### Standards & Frameworks
- **[apqc.org.ai](https://apqc.org.ai)** - Process Classification Framework
- **[iso.org.ai](https://iso.org.ai)** - International quality and safety standards
- **[onet.org.ai](https://onet.org.ai)** - Occupational classifications (chefs, servers, hotel managers)

## Usage

### Import as NPM Package

```typescript
import { Hospitality, things } from 'hospitality.org.ai'
```

### Use in MDX

```mdx
---
$type: https://hospitality.org.ai/Hospitality
name: Example
---

# Example Hospitality
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

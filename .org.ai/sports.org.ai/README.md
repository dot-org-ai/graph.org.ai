---
$id: https://sports.org.ai
$context: https://sports.org.ai
name: sports.org.ai
parent: things.org.ai
license: CC-BY-SA-4.0
---

# sports.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for sports and fitness industries.

## Overview

This repository contains comprehensive MDX documentation for sports.org.ai, covering the sports, recreation, and fitness industries based on NAICS Sector 71 (Arts, Entertainment, and Recreation). This domain provides structured knowledge about professional sports, sports facilities, sports media, sports technology, fitness services, and sports equipment manufacturing.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [schema.org.ai/SportsEvent](https://schema.org.ai/SportsEvent) / [schema.org.ai/SportsOrganization](https://schema.org.ai/SportsOrganization)

## Sports Industry Ecosystem

The sports industry is a dynamic, multi-billion dollar global ecosystem encompassing professional and amateur sports, fitness and recreation, sports media and broadcasting, sports technology and analytics, and sports equipment manufacturing. The industry has experienced significant growth driven by media rights deals, digital transformation, global fan engagement, and the intersection of sports with entertainment, technology, and health.

### Key Segments

1. **Professional Sports** - Leagues, teams, athlete management, and competitive sports
2. **Sports Facilities** - Stadiums, arenas, training centers, and sports venues
3. **Sports Media** - Broadcasting, streaming, journalism, and content creation
4. **Sports Technology** - Analytics, wearables, performance tracking, and innovation
5. **Fitness Industry** - Gyms, personal training, group fitness, and wellness
6. **Sports Equipment** - Apparel, gear, footwear, and sporting goods manufacturing

## NAICS Sector 71 - Arts, Entertainment, and Recreation

This domain is primarily structured around NAICS Sector 71, which comprises establishments engaged in operating facilities or providing services to meet cultural, entertainment, and recreational interests.

### NAICS 711 - Performing Arts, Spectator Sports, and Related Industries

The core sports-related subsector covering professional sports, sporting events, and related activities:

| Code | Industry Group | Description |
|------|---------------|-------------|
| 7111 | Performing Arts Companies | Includes sports-related performances and exhibitions |
| 7112 | Spectator Sports | Professional and semi-professional sports teams and clubs |
| 7113 | Promoters of Events | Sports event promotion, management, and organization |
| 7114 | Agents and Managers | Sports agents, athlete management, talent representation |
| 7115 | Independent Artists | Independent athletes, sports personalities |

#### 7112 - Spectator Sports (Detailed)

- **71121 Spectator Sports**
  - **711211 Sports Teams and Clubs** - Professional and semi-professional sports teams
  - **711212 Racetracks** - Horse racing, auto racing, and other racing venues
  - **711219 Other Spectator Sports** - Sports events, tournaments, competitions

### NAICS 713 - Amusement, Gambling, and Recreation Industries

Recreation and fitness facilities:

| Code | Industry Group | Description |
|------|---------------|-------------|
| 7131 | Amusement Parks and Arcades | Theme parks with sports attractions |
| 7132 | Gambling Industries | Sports betting, fantasy sports (where legal) |
| 7139 | Other Amusement and Recreation | Fitness centers, sports clubs, recreation facilities |

#### 7139 - Other Amusement and Recreation (Detailed)

- **71394 Fitness and Recreational Sports Centers**
  - **713940 Fitness and Recreational Sports Centers** - Gyms, health clubs, yoga studios
- **71395 Bowling Centers**
- **71399 All Other Amusement and Recreation Industries**
  - Golf courses, skiing facilities, marinas, sports instruction

### Related NAICS Codes

**Manufacturing (NAICS 31-33)**:
- **3149 Other Textile Product Mills** - Sports apparel manufacturing
- **31621 Footwear Manufacturing** - Athletic footwear
- **33992 Sporting and Athletic Goods Manufacturing** - Sports equipment, gear
- **339920 Sporting and Athletic Goods Manufacturing** - Balls, bats, protective equipment

**Retail (NAICS 44-45)**:
- **45111 Sporting Goods Stores** - Retail sale of sports equipment and apparel
- **451110 Sporting Goods Stores**

**Information (NAICS 51)**:
- **515 Broadcasting** - Sports broadcasting and media
- **51512 Television Broadcasting** - Sports television networks
- **51913 Internet Publishing and Broadcasting** - Sports streaming, digital media

## Industry Evolution

The sports industry has undergone massive transformation driven by:

- **Digital Media** - Streaming platforms, social media engagement, direct-to-consumer content
- **Data Analytics** - Performance tracking, predictive analytics, player evaluation
- **Wearable Technology** - Fitness trackers, biometric monitoring, recovery optimization
- **Globalization** - International leagues, global fan bases, worldwide talent pools
- **Sports Betting** - Legalization and integration with sports media and entertainment
- **Esports** - Competitive gaming as spectator sport
- **Fan Engagement** - Mobile apps, fantasy sports, interactive experiences
- **Health & Wellness** - Integration of fitness with lifestyle and preventive health

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── **sports.org.ai**

## Structure

```
sports.org.ai/
├── README.md                  # This file
├── package.json               # NPM package config
├── index.ts                   # Type & const exports
├── types.ts                   # TypeScript type definitions
├── [Sports].mdx               # Type template
│
├── ProfessionalSports.mdx     # NAICS 7112 - Leagues, teams, athletes
├── SportsFacilities.mdx       # Stadiums, arenas, training centers
├── SportsMedia.mdx            # Broadcasting, streaming, journalism
├── SportsTech.mdx             # Analytics, wearables, performance tracking
├── FitnessIndustry.mdx        # NAICS 713940 - Gyms, training, wellness
└── SportsEquipment.mdx        # NAICS 339920 - Apparel, gear, manufacturing
```

## Usage

### Import as NPM Package

```typescript
import { Sports, things } from 'sports.org.ai'
```

### Use in MDX

```mdx
---
$type: https://sports.org.ai/Sports
name: Example
---

# Example Sports
```

## Cross-References

This domain connects with other .org.ai domains for comprehensive industry coverage:

| Domain | Relationship | Description |
|--------|--------------|-------------|
| [naics.org.ai/71](https://naics.org.ai/Sectors/71) | Classification | NAICS Sector 71 (Arts, Entertainment, Recreation) |
| [naics.org.ai/7112](https://naics.org.ai/Industries/7112) | Classification | Spectator Sports industry codes |
| [naics.org.ai/713940](https://naics.org.ai/Industries/713940) | Classification | Fitness and Recreational Sports Centers |
| [media.org.ai](https://media.org.ai) | Media | Sports broadcasting, streaming, and content |
| [health.org.ai](https://health.org.ai) | Health | Fitness, wellness, sports medicine, injury prevention |
| [events.org.ai](https://events.org.ai) | Events | Sporting events, tournaments, competitions |
| [tech.org.ai](https://tech.org.ai) | Technology | Sports technology, analytics platforms, wearables |
| [business.org.ai](https://business.org.ai) | Business | Sports business models, sponsorships, economics |
| [brands.org.ai](https://brands.org.ai) | Brands | Sports brands, team identities, athlete brands |
| [companies.org.ai](https://companies.org.ai) | Companies | Sports organizations, leagues, and businesses |

## APQC Process Classification Framework

While APQC doesn't have a sports-specific framework, sports organizations utilize processes from multiple industries:

### Revenue Generation (from Media & Entertainment)
- **3.0 Market and Sell Products and Services**
  - 3.1 Develop marketing strategies for sports properties
  - 3.2 Manage ticket sales and season memberships
  - 3.3 Negotiate media rights and sponsorships
  - 3.4 Develop merchandise and licensing programs

### Event Operations (from Events & Entertainment)
- **5.0 Deliver Sporting Events**
  - 5.1 Schedule games, matches, and competitions
  - 5.2 Manage venue operations and game-day logistics
  - 5.3 Coordinate broadcast and media coverage
  - 5.4 Ensure player/athlete safety and compliance
  - 5.5 Manage fan experience and engagement

### Athlete Management (from Human Capital)
- **7.0 Manage Athletes and Sports Personnel**
  - 7.1 Scout, recruit, and draft athletes
  - 7.2 Negotiate player contracts and compensation
  - 7.3 Manage training and performance development
  - 7.4 Monitor health, fitness, and injury recovery
  - 7.5 Handle trades, transfers, and roster management

### Fitness Operations (from Service Industries)
- **5.0 Deliver Fitness and Recreation Services**
  - 5.1 Manage membership sales and retention
  - 5.2 Schedule classes and personal training sessions
  - 5.3 Maintain equipment and facilities
  - 5.4 Track member progress and engagement
  - 5.5 Ensure safety and regulatory compliance

## Major Sports Leagues & Organizations

### North American Professional Sports
- **NFL** (National Football League) - American football
- **NBA** (National Basketball Association) - Basketball
- **MLB** (Major League Baseball) - Baseball
- **NHL** (National Hockey League) - Ice hockey
- **MLS** (Major League Soccer) - Soccer/football

### International Sports Organizations
- **FIFA** - International football/soccer
- **UEFA** - European football
- **IOC** (International Olympic Committee) - Olympic Games
- **ICC** - International cricket
- **World Rugby** - International rugby

### Global Sports Properties
- **Formula 1** - Auto racing
- **UFC** (Ultimate Fighting Championship) - Mixed martial arts
- **WWE** - Sports entertainment/wrestling
- **PGA Tour** - Professional golf
- **ATP/WTA** - Professional tennis

## Industry Metrics & Economics

### Market Size (2023-2024)
- Global sports market: $620B+ annually
- North American sports market: $85B+
- Fitness industry (global): $100B+
- Sports equipment & apparel: $200B+

### Revenue Streams
1. **Media Rights** - Broadcast and streaming deals (40-60% for major leagues)
2. **Sponsorships** - Corporate partnerships and advertising (20-30%)
3. **Ticketing** - Gate receipts and attendance (15-25%)
4. **Merchandise** - Licensed apparel and products (5-10%)
5. **Digital** - Fantasy sports, betting, apps (growing rapidly)

### Employment
- Direct sports employment: 2M+ jobs (US)
- Fitness industry employment: 800K+ (US)
- Sports-related manufacturing: 150K+ (US)

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

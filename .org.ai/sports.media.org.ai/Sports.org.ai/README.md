---
$id: https://sports.media.org.ai
$context: https://sports.media.org.ai
name: sports.org.ai
license: CC-BY-SA-4.0
---

# sports.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Comprehensive sports industry ontology covering professional and amateur athletics, sports facilities, media, technology, fitness, and equipment manufacturing aligned with NAICS 711 (Performing Arts, Spectator Sports).

## Overview

This repository contains MDX documentation for sports.org.ai, part of the .org.ai ontology ecosystem. It covers the entire sports ecosystem from professional leagues and athletes to facilities, broadcasting, analytics, fitness services, and equipment manufacturing.

**Parent**: [industries.org.ai](https://industries.org.ai)

**NAICS Classification**: 7112 (Spectator Sports), 7139 (Other Amusement and Recreation Industries), 5121 (Motion Picture and Video Production)

## Types

### Core Sports Categories

- **[`Professional Sports`](./ProfessionalSports.mdx)** - Leagues, teams, professional athletes, sports management (NAICS 7112)
- **[`Sports Facilities`](./SportsFacilities.mdx)** - Stadiums, arenas, training centers, sports venues
- **[`Sports Media`](./SportsMedia.mdx)** - Broadcasting, streaming, sports journalism, content production (NAICS 5121, 5111)
- **[`Sports Technology`](./SportsTech.mdx)** - Analytics platforms, wearables, performance tracking, data solutions
- **[`Fitness Industry`](./FitnessIndustry.mdx)** - Gyms, fitness centers, personal training, group fitness classes (NAICS 7139)
- **[`Sports Equipment`](./SportsEquipment.mdx)** - Apparel, gear, equipment manufacturing, sports products (NAICS 3399)

## Hierarchy

```
sports.org.ai/
├── README.md                          # This file
├── ProfessionalSports.mdx             # Professional sports leagues and teams
├── SportsFacilities.mdx               # Venues and training facilities
├── SportsMedia.mdx                    # Broadcasting and sports journalism
├── SportsTech.mdx                     # Analytics and performance technology
├── FitnessIndustry.mdx                # Fitness services and wellness
└── SportsEquipment.mdx                # Sports equipment and apparel manufacturing
```

## NAICS Code Alignment

The sports industry spans multiple NAICS classifications:

| Category | NAICS Code | Description |
|----------|-----------|-------------|
| Professional Sports | 7112 | Spectator sports, professional athletes, sports teams |
| Sports Facilities | 7112, 7139 | Stadiums, arenas, training centers, sports clubs |
| Sports Media | 5121, 5111 | Motion picture and video production, broadcasting |
| Sports Technology | 5112, 5191 | Custom computer programming, data processing |
| Fitness Industry | 7139 | Fitness and recreational sports centers |
| Sports Equipment | 3399, 3161 | Sporting goods manufacturing, footwear |

## Key Industry Segments

### Professional Sports (NAICS 7112)
- Major professional leagues (NFL, NBA, MLB, NHL, MLS, etc.)
- Professional teams and franchises
- Athletes and sports management
- Sports agents and representation
- Event promotion and management

### Sports Facilities (NAICS 7112, 7139)
- Stadiums and arenas (capacity 10,000+)
- Sports training centers and academies
- Specialty sports facilities (golf courses, tennis courts, ice rinks)
- Equipment rental and management
- Facility management and operations

### Sports Media (NAICS 5121, 5111)
- Sports broadcasting networks
- Digital streaming platforms
- Sports journalism and reporting
- Sports content production
- Sports photography and videography
- Social media and fan engagement

### Sports Technology (NAICS 5112, 5191)
- Sports analytics and statistics platforms
- Wearable sports technology
- Performance tracking systems
- Video analysis and coaching software
- Fantasy sports platforms
- Sports betting and prediction analytics

### Fitness Industry (NAICS 7139)
- Health and fitness clubs
- Gym membership services
- Personal training services
- Group fitness classes
- Yoga and wellness studios
- Sports training camps

### Sports Equipment Manufacturing (NAICS 3399, 3161)
- Athletic apparel and footwear
- Sports equipment and gear
- Sporting goods manufacturing
- Sports nutrition and supplements
- Protective equipment
- Technology-integrated sports gear

## Data Sources

- **Professional Sports**: League websites, team records, player statistics
- **Sports Facilities**: Venue databases, IHRSA (International Health, Racquet & Sportsclub Association)
- **Sports Media**: Nielsen Sports, Moffett Nathanson, media network data
- **Sports Technology**: Venture capital databases, startup ecosystems
- **Fitness Industry**: IHRSA data, fitness membership databases
- **Sports Equipment**: Sporting goods trade associations, manufacturer data
- **O*NET**: Sports-related occupations and skills
- **Census & BLS**: Industry employment and economic data

## Relationships

### Connected Domains
- [`occupations.org.ai`](https://occupations.org.ai) - Athletes, coaches, sports managers, fitness professionals
- [`events.org.ai`](https://events.org.ai) - Sporting events, tournaments, competitions
- [`media.org.ai`](https://media.org.ai) - Sports broadcasting and journalism
- [`health.org.ai`](https://health.org.ai) - Sports medicine, athletic training, fitness
- [`tech.org.ai`](https://tech.org.ai) - Sports analytics, wearables, performance software
- [`entertainment.org.ai`](https://entertainment.org.ai) - Sports as entertainment, fan experiences
- [`retail.org.ai`](https://retail.org.ai) - Sports equipment retail, online sales
- [`business.org.ai`](https://business.org.ai) - Sports management, franchise operations

## Key Metrics

### Industry Size & Growth
- **Market Size**: ~$200+ billion annually (global sports market)
- **US Market**: ~$70+ billion (professional sports, fitness, equipment)
- **Growth Rate**: 3-5% CAGR
- **Employment**: 1.2+ million direct jobs in US sports industry

### Major Markets
- Professional sports leagues (NFL, NBA, MLB, NHL, MLS)
- Fitness and wellness ($40+ billion in US)
- Sports equipment and apparel ($60+ billion globally)
- Sports media and broadcasting ($70+ billion globally)

## Occupations

### Sports-Related Occupations
- Professional athletes
- Coaches and assistant coaches
- Sports managers and agents
- Fitness instructors and trainers
- Sports journalists and reporters
- Sports equipment designers and engineers
- Facility managers
- Sports medicine physicians

## Usage

### Import as NPM Package

```typescript
import {
  ProfessionalSports,
  SportsFacilities,
  SportsMedia,
  SportsTech,
  FitnessIndustry,
  SportsEquipment
} from '@org.ai/sports'
```

### Use in MDX

```mdx
---
$type: ProfessionalSports
league: NFL
team: New England Patriots
naicsCode: 7112
---

# New England Patriots

<TeamOverview team={team} />
```

## Entities & Properties

### Common Properties
- `name` - Entity name
- `description` - Detailed description
- `naicsCode` - NAICS industry classification
- `category` - Sport category (football, basketball, etc.)
- `founded` - Foundation/establishment year
- `location` - Geographic location
- `capacity` - For venues: seating/membership capacity
- `employees` - Workforce size
- `revenue` - Annual revenue (if applicable)

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## Attribution

- Industry data: Bureau of Labor Statistics, Census Bureau
- NAICS classifications: US Census Bureau
- Sports league data: Official league websites
- Fitness industry: IHRSA (International Health, Racquet & Sportsclub Association)
- Professional sports statistics: Official league sources

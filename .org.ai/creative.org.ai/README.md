---
$id: https://creative.org.ai
$context: https://creative.org.ai
name: creative.org.ai
parent: media.org.ai
license: CC-BY-SA-4.0
---

# creative.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Creative works, creative industries, and design services.

## Overview

This domain covers the creative industries including arts, entertainment, recreation, and specialized design services. It maps to:
- **NAICS 71**: Arts, Entertainment, and Recreation
- **NAICS 5414**: Specialized Design Services
- **NAICS 5413**: Architectural, Engineering, and Related Services

The creative sector encompasses the production, distribution, and exhibition of creative works, from performing arts to industrial design, from photography to architecture.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [media.org.ai](https://media.org.ai) > [schema.org.ai/CreativeWork](https://schema.org.ai/CreativeWork)

## Creative Industries Overview

The creative economy represents a significant portion of GDP in developed nations, driven by:
- **Cultural Production**: Creating original artistic and cultural works
- **Experience Economy**: Live performances and entertainment venues
- **Design Services**: Visual, industrial, and architectural design
- **Creative Technology**: Digital arts, game design, interactive media
- **Intellectual Property**: Copyright, licensing, and royalties

## NAICS 71: Arts, Entertainment, and Recreation

### 711 - Performing Arts, Spectator Sports, and Related Industries

#### 7111 - Performing Arts Companies
- **711110**: Theater Companies and Dinner Theaters
- **711120**: Dance Companies
- **711130**: Musical Groups and Artists
- **711190**: Other Performing Arts Companies

#### 7112 - Spectator Sports
- **711211**: Sports Teams and Clubs
- **711212**: Racetracks
- **711219**: Other Spectator Sports

#### 7113 - Promoters of Performing Arts, Sports, and Similar Events
- **711310**: Promoters with Facilities
- **711320**: Promoters without Facilities

#### 7114 - Agents and Managers for Artists, Athletes, Entertainers
- **711410**: Agents and Managers

#### 7115 - Independent Artists, Writers, and Performers
- **711510**: Independent Artists, Writers, and Performers

### 712 - Museums, Historical Sites, and Similar Institutions

#### 7121 - Museums, Historical Sites, and Similar Institutions
- **712110**: Museums
- **712120**: Historical Sites
- **712130**: Zoos and Botanical Gardens
- **712190**: Nature Parks and Other Similar Institutions

### 713 - Amusement, Gambling, and Recreation Industries

#### 7131 - Amusement Parks and Arcades
- **713110**: Amusement and Theme Parks
- **713120**: Amusement Arcades

#### 7132 - Gambling Industries
- **713210**: Casinos (except Casino Hotels)
- **713290**: Other Gambling Industries

#### 7139 - Other Amusement and Recreation Industries
- **713910**: Golf Courses and Country Clubs
- **713920**: Skiing Facilities
- **713930**: Marinas
- **713940**: Fitness and Recreational Sports Centers
- **713950**: Bowling Centers
- **713990**: All Other Amusement and Recreation Industries

## NAICS 54: Professional, Scientific, and Technical Services

### 5413 - Architectural, Engineering, and Related Services
- **541310**: Architectural Services
- **541320**: Landscape Architectural Services
- **541330**: Engineering Services
- **541340**: Drafting Services
- **541350**: Building Inspection Services
- **541360**: Geophysical Surveying and Mapping Services
- **541370**: Surveying and Mapping (except Geophysical) Services
- **541380**: Testing Laboratories

### 5414 - Specialized Design Services
- **541410**: Interior Design Services
- **541420**: Industrial Design Services
- **541430**: Graphic Design Services
- **541490**: Other Specialized Design Services

### 5419 - Other Professional, Scientific, and Technical Services
- **541921**: Photography Studios, Portrait
- **541922**: Commercial Photography

## Types

- [`CreativeWork`](https://creative.org.ai/CreativeWork)
- [`PerformingArts`](https://creative.org.ai/PerformingArts)
- [`VisualArts`](https://creative.org.ai/VisualArts)
- [`GraphicDesign`](https://creative.org.ai/GraphicDesign)
- [`IndustrialDesign`](https://creative.org.ai/IndustrialDesign)
- [`ArchitectureDesign`](https://creative.org.ai/ArchitectureDesign)
- [`Photography`](https://creative.org.ai/Photography)

## Structure

```
creative.org.ai/
├── README.md              # This file
├── package.json           # NPM package config
├── index.ts               # Type & const exports
├── types.ts               # TypeScript definitions
├── [CreativeWork].mdx     # Type template
├── PerformingArts.mdx     # NAICS 711
├── VisualArts.mdx         # Galleries, artists
├── GraphicDesign.mdx      # NAICS 541430
├── IndustrialDesign.mdx   # NAICS 541420
├── ArchitectureDesign.mdx # NAICS 541310
└── Photography.mdx        # NAICS 541921/541922
```

## Usage

### Import as NPM Package

```typescript
import { CreativeWork, things } from 'creative.org.ai'
```

### Use in MDX

```mdx
---
$type: https://creative.org.ai/CreativeWork
name: Example
---

# Example CreativeWork
```

## Cross-References

| Domain | Relationship |
|--------|--------------|
| [naics.org.ai](https://naics.org.ai) | Industry classification (NAICS 71, 5413, 5414, 5419) |
| [media.org.ai](https://media.org.ai) | Parent domain for creative works |
| [industries.org.ai](https://industries.org.ai) | Industry-specific resources |
| [businesses.org.ai](https://businesses.org.ai) | Creative businesses and studios |
| [onet.org.ai](https://onet.org.ai) | Creative occupations and careers |
| [schema.org.ai](https://schema.org.ai) | Base ontology (CreativeWork type) |

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

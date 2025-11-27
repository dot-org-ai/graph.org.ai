---
$id: https://naics.org.ai
$context: https://naics.org.ai
name: naics.org.ai
parent: standards.org.ai
source: U.S. Census Bureau
version: "2022"
license: Public Domain
---

# naics.org.ai

[![License: Public Domain](https://img.shields.io/badge/License-Public%20Domain-blue.svg)](https://www.census.gov/naics/)
[![NAICS](https://img.shields.io/badge/Source-U.S.%20Census%20Bureau-green)](https://www.census.gov/naics/)

North American Industry Classification System (NAICS) - the standard for classifying business establishments.

## Overview

NAICS is used by the U.S., Canada, and Mexico to classify businesses by type of economic activity. It provides a standardized framework for collecting, analyzing, and publishing statistical data.

**Parents**: [graph.org.ai](https://graph.org.ai) > [standards.org.ai](https://standards.org.ai)

## Structure

```
naics.org.ai/
├── README.md
├── package.json
├── index.ts
├── types.ts
│
├── Sectors/              # 20 top-level sectors (2-digit)
│   ├── 11/              # Agriculture, Forestry, Fishing
│   ├── 21/              # Mining, Quarrying, Oil/Gas
│   ├── 22/              # Utilities
│   ├── 23/              # Construction
│   ├── 31-33/           # Manufacturing
│   ├── 42/              # Wholesale Trade
│   ├── 44-45/           # Retail Trade
│   ├── 48-49/           # Transportation and Warehousing
│   ├── 51/              # Information
│   ├── 52/              # Finance and Insurance
│   ├── 53/              # Real Estate
│   ├── 54/              # Professional Services
│   ├── 55/              # Management of Companies
│   ├── 56/              # Administrative Services
│   ├── 61/              # Educational Services
│   ├── 62/              # Health Care
│   ├── 71/              # Arts, Entertainment
│   ├── 72/              # Accommodation, Food Services
│   ├── 81/              # Other Services
│   └── 92/              # Public Administration
│
├── Subsectors/           # ~100 subsectors (3-digit)
│   └── [Subsector].mdx
│
├── IndustryGroups/       # ~300 industry groups (4-digit)
│   └── [IndustryGroup].mdx
│
├── Industries/           # ~700 NAICS industries (5-digit)
│   └── [Industry].mdx
│
└── NationalIndustries/   # ~1,000 national industries (6-digit)
    └── [NationalIndustry].mdx
```

## NAICS Hierarchy

```
Sector (XX)                    # 20 sectors
└── Subsector (XXX)            # ~100 subsectors
    └── Industry Group (XXXX)   # ~300 industry groups
        └── NAICS Industry (XXXXX)  # ~700 industries
            └── National Industry (XXXXXX)  # ~1,000 national industries
```

## 20 Sectors

| Code | Sector |
|------|--------|
| 11 | [Agriculture, Forestry, Fishing and Hunting](./Sectors/11/) |
| 21 | [Mining, Quarrying, and Oil and Gas Extraction](./Sectors/21/) |
| 22 | [Utilities](./Sectors/22/) |
| 23 | [Construction](./Sectors/23/) |
| 31-33 | [Manufacturing](./Sectors/31-33/) |
| 42 | [Wholesale Trade](./Sectors/42/) |
| 44-45 | [Retail Trade](./Sectors/44-45/) |
| 48-49 | [Transportation and Warehousing](./Sectors/48-49/) |
| 51 | [Information](./Sectors/51/) |
| 52 | [Finance and Insurance](./Sectors/52/) |
| 53 | [Real Estate and Rental and Leasing](./Sectors/53/) |
| 54 | [Professional, Scientific, and Technical Services](./Sectors/54/) |
| 55 | [Management of Companies and Enterprises](./Sectors/55/) |
| 56 | [Administrative and Support and Waste Management](./Sectors/56/) |
| 61 | [Educational Services](./Sectors/61/) |
| 62 | [Health Care and Social Assistance](./Sectors/62/) |
| 71 | [Arts, Entertainment, and Recreation](./Sectors/71/) |
| 72 | [Accommodation and Food Services](./Sectors/72/) |
| 81 | [Other Services (except Public Administration)](./Sectors/81/) |
| 92 | [Public Administration](./Sectors/92/) |

## Example: Sector 54 - Professional Services

```
54 Professional, Scientific, and Technical Services
├── 541 Professional, Scientific, and Technical Services
│   ├── 5411 Legal Services
│   │   ├── 54111 Offices of Lawyers
│   │   │   └── 541110 Offices of Lawyers
│   │   └── 54119 Other Legal Services
│   │       ├── 541191 Title Abstract and Settlement Offices
│   │       └── 541199 All Other Legal Services
│   ├── 5412 Accounting, Tax Preparation, Bookkeeping
│   ├── 5413 Architectural, Engineering, and Related
│   ├── 5414 Specialized Design Services
│   ├── 5415 Computer Systems Design
│   │   └── 54151 Computer Systems Design and Related
│   │       ├── 541511 Custom Computer Programming Services
│   │       ├── 541512 Computer Systems Design Services
│   │       ├── 541513 Computer Facilities Management
│   │       └── 541519 Other Computer Related Services
│   ├── 5416 Management, Scientific, and Technical Consulting
│   ├── 5417 Scientific Research and Development
│   ├── 5418 Advertising, Public Relations, and Related
│   └── 5419 Other Professional, Scientific, and Technical Services
```

## Usage

```typescript
import {
  sectors,
  subsectors,
  industryGroups,
  naicsIndustries,
  nationalIndustries,
  getByCode,
  getParent,
  getChildren
} from 'naics.org.ai'

// Get all sectors
const allSectors = await sectors

// Get a specific code
const softwareDev = await getByCode('541511')

// Get parent
const parent = await getParent('541511')
// => { code: '54151', name: 'Computer Systems Design...' }

// Get children
const children = await getChildren('5415')
// => [{ code: '54151', ... }]

// Search by name
const techIndustries = await naicsIndustries.search('software')
```

## Types

```typescript
interface NAICSCode {
  '@type': string
  '@id': string
  code: string            // e.g., "541511"
  name: string
  description?: string
  level: 'sector' | 'subsector' | 'industryGroup' | 'naicsIndustry' | 'nationalIndustry'
  parent?: string         // Parent code
  children?: string[]     // Child codes
}

interface Sector extends NAICSCode {
  level: 'sector'
  subsectors: Subsector[]
}

interface Subsector extends NAICSCode {
  level: 'subsector'
  sector: string
  industryGroups: IndustryGroup[]
}

interface IndustryGroup extends NAICSCode {
  level: 'industryGroup'
  subsector: string
  industries: NAICSIndustry[]
}

interface NAICSIndustry extends NAICSCode {
  level: 'naicsIndustry'
  industryGroup: string
  nationalIndustries: NationalIndustry[]
}

interface NationalIndustry extends NAICSCode {
  level: 'nationalIndustry'
  naicsIndustry: string
}
```

## Cross-References

| System | Mapping |
|--------|---------|
| [industries.org.ai](https://industries.org.ai) | Simplified industry access |
| [sic.org.ai](https://sic.org.ai) | SIC code crosswalk |
| [isic.org.ai](https://isic.org.ai) | ISIC crosswalk |
| [onet.org.ai](https://onet.org.ai) | O*NET industry-occupation mapping |
| [businesses.org.ai](https://businesses.org.ai) | Business classification |

## Sources

- [U.S. Census Bureau NAICS](https://www.census.gov/naics/)
- [NAICS 2022 Manual](https://www.census.gov/naics/?48967)
- [NAICS Search](https://www.census.gov/naics/?58967?yeession)

## License

NAICS is public domain data from the U.S. Census Bureau.

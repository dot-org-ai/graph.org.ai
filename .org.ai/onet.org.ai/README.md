---
$id: https://onet.org.ai
$context: https://onet.org.ai
name: onet.org.ai
parent: standards.org.ai
source: O*NET 27.3
license: CC-BY-SA-4.0
---

# onet.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![O*NET](https://img.shields.io/badge/Source-O*NET%2027.3-blue)](https://www.onetcenter.org/)

Complete O*NET (Occupational Information Network) ontology with occupations, skills, abilities, knowledge areas, work activities, and more.

## Overview

O*NET is the primary source of occupational information in the United States, containing data on ~1,000 occupations with detailed information about:

- **What workers do** (tasks, work activities)
- **What workers need** (skills, abilities, knowledge)
- **The work environment** (work context, work styles)
- **Career pathways** (education, experience, training)

**Parents**: [graph.org.ai](https://graph.org.ai) > [standards.org.ai](https://standards.org.ai)

## Structure

```
onet.org.ai/
├── README.md
├── package.json
├── index.ts
├── types.ts
│
├── Occupations/           # ~1,000 SOC-coded occupations
│   ├── [Occupation].mdx
│   └── README.md
│
├── Tasks/                 # Task statements by occupation
│   ├── [Task].mdx
│   └── README.md
│
├── Skills/                # 35 skills (basic + cross-functional)
│   ├── [Skill].mdx
│   └── README.md
│
├── Abilities/             # 52 cognitive, psychomotor, physical, sensory
│   ├── [Ability].mdx
│   └── README.md
│
├── Knowledge/             # 33 knowledge areas
│   ├── [Knowledge].mdx
│   └── README.md
│
├── WorkActivities/        # Generalized, Intermediate, Detailed
│   ├── GWA/              # 41 Generalized Work Activities
│   │   └── [GWA].mdx
│   ├── IWA/              # 332 Intermediate Work Activities
│   │   └── [IWA].mdx
│   ├── DWA/              # 2,070 Detailed Work Activities
│   │   └── [DWA].mdx
│   └── README.md
│
├── WorkContext/           # 57 work context elements
│   ├── [WorkContext].mdx
│   └── README.md
│
├── WorkStyles/            # 16 work style elements
│   ├── [WorkStyle].mdx
│   └── README.md
│
├── WorkValues/            # 6 work value clusters
│   ├── [WorkValue].mdx
│   └── README.md
│
├── Interests/             # 6 RIASEC interest types
│   ├── [Interest].mdx
│   └── README.md
│
├── Tools/                 # Tools used by occupations
│   ├── [Tool].mdx
│   └── README.md
│
├── Technology/            # Technology skills
│   ├── [Technology].mdx
│   └── README.md
│
├── Education/             # Education, training, experience
│   ├── [Education].mdx
│   └── README.md
│
└── JobZones/              # 5 job preparation zones
    ├── [JobZone].mdx
    └── README.md
```

## Data Model

### Occupation Hierarchy

```
Job Family (2-digit SOC)
└── Job Family Group (minor group)
    └── Broad Occupation (5-digit)
        └── Detailed Occupation (6-digit + suffix)
```

### Work Activity Hierarchy

```
Generalized Work Activity (GWA) - 41 items
└── Intermediate Work Activity (IWA) - 332 items
    └── Detailed Work Activity (DWA) - 2,070 items
        └── Task Statement - ~20,000 items
```

## Usage

### Import as NPM Package

```typescript
import {
  occupations,
  skills,
  abilities,
  knowledge,
  workActivities,
  tasks,
  tools,
  technology
} from 'onet.org.ai'

// Get all occupations
const allOccupations = await occupations

// Search skills
const techSkills = await skills.search('programming')

// Get occupation by SOC code
const softwareDev = await occupations.get('15-1252.00')

// Get skills for an occupation
const devSkills = await softwareDev.skills
```

### Use in MDX

```mdx
---
$type: https://onet.org.ai/Occupation
socCode: "15-1252.00"
name: Software Developers
---

# Software Developers

<OccupationOverview occupation={occupation} />

## Tasks
<TaskList occupation={occupation} />

## Skills Required
<SkillsTable occupation={occupation} showLevel={true} />
```

## Types

| Type | Count | Description |
|------|-------|-------------|
| [Occupation](./Occupations/) | ~1,000 | SOC-coded occupations |
| [Task](./Tasks/) | ~20,000 | Task statements |
| [Skill](./Skills/) | 35 | Basic and cross-functional skills |
| [Ability](./Abilities/) | 52 | Cognitive, physical, sensory abilities |
| [Knowledge](./Knowledge/) | 33 | Knowledge areas |
| [GWA](./WorkActivities/GWA/) | 41 | Generalized Work Activities |
| [IWA](./WorkActivities/IWA/) | 332 | Intermediate Work Activities |
| [DWA](./WorkActivities/DWA/) | 2,070 | Detailed Work Activities |
| [WorkContext](./WorkContext/) | 57 | Work environment elements |
| [WorkStyle](./WorkStyles/) | 16 | Work style characteristics |
| [WorkValue](./WorkValues/) | 6 | Work value clusters |
| [Interest](./Interests/) | 6 | RIASEC interest types |
| [Tool](./Tools/) | ~9,000 | Tools and equipment |
| [Technology](./Technology/) | ~17,000 | Software and technology |

## Cross-References

| System | Mapping |
|--------|---------|
| [soc.org.ai](https://soc.org.ai) | SOC codes map to occupations |
| [occupations.org.ai](https://occupations.org.ai) | Simplified occupation access |
| [skills.org.ai](https://skills.org.ai) | Simplified skill access |
| [naics.org.ai](https://naics.org.ai) | Industry-occupation crosswalk |

## Sources

- [O*NET OnLine](https://www.onetonline.org/)
- [O*NET Resource Center](https://www.onetcenter.org/)
- [O*NET Database](https://www.onetcenter.org/database.html) (v27.3)

## License

O*NET data is in the public domain. This ontology is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

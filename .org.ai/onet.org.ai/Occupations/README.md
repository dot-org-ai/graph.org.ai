---
$id: https://onet.org.ai/Occupations
$context: https://onet.org.ai
name: O*NET Occupations
count: ~1,000
---

# O*NET Occupations

All ~1,000 occupations from the O*NET-SOC taxonomy with detailed worker requirements, tasks, and characteristics.

## SOC Code Structure

```
XX-XXXX.XX
│  │    └── O*NET suffix (00 = base, 01+ = detailed)
│  └────── Detailed occupation (6-digit)
└───────── Job Family (2-digit)

Example: 15-1252.00 (Software Developers)
         15 = Computer and Mathematical
         1252 = Software Developers
         00 = Base occupation
```

## Job Families (2-digit SOC)

| Code | Family |
|------|--------|
| 11 | Management |
| 13 | Business and Financial Operations |
| 15 | Computer and Mathematical |
| 17 | Architecture and Engineering |
| 19 | Life, Physical, and Social Science |
| 21 | Community and Social Service |
| 23 | Legal |
| 25 | Educational Instruction and Library |
| 27 | Arts, Design, Entertainment, Sports, Media |
| 29 | Healthcare Practitioners and Technical |
| 31 | Healthcare Support |
| 33 | Protective Service |
| 35 | Food Preparation and Serving |
| 37 | Building and Grounds Cleaning |
| 39 | Personal Care and Service |
| 41 | Sales and Related |
| 43 | Office and Administrative Support |
| 45 | Farming, Fishing, and Forestry |
| 47 | Construction and Extraction |
| 49 | Installation, Maintenance, and Repair |
| 51 | Production |
| 53 | Transportation and Material Moving |
| 55 | Military Specific |

## Usage

```typescript
import { occupations } from 'onet.org.ai'

// Get all occupations
const all = await occupations

// Get by SOC code
const softwareDev = await occupations.get('15-1252.00')

// Search
const techJobs = await occupations.search('software')

// Filter by job family
const computerJobs = await occupations.filter(o => o.socCode.startsWith('15-'))
```

## Schema

```typescript
interface Occupation {
  '@type': 'https://onet.org.ai/Occupation'
  '@id': string
  socCode: string
  name: string
  description: string

  // Related data
  tasks: Task[]
  skills: SkillLevel[]
  abilities: AbilityLevel[]
  knowledge: KnowledgeLevel[]
  workActivities: WorkActivityLevel[]
  workContext: WorkContextLevel[]
  tools: Tool[]
  technology: Technology[]

  // Career info
  jobZone: JobZone
  education: EducationLevel[]
  experience: ExperienceLevel
  training: TrainingLevel

  // Outlook
  brightOutlook: boolean
  greenOccupation: boolean
}
```

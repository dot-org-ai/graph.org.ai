---
$id: https://onet.org.ai/WorkActivities
$context: https://onet.org.ai
name: O*NET Work Activities
---

# O*NET Work Activities

Hierarchical taxonomy of work activities from general to specific.

**Note**: This is reference data for O*NET codes. The primary activity ontology lives at [activities.org.ai](https://activities.org.ai) with `sameAs` links back to these codes.

## Hierarchy

```
Generalized Work Activities (GWA) - 41 items
└── Intermediate Work Activities (IWA) - 332 items
    └── Detailed Work Activities (DWA) - 2,070 items
        └── Task Statements - ~20,000 items
```

## GWA Categories (4 domains)

### Information Input
Obtaining information needed to do the job.

| GWA | Description |
|-----|-------------|
| Getting Information | Observing, receiving, and obtaining information |
| Monitor Processes | Monitoring and reviewing information |
| Identifying Objects | Identifying information by categorizing |

### Mental Processes
Processing information to make decisions.

| GWA | Description |
|-----|-------------|
| Judging Qualities | Assessing value, importance, or quality |
| Processing Information | Compiling, coding, categorizing |
| Evaluating Information | Judging compliance with standards |
| Analyzing Data | Identifying underlying principles |
| Making Decisions | Analyzing information to make decisions |
| Thinking Creatively | Developing original ideas |
| Updating Knowledge | Keeping up-to-date technically |
| Developing Objectives | Establishing long-range objectives |
| Scheduling Work | Scheduling events, programs, activities |
| Organizing Work | Planning and organizing one's own work |

### Work Output
Physical activities and operating equipment.

| GWA | Description |
|-----|-------------|
| Performing Physical Activities | Performing physical activities |
| Handling Objects | Using hands to handle, control, or feel |
| Controlling Machines | Operating, controlling, driving |
| Operating Vehicles | Operating moving equipment |
| Interacting with Computers | Using computers |
| Documenting Information | Recording information |
| Drafting and Specifying | Providing documentation |
| Repairing | Repairing machines or systems |
| Inspecting Equipment | Inspecting equipment, structures, materials |

### Interacting with Others
Communicating and interacting with others.

| GWA | Description |
|-----|-------------|
| Communicating with Supervisors | Communicating internally |
| Communicating with Persons Outside | Communicating externally |
| Establishing Relationships | Developing constructive relationships |
| Assisting and Caring | Providing assistance to others |
| Selling or Influencing | Convincing others |
| Resolving Conflicts | Handling complaints, arbitrating |
| Performing Administrative Activities | Administrative tasks |
| Staffing | Recruiting, interviewing, selecting |
| Coaching and Developing | Training and developing |
| Guiding and Directing | Providing guidance |
| Coordinating Work | Coordinating activities |
| Developing Teams | Encouraging cooperation |
| Training Others | Teaching others |
| Providing Consultation | Providing expert advice |
| Performing for the Public | Performing for audiences |
| Interpreting Meaning | Clarifying information |

## Usage

```typescript
import { gwa, iwa, dwa } from 'onet.org.ai'

// Get all Generalized Work Activities
const generalActivities = await gwa

// Get IWAs under a specific GWA
const gettingInfoIWAs = await iwa.filter(i => i.gwa === '4.A.1.a.1')

// Get DWAs under a specific IWA
const monitoringDWAs = await dwa.filter(d => d.iwa === '4.A.1.b.2')
```

## Subdirectories

- [GWA/](./GWA/) - 41 Generalized Work Activities
- [IWA/](./IWA/) - 332 Intermediate Work Activities
- [DWA/](./DWA/) - 2,070 Detailed Work Activities

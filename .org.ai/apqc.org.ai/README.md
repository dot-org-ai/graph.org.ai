---
$id: https://apqc.org.ai
$context: https://apqc.org.ai
name: apqc.org.ai
parent: standards.org.ai
source: APQC Process Classification Framework (PCF)
version: "7.3.0"
license: CC-BY-SA-4.0
---

# apqc.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![APQC](https://img.shields.io/badge/Source-APQC%20PCF-green)](https://www.apqc.org/pcf)

APQC Process Classification Framework (PCF) - the industry-standard taxonomy for business processes.

## Overview

The PCF provides a common language for organizations to identify, compare, and improve their business processes. It contains ~1,500 processes organized across 13 categories.

**Parents**: [graph.org.ai](https://graph.org.ai) > [standards.org.ai](https://standards.org.ai)

## Structure

```
apqc.org.ai/
├── README.md
├── package.json
├── index.ts
├── types.ts
│
├── Categories/            # 13 top-level categories
│   ├── 1.0/              # Develop Vision and Strategy
│   ├── 2.0/              # Develop and Manage Products and Services
│   ├── 3.0/              # Market and Sell Products and Services
│   ├── 4.0/              # Deliver Physical Products
│   ├── 5.0/              # Deliver Services
│   ├── 6.0/              # Manage Customer Service
│   ├── 7.0/              # Develop and Manage Human Capital
│   ├── 8.0/              # Manage Information Technology
│   ├── 9.0/              # Manage Financial Resources
│   ├── 10.0/             # Acquire, Construct, and Manage Assets
│   ├── 11.0/             # Manage Enterprise Risk, Compliance...
│   ├── 12.0/             # Manage External Relationships
│   └── 13.0/             # Develop and Manage Business Capabilities
│
├── ProcessGroups/         # ~100 process groups
│   └── [ProcessGroup].mdx
│
├── Processes/             # ~500 processes
│   └── [Process].mdx
│
├── Activities/            # ~1,000 activities
│   └── [Activity].mdx
│
└── Tasks/                 # Extended task-level detail
    └── [Task].mdx
```

## PCF Hierarchy

```
Category (X.0)              # 13 categories
└── Process Group (X.Y)     # ~100 process groups
    └── Process (X.Y.Z)     # ~500 processes
        └── Activity (X.Y.Z.A)  # ~1,000 activities
            └── Task (X.Y.Z.A.B)  # Extended detail
```

## 13 Categories

### Operating Processes (1-6)

| # | Category | Description |
|---|----------|-------------|
| 1.0 | [Develop Vision and Strategy](./Categories/1.0/) | Define business concept, strategy, and structure |
| 2.0 | [Develop and Manage Products and Services](./Categories/2.0/) | Design, develop, and manage offerings |
| 3.0 | [Market and Sell Products and Services](./Categories/3.0/) | Market strategy, sales, and customer acquisition |
| 4.0 | [Deliver Physical Products](./Categories/4.0/) | Supply chain, manufacturing, logistics |
| 5.0 | [Deliver Services](./Categories/5.0/) | Service delivery and management |
| 6.0 | [Manage Customer Service](./Categories/6.0/) | Customer support and relationship management |

### Management and Support Processes (7-13)

| # | Category | Description |
|---|----------|-------------|
| 7.0 | [Develop and Manage Human Capital](./Categories/7.0/) | HR, workforce planning, talent management |
| 8.0 | [Manage Information Technology](./Categories/8.0/) | IT strategy, operations, security |
| 9.0 | [Manage Financial Resources](./Categories/9.0/) | Accounting, treasury, tax, reporting |
| 10.0 | [Acquire, Construct, and Manage Assets](./Categories/10.0/) | Facilities, equipment, real estate |
| 11.0 | [Manage Enterprise Risk, Compliance, Remediation, and Resiliency](./Categories/11.0/) | Risk, compliance, legal, audit |
| 12.0 | [Manage External Relationships](./Categories/12.0/) | Government relations, community, investors |
| 13.0 | [Develop and Manage Business Capabilities](./Categories/13.0/) | Process improvement, change management, knowledge |

## Example: Category 7.0 - Human Capital

```
7.0 Develop and Manage Human Capital
├── 7.1 Develop and manage human capital planning, policies...
│   ├── 7.1.1 Develop human capital strategy
│   │   ├── 7.1.1.1 Identify strategic HR needs
│   │   ├── 7.1.1.2 Define HR and business function roles
│   │   ├── 7.1.1.3 Determine HR costs
│   │   └── 7.1.1.4 Establish HR measures
│   ├── 7.1.2 Develop and implement workforce strategy
│   └── 7.1.3 Manage HR policy framework
├── 7.2 Recruit, source, and select employees
│   ├── 7.2.1 Create and develop employee requisitions
│   ├── 7.2.2 Recruit and source candidates
│   ├── 7.2.3 Screen and select candidates
│   └── 7.2.4 Manage new hire/re-hire
├── 7.3 Develop and counsel employees
├── 7.4 Manage employee relations
├── 7.5 Reward and retain employees
├── 7.6 Redeploy and retire employees
└── 7.7 Manage employee information and analytics
```

## Industry Extensions

The PCF has industry-specific extensions:

| Extension | Industries |
|-----------|------------|
| PCF Cross-Industry | Generic framework |
| PCF Banking | Financial services |
| PCF Education | K-12 and Higher Ed |
| PCF Healthcare | Providers and Payers |
| PCF Petroleum | Oil & Gas |
| PCF Retail | Consumer retail |
| PCF Telecommunications | Telecom providers |
| PCF Utilities | Electric and water |

## Usage

```typescript
import {
  categories,
  processGroups,
  processes,
  activities
} from 'apqc.org.ai'

// Get all categories
const allCategories = await categories

// Get processes in category 7.0 (HR)
const hrProcesses = await processes.filter(p => p.code.startsWith('7.'))

// Search for processes
const recruitingProcesses = await processes.search('recruit')

// Get activities for a process
const process = await processes.get('7.2.2')
const activities = await process.activities
```

## Types

```typescript
interface PCFElement {
  '@type': string
  '@id': string
  code: string           // e.g., "7.2.2.1"
  name: string
  description?: string
  parent?: string        // Parent code
  children?: string[]    // Child codes
  level: 'category' | 'processGroup' | 'process' | 'activity' | 'task'
}

interface Category extends PCFElement {
  level: 'category'
  processGroups: ProcessGroup[]
}

interface ProcessGroup extends PCFElement {
  level: 'processGroup'
  category: string
  processes: Process[]
}

interface Process extends PCFElement {
  level: 'process'
  processGroup: string
  activities: Activity[]
}

interface Activity extends PCFElement {
  level: 'activity'
  process: string
  tasks?: Task[]
}
```

## Cross-References

| System | Mapping |
|--------|---------|
| [process.org.ai](https://process.org.ai) | Simplified process access |
| [activities.org.ai](https://activities.org.ai) | Activity ontology |
| [tasks.org.ai](https://tasks.org.ai) | Task ontology |
| [onet.org.ai](https://onet.org.ai) | O*NET work activities mapping |

## Sources

- [APQC Process Classification Framework](https://www.apqc.org/pcf)
- [PCF Download](https://www.apqc.org/resource-library/resource-listing/apqc-process-classification-framework-pcf-cross-industry-excel-7)

## License

This ontology is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

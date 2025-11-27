---
$id: https://apqc.org.ai/Categories
$context: https://apqc.org.ai
name: PCF Categories
count: 13
---

# PCF Categories

13 top-level categories in the Process Classification Framework.

## Operating Processes (1-6)

Categories that directly create value for customers.

| Code | Category | Description |
|------|----------|-------------|
| [1.0](./1.0/) | Develop Vision and Strategy | Define business concept, mission, vision, and strategy |
| [2.0](./2.0/) | Develop and Manage Products and Services | Design, build, and manage product/service offerings |
| [3.0](./3.0/) | Market and Sell Products and Services | Marketing strategy, campaigns, and sales execution |
| [4.0](./4.0/) | Deliver Physical Products | Supply chain, manufacturing, and logistics |
| [5.0](./5.0/) | Deliver Services | Service design, delivery, and quality management |
| [6.0](./6.0/) | Manage Customer Service | Customer support and relationship management |

## Management and Support Processes (7-13)

Categories that enable and support operating processes.

| Code | Category | Description |
|------|----------|-------------|
| [7.0](./7.0/) | Develop and Manage Human Capital | HR, talent acquisition, development, retention |
| [8.0](./8.0/) | Manage Information Technology | IT strategy, infrastructure, security, support |
| [9.0](./9.0/) | Manage Financial Resources | Accounting, treasury, tax, financial reporting |
| [10.0](./10.0/) | Acquire, Construct, and Manage Assets | Facilities, equipment, real estate |
| [11.0](./11.0/) | Manage Enterprise Risk, Compliance, Remediation, and Resiliency | Risk, compliance, legal, audit |
| [12.0](./12.0/) | Manage External Relationships | Government, community, investor relations |
| [13.0](./13.0/) | Develop and Manage Business Capabilities | Process improvement, change management, knowledge |

## Category Structure

Each category contains:

```
X.0 Category
├── X.1 Process Group
│   ├── X.1.1 Process
│   │   ├── X.1.1.1 Activity
│   │   │   └── X.1.1.1.1 Task
│   │   └── X.1.1.2 Activity
│   └── X.1.2 Process
├── X.2 Process Group
└── ...
```

## Usage

```typescript
import { categories } from 'apqc.org.ai'

// Get all categories
const all = await categories

// Get operating processes
const operating = await categories.filter(c =>
  parseFloat(c.code) <= 6.0
)

// Get support processes
const support = await categories.filter(c =>
  parseFloat(c.code) >= 7.0
)
```

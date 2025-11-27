---
$id: https://apqc.org.ai/ProcessGroups
$context: https://apqc.org.ai
name: PCF Process Groups
count: ~100
---

# PCF Process Groups

~100 process groups organized under the 13 categories.

## Structure

```
Category (X.0)
└── Process Group (X.Y)  ← You are here
    └── Process (X.Y.Z)
        └── Activity (X.Y.Z.A)
```

## Process Groups by Category

### 1.0 Develop Vision and Strategy
| Code | Process Group |
|------|---------------|
| 1.1 | Define the business concept and long-term vision |
| 1.2 | Develop business strategy |
| 1.3 | Execute and measure strategic initiatives |

### 2.0 Develop and Manage Products and Services
| Code | Process Group |
|------|---------------|
| 2.1 | Manage product and service portfolio |
| 2.2 | Develop products and services |

### 3.0 Market and Sell Products and Services
| Code | Process Group |
|------|---------------|
| 3.1 | Understand markets, customers, and capabilities |
| 3.2 | Develop marketing strategy |
| 3.3 | Develop sales strategy |
| 3.4 | Develop and manage marketing plans |
| 3.5 | Develop and manage sales plans |

### 7.0 Develop and Manage Human Capital
| Code | Process Group |
|------|---------------|
| 7.1 | Develop and manage HR planning, policies, and strategies |
| 7.2 | Recruit, source, and select employees |
| 7.3 | Develop and counsel employees |
| 7.4 | Manage employee relations |
| 7.5 | Reward and retain employees |
| 7.6 | Redeploy and retire employees |
| 7.7 | Manage employee information and analytics |

### 8.0 Manage Information Technology
| Code | Process Group |
|------|---------------|
| 8.1 | Develop and manage IT customer relationships |
| 8.2 | Develop and manage IT resilience and risk |
| 8.3 | Manage enterprise information |
| 8.4 | Develop and maintain IT solutions |
| 8.5 | Deploy IT solutions |
| 8.6 | Deliver and support IT services |
| 8.7 | Manage IT knowledge |

## Usage

```typescript
import { processGroups } from 'apqc.org.ai'

// Get all process groups
const all = await processGroups

// Get process groups in category 7.0
const hrProcessGroups = await processGroups.filter(pg =>
  pg.code.startsWith('7.')
)
```

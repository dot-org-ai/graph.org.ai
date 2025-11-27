---
$id: https://apps.org.ai
$context: https://apps.org.ai
name: apps.org.ai
parent: tech.org.ai
license: CC-BY-SA-4.0
---

# apps.org.ai

Software applications and SaaS products ontology.

## Overview

A comprehensive registry of software applications, their capabilities, integrations, and categories.

**Parents**: [graph.org.ai](https://graph.org.ai) > [tech.org.ai](https://tech.org.ai)

## Structure

```
apps.org.ai/
├── README.md
├── [App].mdx
├── Categories/
│   └── [Category].mdx
└── Integrations/
    └── [Integration].mdx
```

## Categories

| Category | Description | Count |
|----------|-------------|-------|
| CRM | Customer Relationship Management | 200+ |
| Marketing | Marketing automation | 300+ |
| Productivity | Productivity tools | 250+ |
| Communication | Messaging and video | 150+ |
| Analytics | Data and analytics | 180+ |
| Finance | Accounting and payments | 200+ |
| HR | Human resources | 120+ |
| Development | Developer tools | 180+ |

## Top Apps by Usage

| App | Category | Actions |
|-----|----------|---------|
| Google Sheets | Productivity | 50+ |
| Slack | Communication | 40+ |
| Salesforce | CRM | 100+ |
| HubSpot | CRM | 80+ |
| Mailchimp | Marketing | 30+ |

## Usage

```typescript
import { apps, App } from 'apps.org.ai'

// Get all apps
const allApps = await apps

// Get apps by category
const crmApps = await apps.filter(a =>
  a.categories.includes('CRM')
)

// Get app actions
const sheets = await apps.get('GoogleSheets')
console.log(sheets.actions)
```

## Cross-References

| System | Mapping |
|--------|---------|
| [integrations.org.ai](https://integrations.org.ai) | Integration services |
| [actions.org.ai](https://actions.org.ai) | App actions |
| [apis.org.ai](https://apis.org.ai) | API specifications |

## License

Licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

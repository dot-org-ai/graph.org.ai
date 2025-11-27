---
$id: https://integrations.org.ai
$context: https://integrations.org.ai
name: integrations.org.ai
parent: tech.org.ai
license: CC-BY-SA-4.0
---

# integrations.org.ai

Integration services and connectors ontology.

## Overview

A comprehensive registry of integration services, connectors, and automation capabilities between applications.

**Parents**: [graph.org.ai](https://graph.org.ai) > [tech.org.ai](https://tech.org.ai)

## Structure

```
integrations.org.ai/
├── README.md
├── [Integration].mdx
├── Connectors/
│   └── [Connector].mdx
├── Triggers/
│   └── [Trigger].mdx
└── Actions/
    └── [Action].mdx
```

## Integration Types

| Type | Description |
|------|-------------|
| Native | Built-in integrations |
| API | REST/GraphQL API connections |
| Webhook | Event-driven webhooks |
| OAuth | OAuth-authenticated connections |
| SDK | SDK-based integrations |

## Popular Integrations

| Integration | Category | Triggers | Actions |
|-------------|----------|----------|---------|
| Google Sheets | Productivity | 5 | 15 |
| Slack | Communication | 10 | 20 |
| Salesforce | CRM | 15 | 50 |
| Gmail | Email | 8 | 12 |
| Stripe | Payments | 10 | 25 |

## Usage

```typescript
import { integrations, Integration } from 'integrations.org.ai'

// Get all integrations
const all = await integrations

// Get integrations by category
const crmIntegrations = await integrations.filter(i =>
  i.category === 'CRM'
)

// Get integration triggers and actions
const slack = await integrations.get('Slack')
console.log(slack.triggers, slack.actions)
```

## Cross-References

| System | Mapping |
|--------|---------|
| [apps.org.ai](https://apps.org.ai) | Application registry |
| [actions.org.ai](https://actions.org.ai) | Action definitions |
| [triggers.org.ai](https://triggers.org.ai) | Trigger definitions |
| [apis.org.ai](https://apis.org.ai) | API specifications |

## License

Licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

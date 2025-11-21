---
$id: https://graph.org.ai/Data
$type: https://schema.org.ai/Dataset
$context: https://schema.org.ai
---

# Data

**Data** represents the structured information layer of the graph, typically expressed as YAML-LD or JSON-LD. It provides the semantic context for MDX documents.

## Role

- **Context**: Defining the schema and types.
- **Properties**: Key-value pairs describing entities.
- **Relationships**: Linking entities within the graph.

## Structure

```mermaid
graph TD
    Data --> Context
    Data --> Properties
    Data --> Relationships
```

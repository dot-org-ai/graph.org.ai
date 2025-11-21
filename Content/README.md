---
$id: https://graph.org.ai/Content
$type: https://schema.org.ai/CreativeWork
$context: https://schema.org.ai
---

# Content

**Content** represents the narrative, textual, and media layer of the graph. In the MDXLD architecture, this is the Markdown body.

## Types

- **Narrative**: Prose and descriptions.
- **Documentation**: Guides and manuals.
- **Media References**: Links to images, video, and audio.

## Structure

```mermaid
graph TD
    Content --> Narrative
    Content --> Documentation
    Content --> Media
```

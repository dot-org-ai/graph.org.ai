---
: https://graph.org.ai
: https://schema.org.ai/Domain
: https://schema.org.ai
---

# .org.ai Graph & Ontology

The meta-graph definition and core ontology for the .org.ai ecosystem.

## Overview

At the foundation of the .org.ai Graph & Ontology are **[Nouns](Nouns/)**, **[Verbs](Verbs/)**, and **[Things](Things/)**.

### [Nouns](Nouns/)
Nouns represent the entities in our graph, categorized primarily into:
- **[People](People/)**
- **[Places](Places/)**
- **[Things](Things/)**
- **[Ideas](Ideas/)**

### [Verbs](Verbs/)
Verbs drive the dynamics of the system. They are intrinsically connected to:
- **Actors** (Creator)
- **[Actions](Actions/)** (Create)
- **[Activities](Activities/)** (Creating)
- **Results** (Creation)
- **[Events](Events/)** (Created)
- **Inverse Operations** (Digital: delete, Physical: destroy)

### Language & Flow
The ontology encompasses language structures, including all parts of speech, semantics (Subject.predicate.Object), and logical flow controls (if, else, do, while, until, forEach). Language concepts are primarily located within **[Things/language](Things/language/)**.

### [Agents](Agents/)
[Agents](Agents/) operate within this superset to facilitate interaction, automation, and reasoning across the graph.

## Ontology Diagram

```mermaid
graph TD
    %% Core Foundation
    Root[.org.ai Graph] --> Nouns
    Root --> Verbs
    Root --> Things
    Root --> Agents

    %% Nouns Breakdown
    Nouns --> People
    Nouns --> Places
    Nouns --> Ideas
    Nouns --> ThingsRef[Things]

    %% Verbs Breakdown
    Verbs --> Actor
    Verbs --> Actions
    Verbs --> Activities
    Verbs --> Result
    Verbs --> Events
    Verbs --> Inverse

    %% Inverse Types
    Inverse --> Digital[Digital: Delete]
    Inverse --> Physical[Physical: Destroy]

    %% Language
    Root --> Language
    Language --> Semantics[Semantics: Subject.predicate.Object]
    Language --> Flow[Flow: if, else, do, forEach]

    %% Clickable Links
    click Nouns "/Nouns"
    click Verbs "/Verbs"
    click Things "/Things"
    click ThingsRef "/Things"
    click People "/People"
    click Places "/Places"
    click Ideas "/Ideas"
    click Agents "/Agents"
    click Actions "/Actions"
    click Activities "/Activities"
    click Events "/Events"
```
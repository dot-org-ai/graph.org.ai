---
$id: https://graph.org.ai/Actions
$type: https://schema.org.ai/Action
$context: https://schema.org.ai
---

# Actions

**Actions** represent the execution of a specific Verb by an Agent upon a Noun. They are the atomic units of change within the graph.

## Components

An Action typically consists of:
- **Actor**: The entity initiating the action. Can be a **Person**, **Human**, or **Code**.
- **Verb**: The operation being performed (e.g., Create, Update).
- **Object**: The Noun being acted upon.
- **Result**: The outcome of the action (often leading to an Event).

## Relationship to Verbs
While **[Verbs](../Verbs/)** define *what can be done*, **Actions** describe *what is being done* in a specific instance.

## Structure

```mermaid
graph TD
    Action --> Actor
    Action --> Verb[Verb (Operation)]
    Action --> Object[Object (Noun)]
    Action --> Result[Result (Outcome)]
    
    Actor --> Person
    Actor --> Human
    Actor --> Code
```

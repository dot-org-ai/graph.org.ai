---
$id: https://abilities.org.ai
$context: https://abilities.org.ai
name: abilities.org.ai
parent: onet.org.ai
source: O*NET
license: Public Domain
---

# abilities.org.ai

[![License: Public Domain](https://img.shields.io/badge/License-Public%20Domain-blue.svg)](https://www.onetcenter.org/)

Simplified access to O*NET cognitive, psychomotor, physical, and sensory abilities.

## Overview

Abilities are enduring attributes of the individual that influence performance. This domain provides simplified access to the 52 O*NET abilities.

**Parents**: [graph.org.ai](https://graph.org.ai) > [onet.org.ai](https://onet.org.ai)

## Categories

### Cognitive Abilities (21)
Mental capabilities that influence acquiring knowledge.

| Ability | Description |
|---------|-------------|
| Oral Comprehension | Understanding spoken words and sentences |
| Written Comprehension | Understanding written sentences and paragraphs |
| Oral Expression | Communicating information orally |
| Written Expression | Communicating information in writing |
| Fluency of Ideas | Coming up with multiple ideas |
| Originality | Coming up with unusual ideas |
| Problem Sensitivity | Recognizing when something is wrong |
| Deductive Reasoning | Applying general rules to specific problems |
| Inductive Reasoning | Combining information to form general rules |
| Information Ordering | Arranging things in a certain order |
| Category Flexibility | Generating rules for grouping things |
| Mathematical Reasoning | Choosing the right formula |
| Number Facility | Adding, subtracting, multiplying, dividing |
| Memorization | Remembering information |
| Speed of Closure | Quickly identifying patterns |
| Flexibility of Closure | Identifying patterns in distracting material |
| Perceptual Speed | Comparing similarities and differences |
| Spatial Orientation | Knowing one's location relative to environment |
| Visualization | Imagining how something will look |
| Selective Attention | Concentrating on a task |
| Time Sharing | Shifting between tasks |

### Psychomotor Abilities (10)
Capacities to manipulate and control objects.

| Ability | Description |
|---------|-------------|
| Arm-Hand Steadiness | Keeping hand and arm steady |
| Manual Dexterity | Moving hand to grasp, place objects |
| Finger Dexterity | Moving fingers to manipulate objects |
| Control Precision | Adjusting controls of machine |
| Multilimb Coordination | Coordinating movements of limbs |
| Response Orientation | Choosing quickly among movements |
| Rate Control | Timing adjustments to moving object |
| Reaction Time | Responding quickly to signal |
| Wrist-Finger Speed | Making fast, repetitive movements |
| Speed of Limb Movement | Moving arms and legs quickly |

### Physical Abilities (9)
Capacities for physical activities.

| Ability | Description |
|---------|-------------|
| Static Strength | Exerting maximum muscle force |
| Explosive Strength | Using short bursts of muscle force |
| Dynamic Strength | Exerting muscle force repeatedly |
| Trunk Strength | Using abdominal and back muscles |
| Stamina | Exerting effort over long periods |
| Extent Flexibility | Bending, stretching, twisting |
| Dynamic Flexibility | Quickly bending, stretching |
| Gross Body Coordination | Coordinating body movements |
| Gross Body Equilibrium | Keeping or regaining balance |

### Sensory Abilities (12)
Capacities to perceive information.

| Ability | Description |
|---------|-------------|
| Near Vision | Seeing details at close range |
| Far Vision | Seeing details at a distance |
| Visual Color Discrimination | Matching or detecting color differences |
| Night Vision | Seeing under low light |
| Peripheral Vision | Seeing objects to the side |
| Depth Perception | Judging distances |
| Glare Sensitivity | Seeing in the presence of glare |
| Hearing Sensitivity | Detecting sounds |
| Auditory Attention | Focusing on a single sound source |
| Sound Localization | Identifying the direction of sound |
| Speech Recognition | Identifying and understanding speech |
| Speech Clarity | Speaking clearly |

## Usage

```typescript
import { abilities, Ability } from 'abilities.org.ai'

// Get all abilities
const all = await abilities

// Get cognitive abilities
const cognitive = await abilities.filter(a =>
  a.category === 'cognitive'
)

// Get abilities for an occupation
import { occupations } from 'onet.org.ai'
const dev = await occupations.get('15-1252.00')
const devAbilities = dev.abilities
```

## Cross-References

| System | Mapping |
|--------|---------|
| [onet.org.ai](https://onet.org.ai) | Full O*NET ability detail |
| [skills.org.ai](https://skills.org.ai) | Related skills |
| [occupations.org.ai](https://occupations.org.ai) | Occupation abilities |

## License

O*NET data is public domain from the U.S. Department of Labor.

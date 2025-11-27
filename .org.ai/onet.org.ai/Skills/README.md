---
$id: https://onet.org.ai/Skills
$context: https://onet.org.ai
name: O*NET Skills
count: 35
---

# O*NET Skills

35 skills organized into Basic Skills and Cross-Functional Skills.

## Categories

### Basic Skills (10)

Skills that facilitate learning or the acquisition of knowledge.

#### Content Skills (4)
| ID | Skill | Description |
|----|-------|-------------|
| 2.A.1.a | Reading Comprehension | Understanding written sentences and paragraphs |
| 2.A.1.b | Active Listening | Giving full attention to what others are saying |
| 2.A.1.c | Writing | Communicating effectively in writing |
| 2.A.1.d | Speaking | Talking to others to convey information |

#### Process Skills (6)
| ID | Skill | Description |
|----|-------|-------------|
| 2.A.2.a | Critical Thinking | Using logic to identify problems |
| 2.A.2.b | Active Learning | Understanding implications of new information |
| 2.A.2.c | Learning Strategies | Selecting training methods |
| 2.A.2.d | Monitoring | Monitoring performance of yourself and others |
| 2.A.2.e | Mathematics | Using mathematics to solve problems |
| 2.A.2.f | Science | Using scientific rules to solve problems |

### Cross-Functional Skills (25)

Skills that facilitate performance across job types.

#### Social Skills (6)
| ID | Skill | Description |
|----|-------|-------------|
| 2.B.1.a | Social Perceptiveness | Being aware of others' reactions |
| 2.B.1.b | Coordination | Adjusting actions with others |
| 2.B.1.c | Persuasion | Persuading others to change behavior |
| 2.B.1.d | Negotiation | Bringing others together and reconciling |
| 2.B.1.e | Instructing | Teaching others how to do something |
| 2.B.1.f | Service Orientation | Actively looking for ways to help |

#### Complex Problem Solving (1)
| ID | Skill | Description |
|----|-------|-------------|
| 2.B.2.i | Complex Problem Solving | Identifying complex problems |

#### Technical Skills (7)
| ID | Skill | Description |
|----|-------|-------------|
| 2.B.3.a | Operations Analysis | Analyzing needs and requirements |
| 2.B.3.b | Technology Design | Generating or adapting equipment |
| 2.B.3.c | Equipment Selection | Determining tools needed |
| 2.B.3.d | Installation | Installing equipment, machines, wiring |
| 2.B.3.e | Programming | Writing computer programs |
| 2.B.3.g | Operation Monitoring | Watching gauges, dials, displays |
| 2.B.3.h | Operation and Control | Controlling operations of equipment |
| 2.B.3.j | Equipment Maintenance | Performing routine maintenance |
| 2.B.3.k | Troubleshooting | Determining causes of errors |
| 2.B.3.l | Repairing | Repairing machines or systems |
| 2.B.3.m | Quality Control Analysis | Conducting tests and inspections |

#### Systems Skills (3)
| ID | Skill | Description |
|----|-------|-------------|
| 2.B.4.e | Judgment and Decision Making | Weighing costs and benefits |
| 2.B.4.g | Systems Analysis | Determining how a system should work |
| 2.B.4.h | Systems Evaluation | Identifying measures of system performance |

#### Resource Management Skills (4)
| ID | Skill | Description |
|----|-------|-------------|
| 2.B.5.a | Time Management | Managing one's own time |
| 2.B.5.b | Management of Financial Resources | Managing money |
| 2.B.5.c | Management of Material Resources | Obtaining equipment |
| 2.B.5.d | Management of Personnel Resources | Motivating, developing people |

## Level Scale

Skills are measured on a 0-7 scale:

| Level | Anchor Example |
|-------|----------------|
| 0 | Not relevant |
| 1 | Read step-by-step instructions |
| 2 | Read a memo from management |
| 3 | Read a scientific journal article |
| 4 | Read a legal document |
| 5 | Read a novel |
| 6 | Read a complex technical manual |
| 7 | Read Shakespeare |

## Usage

```typescript
import { skills } from 'onet.org.ai'

// Get all skills
const allSkills = await skills

// Get basic skills
const basicSkills = await skills.filter(s => s.category === 'basic')

// Get skills for an occupation
import { occupations } from 'onet.org.ai'
const softwareDev = await occupations.get('15-1252.00')
const devSkills = softwareDev.skills
```

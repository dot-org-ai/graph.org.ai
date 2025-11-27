---
$id: https://education.org.ai
$context: https://education.org.ai
name: education.org.ai
parent: knowledge.org.ai
license: CC-BY-SA-4.0
---

# education.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Learning, teaching, and training systems, institutions, and processes.

## Overview

This repository contains comprehensive MDX documentation for education.org.ai, part of the .org.ai ontology ecosystem. It provides structured data and ontology for educational institutions, instructional delivery, student services, and learning systems based on industry standards including NAICS Sector 61 (Educational Services) and APQC PCF Education extension.

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai) > [schema.org.ai/EducationalOrganization](https://schema.org.ai/EducationalOrganization)

## Education Industry Overview

The education sector encompasses institutions and organizations that provide instruction and training across a broad range of subjects and levels. This includes:

- **Formal Education**: K-12 schools, colleges, universities with structured curricula and credentials
- **Vocational Training**: Technical schools, apprenticeships, and trade education
- **Corporate Learning**: Workplace training, professional development, and organizational learning
- **Online Education**: MOOCs, e-learning platforms, and digital learning management systems
- **Continuing Education**: Adult education, certification programs, and lifelong learning

The sector is characterized by accreditation requirements, student outcome measurement, credential issuance, and increasingly sophisticated educational technology systems.

## NAICS 61 - Educational Services

The North American Industry Classification System (NAICS) organizes educational services under Sector 61:

### Subsectors

| Code | Subsector | Description |
|------|-----------|-------------|
| **6111** | [Elementary and Secondary Schools](./K12Education) | Public, private, charter schools providing K-12 instruction |
| **6112** | [Junior Colleges](./CommunityColleges) | 2-year institutions awarding associate degrees and certificates |
| **6113** | [Colleges, Universities, and Professional Schools](./HigherEducation) | 4-year institutions, graduate schools, professional programs |
| **6114** | [Business Schools and Computer Training](./CorporateTraining) | Management training, professional development, IT training |
| **6115** | [Technical and Trade Schools](./TechnicalEducation) | Vocational training, apprenticeships, skilled trade instruction |
| **6116** | Educational Support Services | Testing, tutoring, educational consulting |
| **6117** | Educational Services (Other) | Test prep, driving schools, language instruction |

### Key Industry Characteristics

- **Instructional Delivery**: Classroom, online, hybrid, experiential learning
- **Accreditation**: Regional, national, programmatic accreditation bodies
- **Credentials**: Degrees, diplomas, certificates, badges, continuing education units
- **Student Services**: Admissions, financial aid, advising, career services
- **Assessment**: Student outcomes, institutional effectiveness, learning analytics

## APQC PCF Education Extension

The APQC Process Classification Framework provides a standardized taxonomy of business processes adapted specifically for educational institutions:

### Core Education Processes

#### 1.0 Develop Vision and Strategy (Education Context)
- 1.1 Define institutional mission and educational philosophy
- 1.2 Develop academic strategic plan
- 1.3 Design institutional governance structure
- 1.4 Establish accreditation compliance framework

#### 2.0 Design and Develop Academic Programs
- 2.1 Conduct market analysis for program viability
- 2.2 Design curriculum and learning outcomes
- 2.3 Develop instructional materials and assessments
- 2.4 Gain accreditation approval for programs
- 2.5 Manage program portfolio lifecycle

#### 3.0 Market and Recruit Students
- 3.1 Develop enrollment marketing strategy
- 3.2 Execute recruitment campaigns
- 3.3 Manage admissions process
- 3.4 Process applications and financial aid

#### 4.0 Deliver Instruction and Learning Services
- 4.1 Schedule courses and assign faculty
- 4.2 Deliver classroom/online instruction
- 4.3 Facilitate experiential learning
- 4.4 Assess student learning outcomes
- 4.5 Manage learning management systems (LMS)

#### 5.0 Provide Student Services
- 5.1 Manage student registration and records
- 5.2 Provide academic advising
- 5.3 Deliver student support services
- 5.4 Manage career services
- 5.5 Facilitate student engagement and activities

#### 6.0 Manage Institutional Operations
- 6.1 Manage academic facilities
- 6.2 Operate campus services (dining, housing, safety)
- 6.3 Manage library and research resources
- 6.4 Support institutional research and effectiveness

#### 7.0 Develop and Manage Faculty and Staff
- 7.1 Recruit and hire faculty
- 7.2 Manage faculty development and promotion
- 7.3 Administer staff HR processes
- 7.4 Support teaching excellence and pedagogical innovation

#### 8.0 Manage Educational Technology
- 8.1 Implement and maintain Student Information Systems (SIS)
- 8.2 Operate Learning Management Systems (LMS)
- 8.3 Support educational technology infrastructure
- 8.4 Manage data security and student privacy
- 8.5 Enable online and hybrid learning delivery

#### 9.0 Manage Financial Resources
- 9.1 Develop institutional budget
- 9.2 Manage tuition and fee collection
- 9.3 Administer financial aid and scholarships
- 9.4 Oversee endowment and fundraising
- 9.5 Ensure financial compliance and reporting

## Educational Technology Systems

Modern educational institutions rely on integrated technology platforms:

### Learning Management Systems (LMS)
- **Course Management**: Canvas, Blackboard, Moodle, D2L Brightspace
- **Content Delivery**: Video streaming, interactive modules, assignments
- **Assessment**: Quizzes, rubrics, gradebooks, feedback
- **Analytics**: Engagement tracking, early warning systems, learning outcomes

### Student Information Systems (SIS)
- **Enrollment Management**: Admissions, registration, scheduling
- **Academic Records**: Transcripts, degrees, certifications
- **Student Services**: Advising, financial aid, billing
- **Reporting**: Compliance, institutional research, accreditation

### Additional EdTech Categories
- **Video Conferencing**: Zoom, Teams, WebEx for synchronous learning
- **Assessment Tools**: Turnitin, ExamSoft, Respondus for testing and integrity
- **Collaboration**: Google Workspace, Microsoft 365 for student work
- **Analytics**: Learning analytics, predictive modeling, retention tools

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── **education.org.ai**
                    ├── [K12Education](./K12Education)
                    ├── [HigherEducation](./HigherEducation)
                    ├── [CommunityColleges](./CommunityColleges)
                    ├── [OnlineLearning](./OnlineLearning)
                    ├── [CorporateTraining](./CorporateTraining)
                    └── [TechnicalEducation](./TechnicalEducation)

## Types

### Core Types
- [`EducationalOrganization`](https://education.org.ai/EducationalOrganization) - Educational institutions
- [`Course`](https://education.org.ai/Course) - Instructional offerings

### Education Categories
- [`K12Education`](./K12Education) - Elementary and secondary education (NAICS 6111)
- [`HigherEducation`](./HigherEducation) - Colleges and universities (NAICS 6113)
- [`CommunityColleges`](./CommunityColleges) - Two-year institutions (NAICS 6112)
- [`OnlineLearning`](./OnlineLearning) - Digital and distance education
- [`CorporateTraining`](./CorporateTraining) - Business and professional training (NAICS 6114)
- [`TechnicalEducation`](./TechnicalEducation) - Vocational and trade schools (NAICS 6115)

## Structure

```
education.org.ai/
├── README.md                      # This file
├── package.json                   # NPM package config
├── index.ts                       # Type & const exports
├── types.ts                       # TypeScript definitions
├── index.mdx                      # Domain index
│
├── [EducationalOrganization].mdx  # Type template
├── [Course].mdx                   # Type template
│
├── K12Education.mdx               # NAICS 6111 - Elementary/Secondary
├── HigherEducation.mdx            # NAICS 6113 - Universities/Colleges
├── CommunityColleges.mdx          # NAICS 6112 - Junior Colleges
├── OnlineLearning.mdx             # Digital education platforms
├── CorporateTraining.mdx          # NAICS 6114 - Business/Professional
└── TechnicalEducation.mdx         # NAICS 6115 - Trade/Vocational
```

## Usage

### Import as NPM Package

```typescript
import {
  EducationalOrganization,
  Course,
  K12Education,
  HigherEducation,
  CommunityColleges
} from 'education.org.ai'
```

### Use in MDX

```mdx
---
$type: https://education.org.ai/EducationalOrganization
name: Example University
naicsCode: "6113"
accreditation: Regional
---

# Example University

A comprehensive research university...
```

## Cross-References

| System | Relationship |
|--------|--------------|
| [naics.org.ai/61](https://naics.org.ai/Sectors/61/) | NAICS Sector 61 - Educational Services classification |
| [apqc.org.ai](https://apqc.org.ai) | PCF Education extension for institutional processes |
| [knowledge.org.ai](https://knowledge.org.ai) | Parent domain for learning and knowledge systems |
| [organizations.org.ai](https://organizations.org.ai) | Organizational structures and management |
| [businesses.org.ai](https://businesses.org.ai) | Business operations and financial management |

## Sources

- [NAICS Sector 61 - Educational Services](https://www.census.gov/naics/)
- [APQC Process Classification Framework - Education Extension](https://www.apqc.org/pcf)
- [U.S. Department of Education](https://www.ed.gov/)
- [National Center for Education Statistics (NCES)](https://nces.ed.gov/)
- [Council for Higher Education Accreditation (CHEA)](https://www.chea.org/)
- [Educause - Higher Ed IT](https://www.educause.edu/)
- [IMS Global Learning Consortium](https://www.imsglobal.org/)

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

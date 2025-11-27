---
$id: https://research.org.ai
$context: https://research.org.ai
name: research.org.ai
parent: knowledge.org.ai
license: CC-BY-SA-4.0
---

# research.org.ai

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

Ontology domain for research.

## Overview

This repository contains MDX documentation for research.org.ai, part of the .org.ai ontology ecosystem. This domain focuses on scientific research and development services aligned with NAICS 5417 (Scientific Research and Development Services).

**Parents**: [graph.org.ai](https://graph.org.ai) > [schema.org.ai](https://schema.org.ai) > [things.org.ai](https://things.org.ai) > [knowledge.org.ai](https://knowledge.org.ai)

**Related Domains**: [naics.org.ai](https://naics.org.ai) | [science.org.ai](https://science.org.ai) | [education.org.ai](https://education.org.ai)

## Research & Development Industry Overview

The scientific research and development services industry (NAICS 5417) encompasses establishments conducting original investigation undertaken on a systematic basis to gain new knowledge (research) and/or the application of research findings to create new or improved products, processes, or services (experimental development). This critical sector drives innovation across all industries and includes:

- **Basic Research**: Fundamental scientific inquiry to advance knowledge without immediate commercial application
- **Applied Research**: Translational research bridging scientific discovery and practical application
- **Experimental Development**: Creating prototypes, pilot plants, and proof-of-concept demonstrations
- **Clinical Research**: Human subjects research including clinical trials and medical device testing
- **Contract Research**: Third-party R&D services, testing laboratories, and research organizations

### NAICS 5417 Hierarchy

**54171 - Research and Development in the Physical, Engineering, and Life Sciences**
- 541711 - Research and Development in Biotechnology
- 541712 - Research and Development in the Physical, Engineering, and Life Sciences (except Biotechnology)

**54172 - Research and Development in the Social Sciences and Humanities**
- 541720 - Research and Development in the Social Sciences and Humanities

### Industry Scale & Impact

- **Global R&D Spending**: Over $2.5 trillion annually (2024)
- **U.S. R&D Expenditure**: $700+ billion, with 70% from business, 13% from federal government, 13% from academia
- **Employment**: Over 2 million R&D professionals in the United States
- **Patent Output**: 350,000+ U.S. patents granted annually

### Research Funding Sources

1. **Federal Funding**
   - National Institutes of Health (NIH): $47+ billion
   - National Science Foundation (NSF): $10+ billion
   - Department of Energy (DOE): $8+ billion in science
   - Department of Defense (DoD): $40+ billion in R&D
   - NASA: $7+ billion in R&D

2. **Industry Funding**
   - Pharmaceutical & Biotechnology: $200+ billion globally
   - Technology & Software: $300+ billion
   - Automotive & Aerospace: $150+ billion
   - Energy & Materials: $100+ billion

3. **Academic & Institutional**
   - University Research: $80+ billion in U.S.
   - Private Foundations: $10+ billion
   - International Collaboration: Growing

### Technology Transfer & Commercialization

The path from research to market impact:

1. **Discovery**: Basic research identifies new phenomena or knowledge
2. **Invention Disclosure**: Researchers document potentially patentable discoveries
3. **IP Protection**: Patents, copyrights, trade secrets established
4. **Development**: Applied research creates commercial prototypes
5. **Licensing**: Technology transferred to industry partners
6. **Startup Formation**: Spin-offs commercialize university research
7. **Product Launch**: Innovations reach market

**Key Metrics**:
- 25,000+ invention disclosures from U.S. universities annually
- 15,000+ U.S. patents from academic institutions
- 1,000+ university startup companies formed yearly
- $3+ billion in licensing revenue to universities

### Research Categories

## Hierarchy

[graph.org.ai](https://graph.org.ai)
    └── [schema.org.ai](https://schema.org.ai)
        └── [things.org.ai](https://things.org.ai)
            └── [knowledge.org.ai](https://knowledge.org.ai)
                └── **research.org.ai**

## Structure

```
research.org.ai/
├── README.md                # This file
├── package.json             # NPM package config
├── index.ts                 # Type & const exports
├── types.ts                 # TypeScript definitions
├── [Research].mdx           # Type template
├── BasicResearch.mdx        # Fundamental scientific inquiry
├── AppliedResearch.mdx      # Translational research & development
├── ClinicalResearch.mdx     # Clinical trials & medical research
├── MaterialsResearch.mdx    # Advanced materials & nanotechnology
├── AIResearch.mdx           # Machine learning & AI labs
└── ContractResearch.mdx     # CROs & R&D services
```

## Research Categories

- **[Basic Research](./BasicResearch.mdx)** - Fundamental science, academic research, curiosity-driven investigation
- **[Applied Research](./AppliedResearch.mdx)** - Translational research, industry R&D, experimental development
- **[Clinical Research](./ClinicalResearch.mdx)** - Clinical trials, CROs, medical research, regulatory studies
- **[Materials Research](./MaterialsResearch.mdx)** - Advanced materials, nanotechnology, computational materials
- **[AI Research](./AIResearch.mdx)** - Machine learning, AI labs, benchmarks, foundation models
- **[Contract Research](./ContractResearch.mdx)** - CROs, testing laboratories, third-party R&D services

## Usage

### Import as NPM Package

```typescript
import { Research, things } from 'research.org.ai'
```

### Use in MDX

```mdx
---
$type: https://research.org.ai/Research
name: Example
---

# Example Research
```

## Contributing

This ontology is part of the larger .org.ai ecosystem. See [graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) for contribution guidelines.

## License

This work is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

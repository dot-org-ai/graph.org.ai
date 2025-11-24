# Nouns.tsv Generation Report

## Overview

The Nouns.tsv file represents a comprehensive ontology of noun/class definitions across our knowledge graph, integrating multiple standardized taxonomies and custom extensions.

## Statistics

- **Total Nouns:** 7,212
- **Number of Sources:** 9
- **Maximum Hierarchy Depth:** 5 levels
- **Root Classes:** 11 meta-nouns

## Sources and Distribution

| Source | Count | Description |
|--------|-------|-------------|
| naics.org.ai | 3,619 | NAICS industry classifications |
| onet.org.ai | 1,676 | O*NET occupation types |
| schema.org | 920 | Schema.org vocabulary types |
| aimodel.org.ai | 306 | AI/ML model types |
| place.org.ai | 303 | Geographic entities (countries, states) |
| app.org.ai | 250 | Software applications and services |
| concept.org.ai | 59 | Abstract business concepts |
| business.org.ai | 54 | Business entity types and structures |
| careercluster.org.ai | 14 | Career pathway clusters |

## Top-Level Meta Nouns

These are the foundational classes that organize the ontology:

1. **Thing** (schema.org) - The most generic type, root of all classes
2. **Occupation** (onet.org.ai) - Jobs and professions
3. **Industry** (naics.org.ai) - Economic activity categories
4. **Business** (business.org.ai) - Commercial organizations
5. **Department** (business.org.ai) - Organizational divisions
6. **CareerCluster** (careercluster.org.ai) - Occupation groupings
7. **App** (app.org.ai) - Software applications
8. **AIModel** (aimodel.org.ai) - AI/ML models
9. **Concept** (concept.org.ai) - Abstract ideas
10. **Country** (place.org.ai) - Nation states
11. **State** (place.org.ai) - Sub-national divisions

## Most Common Parent Classes

The following parent classes have the most child nouns:

1. **Industry** - 3,619 children (entire NAICS taxonomy)
2. **Occupation** - 1,676 children (O*NET SOC codes)
3. **AIModel** - 306 children (language models, vision models, etc.)
4. **Country** - 252 children (world countries)
5. **App** - 250 children (software applications)
6. **CreativeWork** - 69 children (Schema.org creative types)
7. **Intangible** - 65 children (abstract Schema.org concepts)
8. **Enumeration** - 56 children (Schema.org enumerations)
9. **State** - 51 children (US states and territories)
10. **CivicStructure** - 30 children (public buildings and places)

## Hierarchy Depth Distribution

| Depth | Count | Description |
|-------|-------|-------------|
| 0 | 8 | Root nouns with no parent |
| 1 | 81 | Direct children of root |
| 2 | 5,859 | Most common depth (81% of all nouns) |
| 3 | 761 | Specialized sub-types |
| 4 | 482 | Highly specific types |
| 5 | 21 | Deepest specializations |

## Example Hierarchies

### Depth 5 (Deepest)
```
Thing -> Intangible -> Service -> FinancialProduct -> InvestmentOrDeposit -> DepositAccount
Thing -> Action -> InteractAction -> CommunicateAction -> InformAction -> RsvpAction
Thing -> MedicalEntity -> MedicalProcedure -> TherapeuticProcedure -> MedicalTherapy -> PalliativeProcedure
```

### Depth 3 (Common)
```
Thing -> Place -> AdministrativeArea -> State
Thing -> Place -> AdministrativeArea -> Country
Thing -> CreativeWork -> SoftwareApplication -> App
```

### Depth 2 (Most Common)
```
Thing -> Intangible -> Occupation
Thing -> CreativeWork -> Clip
Thing -> CreativeWork -> MusicPlaylist
```

## Sample Nouns by Source

### Schema.org
- **Clip** - A short TV or radio program segment
- **WatchAction** - Consuming dynamic/moving visual content
- **Hotel** - Lodging establishment

### ONET (Occupations)
- **ChiefExecutives** (11-1011.00)
- **SoftwareEngineers** (15-1252.00)
- **DataScientists** (15-2051.00)

### NAICS (Industries)
- **Agriculture** (11) - Agriculture, Forestry, Fishing and Hunting
- **Manufacturing** (31-33) - Manufacturing sector
- **InformationTechnology** (51) - IT and digital services

### Business Types
- **LocalBusiness** - Physical location businesses
- **OnlineBusiness** - Digital-first businesses
- **Ecommerce** - Online retail

### Apps
- **google-sheets** - Google Sheets spreadsheet app
- **slack** - Slack team communication platform
- **notion** - Notion all-in-one workspace

### AI Models
- **gpt-5** - OpenAI's GPT-5 language model
- **claude-sonnet-4.5** - Anthropic's Claude Sonnet
- **gemini-3-pro** - Google's Gemini model

## File Structure

The Nouns.tsv file contains the following columns:

- **id**: Unique identifier for the noun
- **type**: Always "Noun" (for consistency with ontology)
- **name**: Human-readable display name
- **description**: Detailed description of what the noun represents
- **source**: Origin taxonomy/ontology (e.g., schema.org, onet.org.ai)
- **properties**: Key properties or attributes specific to this type
- **parent**: Parent class in the hierarchy (empty for root classes)

## Usage

This file represents the "who" and "what" of the ontology - the subjects and objects that can be connected by verbs (actions/relationships). It can be used for:

1. **Type validation** - Ensuring entities conform to known types
2. **Navigation** - Building hierarchical type browsers
3. **Inference** - Understanding relationships between types
4. **Search** - Finding related entity types
5. **Schema generation** - Creating database schemas or API models

## Integration with Other Files

- **Verbs.tsv** - Defines relationships between these nouns
- **Properties.tsv** - Defines attributes applicable to each noun type
- **Processes.tsv** - Defines workflows involving these noun types
- **Tasks.tsv** - Defines actions performed on/by these nouns

## Generation

Generated by: `scripts/generate-nouns.js`
Date: $(date)
Total processing time: ~2 seconds for 7,212 nouns


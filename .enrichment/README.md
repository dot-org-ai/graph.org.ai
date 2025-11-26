# Domain Ontology

This folder contains enrichment data that defines the canonical URL structure and domain relationships for the .org.ai ontology.

## domain-ontology.tsv

Defines the mapping between entity types and their canonical/alias domains.

### Schema

- **type**: The entity type (PascalCase, matches `type` field in TSV files)
- **canonicalDomain**: The primary, authoritative domain for this type
- **aliasDomains**: Semicolon-separated list of alias domains where this type also appears
- **notes**: Description of the type and its domain relationships

### Canonical URLs

Each entity has ONE canonical URL on its canonical domain, but can have multiple alias URLs on other domains.

**Example: NAICS Industry "Manufacturing"**
- Canonical URL: `https://naics.org.ai/Manufacturing`
- Alias URLs:
  - `https://industries.org.ai/Manufacturing`
  - `https://business.org.ai/Manufacturing`
  - `https://nouns.org.ai/Manufacturing`

### Domain Hierarchy

The .org.ai domain hierarchy follows a subsumption model where more specific domains are subsets of more general ones:

```
nouns.org.ai (universal base - all types)
├── language.org.ai
│   ├── verbs.org.ai
│   └── concepts.org.ai
├── schema.org.ai (schema.org types)
├── standards.org.ai
│   ├── onet.org.ai (occupational taxonomy)
│   │   ├── occupations.org.ai
│   │   ├── skills.org.ai
│   │   ├── abilities.org.ai
│   │   └── activities.org.ai
│   ├── naics.org.ai (industry classification)
│   │   └── industries.org.ai
│   ├── unspsc.org.ai (product taxonomy)
│   │   └── products.org.ai
│   └── napcs.org.ai (service classification)
│       └── services.org.ai
├── business.org.ai
│   ├── industries.org.ai
│   ├── careers.org.ai
│   └── education.org.ai
├── tech.org.ai
│   ├── apps.org.ai
│   ├── integrations.org.ai
│   └── models.org.ai
├── actions.org.ai (verbs acting on nouns)
├── events.org.ai (past-tense actions)
├── process.org.ai (APQC processes)
└── places.org.ai
```

### URL Format Rules

1. **When type IS in hostname (singular or plural):**
   ```
   https://[type].org.ai/{Id}
   ```
   Examples:
   - `https://actions.org.ai/create.Contact` (NOT `/Action/create.Contact`)
   - `https://events.org.ai/Contact.created` (NOT `/Event/Contact.created`)
   - `https://occupations.org.ai/ChiefExecutive` (NOT `/Occupation/ChiefExecutive`)

2. **When type is NOT in hostname:**
   ```
   https://{domain}/{Type}/{Id}
   ```
   Examples:
   - `https://standards.org.ai/NAICS/Manufacturing`
   - `https://onet.org.ai/Skill/ReadingComprehension`
   - `https://unspsc.org.ai/Product/16bitmicrocontroller`

3. **Semantic IDs with dots are preserved:**
   - `create.Contact` (NOT `CreateContact` or `ContactCreate`)
   - `Contact.created` (NOT `ContactCreated`)
   - `ChiefExecutives.direct.Organization'sFinancialBudgetActivities...`

### Usage

URL generation and validation scripts should:

1. Load the domain ontology from `domain-ontology.tsv`
2. Determine the canonical domain for each type
3. Generate the canonical URL using the format rules above
4. Optionally generate alias URLs for search/discovery

### Future Work

- Add domain hierarchy relationships to enable subset/superset queries
- Define which domains support multi-tenancy (e.g., `automotive.org.ai` ⊂ `manufacturing.org.ai`)
- Map standard code systems (NAICS, SOC, CIP, UNSPSC, GPC, NAPCS) to their canonical domains

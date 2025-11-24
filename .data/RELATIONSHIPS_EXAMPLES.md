# Relationship Examples

This document provides detailed examples from each relationship file to illustrate the structure and content.

## 1. Types.Relationships.tsv (Schema.org Type Hierarchy)

Schema.org types organized in a class hierarchy using `subClassOf` relationships.

```tsv
ns      from                    to                              predicate   reverse
schema  schema:WatchAction      schema:ConsumeAction           subClassOf  superClassOf
schema  schema:ExerciseGym      schema:SportsActivityLocation  subClassOf  superClassOf
schema  schema:MusicPlaylist    schema:CreativeWork            subClassOf  superClassOf
```

This creates a taxonomy where:
- WatchAction is a type of ConsumeAction
- ExerciseGym is a type of SportsActivityLocation
- MusicPlaylist is a type of CreativeWork

## 2. Properties.Relationships.tsv (Schema.org Property Domains and Ranges)

Properties linked to the types they apply to (domain) and the types of values they accept (range).

```tsv
ns      from                        to                      predicate        reverse
schema  schema:minimumPaymentDue    schema:Invoice         domainIncludes   hasDomainProperty
schema  schema:minimumPaymentDue    schema:MonetaryAmount  rangeIncludes    hasRangeProperty
schema  schema:discount             schema:Order           domainIncludes   hasDomainProperty
schema  schema:discount             schema:Number          rangeIncludes    hasRangeProperty
```

This means:
- `minimumPaymentDue` can be used on Invoice objects
- `minimumPaymentDue` values are MonetaryAmount objects
- `discount` can be used on Order objects
- `discount` values are Numbers

## 3. Products.Relationships.tsv (UNSPSC Product Hierarchy)

Products organized in a 4-level hierarchy: Segment → Family → Class → Commodity

```tsv
ns      from                            to                          predicate               reverse
unspsc  unspsc-cats                     unspsc-class-10101500      partOfProductCategory   hasSubProduct
unspsc  unspsc-class-10101500           unspsc-family-10100000     partOfProductCategory   hasSubProduct
unspsc  unspsc-family-10100000          unspsc-segment-10000000    partOfProductCategory   hasSubProduct
```

This creates the hierarchy:
- Cats (commodity) → Class 10101500 "Livestock" → Family 10100000 "Live animals" → Segment 10000000 "Live Plant and Animal Material"

## 4. Services.Relationships.tsv (NAPCS Service Hierarchy)

Services organized in a 4-level hierarchy: Group → Class → Subclass → Detail

```tsv
ns      from                            to          predicate               reverse
napcs   Cattle                          111111     partOfServiceCategory   hasSubService
napcs   CattleCalves111111              11111      partOfServiceCategory   hasSubService
napcs   CattleCalves                    111        partOfServiceCategory   hasSubService
```

This creates the hierarchy:
- Cattle (detail) → 111111 (subclass) → 11111 (class) → 111 (group "Live Animals")

## 5. Nouns.Relationships.tsv (Noun Type System)

Custom nouns linked to their parent types and defining ontologies.

```tsv
ns    from        to                  predicate   reverse
noun  State       Place               subClassOf  superClassOf
noun  State       place.org.ai        definedBy   defines
noun  Country     Place               subClassOf  superClassOf
noun  Country     place.org.ai        definedBy   defines
noun  AIModel     ComputationalModel  subClassOf  superClassOf
noun  AIModel     aimodel.org.ai      definedBy   defines
```

This shows:
- State and Country are types of Place
- These types are defined by the place.org.ai ontology
- AIModel is a type of ComputationalModel
- AIModel is defined by the aimodel.org.ai ontology

## 6. Models.Relationships.tsv (AI Model Capabilities)

AI models linked to their capabilities and characteristics.

```tsv
ns     from                                to           predicate       reverse
model  google/gemini-3-pro-image-preview  AIModel      instanceOf      hasInstance
model  google/gemini-3-pro-image-preview  TextModel    hasCapability   capabilityOf
model  google/gemini-3-pro-image-preview  VisionModel  hasCapability   capabilityOf
model  allenai/olmo-3-7b-instruct         AIModel      instanceOf      hasInstance
model  allenai/olmo-3-7b-instruct         TextModel    hasCapability   capabilityOf
```

This indicates:
- Gemini 3 Pro is an AI Model that can handle both text and vision
- Olmo 3 7B Instruct is an AI Model that handles text

## 7. Language.Relationships.tsv (Language Elements)

Parts of speech and their semantic categories.

```tsv
ns        from         to            predicate    reverse
language  accurately   Adverb        instanceOf   hasInstance
language  accurately   Manner        hasCategory  categoryOf
language  after        Preposition   instanceOf   hasInstance
language  after        Time          hasCategory  categoryOf
language  about        Preposition   instanceOf   hasInstance
language  about        Location      hasCategory  categoryOf
```

This shows:
- "accurately" is an Adverb in the Manner category
- "after" is a Preposition in the Time category
- "about" is a Preposition in the Location/Topic category

## Graph Query Examples

These relationships enable powerful graph queries:

### Find all subclasses of CreativeWork
```
Match (n)-[subClassOf]->(schema:CreativeWork)
```

### Find all properties that can be used on Invoice
```
Match (p)-[domainIncludes]->(schema:Invoice)
```

### Find the full product hierarchy for a commodity
```
Match (commodity)-[partOfProductCategory*]->(segment)
```

### Find all AI models with vision capabilities
```
Match (model)-[hasCapability]->(VisionModel)
```

### Find all Time-related prepositions
```
Match (word)-[hasCategory]->(Time)
Where (word)-[instanceOf]->(Preposition)
```

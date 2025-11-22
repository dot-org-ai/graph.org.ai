# Language Source Data

Parts of speech for the GraphDL semantic parser.

## Files

| File | Count | Description |
|------|-------|-------------|
| `Language.Verbs.tsv` | 217 | Verb forms with conjugations (predicate, event, activity, actor, object, inverse) |
| `Language.Prepositions.tsv` | 54 | Prepositions with categories and usage |
| `Language.Conjunctions.tsv` | 32 | Coordinating, subordinating, and correlative conjunctions |
| `Language.Determiners.tsv` | 40 | Articles, quantifiers, demonstratives, possessives, interrogatives |
| `Language.Pronouns.tsv` | 58 | Personal, demonstrative, interrogative, relative, and indefinite pronouns |
| `Language.Adverbs.tsv` | 128 | Adverbs categorized by manner, time, frequency, degree, certainty |

**Total:** 529 entries

## Verbs (217 entries)

Extracted from `verbs.org.ai/*.mdx` files. Each verb includes:

- **id**: Canonical form (e.g., "analyze")
- **name**: Display name
- **canonicalForm**: Base form
- **description**: Definition
- **predicate**: Present tense (e.g., "analyzes")
- **event**: Past tense (e.g., "analyzed")
- **activity**: Gerund/present participle (e.g., "analyzing")
- **actor**: Agent noun (e.g., "Analyzer")
- **object**: Result noun (e.g., "Analysis")
- **inverse**: Passive form (e.g., "analyzedBy")
- **source**: Origin URL
- **vocabulary**: Source vocabulary (O*NET, APQC, GS1, Schema.org)

### Example Verbs

```
analyze: analyzes, analyzed, analyzing → Analyzer, Analysis
communicate: communicates, communicated, communicating → Communicator, Communication
develop: develops, developed, developing → Developer, Development
```

## Prepositions (54 entries)

Common prepositions categorized by semantic function:

- **Location/Position**: at, in, on, above, below, beside, between, near, etc.
- **Movement/Direction**: to, from, into, onto, through, across, along, etc.
- **Time**: after, before, during, until, since, etc.
- **Topic**: about, concerning, regarding
- **Method/Instrument**: with, via, by
- **Purpose**: for

### Example Usage in Statements

```
Subject.predicate.Object.in.Location
Subject.predicate.Object.with.Instrument
Subject.predicate.Object.to.Recipient
Subject.predicate.Object.from.Source
```

## Conjunctions (32 entries)

- **Coordinating** (7): and, but, or, nor, for, so, yet
- **Subordinating** (23): after, although, as, because, before, if, since, than, that, though, unless, until, when, where, whereas, whether, while, etc.
- **Correlative** (4): both, either, neither, not

### Usage in GraphDL

Conjunctions enable compound entity expansion:

```
"analyze and review" → ["analyze", "review"]
"email or call" → ["email", "call"]
"create, test, and deploy" → ["create", "test", "deploy"]
```

## Determiners (40 entries)

- **Articles** (3): a, an, the
- **Quantifiers** (23): all, any, both, each, every, few, many, more, most, much, some, etc.
- **Demonstratives** (4): this, that, these, those
- **Possessives** (7): my, your, his, her, its, our, their
- **Interrogatives** (3): what, which, whose

## Pronouns (58 entries)

- **Personal** (21): I, me, you, he, she, it, we, they, etc.
- **Demonstrative** (4): this, that, these, those
- **Interrogative** (5): who, whom, whose, what, which
- **Relative** (5): who, whom, whose, which, that
- **Indefinite** (9): anyone, everyone, someone, nothing, etc.

## Adverbs (128 entries)

Categorized by function:

- **Manner** (45): accurately, carefully, efficiently, properly, etc.
- **Time** (25): now, then, today, yesterday, soon, recently, etc.
- **Frequency** (24): always, often, sometimes, rarely, never, daily, weekly, etc.
- **Degree** (25): very, quite, extremely, highly, completely, partially, etc.
- **Certainty** (9): certainly, definitely, probably, possibly, apparently, etc.

## GraphDL Parser Usage

These language files support the GraphDL semantic parser for:

1. **Statement Parsing**: Break down natural language into Subject.predicate.Object.preposition.Object
2. **Verb Conjugation**: Normalize verbs to canonical forms
3. **Compound Expansion**: Identify AND/OR conjunctions for Cartesian products
4. **Part-of-Speech Tagging**: Classify words for accurate semantic parsing
5. **Entity Recognition**: Distinguish Nouns (TitleCase) from verbs (camelCase) and prepositions (lowercase)

## Naming Conventions

- **Nouns** (Subject/Object): TitleCase (e.g., "FinancialAnalyst", "MarketData")
- **Verbs** (predicate): camelCase (e.g., "analyze", "communicate")
- **Prepositions**: lowercase (e.g., "in", "with", "to")
- **Determiners**: lowercase (e.g., "the", "a", "some")
- **Adverbs**: camelCase when used as modifiers (e.g., "carefully", "efficiently")

## Examples

### Statement Structure

```
FinancialAnalyst.analyze.MarketData.in.SpreadsheetApplication
  Subject:     FinancialAnalyst (TitleCase Noun)
  predicate:   analyze (camelCase verb)
  Object:      MarketData (TitleCase Noun)
  preposition: in (lowercase)
  Object:      SpreadsheetApplication (TitleCase Noun)
```

### Compound Expansion

```
"analyze and review data" →
  - "analyze data"
  - "review data"

"communicate status to customer or manager" →
  - "communicate status to customer"
  - "communicate status to manager"
```

## Data Sources

- **Verbs**: Manually curated from O*NET, APQC, GS1, and Schema.org vocabularies
- **Other Parts of Speech**: Standard English grammar references

## Adding New Verbs - Iterative Workflow

### 1. Discover Missing Verbs

```bash
npx tsx .scripts/discover-missing-verbs.ts
```

Generates `.output/MissingVerbs.tsv` with all verbs found in APQC/ONET that aren't in our lexicon.

### 2. Generate Conjugation Template

```bash
npx tsx .scripts/add-verbs-template.ts
```

Creates `.output/NewVerbs.Template.tsv` with auto-generated conjugations (frequency ≥ 2).

### 3. Manual Review & Correction

**⚠️ Auto-generation has known issues - review carefully!**

Common fixes needed:

| Generated | Correct | Pattern |
|-----------|---------|---------|
| Defination | Definition | -ine → -inition |
| Traination | Training | Use gerund as noun |
| Supportation | Support | Simple noun form |
| trainned | trained | Don't double after 'ai' |
| writedBy | writtenBy | Irregular passive |

### 4. Add Descriptions

Replace all `TODO: Add description` with context from APQC/ONET usage.

### 5. Append to Verbs File

```bash
tail -n +2 .output/NewVerbs.Template.tsv >> .enrichment/Language/Language.Verbs.tsv
```

### 6. Re-run Parser

```bash
npx tsx .scripts/batch-parse-apqc.ts
npx tsx .scripts/batch-parse-onet.ts
```

## Updates

To update verbs from MDX files:

```bash
npx tsx .scripts/extract-verbs.ts
```

This regenerates `Language.Verbs.tsv` from `verbs.org.ai/*.mdx`.

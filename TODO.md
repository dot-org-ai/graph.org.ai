# TODO

## Source

- [x] Get all data sources into .source/[SourceName.TypeName].tsv files (column names `camelCase`)
  - [x] Schema.org Types & Properties (920 types, 1510 properties)
  - [x] O*NET (25+ tables/files, ~900K rows total)
  - [ ] GS1 (EPCIS, CBV, Identifiers, and Ontologies for each) - Requires manual download
  - [ ] NAICS Industries - Requires manual XLSX conversion (see .source/NAICS/README.md)
  - [ ] NAPCS Products/Services - Requires manual download
  - [ ] UNSPSC Products/Services - Requires registration (see .source/UNSPSC/README.md)
  - [x] APQC Process (1,921 processes, 37,623 industry variants)
  - [ ] Simple Icons / React Icons - API error, requires manual download
  - [x] .do Models, Providers, Labs (342 models from OpenRouter)
  - [ ] .do Integrations - API authentication required

## Schema

- [ ] Create Zod schemas for all .org.ai Nouns
  - [ ] Noun (properties, actions, events)
  - [ ] Verb (action, actor, act, activity, result, event, reverse, inverse)
  - [ ] Things (type, data, content, code, component, relationships, references)
  - [ ] Language (all base partOfSpeech enums: Adjectives, Adverbs, Propositions, Pronouns, Conjunctions, etc)
  - [ ] Statement (Subject.predicate.Object.proposition.Object)
  - [ ] Industries
  - [ ] Products
  - [ ] Services
  - [ ] Occupations
  - [ ] Activities (Work Activities -> IWA -> DWA -> Tasks)
  - [ ] Skills
  - [ ] Knowledge
  - [ ] Abilities
  - [ ] Education
  - [ ] Training
  - [ ] Experience
  - [ ] Jobs (Zones to Alternate Titles)
  - [ ] Interests
  - [ ] Keywords
  - [ ] Work Styles
  - [ ] Work Values
  - [ ] Tasks
  - [ ] Tech
  - [ ] Tools

## MDX Primitivies

- [ ] mdxld
- [ ] mdxui
  - [ ] @mdxui/markdown
  - [ ] @mdxui/ink
  - [ ] @mdxui/hono
  - [ ] @mdxui/next
- [ ] mdxdb
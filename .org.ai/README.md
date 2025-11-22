# .org.ai Ecosystem

This directory contains git submodules for all `.org.ai` domain repositories, plus centralized templates for generating new domains and content.

## Structure

```
.org.ai/
├── README.md                    # This file
├── templates/                   # Centralized templates
│   ├── domain/                  # Domain structure templates
│   │   ├── README.md           # Domain README template
│   │   ├── LICENSE             # CC-BY-SA-4.0 license
│   │   ├── thing.mdx           # MDX entity template
│   │   └── .github/            # GitHub Actions workflows
│   ├── npm/                    # NPM package templates
│   │   ├── package.json        # Package configuration
│   │   └── tsconfig.json       # TypeScript configuration
│   ├── scripts/                # Generation scripts
│   │   ├── create-domain.ts    # Create new domain from template
│   │   └── generate-content.ts # Generate MDX content
│   └── site/                   # Documentation site templates
│
├── schema.org.ai/              # Submodule: Foundational schemas and types
├── occupations.org.ai/         # Submodule: Roles, skills, occupational ontologies
├── products.org.ai/            # Submodule: Products ontology (GS1, UNSPSC, Wikidata)
├── services.org.ai/            # Submodule: Services ontology (NAICS, UNSPSC)
├── industries.org.ai/          # Submodule: Industry-specific ontologies
├── tasks.org.ai/               # Submodule: Task definitions and workflows
├── language.org.ai/            # Submodule: Natural language patterns
├── verbs.org.ai/               # Submodule: Business actions and operations
├── nouns.org.ai/               # Submodule: Entities, subjects, and objects
└── process.org.ai/             # Submodule: Business processes and workflows
```

## Usage

### Working with Submodules

#### Clone with all submodules

```bash
git clone --recursive https://github.com/dot-org-ai/graph.org.ai
```

#### Update all submodules

```bash
git submodule update --init --recursive
```

#### Pull latest changes for all submodules

```bash
git submodule update --remote
```

#### Update a specific submodule

```bash
cd .org.ai/schema.org.ai
git pull origin main
cd ../..
git add .org.ai/schema.org.ai
git commit -m "Update schema.org.ai submodule"
```

### Creating a New Domain

Use the domain creation script to bootstrap a new `.org.ai` domain:

```bash
cd .org.ai/templates/scripts
npm install
./create-domain.ts mydomain.org.ai
```

This will:

1. Create directory structure based on templates
2. Generate README, LICENSE, package.json, etc.
3. Initialize a git repository
4. Provide next steps for GitHub setup

### Generating Content

Each domain has its own content generation script:

```bash
cd .org.ai/mydomain.org.ai/scripts
npm install
npm run generate
```

### Publishing NPM Packages

Each domain can be published as an NPM package:

```bash
cd .org.ai/mydomain.org.ai/package
npm install
npm run build
npm publish --access public
```

## Domain Registry

All domains are registered in `../.org.ai.tsv` at the root of the graph.org.ai repository.

Current domains:

| Domain | Parent | Description |
|--------|--------|-------------|
| schema.org.ai | - | Foundational data schemas and types |
| occupations.org.ai | work.org.ai | Roles, skills, and occupational ontologies |
| products.org.ai | things.org.ai | Products ontology (GS1, UNSPSC, Wikidata) |
| services.org.ai | products.org.ai | Services ontology (NAICS, UNSPSC) |
| industries.org.ai | business.org.ai | Industry-specific ontologies |
| tasks.org.ai | activities.org.ai | Task definitions and workflows |
| language.org.ai | things.org.ai | Natural language patterns |
| verbs.org.ai | schema.org.ai | Business actions and operations |
| nouns.org.ai | schema.org.ai | Entities, subjects, and objects |
| process.org.ai | activities.org.ai | Business processes and workflows |

## Template Usage

### Domain README Template

Located at `templates/domain/README.md`, supports these variables:

- `{{domain}}` - Full domain name (e.g., tools.org.ai)
- `{{domainName}}` - Short name (e.g., tools)
- `{{parent}}` - Parent domain
- `{{description}}` - Domain description
- `{{types}}` - Array of type definitions
- `{{properties}}` - Array of property definitions
- `{{enums}}` - Array of enum definitions

### NPM Package Template

Located at `templates/npm/package.json`, configured for:

- TypeScript compilation
- ESM modules
- Dual exports (CommonJS + ESM)
- Vitest for testing
- ESLint for linting

### MDX Entity Template

Located at `templates/domain/thing.mdx`, supports:

- Frontmatter with $id, $type, name, description
- Property definitions
- Examples (MDX and TypeScript)
- Related types
- Parent/child type hierarchy

## GitHub Integration

Each domain includes GitHub Actions workflows for:

- **Build and Test**: Runs on push and PR
  - Type checking
  - Linting
  - Building
  - Testing

- **NPM Publishing**: Runs on main branch
  - Automatic publishing to NPM
  - Requires NPM_TOKEN secret

## Contributing

To add a new submodule:

```bash
# From graph.org.ai root
git submodule add https://github.com/dot-org-ai/newdomain.org.ai .org.ai/newdomain.org.ai
git commit -m "Add newdomain.org.ai submodule"
```

To update the template system:

1. Make changes in `.org.ai/templates/`
2. Test with a new domain creation
3. Update this README with any new features
4. Commit changes to graph.org.ai

## License

All templates and tooling: MIT License
All ontology content: CC BY-SA 4.0 License

## Resources

- [Graph.org.ai](https://github.com/dot-org-ai/graph.org.ai) - Main repository
- [Schema.org.ai](https://schema.org.ai) - Core ontology
- [.org.ai TSV](./.org.ai.tsv) - Domain registry

## Support

For issues with:
- **Templates or tooling**: Open issue in graph.org.ai
- **Specific domains**: Open issue in that domain's repository
- **New domain requests**: Open issue in graph.org.ai with "domain-request" label

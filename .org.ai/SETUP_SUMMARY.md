# .org.ai Setup Summary

This document summarizes the setup of the `.org.ai` ecosystem within graph.org.ai.

## What Was Created

### 1. Directory Structure

```
.org.ai/
├── README.md                    # Main documentation
├── SETUP_SUMMARY.md            # This file
├── templates/                   # Centralized templates
│   ├── domain/                 # Domain templates
│   │   ├── README.md
│   │   ├── LICENSE
│   │   ├── thing.mdx
│   │   └── .github/workflows/build.yml
│   ├── npm/                    # NPM package templates
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── scripts/                # Generation scripts
│   │   ├── create-domain.ts
│   │   └── generate-content.ts
│   └── package.json            # Templates package config
│
└── [10 submodules]/            # Domain repositories
    ├── schema.org.ai/
    ├── occupations.org.ai/
    ├── products.org.ai/
    ├── services.org.ai/
    ├── industries.org.ai/
    ├── tasks.org.ai/
    ├── language.org.ai/
    ├── verbs.org.ai/
    ├── nouns.org.ai/
    └── process.org.ai/
```

### 2. Git Submodules Added

All existing `.org.ai` repositories from the `dot-org-ai` GitHub organization have been added as submodules:

1. **schema.org.ai** - Foundational schemas and types
2. **occupations.org.ai** - Roles and occupational ontologies
3. **products.org.ai** - Products ontology (GS1, UNSPSC, Wikidata)
4. **services.org.ai** - Services ontology (NAICS, UNSPSC)
5. **industries.org.ai** - Industry-specific ontologies
6. **tasks.org.ai** - Task definitions and workflows
7. **language.org.ai** - Natural language patterns
8. **verbs.org.ai** - Business actions and operations
9. **nouns.org.ai** - Entities, subjects, and objects
10. **process.org.ai** - Business processes and workflows

### 3. Template System

Created a comprehensive template system for generating new domains:

#### Domain Templates
- **README.md** - Markdown template with variables for domain info
- **LICENSE** - CC-BY-SA-4.0 license file
- **thing.mdx** - MDX entity template with frontmatter
- **.github/workflows/build.yml** - GitHub Actions for CI/CD

#### NPM Templates
- **package.json** - TypeScript package configuration
- **tsconfig.json** - TypeScript compiler configuration

#### Scripts
- **create-domain.ts** - Bootstrap new domains from templates
- **generate-content.ts** - Generate MDX files from data sources

### 4. Documentation

- **README.md** - Comprehensive guide for working with the ecosystem
- **SETUP_SUMMARY.md** - This summary document

## How to Use

### Working with Existing Domains

```bash
# Update all submodules
git submodule update --init --recursive

# Pull latest changes
git submodule update --remote

# Work on a specific domain
cd .org.ai/schema.org.ai
git checkout main
# make changes...
git commit -m "Update schema"
git push
```

### Creating a New Domain

```bash
# 1. Create domain from template
cd .org.ai/templates
npm install
npm run create-domain newdomain.org.ai

# 2. Create GitHub repository
cd ../newdomain.org.ai
gh repo create dot-org-ai/newdomain.org.ai --public

# 3. Push to GitHub
git remote add origin https://github.com/dot-org-ai/newdomain.org.ai
git push -u origin main

# 4. Add as submodule to graph.org.ai
cd ../..
git submodule add https://github.com/dot-org-ai/newdomain.org.ai .org.ai/newdomain.org.ai
git commit -m "Add newdomain.org.ai submodule"
```

### Generating Content

Each domain can generate its content from the centralized templates:

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
npm test
npm publish --access public
```

## Template Variables

The template system supports these variables:

- `{{domain}}` - Full domain (e.g., tools.org.ai)
- `{{domainName}}` - Short name (e.g., tools)
- `{{parent}}` - Parent domain
- `{{description}}` - Description
- `{{types}}` - Type definitions
- `{{properties}}` - Property definitions
- `{{enums}}` - Enum definitions
- `{{TypeName}}` - Entity type name
- `{{parentType}}` - Parent type

## Integration with graph.org.ai

The `.org.ai` ecosystem integrates with the main graph.org.ai repository:

1. **Domain Registry**: All domains are registered in `/.org.ai.tsv`
2. **Submodules**: Referenced via git submodules in `.gitmodules`
3. **Templates**: Centralized in `.org.ai/templates/`
4. **Content Generation**: Scripts read from graph data sources

## Next Steps

1. **Update Domain Registry**: Ensure all domains in `.org.ai.tsv` have corresponding repos
2. **Generate Missing Domains**: Use create-domain script for domains that don't exist yet
3. **Standardize Structure**: Migrate existing domains to use the template structure
4. **NPM Publishing**: Set up NPM organization and publish packages
5. **CI/CD**: Enable GitHub Actions for all domains
6. **Documentation Sites**: Deploy documentation sites for each domain

## Files Modified

- `.gitignore` - Commented out Products.org.ai/ and Services.org.ai/ exclusions
- `.gitmodules` - Added 10 submodule references
- Created `.org.ai/` directory with templates and submodules
- Created `.org.ai/README.md` - Main documentation
- Created `.org.ai/SETUP_SUMMARY.md` - This file

## Maintenance

### Updating Submodules

```bash
# Update all to latest
git submodule update --remote

# Update specific submodule
git submodule update --remote .org.ai/schema.org.ai

# Commit updates
git add .org.ai
git commit -m "Update .org.ai submodules"
```

### Adding New Submodules

```bash
git submodule add https://github.com/dot-org-ai/newdomain.org.ai .org.ai/newdomain.org.ai
git commit -m "Add newdomain.org.ai submodule"
```

### Removing Submodules

```bash
git submodule deinit -f .org.ai/olddomain.org.ai
git rm -f .org.ai/olddomain.org.ai
rm -rf .git/modules/.org.ai/olddomain.org.ai
git commit -m "Remove olddomain.org.ai submodule"
```

## Resources

- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [GitHub dot-org-ai Organization](https://github.com/dot-org-ai)
- [Graph.org.ai Repository](https://github.com/dot-org-ai/graph.org.ai)
- [Schema.org.ai](https://schema.org.ai)

## License

- **Templates and Tooling**: MIT License
- **Ontology Content**: CC BY-SA 4.0 License

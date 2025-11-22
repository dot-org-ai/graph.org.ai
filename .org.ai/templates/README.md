# .org.ai Templates

Centralized templates for generating `.org.ai` domains, content, and NPM packages.

## Templates Overview

### Domain Templates

Located in `domain/`, these templates create the structure for a new `.org.ai` domain:

| Template | Purpose | Variables |
|----------|---------|-----------|
| `README.md` | Domain documentation | domain, domainName, parent, description, types, properties, enums |
| `LICENSE` | CC-BY-SA-4.0 license | - |
| `thing.mdx` | MDX entity template | TypeName, description, properties, parentType |
| `.github/workflows/build.yml` | GitHub Actions CI/CD | - |

### NPM Templates

Located in `npm/`, these templates create NPM package structure:

| Template | Purpose |
|----------|---------|
| `package.json` | Package configuration with TypeScript, ESM, testing |
| `tsconfig.json` | TypeScript compiler configuration |

### Scripts

Located in `scripts/`, executable generation scripts:

| Script | Purpose | Usage |
|--------|---------|-------|
| `create-domain.ts` | Generate new domain from templates | `npm run create-domain mydomain.org.ai` |
| `generate-content.ts` | Generate MDX content from data | Customize per domain |

## Using Templates

### 1. Create a New Domain

```bash
cd .org.ai/templates
npm install
npm run create-domain tools.org.ai
```

This will:
1. Create directory structure
2. Generate README, LICENSE, package files
3. Set up GitHub Actions
4. Initialize git repository
5. Provide next steps for GitHub setup

### 2. Customize Templates

Edit templates before creating domains:

```bash
# Edit domain README template
vi domain/README.md

# Edit package.json template
vi npm/package.json

# Edit entity template
vi domain/thing.mdx
```

### 3. Generate Content

Each domain gets a copy of `generate-content.ts` that you can customize:

```bash
cd .org.ai/mydomain.org.ai/scripts
# Edit generate-content.ts for your data source
vi generate-content.ts
# Run generator
npm run generate
```

## Template Variables

Templates use Mustache-style `{{variable}}` syntax:

### Domain Variables

- `{{domain}}` - Full domain name (e.g., `tools.org.ai`)
- `{{domainName}}` - Short name without .org.ai (e.g., `tools`)
- `{{parent}}` - Parent domain (e.g., `things.org.ai`)
- `{{description}}` - Domain description
- `{{types}}` - Array of type names
- `{{properties}}` - Array of property definitions
- `{{enums}}` - Array of enum definitions
- `{{sources}}` - Data source attribution
- `{{attribution}}` - Additional attribution

### Entity Variables

- `{{TypeName}}` - Entity type name (e.g., `Tool`)
- `{{parentType}}` - Parent type (e.g., `Thing`)
- `{{description}}` - Type description
- `{{properties}}` - Type properties
- `{{requiredProperties}}` - Required properties
- `{{relatedTypes}}` - Related types
- `{{childTypes}}` - Child types
- `{{exampleValue}}` - Example value for property

## Template Structure

### domain/README.md

```markdown
---
$id: https://{{domain}}
$context: https://{{domain}}
name: {{domain}}
license: CC-BY-SA-4.0
---

# {{domain}}

{{description}}

## Overview
...
```

### domain/thing.mdx

```markdown
---
$id: https://{{domain}}/{{TypeName}}
$type: Type
name: {{TypeName}}
subClassOf: {{parentType}}
description: {{description}}
---

# {{TypeName}}
...
```

### npm/package.json

```json
{
  "name": "@org.ai/{{domainName}}",
  "version": "0.1.0",
  "description": "{{description}}",
  ...
}
```

## Customization

### Adding New Templates

1. Create template file in appropriate directory
2. Use `{{variable}}` syntax for replacements
3. Update `create-domain.ts` to copy/render template
4. Document in this README

### Modifying Existing Templates

1. Edit template file
2. Test with `npm run create-domain test.org.ai`
3. Delete test domain if satisfied
4. Document changes

## Generation Scripts

### create-domain.ts

Main domain generator. Features:

- Loads config from `.org.ai.tsv`
- Creates directory structure
- Renders all templates with variables
- Initializes git repository
- Provides next steps

**Usage:**
```bash
npm run create-domain mydomain.org.ai
```

### generate-content.ts

Content generator template. Each domain gets a copy to customize.

**Customize for:**
- Loading your data source
- Mapping data to entity structure
- Generating MDX files
- Building hierarchy

## Best Practices

1. **Keep templates generic** - Use variables for domain-specific content
2. **Document variables** - Add comments explaining what each variable does
3. **Test frequently** - Create test domains to verify templates
4. **Version templates** - Commit template changes separately
5. **Update all domains** - When templates change, consider updating existing domains

## File Structure

```
templates/
├── README.md              # This file
├── package.json           # Template system dependencies
├── domain/                # Domain structure templates
│   ├── README.md         # Domain README with frontmatter
│   ├── LICENSE           # CC-BY-SA-4.0 license
│   ├── thing.mdx         # MDX entity template
│   └── .github/
│       └── workflows/
│           └── build.yml # CI/CD workflow
├── npm/                  # NPM package templates
│   ├── package.json      # Package config with TypeScript
│   └── tsconfig.json     # TypeScript config
└── scripts/              # Generation scripts
    ├── create-domain.ts  # Domain generator
    └── generate-content.ts # Content generator
```

## Dependencies

Install with:
```bash
npm install
```

Includes:
- `tsx` - TypeScript execution
- `@types/node` - Node.js types
- `typescript` - TypeScript compiler

## Examples

### Create a domain from registry

```bash
# Domain exists in .org.ai.tsv
npm run create-domain tools.org.ai
# Config loaded automatically from .org.ai.tsv
```

### Create a custom domain

```bash
# 1. Add to .org.ai.tsv first
echo "mydomain.org.ai	things.org.ai	Custom domain	MyType		myProp" >> ../../.org.ai.tsv

# 2. Generate
npm run create-domain mydomain.org.ai
```

### Generate content for domain

```bash
cd ../mydomain.org.ai/scripts
npm install

# Edit generate-content.ts to load your data
vi generate-content.ts

# Run generator
npm run generate

# Check output
ls ../things/
```

## Troubleshooting

### Template variables not replaced

- Check syntax: `{{variable}}` (double curly braces)
- Verify variable name matches config
- Check renderTemplate function in create-domain.ts

### Script won't execute

```bash
# Make executable
chmod +x scripts/create-domain.ts

# Install dependencies
npm install
```

### Domain already exists

```bash
# Remove old domain
rm -rf ../mydomain.org.ai

# Try again
npm run create-domain mydomain.org.ai
```

## Contributing

To improve templates:

1. Fork graph.org.ai
2. Make changes in `.org.ai/templates/`
3. Test with create-domain
4. Submit PR with:
   - Template changes
   - Updated README
   - Test example

## Resources

- [Main README](../README.md)
- [Quick Start](../QUICK_START.md)
- [Setup Summary](../SETUP_SUMMARY.md)
- [Domain Registry](../../.org.ai.tsv)

## License

Templates and scripts: MIT License
Generated content: CC BY-SA 4.0 License

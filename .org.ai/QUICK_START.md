# .org.ai Quick Start Guide

Quick reference for common operations with the `.org.ai` ecosystem.

## Initial Setup

```bash
# Clone with all submodules
git clone --recursive https://github.com/dot-org-ai/graph.org.ai

# Or if already cloned, initialize submodules
cd graph.org.ai
git submodule update --init --recursive
```

## Creating a New Domain

```bash
# 1. Navigate to templates
cd .org.ai/templates

# 2. Install dependencies (first time only)
npm install

# 3. Create new domain
npm run create-domain mydomain.org.ai

# 4. Follow the printed instructions to:
#    - Create GitHub repo
#    - Push code
#    - Add as submodule
```

## Updating Content

### Generate content for a domain

```bash
cd .org.ai/mydomain.org.ai/scripts
npm install
npm run generate
```

### Edit templates

Templates are centralized in `.org.ai/templates/`:

- **Domain templates**: `.org.ai/templates/domain/`
- **NPM templates**: `.org.ai/templates/npm/`
- **Scripts**: `.org.ai/templates/scripts/`

After editing templates, create a new domain to test.

## Working with Submodules

### Update all submodules to latest

```bash
git submodule update --remote
git add .org.ai
git commit -m "Update all .org.ai submodules"
```

### Update specific submodule

```bash
cd .org.ai/schema.org.ai
git pull origin main
cd ../..
git add .org.ai/schema.org.ai
git commit -m "Update schema.org.ai"
```

### Make changes in a submodule

```bash
# 1. Navigate to submodule
cd .org.ai/schema.org.ai

# 2. Make sure you're on a branch
git checkout main

# 3. Make changes and commit
git add .
git commit -m "Update schema"

# 4. Push to origin
git push origin main

# 5. Update parent repo
cd ../..
git add .org.ai/schema.org.ai
git commit -m "Update schema.org.ai submodule reference"
git push
```

## Publishing

### Build NPM package

```bash
cd .org.ai/mydomain.org.ai/package
npm install
npm run build
```

### Run tests

```bash
npm test
```

### Publish to NPM

```bash
# Make sure you're logged in
npm login

# Publish
npm publish --access public
```

## Common Tasks

### List all domains

```bash
ls -1 .org.ai/ | grep '\.org\.ai$'
```

### Check submodule status

```bash
git submodule status
```

### View domain info

```bash
# From .org.ai.tsv
cat .org.ai.tsv | grep "mydomain.org.ai"
```

### Clone a single submodule

```bash
# For working on just one domain
git clone https://github.com/dot-org-ai/mydomain.org.ai
```

## Troubleshooting

### Submodule shows as modified

```bash
# Reset to committed state
git submodule update --init .org.ai/mydomain.org.ai
```

### Template script won't run

```bash
# Make executable
chmod +x .org.ai/templates/scripts/create-domain.ts

# Install dependencies
cd .org.ai/templates
npm install
```

### Submodule won't update

```bash
# Force update
git submodule update --init --force --remote .org.ai/mydomain.org.ai
```

## File Locations

| What | Where |
|------|-------|
| Submodules | `.org.ai/<domain>/` |
| Templates | `.org.ai/templates/` |
| Domain registry | `.org.ai.tsv` |
| Docs | `.org.ai/README.md` |
| Scripts | `.org.ai/templates/scripts/` |

## Useful Commands

```bash
# Count submodules
git submodule status | wc -l

# List all submodule URLs
git config --file .gitmodules --get-regexp url

# Update template dependencies
cd .org.ai/templates && npm install && npm update

# Check which domains exist in registry but not as submodules
comm -23 \
  <(cat .org.ai.tsv | tail -n +2 | cut -f1 | sort) \
  <(ls -1 .org.ai/ | grep '\.org\.ai$' | sort)
```

## Next Steps

1. Read the full [README](.org.ai/README.md)
2. Review [SETUP_SUMMARY](.org.ai/SETUP_SUMMARY.md)
3. Check domain registry in `.org.ai.tsv`
4. Explore existing domains in `.org.ai/*/`
5. Create your first domain!

## Getting Help

- **Templates/Tooling Issues**: [graph.org.ai issues](https://github.com/dot-org-ai/graph.org.ai/issues)
- **Domain Issues**: Open issue in specific domain repo
- **Questions**: Use GitHub Discussions

## Resources

- [Graph.org.ai](https://github.com/dot-org-ai/graph.org.ai)
- [GitHub Organization](https://github.com/dot-org-ai)
- [Schema.org.ai](https://schema.org.ai)
- [Git Submodules Guide](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

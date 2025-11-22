#!/usr/bin/env node
/**
 * Domain Creation Script
 *
 * Creates a new .org.ai domain from templates
 *
 * Usage: npm run create-domain <domain-name>
 * Example: npm run create-domain tools.org.ai
 */

import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'

interface DomainConfig {
  domain: string
  domainName: string
  parent?: string
  description?: string
  types?: string[]
  properties?: string[]
  enums?: string[]
  sources?: string
  attribution?: string
}

const TEMPLATES_DIR = path.join(__dirname, '..')
const DOMAINS_DIR = path.join(__dirname, '../..')

async function loadTemplate(templatePath: string): Promise<string> {
  return await fs.readFile(templatePath, 'utf-8')
}

function renderTemplate(template: string, config: DomainConfig): string {
  let result = template

  // Replace simple placeholders
  result = result.replace(/\{\{domain\}\}/g, config.domain)
  result = result.replace(/\{\{domainName\}\}/g, config.domainName)
  result = result.replace(/\{\{parent\}\}/g, config.parent || 'schema.org.ai')
  result = result.replace(/\{\{description\}\}/g, config.description || '')
  result = result.replace(/\{\{sources\}\}/g, config.sources || '')
  result = result.replace(/\{\{attribution\}\}/g, config.attribution || '')

  return result
}

async function createDomain(config: DomainConfig): Promise<void> {
  const domainDir = path.join(DOMAINS_DIR, config.domain)

  console.log(`Creating domain: ${config.domain}`)

  // Create directory structure
  await fs.mkdir(domainDir, { recursive: true })
  await fs.mkdir(path.join(domainDir, 'things'), { recursive: true })
  await fs.mkdir(path.join(domainDir, 'package'), { recursive: true })
  await fs.mkdir(path.join(domainDir, 'scripts'), { recursive: true })
  await fs.mkdir(path.join(domainDir, 'site'), { recursive: true })
  await fs.mkdir(path.join(domainDir, '.github/workflows'), { recursive: true })

  // Copy and render README
  const readmeTemplate = await loadTemplate(path.join(TEMPLATES_DIR, 'domain/README.md'))
  const readme = renderTemplate(readmeTemplate, config)
  await fs.writeFile(path.join(domainDir, 'README.md'), readme)

  // Copy LICENSE
  const license = await loadTemplate(path.join(TEMPLATES_DIR, 'domain/LICENSE'))
  await fs.writeFile(path.join(domainDir, 'LICENSE'), license)

  // Create package.json
  const packageTemplate = await loadTemplate(path.join(TEMPLATES_DIR, 'npm/package.json'))
  const packageJson = renderTemplate(packageTemplate, config)
  await fs.writeFile(path.join(domainDir, 'package/package.json'), packageJson)

  // Create tsconfig.json
  const tsconfig = await loadTemplate(path.join(TEMPLATES_DIR, 'npm/tsconfig.json'))
  await fs.writeFile(path.join(domainDir, 'package/tsconfig.json'), tsconfig)

  // Create GitHub workflow
  const workflow = await loadTemplate(path.join(TEMPLATES_DIR, 'domain/.github/workflows/build.yml'))
  await fs.writeFile(path.join(domainDir, '.github/workflows/build.yml'), workflow)

  // Copy generation script
  const genScript = await loadTemplate(path.join(TEMPLATES_DIR, 'scripts/generate-content.ts'))
  const script = renderTemplate(genScript, config)
  await fs.writeFile(path.join(domainDir, 'scripts/generate-content.ts'), script)
  await fs.chmod(path.join(domainDir, 'scripts/generate-content.ts'), 0o755)

  console.log(`✓ Created domain structure at ${domainDir}`)

  // Initialize git repo
  try {
    execSync('git init', { cwd: domainDir, stdio: 'inherit' })
    execSync('git add .', { cwd: domainDir, stdio: 'inherit' })
    execSync(`git commit -m "Initial commit for ${config.domain}"`, { cwd: domainDir, stdio: 'inherit' })
    console.log(`✓ Initialized git repository`)
  } catch (error) {
    console.error('Warning: Failed to initialize git repository:', error)
  }

  console.log(`\nNext steps:`)
  console.log(`1. cd ${config.domain}`)
  console.log(`2. Create GitHub repository: gh repo create dot-org-ai/${config.domain} --public`)
  console.log(`3. Push to GitHub: git remote add origin https://github.com/dot-org-ai/${config.domain} && git push -u origin main`)
  console.log(`4. Add as submodule to graph.org.ai: cd .. && git submodule add https://github.com/dot-org-ai/${config.domain} .org.ai/${config.domain}`)
}

async function loadDomainConfig(domainName: string): Promise<DomainConfig> {
  // Try to load config from .org.ai.tsv
  const tsvPath = path.join(__dirname, '../../.org.ai.tsv')

  try {
    const tsv = await fs.readFile(tsvPath, 'utf-8')
    const lines = tsv.split('\n')
    const headers = lines[0].split('\t')

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split('\t')
      if (cols[0] === domainName) {
        return {
          domain: domainName,
          domainName: domainName.replace('.org.ai', ''),
          parent: cols[1] || undefined,
          description: cols[2] || undefined,
          types: cols[3] ? cols[3].split(',').map(s => s.trim()) : undefined,
          enums: cols[4] ? cols[4].split(',').map(s => s.trim()) : undefined,
          properties: cols[5] ? cols[5].split(',').map(s => s.trim()) : undefined,
        }
      }
    }
  } catch (error) {
    console.error('Warning: Could not load config from .org.ai.tsv')
  }

  // Return basic config
  return {
    domain: domainName,
    domainName: domainName.replace('.org.ai', ''),
  }
}

async function main() {
  const domainName = process.argv[2]

  if (!domainName) {
    console.error('Usage: create-domain <domain-name>')
    console.error('Example: create-domain tools.org.ai')
    process.exit(1)
  }

  if (!domainName.endsWith('.org.ai')) {
    console.error('Error: Domain name must end with .org.ai')
    process.exit(1)
  }

  const config = await loadDomainConfig(domainName)
  await createDomain(config)
}

main().catch(console.error)

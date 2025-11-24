#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Generate People/Agents/Organizations domain files:
 * - Agents.tsv (AI agents from Apps)
 * - People.tsv (stub with common person types)
 * - Organizations.tsv (stub with organization types)
 * - Companies.tsv (from Apps with industry category)
 * - Roles.tsv (from ONET occupations)
 *
 * Also generate relationship files:
 * - Roles.Occupations.tsv
 * - People.Roles.tsv
 * - Companies.Industries.tsv
 * - Agents.Apps.tsv
 */

function toPascalCase(text: string): string {
  const articles = new Set(['the', 'a', 'an'])
  const conjunctions = new Set(['and', 'or', 'but', 'nor', 'so', 'yet'])
  const prepositions = new Set(['in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by'])

  const tokens = text.split(/[\s\-\/,;:()]+/).filter(t => t.trim())

  const result = tokens
    .filter(t => {
      const lower = t.toLowerCase()
      return !articles.has(lower) && !conjunctions.has(lower) && !prepositions.has(lower)
    })
    .map(t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join('')

  return result || text.replace(/\s+/g, '')
}

// Load occupation aliases from Occupations.tsv for short names
function loadOccupationAliases(dataDir: string): Map<string, string> {
  const aliasMap = new Map<string, string>()
  const occupationsPath = path.join(dataDir, 'Occupations.tsv')

  if (fs.existsSync(occupationsPath)) {
    const content = fs.readFileSync(occupationsPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')
    const idIdx = headers.indexOf('id')
    const nameIdx = headers.indexOf('name')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const cols = line.split('\t')
      const id = cols[idIdx]
      const name = cols[nameIdx]

      if (id && name) {
        aliasMap.set(name, id)
      }
    }
  }

  return aliasMap
}

// Smart PascalCase that uses aliases for known occupations
function smartPascalCase(text: string, aliases: Map<string, string>): string {
  // Check for alias first
  if (aliases.has(text)) {
    return aliases.get(text)!
  }

  // For comma-separated lists, use last part after "and"
  if (text.includes(',')) {
    const parts = text.split(',').map(p => p.trim())
    const lastPart = parts[parts.length - 1]

    if (lastPart.toLowerCase().includes(' and ')) {
      const andParts = lastPart.split(/\s+and\s+/i)
      const mainTerm = andParts[andParts.length - 1].trim()
      return toPascalCase(mainTerm)
    }

    return toPascalCase(lastPart)
  }

  return toPascalCase(text)
}

function extractRoleLevel(title: string): string {
  const lower = title.toLowerCase()
  if (lower.includes('chief') || lower.includes('executive') || lower.includes('president')) {
    return 'Executive'
  } else if (lower.includes('director') || lower.includes('vp') || lower.includes('vice president')) {
    return 'Director'
  } else if (lower.includes('manager') || lower.includes('supervisor') || lower.includes('lead')) {
    return 'Manager'
  } else if (lower.includes('senior') || lower.includes('sr.')) {
    return 'Senior'
  } else if (lower.includes('junior') || lower.includes('jr.') || lower.includes('associate')) {
    return 'Junior'
  } else if (lower.includes('intern') || lower.includes('trainee')) {
    return 'Entry'
  }
  return 'Professional'
}

async function generateRoles() {
  console.log('\n👔 Generating Roles.tsv from ONET Occupations...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Load occupation aliases
  const aliases = loadOccupationAliases(dataDir)
  console.log(`  Loaded ${aliases.size} occupation aliases`)

  // Read ONET.Occupation.tsv
  const onetOccPath = path.join(dataDir, 'ONET.Occupation.tsv')
  const content = fs.readFileSync(onetOccPath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split('\t')

  const idIdx = headers.indexOf('id')
  const nameIdx = headers.indexOf('name')
  const descIdx = headers.indexOf('description')
  const codeIdx = headers.indexOf('code')

  const roles: Array<{
    id: string
    name: string
    description: string
    level: string
  }> = []

  const rolesOccupations: Array<{
    roleId: string
    occupationId: string
  }> = []

  const seen = new Set<string>()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const id = cols[idIdx]
    const name = cols[nameIdx]
    const description = cols[descIdx] || ''
    const code = cols[codeIdx] || ''

    if (!name || !id) continue

    const roleId = smartPascalCase(name, aliases)
    const level = extractRoleLevel(name)

    if (!seen.has(roleId)) {
      seen.add(roleId)
      roles.push({
        id: roleId,
        name: name,
        description: description,
        level: level
      })
    }

    // Create relationship
    rolesOccupations.push({
      roleId: roleId,
      occupationId: id
    })
  }

  // Sort by id
  roles.sort((a, b) => a.id.localeCompare(b.id))

  // Write Roles.tsv
  const rolesPath = path.join(dataDir, 'Roles.tsv')
  const rolesHeaders = ['id', 'name', 'description', 'level']
  const rolesRows = roles.map(r =>
    `${r.id}\t${r.name}\t${r.description}\t${r.level}`
  )

  fs.writeFileSync(rolesPath, rolesHeaders.join('\t') + '\n' + rolesRows.join('\n'))
  console.log(`  ✓ Roles.tsv (${roles.length} roles from ${lines.length - 1} occupations)`)

  // Write Roles.Occupations.tsv
  rolesOccupations.sort((a, b) => {
    const cmp = a.roleId.localeCompare(b.roleId)
    return cmp !== 0 ? cmp : a.occupationId.localeCompare(b.occupationId)
  })

  const rolesOccPath = path.join(dataDir, 'Roles.Occupations.tsv')
  const rolesOccHeaders = ['roleId', 'occupationId']
  const rolesOccRows = rolesOccupations.map(ro =>
    `${ro.roleId}\t${ro.occupationId}`
  )

  fs.writeFileSync(rolesOccPath, rolesOccHeaders.join('\t') + '\n' + rolesOccRows.join('\n'))
  console.log(`  ✓ Roles.Occupations.tsv (${rolesOccupations.length} relationships)`)
}

async function generateAgents() {
  console.log('\n🤖 Generating Agents.tsv from Apps (AI/Automation tools)...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Read Apps.tsv
  const appsPath = path.join(dataDir, 'Apps.tsv')
  const content = fs.readFileSync(appsPath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split('\t')

  const idIdx = headers.indexOf('id')
  const nameIdx = headers.indexOf('name')
  const descIdx = headers.indexOf('description')
  const categoryIdx = headers.indexOf('category')

  const agents: Array<{
    id: string
    name: string
    description: string
    type: string
  }> = []

  const agentsApps: Array<{
    agentId: string
    appId: string
  }> = []

  // Filter for AI/automation categories
  const aiCategories = new Set([
    'AI Tools',
    'Automation',
    'AI',
    'Machine Learning',
    'Artificial Intelligence',
    'Bot',
    'Assistant',
    'Analytics',
    'Data Science'
  ])

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const id = cols[idIdx]
    const name = cols[nameIdx]
    const description = cols[descIdx] || ''
    const category = cols[categoryIdx] || ''

    if (!name || !id) continue

    // Check if it's an AI/automation tool by category or name
    const isAgent = aiCategories.has(category) ||
      name.toLowerCase().includes('ai') ||
      name.toLowerCase().includes('bot') ||
      name.toLowerCase().includes('automation') ||
      name.toLowerCase().includes('assistant') ||
      description.toLowerCase().includes('automate') ||
      description.toLowerCase().includes('artificial intelligence')

    if (isAgent) {
      agents.push({
        id: id,
        name: name,
        description: description,
        type: category || 'AI Tool'
      })

      agentsApps.push({
        agentId: id,
        appId: id
      })
    }
  }

  // Sort by id
  agents.sort((a, b) => a.id.localeCompare(b.id))

  // Write Agents.tsv
  const agentsPath = path.join(dataDir, 'Agents.tsv')
  const agentsHeaders = ['id', 'name', 'description', 'type']
  const agentsRows = agents.map(a =>
    `${a.id}\t${a.name}\t${a.description}\t${a.type}`
  )

  fs.writeFileSync(agentsPath, agentsHeaders.join('\t') + '\n' + agentsRows.join('\n'))
  console.log(`  ✓ Agents.tsv (${agents.length} AI agents from ${lines.length - 1} apps)`)

  // Write Agents.Apps.tsv
  agentsApps.sort((a, b) => a.agentId.localeCompare(b.agentId))

  const agentsAppsPath = path.join(dataDir, 'Agents.Apps.tsv')
  const agentsAppsHeaders = ['agentId', 'appId']
  const agentsAppsRows = agentsApps.map(aa =>
    `${aa.agentId}\t${aa.appId}`
  )

  fs.writeFileSync(agentsAppsPath, agentsAppsHeaders.join('\t') + '\n' + agentsAppsRows.join('\n'))
  console.log(`  ✓ Agents.Apps.tsv (${agentsApps.length} relationships)`)
}

async function generateCompanies() {
  console.log('\n🏢 Generating Companies.tsv from Apps...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Read Apps.tsv
  const appsPath = path.join(dataDir, 'Apps.tsv')
  const content = fs.readFileSync(appsPath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split('\t')

  const idIdx = headers.indexOf('id')
  const nameIdx = headers.indexOf('name')
  const descIdx = headers.indexOf('description')
  const categoryIdx = headers.indexOf('category')

  const companies: Array<{
    id: string
    name: string
    description: string
    industry: string
  }> = []

  const companiesIndustries: Array<{
    companyId: string
    industryId: string
  }> = []

  // Mapping of app categories to NAICS industry codes
  const categoryToIndustry: { [key: string]: string } = {
    'CRM': '51121',  // Software Publishers
    'Marketing': '54181',  // Advertising Agencies
    'Sales': '51121',
    'Communication': '51791',  // Other Telecommunications
    'Project Management': '51121',
    'Productivity': '51121',
    'Analytics': '51121',
    'Finance': '52232',  // Financial Transactions Processing
    'Accounting': '54121',  // Accounting Services
    'HR': '54161',  // Management Consulting Services
    'E-commerce': '45411',  // Electronic Shopping
    'Payment Processing': '52232',
    'Developer Tools': '51121',
    'IT Operations': '51121',
    'Customer Support': '51121',
    'Forms & Surveys': '51121',
    'Documents': '51121',
    'File Management': '51121',
    'Video & Audio': '51219',  // Other Information Services
    'Social Media': '51913',  // Internet Publishing
    'Email': '51121',
    'Scheduling': '51121'
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const id = cols[idIdx]
    const name = cols[nameIdx]
    const description = cols[descIdx] || ''
    const category = cols[categoryIdx] || ''

    if (!name || !id) continue

    const industryCode = categoryToIndustry[category] || '51121'  // Default to Software Publishers

    companies.push({
      id: id,
      name: name,
      description: description,
      industry: category
    })

    companiesIndustries.push({
      companyId: id,
      industryId: industryCode
    })
  }

  // Sort by id
  companies.sort((a, b) => a.id.localeCompare(b.id))

  // Write Companies.tsv
  const companiesPath = path.join(dataDir, 'Companies.tsv')
  const companiesHeaders = ['id', 'name', 'description', 'industry']
  const companiesRows = companies.map(c =>
    `${c.id}\t${c.name}\t${c.description}\t${c.industry}`
  )

  fs.writeFileSync(companiesPath, companiesHeaders.join('\t') + '\n' + companiesRows.join('\n'))
  console.log(`  ✓ Companies.tsv (${companies.length} companies from apps)`)

  // Write Companies.Industries.tsv
  companiesIndustries.sort((a, b) => {
    const cmp = a.companyId.localeCompare(b.companyId)
    return cmp !== 0 ? cmp : a.industryId.localeCompare(b.industryId)
  })

  const companiesIndPath = path.join(dataDir, 'Companies.Industries.tsv')
  const companiesIndHeaders = ['companyId', 'industryId']
  const companiesIndRows = companiesIndustries.map(ci =>
    `${ci.companyId}\t${ci.industryId}`
  )

  fs.writeFileSync(companiesIndPath, companiesIndHeaders.join('\t') + '\n' + companiesIndRows.join('\n'))
  console.log(`  ✓ Companies.Industries.tsv (${companiesIndustries.length} relationships)`)
}

async function generatePeople() {
  console.log('\n👥 Generating People.tsv (stub with common person types)...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Create stub with common person types
  const people: Array<{
    id: string
    name: string
    description: string
    type: string
  }> = [
    {
      id: 'Employee',
      name: 'Employee',
      description: 'A person employed by an organization',
      type: 'Worker'
    },
    {
      id: 'Manager',
      name: 'Manager',
      description: 'A person responsible for managing employees or resources',
      type: 'Leadership'
    },
    {
      id: 'Executive',
      name: 'Executive',
      description: 'A senior-level person in an organization',
      type: 'Leadership'
    },
    {
      id: 'Contractor',
      name: 'Contractor',
      description: 'An independent professional hired for specific work',
      type: 'Worker'
    },
    {
      id: 'Freelancer',
      name: 'Freelancer',
      description: 'A self-employed professional working on multiple projects',
      type: 'Worker'
    },
    {
      id: 'Consultant',
      name: 'Consultant',
      description: 'An expert providing professional advice',
      type: 'Professional'
    },
    {
      id: 'Customer',
      name: 'Customer',
      description: 'A person who purchases goods or services',
      type: 'Stakeholder'
    },
    {
      id: 'Supplier',
      name: 'Supplier',
      description: 'A person or organization that provides goods or services',
      type: 'Stakeholder'
    },
    {
      id: 'Partner',
      name: 'Partner',
      description: 'A person or organization in a business partnership',
      type: 'Stakeholder'
    },
    {
      id: 'Investor',
      name: 'Investor',
      description: 'A person who provides capital for business ventures',
      type: 'Stakeholder'
    },
    {
      id: 'Founder',
      name: 'Founder',
      description: 'A person who establishes an organization',
      type: 'Leadership'
    },
    {
      id: 'Director',
      name: 'Director',
      description: 'A person who manages a department or division',
      type: 'Leadership'
    },
    {
      id: 'Specialist',
      name: 'Specialist',
      description: 'A person with deep expertise in a specific area',
      type: 'Professional'
    },
    {
      id: 'Analyst',
      name: 'Analyst',
      description: 'A person who analyzes data and information',
      type: 'Professional'
    },
    {
      id: 'Administrator',
      name: 'Administrator',
      description: 'A person who manages administrative functions',
      type: 'Worker'
    }
  ]

  // Create People.Roles relationships
  const peopleRoles: Array<{
    personId: string
    roleId: string
  }> = []

  // Read Roles.tsv to create relationships for ALL roles
  const rolesPath = path.join(dataDir, 'Roles.tsv')
  if (fs.existsSync(rolesPath)) {
    const rolesContent = fs.readFileSync(rolesPath, 'utf-8')
    const rolesLines = rolesContent.split('\n')
    const rolesHeaders = rolesLines[0].split('\t')
    const roleIdIdx = rolesHeaders.indexOf('id')
    const roleLevelIdx = rolesHeaders.indexOf('level')

    // Map ALL roles based on their level
    for (let i = 1; i < rolesLines.length; i++) {
      const line = rolesLines[i]
      if (!line.trim()) continue

      const cols = line.split('\t')
      const roleId = cols[roleIdIdx]
      const level = cols[roleLevelIdx]

      if (!roleId) continue

      // Map levels to person types
      if (level === 'Executive') {
        peopleRoles.push({ personId: 'Executive', roleId })
      } else if (level === 'Director') {
        peopleRoles.push({ personId: 'Director', roleId })
      } else if (level === 'Manager') {
        peopleRoles.push({ personId: 'Manager', roleId })
      } else if (level === 'Senior') {
        peopleRoles.push({ personId: 'Specialist', roleId })
      } else if (level === 'Junior' || level === 'Entry') {
        peopleRoles.push({ personId: 'Employee', roleId })
      } else {
        peopleRoles.push({ personId: 'Employee', roleId })
      }
    }
  }

  // Write People.tsv
  const peoplePath = path.join(dataDir, 'People.tsv')
  const peopleHeaders = ['id', 'name', 'description', 'type']
  const peopleRows = people.map(p =>
    `${p.id}\t${p.name}\t${p.description}\t${p.type}`
  )

  fs.writeFileSync(peoplePath, peopleHeaders.join('\t') + '\n' + peopleRows.join('\n'))
  console.log(`  ✓ People.tsv (${people.length} person types - stub)`)

  // Write People.Roles.tsv
  if (peopleRoles.length > 0) {
    peopleRoles.sort((a, b) => {
      const cmp = a.personId.localeCompare(b.personId)
      return cmp !== 0 ? cmp : a.roleId.localeCompare(b.roleId)
    })

    const peopleRolesPath = path.join(dataDir, 'People.Roles.tsv')
    const peopleRolesHeaders = ['personId', 'roleId']
    const peopleRolesRows = peopleRoles.map(pr =>
      `${pr.personId}\t${pr.roleId}`
    )

    fs.writeFileSync(peopleRolesPath, peopleRolesHeaders.join('\t') + '\n' + peopleRolesRows.join('\n'))
    console.log(`  ✓ People.Roles.tsv (${peopleRoles.length} relationships)`)
  }
}

async function generateOrganizations() {
  console.log('\n🏛️ Generating Organizations.tsv (stub with organization types)...')

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  // Create stub with common organization types
  const organizations: Array<{
    id: string
    name: string
    description: string
    type: string
  }> = [
    {
      id: 'Corporation',
      name: 'Corporation',
      description: 'A legal entity that is separate from its owners',
      type: 'Business'
    },
    {
      id: 'LLC',
      name: 'Limited Liability Company',
      description: 'A business structure that combines partnership and corporate features',
      type: 'Business'
    },
    {
      id: 'Partnership',
      name: 'Partnership',
      description: 'A business owned by two or more people',
      type: 'Business'
    },
    {
      id: 'SoleProprietorship',
      name: 'Sole Proprietorship',
      description: 'A business owned by one person',
      type: 'Business'
    },
    {
      id: 'Nonprofit',
      name: 'Nonprofit Organization',
      description: 'An organization that operates for purposes other than profit',
      type: 'Nonprofit'
    },
    {
      id: 'Government',
      name: 'Government Agency',
      description: 'A permanent or semi-permanent organization in government',
      type: 'Government'
    },
    {
      id: 'NGO',
      name: 'Non-Governmental Organization',
      description: 'A non-profit organization independent of government',
      type: 'Nonprofit'
    },
    {
      id: 'Cooperative',
      name: 'Cooperative',
      description: 'An organization owned and operated by its members',
      type: 'Business'
    },
    {
      id: 'Foundation',
      name: 'Foundation',
      description: 'An organization established to provide funding',
      type: 'Nonprofit'
    },
    {
      id: 'Trust',
      name: 'Trust',
      description: 'A legal entity that holds property for beneficiaries',
      type: 'Business'
    },
    {
      id: 'PublicCompany',
      name: 'Public Company',
      description: 'A corporation whose shares are traded publicly',
      type: 'Business'
    },
    {
      id: 'PrivateCompany',
      name: 'Private Company',
      description: 'A corporation whose shares are not publicly traded',
      type: 'Business'
    },
    {
      id: 'Startup',
      name: 'Startup',
      description: 'A newly established company in early growth stages',
      type: 'Business'
    },
    {
      id: 'Enterprise',
      name: 'Enterprise',
      description: 'A large-scale organization or business',
      type: 'Business'
    },
    {
      id: 'SmallBusiness',
      name: 'Small Business',
      description: 'A privately owned corporation, partnership, or sole proprietorship',
      type: 'Business'
    }
  ]

  // Write Organizations.tsv
  const orgsPath = path.join(dataDir, 'Organizations.tsv')
  const orgsHeaders = ['id', 'name', 'description', 'type']
  const orgsRows = organizations.map(o =>
    `${o.id}\t${o.name}\t${o.description}\t${o.type}`
  )

  fs.writeFileSync(orgsPath, orgsHeaders.join('\t') + '\n' + orgsRows.join('\n'))
  console.log(`  ✓ Organizations.tsv (${organizations.length} organization types - stub)`)
}

async function main() {
  console.log('='.repeat(100))
  console.log('PEOPLE / AGENTS / ORGANIZATIONS GENERATION')
  console.log('='.repeat(100))

  await generateRoles()
  await generateAgents()
  await generateCompanies()
  await generatePeople()
  await generateOrganizations()

  console.log('\n' + '='.repeat(100))
  console.log('✅ People, Agents, and Organizations files generated!')
  console.log('='.repeat(100))
  console.log('\nGenerated Files:')
  console.log('  - Roles.tsv (from ONET Occupations)')
  console.log('  - Agents.tsv (AI tools from Apps)')
  console.log('  - Companies.tsv (from Apps)')
  console.log('  - People.tsv (stub with 15 person types)')
  console.log('  - Organizations.tsv (stub with 15 organization types)')
  console.log('\nGenerated Relationships:')
  console.log('  - Roles.Occupations.tsv')
  console.log('  - Agents.Apps.tsv')
  console.log('  - Companies.Industries.tsv')
  console.log('  - People.Roles.tsv')
  console.log('='.repeat(100))
}

main().catch(console.error)

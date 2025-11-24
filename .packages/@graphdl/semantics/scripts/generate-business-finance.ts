#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'

/**
 * Generate Business/Finance domain files:
 * - Jobs.tsv (job types with levels)
 * - Startups.tsv (startup stages and types)
 * - Finance.tsv (financial concepts and instruments)
 * - VC.tsv (venture capital stages and focuses)
 * - Offers.tsv (offers and deals)
 * - Payments.tsv (payment methods and processors)
 *
 * Plus relationship files linking to existing domains
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

async function generateJobs(dataDir: string) {
  console.log('\n💼 Generating Jobs.tsv...')

  // Load occupation aliases
  const aliases = loadOccupationAliases(dataDir)
  console.log(`  Loaded ${aliases.size} occupation aliases`)

  // Read ONET occupations
  const onetPath = path.join(dataDir, 'ONET.Occupation.tsv')
  const content = fs.readFileSync(onetPath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split('\t')

  const idIdx = headers.indexOf('id')
  const nameIdx = headers.indexOf('name')
  const descIdx = headers.indexOf('description')
  const codeIdx = headers.indexOf('code')

  const jobs: Array<{
    id: string
    name: string
    description: string
    occupation: string
    level: string
  }> = []

  const jobsRelationships: Array<{
    jobId: string
    occupationId: string
  }> = []

  // Job levels to expand
  const levels = [
    { suffix: '', level: 'Mid', description: '' },
    { suffix: 'Junior', level: 'Junior', description: 'Entry-level' },
    { suffix: 'Senior', level: 'Senior', description: 'Senior-level' },
    { suffix: 'Lead', level: 'Lead', description: 'Lead' },
    { suffix: 'Principal', level: 'Principal', description: 'Principal' },
    { suffix: 'Staff', level: 'Staff', description: 'Staff-level' }
  ]

  // Job contexts
  const contexts = [
    { suffix: '', context: '', description: '' },
    { suffix: 'Remote', context: 'Remote', description: 'Remote work' },
    { suffix: 'Hybrid', context: 'Hybrid', description: 'Hybrid work' },
    { suffix: 'Onsite', context: 'On-site', description: 'On-site work' }
  ]

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const occupationId = cols[idIdx]
    const occupationName = cols[nameIdx]
    const description = cols[descIdx] || ''
    const code = cols[codeIdx] || ''

    if (!occupationName) continue

    // Create base job using smart pascal case with aliases
    const baseId = smartPascalCase(occupationName, aliases)

    // Add level variations for professional roles
    if (code.startsWith('11-') || // Management
        code.startsWith('13-') || // Business/Financial
        code.startsWith('15-') || // Computer/IT
        code.startsWith('17-') || // Engineering
        code.startsWith('19-') || // Life/Physical/Social Science
        code.startsWith('27-')) { // Arts/Media

      for (const level of levels) {
        const jobId = level.suffix ? `${level.suffix}${baseId}` : baseId
        const jobName = level.suffix ? `${level.suffix} ${occupationName}` : occupationName
        const jobDesc = level.description ? `${level.description} ${occupationName}` : description

        jobs.push({
          id: jobId,
          name: jobName,
          description: jobDesc,
          occupation: occupationId,
          level: level.level
        })

        jobsRelationships.push({
          jobId,
          occupationId
        })
      }
    } else {
      // For other roles, just add base
      jobs.push({
        id: baseId,
        name: occupationName,
        description: description,
        occupation: occupationId,
        level: 'Mid'
      })

      jobsRelationships.push({
        jobId: baseId,
        occupationId
      })
    }
  }

  // Sort by id
  jobs.sort((a, b) => a.id.localeCompare(b.id))
  jobsRelationships.sort((a, b) => a.jobId.localeCompare(b.jobId))

  // Write Jobs.tsv
  const jobsPath = path.join(dataDir, 'Jobs.tsv')
  const jobsHeaders = ['id', 'name', 'description', 'occupation', 'level']
  const jobsRows = jobs.map(j =>
    `${j.id}\t${j.name}\t${j.description}\t${j.occupation}\t${j.level}`
  )

  fs.writeFileSync(jobsPath, jobsHeaders.join('\t') + '\n' + jobsRows.join('\n'))
  console.log(`  ✓ Jobs.tsv (${jobs.length} jobs from ${lines.length - 1} occupations)`)

  // Write Jobs.Occupations.tsv
  const jobsOccupationsPath = path.join(dataDir, 'Jobs.Occupations.tsv')
  const jobsOccupationsHeaders = ['jobId', 'occupationId']
  const jobsOccupationsRows = jobsRelationships.map(r =>
    `${r.jobId}\t${r.occupationId}`
  )

  fs.writeFileSync(jobsOccupationsPath, jobsOccupationsHeaders.join('\t') + '\n' + jobsOccupationsRows.join('\n'))
  console.log(`  ✓ Jobs.Occupations.tsv (${jobsRelationships.length} relationships)`)
}

async function generateStartups(dataDir: string) {
  console.log('\n🚀 Generating Startups.tsv...')

  // Read NAICS industries
  const naicsPath = path.join(dataDir, 'NAICS.Industry.tsv')
  const content = fs.readFileSync(naicsPath, 'utf-8')
  const lines = content.split('\n')
  const headers = lines[0].split('\t')

  const idIdx = headers.indexOf('id')
  const nameIdx = headers.indexOf('name')
  const descIdx = headers.indexOf('description')
  const codeIdx = headers.indexOf('code')

  const startups: Array<{
    id: string
    name: string
    description: string
    industry: string
    stage: string
  }> = []

  const startupsRelationships: Array<{
    startupId: string
    industryId: string
  }> = []

  // Startup stages
  const stages = [
    { name: 'Idea', description: 'Idea stage' },
    { name: 'PreSeed', description: 'Pre-seed stage' },
    { name: 'Seed', description: 'Seed stage' },
    { name: 'SeriesA', description: 'Series A stage' },
    { name: 'SeriesB', description: 'Series B stage' },
    { name: 'SeriesC', description: 'Series C+ stage' },
    { name: 'GrowthStage', description: 'Growth stage' },
    { name: 'Scaleup', description: 'Scale-up stage' }
  ]

  // Focus on top-level and second-level industries (codes 2-3 digits)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const cols = line.split('\t')
    const industryId = cols[idIdx]
    const industryName = cols[nameIdx]
    const description = cols[descIdx] || ''
    const code = cols[codeIdx] || ''

    if (!industryName || code.length > 4) continue // Skip detailed codes

    // Clean up name
    const cleanName = industryName.replace(/T$/, '').trim()

    for (const stage of stages) {
      const startupId = `${stage.name}${toPascalCase(cleanName)}Startup`
      const startupName = `${stage.name} ${cleanName} Startup`
      const startupDesc = `${stage.description} startup in ${cleanName.toLowerCase()}`

      startups.push({
        id: startupId,
        name: startupName,
        description: startupDesc,
        industry: industryId,
        stage: stage.name
      })

      startupsRelationships.push({
        startupId,
        industryId
      })
    }
  }

  // Sort
  startups.sort((a, b) => a.id.localeCompare(b.id))
  startupsRelationships.sort((a, b) => a.startupId.localeCompare(b.startupId))

  // Write Startups.tsv
  const startupsPath = path.join(dataDir, 'Startups.tsv')
  const startupsHeaders = ['id', 'name', 'description', 'industry', 'stage']
  const startupsRows = startups.map(s =>
    `${s.id}\t${s.name}\t${s.description}\t${s.industry}\t${s.stage}`
  )

  fs.writeFileSync(startupsPath, startupsHeaders.join('\t') + '\n' + startupsRows.join('\n'))
  console.log(`  ✓ Startups.tsv (${startups.length} startup types)`)

  // Write Startups.Industries.tsv
  const startupsIndustriesPath = path.join(dataDir, 'Startups.Industries.tsv')
  const startupsIndustriesHeaders = ['startupId', 'industryId']
  const startupsIndustriesRows = startupsRelationships.map(r =>
    `${r.startupId}\t${r.industryId}`
  )

  fs.writeFileSync(startupsIndustriesPath, startupsIndustriesHeaders.join('\t') + '\n' + startupsIndustriesRows.join('\n'))
  console.log(`  ✓ Startups.Industries.tsv (${startupsRelationships.length} relationships)`)
}

async function generateFinance(dataDir: string) {
  console.log('\n💰 Generating Finance.tsv...')

  const finance: Array<{
    id: string
    name: string
    description: string
    category: string
    type: string
  }> = []

  const financeServices: Array<{
    financeId: string
    serviceId: string
  }> = []

  // Financial concepts and instruments
  const concepts = [
    // Banking
    { name: 'Savings Account', category: 'Banking', type: 'Account', description: 'A deposit account held at a financial institution' },
    { name: 'Checking Account', category: 'Banking', type: 'Account', description: 'A transactional deposit account held at a financial institution' },
    { name: 'Certificate of Deposit', category: 'Banking', type: 'Account', description: 'A time deposit with a fixed term and interest rate' },
    { name: 'Money Market Account', category: 'Banking', type: 'Account', description: 'An interest-bearing account with check-writing privileges' },

    // Investments
    { name: 'Stock', category: 'Investment', type: 'Security', description: 'An equity security representing ownership in a corporation' },
    { name: 'Bond', category: 'Investment', type: 'Security', description: 'A fixed-income instrument representing a loan' },
    { name: 'Mutual Fund', category: 'Investment', type: 'Fund', description: 'An investment vehicle pooling money from multiple investors' },
    { name: 'ETF', category: 'Investment', type: 'Fund', description: 'Exchange-traded fund that tracks an index or basket of assets' },
    { name: 'Index Fund', category: 'Investment', type: 'Fund', description: 'A mutual fund or ETF designed to track a market index' },
    { name: 'Hedge Fund', category: 'Investment', type: 'Fund', description: 'A pooled investment fund using advanced strategies' },
    { name: 'Private Equity', category: 'Investment', type: 'Fund', description: 'Investment in private companies not listed on public exchanges' },
    { name: 'Real Estate Investment Trust', category: 'Investment', type: 'Security', description: 'A company that owns income-producing real estate' },
    { name: 'Commodity', category: 'Investment', type: 'Asset', description: 'A basic good used in commerce that is interchangeable' },
    { name: 'Cryptocurrency', category: 'Investment', type: 'Digital Asset', description: 'A digital or virtual currency using cryptography' },

    // Credit
    { name: 'Credit Card', category: 'Credit', type: 'Revolving Credit', description: 'A payment card issued to users for payment of goods and services' },
    { name: 'Debit Card', category: 'Banking', type: 'Payment Card', description: 'A payment card that deducts money directly from a bank account' },
    { name: 'Personal Loan', category: 'Credit', type: 'Loan', description: 'An unsecured loan for personal use' },
    { name: 'Mortgage', category: 'Credit', type: 'Secured Loan', description: 'A loan secured by real property' },
    { name: 'Auto Loan', category: 'Credit', type: 'Secured Loan', description: 'A loan to purchase a vehicle' },
    { name: 'Student Loan', category: 'Credit', type: 'Loan', description: 'A loan to pay for educational expenses' },
    { name: 'Business Loan', category: 'Credit', type: 'Loan', description: 'A loan for business purposes' },
    { name: 'Line of Credit', category: 'Credit', type: 'Revolving Credit', description: 'A flexible loan from a financial institution' },

    // Insurance
    { name: 'Life Insurance', category: 'Insurance', type: 'Insurance Policy', description: 'Insurance paying a sum on the death of the insured' },
    { name: 'Health Insurance', category: 'Insurance', type: 'Insurance Policy', description: 'Insurance covering medical expenses' },
    { name: 'Auto Insurance', category: 'Insurance', type: 'Insurance Policy', description: 'Insurance for vehicles against loss or damage' },
    { name: 'Home Insurance', category: 'Insurance', type: 'Insurance Policy', description: 'Insurance for private homes' },
    { name: 'Disability Insurance', category: 'Insurance', type: 'Insurance Policy', description: 'Insurance providing income if unable to work' },

    // Derivatives
    { name: 'Option', category: 'Derivative', type: 'Contract', description: 'A contract giving the right to buy or sell at a specific price' },
    { name: 'Future', category: 'Derivative', type: 'Contract', description: 'A standardized contract to buy or sell at a predetermined price' },
    { name: 'Swap', category: 'Derivative', type: 'Contract', description: 'A derivative contract to exchange cash flows' },

    // Services
    { name: 'Financial Planning', category: 'Service', type: 'Advisory', description: 'Professional guidance on financial matters' },
    { name: 'Wealth Management', category: 'Service', type: 'Advisory', description: 'Investment advisory and financial planning services' },
    { name: 'Tax Planning', category: 'Service', type: 'Advisory', description: 'Analysis and planning to minimize tax liability' },
    { name: 'Estate Planning', category: 'Service', type: 'Advisory', description: 'Planning for the disposal of an estate' },
    { name: 'Retirement Planning', category: 'Service', type: 'Advisory', description: 'Planning for financial security in retirement' },
    { name: 'Investment Management', category: 'Service', type: 'Advisory', description: 'Professional management of securities and assets' },

    // Accounts
    { name: 'IRA', category: 'Retirement', type: 'Account', description: 'Individual Retirement Account with tax advantages' },
    { name: '401k', category: 'Retirement', type: 'Account', description: 'Employer-sponsored retirement savings plan' },
    { name: 'Roth IRA', category: 'Retirement', type: 'Account', description: 'Individual retirement account with tax-free withdrawals' },
    { name: 'HSA', category: 'Healthcare', type: 'Account', description: 'Health Savings Account with tax advantages' },
    { name: 'FSA', category: 'Healthcare', type: 'Account', description: 'Flexible Spending Account for healthcare expenses' }
  ]

  for (const concept of concepts) {
    const id = toPascalCase(concept.name)
    finance.push({
      id,
      name: concept.name,
      description: concept.description,
      category: concept.category,
      type: concept.type
    })
  }

  // Sort
  finance.sort((a, b) => a.id.localeCompare(b.id))

  // Write Finance.tsv
  const financePath = path.join(dataDir, 'Finance.tsv')
  const financeHeaders = ['id', 'name', 'description', 'category', 'type']
  const financeRows = finance.map(f =>
    `${f.id}\t${f.name}\t${f.description}\t${f.category}\t${f.type}`
  )

  fs.writeFileSync(financePath, financeHeaders.join('\t') + '\n' + financeRows.join('\n'))
  console.log(`  ✓ Finance.tsv (${finance.length} financial concepts)`)

  // Create Finance.Services.tsv (empty for now, to be populated by linking financial services)
  const financeServicesPath = path.join(dataDir, 'Finance.Services.tsv')
  const financeServicesHeaders = ['financeId', 'serviceId']
  fs.writeFileSync(financeServicesPath, financeServicesHeaders.join('\t') + '\n')
  console.log(`  ✓ Finance.Services.tsv (placeholder for relationships)`)
}

async function generateVC(dataDir: string) {
  console.log('\n💼 Generating VC.tsv...')

  const vc: Array<{
    id: string
    name: string
    description: string
    stage: string
    focus: string
  }> = []

  const vcStartups: Array<{
    vcId: string
    startupId: string
  }> = []

  // VC concepts
  const stages = [
    { name: 'Pre-Seed', description: 'Pre-seed funding for very early stage startups' },
    { name: 'Seed', description: 'Seed funding for early-stage startups' },
    { name: 'Series A', description: 'Series A funding for startups with traction' },
    { name: 'Series B', description: 'Series B funding for scaling companies' },
    { name: 'Series C', description: 'Series C and later stage funding' },
    { name: 'Growth', description: 'Growth equity for established companies' },
    { name: 'Late Stage', description: 'Late-stage venture capital' }
  ]

  const focuses = [
    'Technology',
    'Healthcare',
    'Fintech',
    'SaaS',
    'Consumer',
    'Enterprise',
    'DeepTech',
    'Biotech',
    'CleanTech',
    'EdTech',
    'Agtech',
    'PropTech',
    'Mobility',
    'Cybersecurity',
    'AI/ML',
    'Blockchain',
    'eCommerce',
    'Marketplace',
    'Infrastructure',
    'DevTools'
  ]

  // Create VC stage entries
  for (const stage of stages) {
    const stageId = toPascalCase(stage.name)
    vc.push({
      id: stageId,
      name: stage.name,
      description: stage.description,
      stage: stage.name,
      focus: 'General'
    })
  }

  // Create VC focus + stage combinations
  for (const focus of focuses) {
    for (const stage of stages) {
      const id = `${toPascalCase(stage.name)}${toPascalCase(focus)}VC`
      const name = `${stage.name} ${focus} VC`
      const description = `${stage.description} focused on ${focus.toLowerCase()}`

      vc.push({
        id,
        name,
        description,
        stage: stage.name,
        focus
      })
    }
  }

  // Sort
  vc.sort((a, b) => a.id.localeCompare(b.id))

  // Write VC.tsv
  const vcPath = path.join(dataDir, 'VC.tsv')
  const vcHeaders = ['id', 'name', 'description', 'stage', 'focus']
  const vcRows = vc.map(v =>
    `${v.id}\t${v.name}\t${v.description}\t${v.stage}\t${v.focus}`
  )

  fs.writeFileSync(vcPath, vcHeaders.join('\t') + '\n' + vcRows.join('\n'))
  console.log(`  ✓ VC.tsv (${vc.length} VC types)`)

  // Create VC.Startups.tsv (placeholder)
  const vcStartupsPath = path.join(dataDir, 'VC.Startups.tsv')
  const vcStartupsHeaders = ['vcId', 'startupId']
  fs.writeFileSync(vcStartupsPath, vcStartupsHeaders.join('\t') + '\n')
  console.log(`  ✓ VC.Startups.tsv (placeholder for relationships)`)
}

async function generateOffers(dataDir: string) {
  console.log('\n🎁 Generating Offers.tsv...')

  const offers: Array<{
    id: string
    name: string
    description: string
    type: string
    category: string
  }> = []

  const offersProducts: Array<{
    offerId: string
    productId: string
  }> = []

  // Offer types
  const offerTypes = [
    // Discounts
    { name: 'Percentage Discount', type: 'Discount', category: 'Promotion', description: 'A percentage off the regular price' },
    { name: 'Fixed Amount Discount', type: 'Discount', category: 'Promotion', description: 'A fixed dollar amount off' },
    { name: 'Buy One Get One', type: 'Discount', category: 'Promotion', description: 'Purchase one item and receive another free or discounted' },
    { name: 'Volume Discount', type: 'Discount', category: 'Promotion', description: 'Discount based on quantity purchased' },
    { name: 'Bundle Discount', type: 'Discount', category: 'Promotion', description: 'Discount when purchasing multiple items together' },

    // Trials
    { name: 'Free Trial', type: 'Trial', category: 'Acquisition', description: 'Limited time free access to a product or service' },
    { name: 'Freemium', type: 'Trial', category: 'Acquisition', description: 'Free basic version with paid premium features' },
    { name: 'Money Back Guarantee', type: 'Guarantee', category: 'Assurance', description: 'Refund if not satisfied within a period' },

    // Subscriptions
    { name: 'Monthly Subscription', type: 'Subscription', category: 'Recurring', description: 'Monthly recurring payment for access' },
    { name: 'Annual Subscription', type: 'Subscription', category: 'Recurring', description: 'Annual recurring payment for access' },
    { name: 'Subscription Discount', type: 'Subscription', category: 'Promotion', description: 'Discounted subscription for a period' },

    // Loyalty
    { name: 'Loyalty Points', type: 'Loyalty', category: 'Retention', description: 'Points earned for purchases or actions' },
    { name: 'Referral Bonus', type: 'Referral', category: 'Acquisition', description: 'Reward for referring new customers' },
    { name: 'VIP Access', type: 'Loyalty', category: 'Retention', description: 'Exclusive access for loyal customers' },

    // Time-based
    { name: 'Early Bird Discount', type: 'Time-Limited', category: 'Promotion', description: 'Discount for early purchasers' },
    { name: 'Flash Sale', type: 'Time-Limited', category: 'Promotion', description: 'Short-duration deep discount' },
    { name: 'Seasonal Sale', type: 'Time-Limited', category: 'Promotion', description: 'Discount during specific seasons' },
    { name: 'Limited Time Offer', type: 'Time-Limited', category: 'Promotion', description: 'Offer available for a limited time' },

    // Add-ons
    { name: 'Free Shipping', type: 'Incentive', category: 'Promotion', description: 'No charge for delivery' },
    { name: 'Gift With Purchase', type: 'Incentive', category: 'Promotion', description: 'Free item included with purchase' },
    { name: 'Extended Warranty', type: 'Service', category: 'Assurance', description: 'Additional warranty coverage' },

    // Enterprise
    { name: 'Enterprise License', type: 'License', category: 'Enterprise', description: 'Site or organization-wide licensing' },
    { name: 'Volume License', type: 'License', category: 'Enterprise', description: 'License for multiple seats at reduced cost' },
    { name: 'Custom Pricing', type: 'Negotiated', category: 'Enterprise', description: 'Individually negotiated pricing' }
  ]

  for (const offer of offerTypes) {
    const id = toPascalCase(offer.name)
    offers.push({
      id,
      name: offer.name,
      description: offer.description,
      type: offer.type,
      category: offer.category
    })
  }

  // Sort
  offers.sort((a, b) => a.id.localeCompare(b.id))

  // Write Offers.tsv
  const offersPath = path.join(dataDir, 'Offers.tsv')
  const offersHeaders = ['id', 'name', 'description', 'type', 'category']
  const offersRows = offers.map(o =>
    `${o.id}\t${o.name}\t${o.description}\t${o.type}\t${o.category}`
  )

  fs.writeFileSync(offersPath, offersHeaders.join('\t') + '\n' + offersRows.join('\n'))
  console.log(`  ✓ Offers.tsv (${offers.length} offer types)`)

  // Create Offers.Products.tsv (placeholder)
  const offersProductsPath = path.join(dataDir, 'Offers.Products.tsv')
  const offersProductsHeaders = ['offerId', 'productId']
  fs.writeFileSync(offersProductsPath, offersProductsHeaders.join('\t') + '\n')
  console.log(`  ✓ Offers.Products.tsv (placeholder for relationships)`)
}

async function generatePayments(dataDir: string) {
  console.log('\n💳 Generating Payments.tsv...')

  // Read Apps.tsv to find payment processors
  const appsPath = path.join(dataDir, 'Apps.tsv')
  let paymentApps: Array<{ id: string; name: string; slug: string; category: string }> = []

  if (fs.existsSync(appsPath)) {
    const content = fs.readFileSync(appsPath, 'utf-8')
    const lines = content.split('\n')
    const headers = lines[0].split('\t')

    const idIdx = headers.indexOf('id')
    const nameIdx = headers.indexOf('name')
    const slugIdx = headers.indexOf('slug')
    const categoryIdx = headers.indexOf('category')

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const cols = line.split('\t')
      const category = cols[categoryIdx] || ''

      if (category.includes('Payment') || category.includes('eCommerce') ||
          category.includes('Accounting') || category.includes('Invoice')) {
        paymentApps.push({
          id: cols[idIdx],
          name: cols[nameIdx],
          slug: cols[slugIdx],
          category: cols[categoryIdx]
        })
      }
    }
  }

  const payments: Array<{
    id: string
    name: string
    description: string
    method: string
    processor: string
  }> = []

  const paymentsApps: Array<{
    paymentId: string
    appId: string
  }> = []

  // Payment methods
  const methods = [
    // Cards
    { name: 'Credit Card', method: 'Card', processor: 'General', description: 'Payment using a credit card' },
    { name: 'Debit Card', method: 'Card', processor: 'General', description: 'Payment using a debit card' },
    { name: 'Prepaid Card', method: 'Card', processor: 'General', description: 'Payment using a prepaid card' },

    // Digital Wallets
    { name: 'Apple Pay', method: 'Digital Wallet', processor: 'Apple', description: 'Payment using Apple Pay' },
    { name: 'Google Pay', method: 'Digital Wallet', processor: 'Google', description: 'Payment using Google Pay' },
    { name: 'PayPal', method: 'Digital Wallet', processor: 'PayPal', description: 'Payment using PayPal' },
    { name: 'Venmo', method: 'Digital Wallet', processor: 'PayPal', description: 'Payment using Venmo' },
    { name: 'Samsung Pay', method: 'Digital Wallet', processor: 'Samsung', description: 'Payment using Samsung Pay' },
    { name: 'Alipay', method: 'Digital Wallet', processor: 'Alibaba', description: 'Payment using Alipay' },
    { name: 'WeChat Pay', method: 'Digital Wallet', processor: 'Tencent', description: 'Payment using WeChat Pay' },

    // Bank Transfer
    { name: 'ACH Transfer', method: 'Bank Transfer', processor: 'ACH', description: 'Automated Clearing House transfer' },
    { name: 'Wire Transfer', method: 'Bank Transfer', processor: 'Wire', description: 'Direct bank wire transfer' },
    { name: 'Direct Debit', method: 'Bank Transfer', processor: 'Bank', description: 'Direct withdrawal from bank account' },
    { name: 'SEPA Transfer', method: 'Bank Transfer', processor: 'SEPA', description: 'Single Euro Payments Area transfer' },

    // Alternative
    { name: 'Check', method: 'Traditional', processor: 'Bank', description: 'Payment by check' },
    { name: 'Cash', method: 'Traditional', processor: 'Physical', description: 'Payment in cash' },
    { name: 'Money Order', method: 'Traditional', processor: 'Financial Institution', description: 'Payment by money order' },

    // Buy Now Pay Later
    { name: 'Afterpay', method: 'BNPL', processor: 'Afterpay', description: 'Buy now, pay later with Afterpay' },
    { name: 'Klarna', method: 'BNPL', processor: 'Klarna', description: 'Buy now, pay later with Klarna' },
    { name: 'Affirm', method: 'BNPL', processor: 'Affirm', description: 'Buy now, pay later with Affirm' },
    { name: 'Sezzle', method: 'BNPL', processor: 'Sezzle', description: 'Buy now, pay later with Sezzle' },

    // Crypto
    { name: 'Bitcoin', method: 'Cryptocurrency', processor: 'Blockchain', description: 'Payment using Bitcoin' },
    { name: 'Ethereum', method: 'Cryptocurrency', processor: 'Blockchain', description: 'Payment using Ethereum' },
    { name: 'USDC', method: 'Cryptocurrency', processor: 'Blockchain', description: 'Payment using USDC stablecoin' },
    { name: 'Crypto Payment', method: 'Cryptocurrency', processor: 'Blockchain', description: 'Payment using cryptocurrency' },

    // Processors
    { name: 'Stripe', method: 'Payment Gateway', processor: 'Stripe', description: 'Online payment processing via Stripe' },
    { name: 'Square', method: 'Payment Gateway', processor: 'Square', description: 'Payment processing via Square' },
    { name: 'Braintree', method: 'Payment Gateway', processor: 'PayPal', description: 'Payment processing via Braintree' },
    { name: 'Adyen', method: 'Payment Gateway', processor: 'Adyen', description: 'Payment processing via Adyen' },
    { name: 'Authorize.Net', method: 'Payment Gateway', processor: 'Visa', description: 'Payment processing via Authorize.Net' },

    // Invoicing
    { name: 'Invoice Payment', method: 'Invoice', processor: 'Vendor', description: 'Payment via invoice' },
    { name: 'Net 30', method: 'Invoice', processor: 'Vendor', description: 'Payment due in 30 days' },
    { name: 'Net 60', method: 'Invoice', processor: 'Vendor', description: 'Payment due in 60 days' },
    { name: 'Purchase Order', method: 'Invoice', processor: 'Vendor', description: 'Payment via purchase order' }
  ]

  for (const method of methods) {
    const id = toPascalCase(method.name)
    payments.push({
      id,
      name: method.name,
      description: method.description,
      method: method.method,
      processor: method.processor
    })

    // Link to payment apps if name matches
    const matchingApp = paymentApps.find(app =>
      app.name.toLowerCase().includes(method.name.toLowerCase()) ||
      method.name.toLowerCase().includes(app.name.toLowerCase())
    )

    if (matchingApp) {
      paymentsApps.push({
        paymentId: id,
        appId: matchingApp.id
      })
    }
  }

  // Sort
  payments.sort((a, b) => a.id.localeCompare(b.id))
  paymentsApps.sort((a, b) => a.paymentId.localeCompare(b.paymentId))

  // Write Payments.tsv
  const paymentsPath = path.join(dataDir, 'Payments.tsv')
  const paymentsHeaders = ['id', 'name', 'description', 'method', 'processor']
  const paymentsRows = payments.map(p =>
    `${p.id}\t${p.name}\t${p.description}\t${p.method}\t${p.processor}`
  )

  fs.writeFileSync(paymentsPath, paymentsHeaders.join('\t') + '\n' + paymentsRows.join('\n'))
  console.log(`  ✓ Payments.tsv (${payments.length} payment methods)`)

  // Write Payments.Apps.tsv
  const paymentsAppsPath = path.join(dataDir, 'Payments.Apps.tsv')
  const paymentsAppsHeaders = ['paymentId', 'appId']
  const paymentsAppsRows = paymentsApps.map(r =>
    `${r.paymentId}\t${r.appId}`
  )

  fs.writeFileSync(paymentsAppsPath, paymentsAppsHeaders.join('\t') + '\n' + paymentsAppsRows.join('\n'))
  console.log(`  ✓ Payments.Apps.tsv (${paymentsApps.length} relationships)`)
}

async function main() {
  console.log('='.repeat(100))
  console.log('BUSINESS/FINANCE DOMAIN GENERATION')
  console.log('='.repeat(100))

  const repoRoot = path.resolve(import.meta.dirname, '../../../..')
  const dataDir = path.join(repoRoot, '.data')

  await generateJobs(dataDir)
  await generateStartups(dataDir)
  await generateFinance(dataDir)
  await generateVC(dataDir)
  await generateOffers(dataDir)
  await generatePayments(dataDir)

  console.log('\n' + '='.repeat(100))
  console.log('✅ Business/Finance domain files generated!')
  console.log('='.repeat(100))
}

main().catch(console.error)

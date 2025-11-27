/**
 * consulting.org.ai
 *
 * Ontology package for consulting
 *
 * @example
 * ```typescript
 * import { Consulting, things } from 'consulting.org.ai'
 * ```
 *
 * @see https://consulting.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type {
  Consulting,
  ManagementConsulting,
  ITConsulting,
  HRConsulting,
  FinancialAdvisory,
  RiskConsulting,
  MarketingConsulting
} from './types'

// Import types for runtime use
import type {
  Consulting,
  ManagementConsulting,
  ITConsulting,
  HRConsulting,
  FinancialAdvisory,
  RiskConsulting,
  MarketingConsulting
} from './types'

/**
 * Collection of all consulting instances
 * Fetched from https://consulting.org.ai
 */
export const things: Promise<(Consulting | ManagementConsulting | ITConsulting | HRConsulting | FinancialAdvisory | RiskConsulting | MarketingConsulting)[]> = fetch('https://consulting.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Consulting by ID
 */
export async function get(id: string): Promise<Consulting | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://consulting.org.ai/${id}`)
}

/**
 * Search consulting by name or description
 */
export async function search(query: string): Promise<(Consulting)[]> {
  const items = await things
  const q = query.toLowerCase()
  return items.filter(item =>
    item.name?.toLowerCase().includes(q) ||
    item.description?.toLowerCase().includes(q)
  )
}

/**
 * Domain metadata
 */
export const domain = {
  '@context': 'https://consulting.org.ai',
  '@id': 'https://consulting.org.ai',
  name: 'consulting.org.ai',
  parent: 'business.org.ai',
  types: [
    'Consulting',
    'ManagementConsulting',
    'ITConsulting',
    'HRConsulting',
    'FinancialAdvisory',
    'RiskConsulting',
    'MarketingConsulting'
  ]
} as const

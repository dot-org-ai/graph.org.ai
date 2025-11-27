/**
 * insurance.org.ai
 *
 * Ontology package for insurance
 *
 * @example
 * ```typescript
 * import { Insurance, things } from 'insurance.org.ai'
 * ```
 *
 * @see https://insurance.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type {
  Insurance,
  LifeInsurance,
  PropertyCasualty,
  HealthInsurance,
  Reinsurance,
  InsurTech,
  ClaimsManagement
} from './types'

// Import types for runtime use
import type {
  Insurance,
  LifeInsurance,
  PropertyCasualty,
  HealthInsurance,
  Reinsurance,
  InsurTech,
  ClaimsManagement
} from './types'

/**
 * Collection of all insurance instances
 * Fetched from https://insurance.org.ai
 */
export const things: Promise<(Insurance)[]> = fetch('https://insurance.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Insurance by ID
 */
export async function get(id: string): Promise<Insurance | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://insurance.org.ai/${id}`)
}

/**
 * Search insurance by name or description
 */
export async function search(query: string): Promise<(Insurance)[]> {
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
  '@context': 'https://insurance.org.ai',
  '@id': 'https://insurance.org.ai',
  name: 'insurance.org.ai',
  parent: 'business.org.ai',
  types: [
    'Insurance',
    'LifeInsurance',
    'PropertyCasualty',
    'HealthInsurance',
    'Reinsurance',
    'InsurTech',
    'ClaimsManagement'
  ]
} as const

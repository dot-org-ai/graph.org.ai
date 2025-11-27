/**
 * finance.org.ai
 *
 * Financial systems, money, and instruments.
 *
 * @example
 * ```typescript
 * import { FinancialProduct, things } from 'finance.org.ai'
 * ```
 *
 * @see https://finance.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { FinancialProduct, MonetaryAmount } from './types'

// Import types for runtime use
import type { FinancialProduct, MonetaryAmount } from './types'

/**
 * Collection of all finance instances
 * Fetched from https://finance.org.ai
 */
export const things: Promise<(FinancialProduct | MonetaryAmount)[]> = fetch('https://finance.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific FinancialProduct by ID
 */
export async function get(id: string): Promise<FinancialProduct | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://finance.org.ai/${id}`)
}

/**
 * Search finance by name or description
 */
export async function search(query: string): Promise<(FinancialProduct | MonetaryAmount)[]> {
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
  '@context': 'https://finance.org.ai',
  '@id': 'https://finance.org.ai',
  name: 'finance.org.ai',
  parent: 'business.org.ai',
  types: ['FinancialProduct', 'MonetaryAmount']
} as const

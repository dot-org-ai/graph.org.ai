/**
 * payments.org.ai
 *
 * Ontology package for payments
 *
 * @example
 * ```typescript
 * import { Payments, things } from 'payments.org.ai'
 * ```
 *
 * @see https://payments.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Payments } from './types'

// Import types for runtime use
import type { Payments } from './types'

/**
 * Collection of all payments instances
 * Fetched from https://payments.org.ai
 */
export const things: Promise<(Payments)[]> = fetch('https://payments.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Payments by ID
 */
export async function get(id: string): Promise<Payments | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://payments.org.ai/${id}`)
}

/**
 * Search payments by name or description
 */
export async function search(query: string): Promise<(Payments)[]> {
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
  '@context': 'https://payments.org.ai',
  '@id': 'https://payments.org.ai',
  name: 'payments.org.ai',
  parent: 'business.org.ai',
  types: ['Payments']
} as const

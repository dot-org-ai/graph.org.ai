/**
 * offers.org.ai
 *
 * Ontology package for offers
 *
 * @example
 * ```typescript
 * import { Offers, things } from 'offers.org.ai'
 * ```
 *
 * @see https://offers.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Offers } from './types'

// Import types for runtime use
import type { Offers } from './types'

/**
 * Collection of all offers instances
 * Fetched from https://offers.org.ai
 */
export const things: Promise<(Offers)[]> = fetch('https://offers.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Offers by ID
 */
export async function get(id: string): Promise<Offers | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://offers.org.ai/${id}`)
}

/**
 * Search offers by name or description
 */
export async function search(query: string): Promise<(Offers)[]> {
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
  '@context': 'https://offers.org.ai',
  '@id': 'https://offers.org.ai',
  name: 'offers.org.ai',
  parent: 'business.org.ai',
  types: ['Offers']
} as const

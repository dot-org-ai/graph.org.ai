/**
 * gs1.org.ai
 *
 * Standardized types for commercial products, places, and supply chain events.
 *
 * @example
 * ```typescript
 * import { Product, things } from 'gs1.org.ai'
 * ```
 *
 * @see https://gs1.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Product, Place, Location, Event, Organization } from './types'

// Import types for runtime use
import type { Product, Place, Location, Event, Organization } from './types'

/**
 * Collection of all gs1 instances
 * Fetched from https://gs1.org.ai
 */
export const things: Promise<(Product | Place | Location | Event | Organization)[]> = fetch('https://gs1.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Product by ID
 */
export async function get(id: string): Promise<Product | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://gs1.org.ai/${id}`)
}

/**
 * Search gs1 by name or description
 */
export async function search(query: string): Promise<(Product | Place | Location | Event | Organization)[]> {
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
  '@context': 'https://gs1.org.ai',
  '@id': 'https://gs1.org.ai',
  name: 'gs1.org.ai',
  parent: 'standards.org.ai',
  types: ['Product', 'Place', 'Location', 'Event', 'Organization']
} as const

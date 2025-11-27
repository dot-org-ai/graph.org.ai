/**
 * business.org.ai
 *
 * Commercial entities and concepts.
 *
 * @example
 * ```typescript
 * import { Business, things } from 'business.org.ai'
 * ```
 *
 * @see https://business.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Business } from './types'

// Import types for runtime use
import type { Business } from './types'

/**
 * Collection of all business instances
 * Fetched from https://business.org.ai
 */
export const things: Promise<(Business)[]> = fetch('https://business.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Business by ID
 */
export async function get(id: string): Promise<Business | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://business.org.ai/${id}`)
}

/**
 * Search business by name or description
 */
export async function search(query: string): Promise<(Business)[]> {
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
  '@context': 'https://business.org.ai',
  '@id': 'https://business.org.ai',
  name: 'business.org.ai',
  parent: 'things.org.ai',
  types: ['Business']
} as const

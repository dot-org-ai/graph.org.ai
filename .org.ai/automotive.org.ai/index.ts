/**
 * automotive.org.ai
 *
 * Ontology package for automotive
 *
 * @example
 * ```typescript
 * import { Automotive, things } from 'automotive.org.ai'
 * ```
 *
 * @see https://automotive.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Automotive } from './types'

// Import types for runtime use
import type { Automotive } from './types'

/**
 * Collection of all automotive instances
 * Fetched from https://automotive.org.ai
 */
export const things: Promise<(Automotive)[]> = fetch('https://automotive.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Automotive by ID
 */
export async function get(id: string): Promise<Automotive | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://automotive.org.ai/${id}`)
}

/**
 * Search automotive by name or description
 */
export async function search(query: string): Promise<(Automotive)[]> {
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
  '@context': 'https://automotive.org.ai',
  '@id': 'https://automotive.org.ai',
  name: 'automotive.org.ai',
  parent: 'industries.org.ai',
  types: ['Automotive']
} as const

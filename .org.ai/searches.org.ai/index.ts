/**
 * searches.org.ai
 *
 * Ontology package for searches
 *
 * @example
 * ```typescript
 * import { Searches, things } from 'searches.org.ai'
 * ```
 *
 * @see https://searches.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Searches } from './types'

// Import types for runtime use
import type { Searches } from './types'

/**
 * Collection of all searches instances
 * Fetched from https://searches.org.ai
 */
export const things: Promise<(Searches)[]> = fetch('https://searches.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Searches by ID
 */
export async function get(id: string): Promise<Searches | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://searches.org.ai/${id}`)
}

/**
 * Search searches by name or description
 */
export async function search(query: string): Promise<(Searches)[]> {
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
  '@context': 'https://searches.org.ai',
  '@id': 'https://searches.org.ai',
  name: 'searches.org.ai',
  parent: 'agents.org.ai',
  types: ['Searches']
} as const

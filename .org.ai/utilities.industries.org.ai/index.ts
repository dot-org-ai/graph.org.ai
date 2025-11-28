/**
 * utilities.org.ai
 *
 * Ontology package for utilities
 *
 * @example
 * ```typescript
 * import { Utilities, things } from 'utilities.org.ai'
 * ```
 *
 * @see https://utilities.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Utilities } from './types'

// Import types for runtime use
import type { Utilities } from './types'

/**
 * Collection of all utilities instances
 * Fetched from https://utilities.org.ai
 */
export const things: Promise<(Utilities)[]> = fetch('https://utilities.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Utilities by ID
 */
export async function get(id: string): Promise<Utilities | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://utilities.org.ai/${id}`)
}

/**
 * Search utilities by name or description
 */
export async function search(query: string): Promise<(Utilities)[]> {
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
  '@context': 'https://utilities.org.ai',
  '@id': 'https://utilities.org.ai',
  name: 'utilities.org.ai',
  parent: 'science.org.ai',
  types: ['Utilities']
} as const

/**
 * agriculture.org.ai
 *
 * Ontology package for agriculture
 *
 * @example
 * ```typescript
 * import { Agriculture, things } from 'agriculture.org.ai'
 * ```
 *
 * @see https://agriculture.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Agriculture } from './types'

// Import types for runtime use
import type { Agriculture } from './types'

/**
 * Collection of all agriculture instances
 * Fetched from https://agriculture.org.ai
 */
export const things: Promise<(Agriculture)[]> = fetch('https://agriculture.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Agriculture by ID
 */
export async function get(id: string): Promise<Agriculture | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://agriculture.org.ai/${id}`)
}

/**
 * Search agriculture by name or description
 */
export async function search(query: string): Promise<(Agriculture)[]> {
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
  '@context': 'https://agriculture.org.ai',
  '@id': 'https://agriculture.org.ai',
  name: 'agriculture.org.ai',
  parent: 'industries.org.ai',
  types: ['Agriculture']
} as const

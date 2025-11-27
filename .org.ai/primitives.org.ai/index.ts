/**
 * primitives.org.ai
 *
 * Ontology package for primitives
 *
 * @example
 * ```typescript
 * import { Primitives, things } from 'primitives.org.ai'
 * ```
 *
 * @see https://primitives.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Primitives } from './types'

// Import types for runtime use
import type { Primitives } from './types'

/**
 * Collection of all primitives instances
 * Fetched from https://primitives.org.ai
 */
export const things: Promise<(Primitives)[]> = fetch('https://primitives.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Primitives by ID
 */
export async function get(id: string): Promise<Primitives | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://primitives.org.ai/${id}`)
}

/**
 * Search primitives by name or description
 */
export async function search(query: string): Promise<(Primitives)[]> {
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
  '@context': 'https://primitives.org.ai',
  '@id': 'https://primitives.org.ai',
  name: 'primitives.org.ai',
  parent: 'graph.org.ai',
  types: ['Primitives']
} as const

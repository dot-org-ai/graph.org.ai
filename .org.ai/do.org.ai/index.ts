/**
 * do.org.ai
 *
 * Ontology package for do
 *
 * @example
 * ```typescript
 * import { Do, things } from 'do.org.ai'
 * ```
 *
 * @see https://do.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Do } from './types'

// Import types for runtime use
import type { Do } from './types'

/**
 * Collection of all do instances
 * Fetched from https://do.org.ai
 */
export const things: Promise<(Do)[]> = fetch('https://do.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Do by ID
 */
export async function get(id: string): Promise<Do | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://do.org.ai/${id}`)
}

/**
 * Search do by name or description
 */
export async function search(query: string): Promise<(Do)[]> {
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
  '@context': 'https://do.org.ai',
  '@id': 'https://do.org.ai',
  name: 'do.org.ai',
  parent: 'graph.org.ai',
  types: ['Do']
} as const

/**
 * soc.org.ai
 *
 * Standard Occupational Classification.
 *
 * @example
 * ```typescript
 * import { Soc, things } from 'soc.org.ai'
 * ```
 *
 * @see https://soc.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Soc } from './types'

// Import types for runtime use
import type { Soc } from './types'

/**
 * Collection of all soc instances
 * Fetched from https://soc.org.ai
 */
export const things: Promise<(Soc)[]> = fetch('https://soc.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Soc by ID
 */
export async function get(id: string): Promise<Soc | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://soc.org.ai/${id}`)
}

/**
 * Search soc by name or description
 */
export async function search(query: string): Promise<(Soc)[]> {
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
  '@context': 'https://soc.org.ai',
  '@id': 'https://soc.org.ai',
  name: 'soc.org.ai',
  parent: 'knowledge.org.ai',
  types: ['Soc']
} as const

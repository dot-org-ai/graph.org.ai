/**
 * things.org.ai
 *
 * The most generic type of item.
 *
 * @example
 * ```typescript
 * import { Thing, things } from 'things.org.ai'
 * ```
 *
 * @see https://things.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Thing } from './types'

// Import types for runtime use
import type { Thing } from './types'

/**
 * Collection of all things instances
 * Fetched from https://things.org.ai
 */
export const things: Promise<(Thing)[]> = fetch('https://things.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Thing by ID
 */
export async function get(id: string): Promise<Thing | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://things.org.ai/${id}`)
}

/**
 * Search things by name or description
 */
export async function search(query: string): Promise<(Thing)[]> {
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
  '@context': 'https://things.org.ai',
  '@id': 'https://things.org.ai',
  name: 'things.org.ai',
  parent: 'schema.org.ai',
  types: ['Thing']
} as const

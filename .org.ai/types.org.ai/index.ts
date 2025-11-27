/**
 * types.org.ai
 *
 * Global type definitions.
 *
 * @example
 * ```typescript
 * import { Types, things } from 'types.org.ai'
 * ```
 *
 * @see https://types.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Types } from './types'

// Import types for runtime use
import type { Types } from './types'

/**
 * Collection of all types instances
 * Fetched from https://types.org.ai
 */
export const things: Promise<(Types)[]> = fetch('https://types.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Types by ID
 */
export async function get(id: string): Promise<Types | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://types.org.ai/${id}`)
}

/**
 * Search types by name or description
 */
export async function search(query: string): Promise<(Types)[]> {
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
  '@context': 'https://types.org.ai',
  '@id': 'https://types.org.ai',
  name: 'types.org.ai',
  parent: 'schema.org.ai',
  types: ['Types']
} as const

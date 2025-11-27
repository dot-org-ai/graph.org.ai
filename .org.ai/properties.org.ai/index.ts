/**
 * properties.org.ai
 *
 * Global property definitions.
 *
 * @example
 * ```typescript
 * import { Properties, things } from 'properties.org.ai'
 * ```
 *
 * @see https://properties.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Properties } from './types'

// Import types for runtime use
import type { Properties } from './types'

/**
 * Collection of all properties instances
 * Fetched from https://properties.org.ai
 */
export const things: Promise<(Properties)[]> = fetch('https://properties.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Properties by ID
 */
export async function get(id: string): Promise<Properties | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://properties.org.ai/${id}`)
}

/**
 * Search properties by name or description
 */
export async function search(query: string): Promise<(Properties)[]> {
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
  '@context': 'https://properties.org.ai',
  '@id': 'https://properties.org.ai',
  name: 'properties.org.ai',
  parent: 'schema.org.ai',
  types: ['Properties']
} as const

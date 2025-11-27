/**
 * places.org.ai
 *
 * Entities that have a somewhat fixed, physical extension. Includes GeoNames data.
 *
 * @example
 * ```typescript
 * import { Place, things } from 'places.org.ai'
 * ```
 *
 * @see https://places.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Place, Location } from './types'

// Import types for runtime use
import type { Place, Location } from './types'

/**
 * Collection of all places instances
 * Fetched from https://places.org.ai
 */
export const things: Promise<(Place | Location)[]> = fetch('https://places.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Place by ID
 */
export async function get(id: string): Promise<Place | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://places.org.ai/${id}`)
}

/**
 * Search places by name or description
 */
export async function search(query: string): Promise<(Place | Location)[]> {
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
  '@context': 'https://places.org.ai',
  '@id': 'https://places.org.ai',
  name: 'places.org.ai',
  parent: 'things.org.ai',
  types: ['Place', 'Location']
} as const

/**
 * media.org.ai
 *
 * Ontology package for media
 *
 * @example
 * ```typescript
 * import { Media, things } from 'media.org.ai'
 * ```
 *
 * @see https://media.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Media } from './types'

// Import types for runtime use
import type { Media } from './types'

/**
 * Collection of all media instances
 * Fetched from https://media.org.ai
 */
export const things: Promise<(Media)[]> = fetch('https://media.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Media by ID
 */
export async function get(id: string): Promise<Media | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://media.org.ai/${id}`)
}

/**
 * Search media by name or description
 */
export async function search(query: string): Promise<(Media)[]> {
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
  '@context': 'https://media.org.ai',
  '@id': 'https://media.org.ai',
  name: 'media.org.ai',
  parent: 'things.org.ai',
  types: ['Media']
} as const

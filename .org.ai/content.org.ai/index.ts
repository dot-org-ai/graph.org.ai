/**
 * content.org.ai
 *
 * Media content.
 *
 * @example
 * ```typescript
 * import { MediaObject, things } from 'content.org.ai'
 * ```
 *
 * @see https://content.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { MediaObject } from './types'

// Import types for runtime use
import type { MediaObject } from './types'

/**
 * Collection of all content instances
 * Fetched from https://content.org.ai
 */
export const things: Promise<(MediaObject)[]> = fetch('https://content.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific MediaObject by ID
 */
export async function get(id: string): Promise<MediaObject | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://content.org.ai/${id}`)
}

/**
 * Search content by name or description
 */
export async function search(query: string): Promise<(MediaObject)[]> {
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
  '@context': 'https://content.org.ai',
  '@id': 'https://content.org.ai',
  name: 'content.org.ai',
  parent: 'media.org.ai',
  types: ['MediaObject']
} as const

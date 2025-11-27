/**
 * video.org.ai
 *
 * Ontology package for video
 *
 * @example
 * ```typescript
 * import { Video, things } from 'video.org.ai'
 * ```
 *
 * @see https://video.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Video } from './types'

// Import types for runtime use
import type { Video } from './types'

/**
 * Collection of all video instances
 * Fetched from https://video.org.ai
 */
export const things: Promise<(Video)[]> = fetch('https://video.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Video by ID
 */
export async function get(id: string): Promise<Video | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://video.org.ai/${id}`)
}

/**
 * Search video by name or description
 */
export async function search(query: string): Promise<(Video)[]> {
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
  '@context': 'https://video.org.ai',
  '@id': 'https://video.org.ai',
  name: 'video.org.ai',
  parent: 'media.org.ai',
  types: ['Video']
} as const

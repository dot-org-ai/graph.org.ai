/**
 * images.org.ai
 *
 * Ontology package for images
 *
 * @example
 * ```typescript
 * import { Images, things } from 'images.org.ai'
 * ```
 *
 * @see https://images.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Images } from './types'

// Import types for runtime use
import type { Images } from './types'

/**
 * Collection of all images instances
 * Fetched from https://images.org.ai
 */
export const things: Promise<(Images)[]> = fetch('https://images.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Images by ID
 */
export async function get(id: string): Promise<Images | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://images.org.ai/${id}`)
}

/**
 * Search images by name or description
 */
export async function search(query: string): Promise<(Images)[]> {
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
  '@context': 'https://images.org.ai',
  '@id': 'https://images.org.ai',
  name: 'images.org.ai',
  parent: 'media.org.ai',
  types: ['Images']
} as const

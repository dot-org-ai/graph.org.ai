/**
 * blog.org.ai
 *
 * Ontology package for blog
 *
 * @example
 * ```typescript
 * import { Blog, things } from 'blog.org.ai'
 * ```
 *
 * @see https://blog.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Blog } from './types'

// Import types for runtime use
import type { Blog } from './types'

/**
 * Collection of all blog instances
 * Fetched from https://blog.org.ai
 */
export const things: Promise<(Blog)[]> = fetch('https://blog.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Blog by ID
 */
export async function get(id: string): Promise<Blog | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://blog.org.ai/${id}`)
}

/**
 * Search blog by name or description
 */
export async function search(query: string): Promise<(Blog)[]> {
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
  '@context': 'https://blog.org.ai',
  '@id': 'https://blog.org.ai',
  name: 'blog.org.ai',
  parent: 'media.org.ai',
  types: ['Blog']
} as const

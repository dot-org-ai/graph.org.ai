/**
 * news.org.ai
 *
 * Ontology package for news
 *
 * @example
 * ```typescript
 * import { News, things } from 'news.org.ai'
 * ```
 *
 * @see https://news.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { News } from './types'

// Import types for runtime use
import type { News } from './types'

/**
 * Collection of all news instances
 * Fetched from https://news.org.ai
 */
export const things: Promise<(News)[]> = fetch('https://news.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific News by ID
 */
export async function get(id: string): Promise<News | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://news.org.ai/${id}`)
}

/**
 * Search news by name or description
 */
export async function search(query: string): Promise<(News)[]> {
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
  '@context': 'https://news.org.ai',
  '@id': 'https://news.org.ai',
  name: 'news.org.ai',
  parent: 'media.org.ai',
  types: ['News']
} as const

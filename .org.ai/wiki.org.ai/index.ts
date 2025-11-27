/**
 * wiki.org.ai
 *
 * Ontology package for wiki
 *
 * @example
 * ```typescript
 * import { Wiki, things } from 'wiki.org.ai'
 * ```
 *
 * @see https://wiki.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Wiki } from './types'

// Import types for runtime use
import type { Wiki } from './types'

/**
 * Collection of all wiki instances
 * Fetched from https://wiki.org.ai
 */
export const things: Promise<(Wiki)[]> = fetch('https://wiki.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Wiki by ID
 */
export async function get(id: string): Promise<Wiki | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://wiki.org.ai/${id}`)
}

/**
 * Search wiki by name or description
 */
export async function search(query: string): Promise<(Wiki)[]> {
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
  '@context': 'https://wiki.org.ai',
  '@id': 'https://wiki.org.ai',
  name: 'wiki.org.ai',
  parent: 'knowledge.org.ai',
  types: ['Wiki']
} as const

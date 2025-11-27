/**
 * ideas.org.ai
 *
 * Ontology package for ideas
 *
 * @example
 * ```typescript
 * import { Ideas, things } from 'ideas.org.ai'
 * ```
 *
 * @see https://ideas.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Ideas } from './types'

// Import types for runtime use
import type { Ideas } from './types'

/**
 * Collection of all ideas instances
 * Fetched from https://ideas.org.ai
 */
export const things: Promise<(Ideas)[]> = fetch('https://ideas.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Ideas by ID
 */
export async function get(id: string): Promise<Ideas | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://ideas.org.ai/${id}`)
}

/**
 * Search ideas by name or description
 */
export async function search(query: string): Promise<(Ideas)[]> {
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
  '@context': 'https://ideas.org.ai',
  '@id': 'https://ideas.org.ai',
  name: 'ideas.org.ai',
  parent: 'knowledge.org.ai',
  types: ['Ideas']
} as const

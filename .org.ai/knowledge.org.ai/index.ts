/**
 * knowledge.org.ai
 *
 * Abstract information and concepts.
 *
 * @example
 * ```typescript
 * import { Knowledge, things } from 'knowledge.org.ai'
 * ```
 *
 * @see https://knowledge.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Knowledge } from './types'

// Import types for runtime use
import type { Knowledge } from './types'

/**
 * Collection of all knowledge instances
 * Fetched from https://knowledge.org.ai
 */
export const things: Promise<(Knowledge)[]> = fetch('https://knowledge.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Knowledge by ID
 */
export async function get(id: string): Promise<Knowledge | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://knowledge.org.ai/${id}`)
}

/**
 * Search knowledge by name or description
 */
export async function search(query: string): Promise<(Knowledge)[]> {
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
  '@context': 'https://knowledge.org.ai',
  '@id': 'https://knowledge.org.ai',
  name: 'knowledge.org.ai',
  parent: 'things.org.ai',
  types: ['Knowledge']
} as const

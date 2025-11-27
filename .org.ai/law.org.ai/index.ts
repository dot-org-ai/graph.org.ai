/**
 * law.org.ai
 *
 * Legal systems and legislation.
 *
 * @example
 * ```typescript
 * import { Legislation, things } from 'law.org.ai'
 * ```
 *
 * @see https://law.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Legislation } from './types'

// Import types for runtime use
import type { Legislation } from './types'

/**
 * Collection of all law instances
 * Fetched from https://law.org.ai
 */
export const things: Promise<(Legislation)[]> = fetch('https://law.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Legislation by ID
 */
export async function get(id: string): Promise<Legislation | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://law.org.ai/${id}`)
}

/**
 * Search law by name or description
 */
export async function search(query: string): Promise<(Legislation)[]> {
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
  '@context': 'https://law.org.ai',
  '@id': 'https://law.org.ai',
  name: 'law.org.ai',
  parent: 'knowledge.org.ai',
  types: ['Legislation']
} as const

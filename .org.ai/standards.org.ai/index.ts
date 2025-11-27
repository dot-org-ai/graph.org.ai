/**
 * standards.org.ai
 *
 * International standards and classification systems not owned by platform.
 *
 * @example
 * ```typescript
 * import { Standards, things } from 'standards.org.ai'
 * ```
 *
 * @see https://standards.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Standards } from './types'

// Import types for runtime use
import type { Standards } from './types'

/**
 * Collection of all standards instances
 * Fetched from https://standards.org.ai
 */
export const things: Promise<(Standards)[]> = fetch('https://standards.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Standards by ID
 */
export async function get(id: string): Promise<Standards | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://standards.org.ai/${id}`)
}

/**
 * Search standards by name or description
 */
export async function search(query: string): Promise<(Standards)[]> {
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
  '@context': 'https://standards.org.ai',
  '@id': 'https://standards.org.ai',
  name: 'standards.org.ai',
  parent: 'knowledge.org.ai',
  types: ['Standards']
} as const

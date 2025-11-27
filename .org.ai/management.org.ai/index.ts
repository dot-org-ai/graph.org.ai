/**
 * management.org.ai
 *
 * Ontology package for management
 *
 * @example
 * ```typescript
 * import { Management, things } from 'management.org.ai'
 * ```
 *
 * @see https://management.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Management } from './types'

// Import types for runtime use
import type { Management } from './types'

/**
 * Collection of all management instances
 * Fetched from https://management.org.ai
 */
export const things: Promise<(Management)[]> = fetch('https://management.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Management by ID
 */
export async function get(id: string): Promise<Management | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://management.org.ai/${id}`)
}

/**
 * Search management by name or description
 */
export async function search(query: string): Promise<(Management)[]> {
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
  '@context': 'https://management.org.ai',
  '@id': 'https://management.org.ai',
  name: 'management.org.ai',
  parent: 'business.org.ai',
  types: ['Management']
} as const

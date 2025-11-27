/**
 * construction.org.ai
 *
 * Ontology package for construction
 *
 * @example
 * ```typescript
 * import { Construction, things } from 'construction.org.ai'
 * ```
 *
 * @see https://construction.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Construction } from './types'

// Import types for runtime use
import type { Construction } from './types'

/**
 * Collection of all construction instances
 * Fetched from https://construction.org.ai
 */
export const things: Promise<(Construction)[]> = fetch('https://construction.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Construction by ID
 */
export async function get(id: string): Promise<Construction | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://construction.org.ai/${id}`)
}

/**
 * Search construction by name or description
 */
export async function search(query: string): Promise<(Construction)[]> {
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
  '@context': 'https://construction.org.ai',
  '@id': 'https://construction.org.ai',
  name: 'construction.org.ai',
  parent: 'industries.org.ai',
  types: ['Construction']
} as const

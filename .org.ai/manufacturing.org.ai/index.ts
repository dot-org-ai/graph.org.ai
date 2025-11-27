/**
 * manufacturing.org.ai
 *
 * Ontology package for manufacturing
 *
 * @example
 * ```typescript
 * import { Manufacturing, things } from 'manufacturing.org.ai'
 * ```
 *
 * @see https://manufacturing.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Manufacturing } from './types'

// Import types for runtime use
import type { Manufacturing } from './types'

/**
 * Collection of all manufacturing instances
 * Fetched from https://manufacturing.org.ai
 */
export const things: Promise<(Manufacturing)[]> = fetch('https://manufacturing.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Manufacturing by ID
 */
export async function get(id: string): Promise<Manufacturing | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://manufacturing.org.ai/${id}`)
}

/**
 * Search manufacturing by name or description
 */
export async function search(query: string): Promise<(Manufacturing)[]> {
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
  '@context': 'https://manufacturing.org.ai',
  '@id': 'https://manufacturing.org.ai',
  name: 'manufacturing.org.ai',
  parent: 'industries.org.ai',
  types: ['Manufacturing']
} as const

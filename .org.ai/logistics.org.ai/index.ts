/**
 * logistics.org.ai
 *
 * Ontology package for logistics
 *
 * @example
 * ```typescript
 * import { Logistics, things } from 'logistics.org.ai'
 * ```
 *
 * @see https://logistics.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Logistics } from './types'

// Import types for runtime use
import type { Logistics } from './types'

/**
 * Collection of all logistics instances
 * Fetched from https://logistics.org.ai
 */
export const things: Promise<(Logistics)[]> = fetch('https://logistics.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Logistics by ID
 */
export async function get(id: string): Promise<Logistics | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://logistics.org.ai/${id}`)
}

/**
 * Search logistics by name or description
 */
export async function search(query: string): Promise<(Logistics)[]> {
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
  '@context': 'https://logistics.org.ai',
  '@id': 'https://logistics.org.ai',
  name: 'logistics.org.ai',
  parent: 'business.org.ai',
  types: ['Logistics']
} as const

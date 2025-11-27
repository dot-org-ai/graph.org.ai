/**
 * units.org.ai
 *
 * Ontology package for units
 *
 * @example
 * ```typescript
 * import { Units, things } from 'units.org.ai'
 * ```
 *
 * @see https://units.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Units } from './types'

// Import types for runtime use
import type { Units } from './types'

/**
 * Collection of all units instances
 * Fetched from https://units.org.ai
 */
export const things: Promise<(Units)[]> = fetch('https://units.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Units by ID
 */
export async function get(id: string): Promise<Units | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://units.org.ai/${id}`)
}

/**
 * Search units by name or description
 */
export async function search(query: string): Promise<(Units)[]> {
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
  '@context': 'https://units.org.ai',
  '@id': 'https://units.org.ai',
  name: 'units.org.ai',
  parent: 'things.org.ai',
  types: ['Units']
} as const

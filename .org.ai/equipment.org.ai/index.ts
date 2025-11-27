/**
 * equipment.org.ai
 *
 * Ontology package for equipment
 *
 * @example
 * ```typescript
 * import { Equipment, things } from 'equipment.org.ai'
 * ```
 *
 * @see https://equipment.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Equipment } from './types'

// Import types for runtime use
import type { Equipment } from './types'

/**
 * Collection of all equipment instances
 * Fetched from https://equipment.org.ai
 */
export const things: Promise<(Equipment)[]> = fetch('https://equipment.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Equipment by ID
 */
export async function get(id: string): Promise<Equipment | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://equipment.org.ai/${id}`)
}

/**
 * Search equipment by name or description
 */
export async function search(query: string): Promise<(Equipment)[]> {
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
  '@context': 'https://equipment.org.ai',
  '@id': 'https://equipment.org.ai',
  name: 'equipment.org.ai',
  parent: 'things.org.ai',
  types: ['Equipment']
} as const

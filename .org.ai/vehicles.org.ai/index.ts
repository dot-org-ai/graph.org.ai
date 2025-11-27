/**
 * vehicles.org.ai
 *
 * Ontology package for vehicles
 *
 * @example
 * ```typescript
 * import { Vehicles, things } from 'vehicles.org.ai'
 * ```
 *
 * @see https://vehicles.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Vehicles } from './types'

// Import types for runtime use
import type { Vehicles } from './types'

/**
 * Collection of all vehicles instances
 * Fetched from https://vehicles.org.ai
 */
export const things: Promise<(Vehicles)[]> = fetch('https://vehicles.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Vehicles by ID
 */
export async function get(id: string): Promise<Vehicles | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://vehicles.org.ai/${id}`)
}

/**
 * Search vehicles by name or description
 */
export async function search(query: string): Promise<(Vehicles)[]> {
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
  '@context': 'https://vehicles.org.ai',
  '@id': 'https://vehicles.org.ai',
  name: 'vehicles.org.ai',
  parent: 'tools.org.ai',
  types: ['Vehicles']
} as const

/**
 * molecules.org.ai
 *
 * Ontology package for molecules
 *
 * @example
 * ```typescript
 * import { Molecules, things } from 'molecules.org.ai'
 * ```
 *
 * @see https://molecules.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Molecules } from './types'

// Import types for runtime use
import type { Molecules } from './types'

/**
 * Collection of all molecules instances
 * Fetched from https://molecules.org.ai
 */
export const things: Promise<(Molecules)[]> = fetch('https://molecules.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Molecules by ID
 */
export async function get(id: string): Promise<Molecules | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://molecules.org.ai/${id}`)
}

/**
 * Search molecules by name or description
 */
export async function search(query: string): Promise<(Molecules)[]> {
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
  '@context': 'https://molecules.org.ai',
  '@id': 'https://molecules.org.ai',
  name: 'molecules.org.ai',
  parent: 'science.org.ai',
  types: ['Molecules']
} as const

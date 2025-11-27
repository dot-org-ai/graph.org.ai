/**
 * species.org.ai
 *
 * Ontology package for species
 *
 * @example
 * ```typescript
 * import { Species, things } from 'species.org.ai'
 * ```
 *
 * @see https://species.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Species } from './types'

// Import types for runtime use
import type { Species } from './types'

/**
 * Collection of all species instances
 * Fetched from https://species.org.ai
 */
export const things: Promise<(Species)[]> = fetch('https://species.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Species by ID
 */
export async function get(id: string): Promise<Species | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://species.org.ai/${id}`)
}

/**
 * Search species by name or description
 */
export async function search(query: string): Promise<(Species)[]> {
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
  '@context': 'https://species.org.ai',
  '@id': 'https://species.org.ai',
  name: 'species.org.ai',
  parent: 'science.org.ai',
  types: ['Species']
} as const

/**
 * gdpval.org.ai
 *
 * Ontology package for gdpval
 *
 * @example
 * ```typescript
 * import { Gdpval, things } from 'gdpval.org.ai'
 * ```
 *
 * @see https://gdpval.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Gdpval } from './types'

// Import types for runtime use
import type { Gdpval } from './types'

/**
 * Collection of all gdpval instances
 * Fetched from https://gdpval.org.ai
 */
export const things: Promise<(Gdpval)[]> = fetch('https://gdpval.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Gdpval by ID
 */
export async function get(id: string): Promise<Gdpval | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://gdpval.org.ai/${id}`)
}

/**
 * Search gdpval by name or description
 */
export async function search(query: string): Promise<(Gdpval)[]> {
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
  '@context': 'https://gdpval.org.ai',
  '@id': 'https://gdpval.org.ai',
  name: 'gdpval.org.ai',
  parent: 'agi.org.ai',
  types: ['Gdpval']
} as const

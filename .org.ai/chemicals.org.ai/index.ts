/**
 * chemicals.org.ai
 *
 * Ontology package for chemicals
 *
 * @example
 * ```typescript
 * import { Chemicals, things } from 'chemicals.org.ai'
 * ```
 *
 * @see https://chemicals.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Chemicals } from './types'

// Import types for runtime use
import type { Chemicals } from './types'

/**
 * Collection of all chemicals instances
 * Fetched from https://chemicals.org.ai
 */
export const things: Promise<(Chemicals)[]> = fetch('https://chemicals.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Chemicals by ID
 */
export async function get(id: string): Promise<Chemicals | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://chemicals.org.ai/${id}`)
}

/**
 * Search chemicals by name or description
 */
export async function search(query: string): Promise<(Chemicals)[]> {
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
  '@context': 'https://chemicals.org.ai',
  '@id': 'https://chemicals.org.ai',
  name: 'chemicals.org.ai',
  parent: 'science.org.ai',
  types: ['Chemicals']
} as const

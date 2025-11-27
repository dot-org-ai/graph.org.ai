/**
 * semantics.org.ai
 *
 * Ontology package for semantics
 *
 * @example
 * ```typescript
 * import { Semantics, things } from 'semantics.org.ai'
 * ```
 *
 * @see https://semantics.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Semantics } from './types'

// Import types for runtime use
import type { Semantics } from './types'

/**
 * Collection of all semantics instances
 * Fetched from https://semantics.org.ai
 */
export const things: Promise<(Semantics)[]> = fetch('https://semantics.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Semantics by ID
 */
export async function get(id: string): Promise<Semantics | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://semantics.org.ai/${id}`)
}

/**
 * Search semantics by name or description
 */
export async function search(query: string): Promise<(Semantics)[]> {
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
  '@context': 'https://semantics.org.ai',
  '@id': 'https://semantics.org.ai',
  name: 'semantics.org.ai',
  parent: 'language.org.ai',
  types: ['Semantics']
} as const

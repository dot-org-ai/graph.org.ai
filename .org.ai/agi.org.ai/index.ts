/**
 * agi.org.ai
 *
 * Ontology package for agi
 *
 * @example
 * ```typescript
 * import { Agi, things } from 'agi.org.ai'
 * ```
 *
 * @see https://agi.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Agi } from './types'

// Import types for runtime use
import type { Agi } from './types'

/**
 * Collection of all agi instances
 * Fetched from https://agi.org.ai
 */
export const things: Promise<(Agi)[]> = fetch('https://agi.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Agi by ID
 */
export async function get(id: string): Promise<Agi | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://agi.org.ai/${id}`)
}

/**
 * Search agi by name or description
 */
export async function search(query: string): Promise<(Agi)[]> {
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
  '@context': 'https://agi.org.ai',
  '@id': 'https://agi.org.ai',
  name: 'agi.org.ai',
  parent: 'agents.org.ai',
  types: ['Agi']
} as const

/**
 * triggers.org.ai
 *
 * Ontology package for triggers
 *
 * @example
 * ```typescript
 * import { Triggers, things } from 'triggers.org.ai'
 * ```
 *
 * @see https://triggers.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Triggers } from './types'

// Import types for runtime use
import type { Triggers } from './types'

/**
 * Collection of all triggers instances
 * Fetched from https://triggers.org.ai
 */
export const things: Promise<(Triggers)[]> = fetch('https://triggers.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Triggers by ID
 */
export async function get(id: string): Promise<Triggers | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://triggers.org.ai/${id}`)
}

/**
 * Search triggers by name or description
 */
export async function search(query: string): Promise<(Triggers)[]> {
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
  '@context': 'https://triggers.org.ai',
  '@id': 'https://triggers.org.ai',
  name: 'triggers.org.ai',
  parent: 'agents.org.ai',
  types: ['Triggers']
} as const

/**
 * aerospace.org.ai
 *
 * Ontology package for aerospace product and parts manufacturing
 *
 * @example
 * ```typescript
 * import { Aerospace, things } from 'aerospace.org.ai'
 * ```
 *
 * @see https://aerospace.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Aerospace } from './types'

// Import types for runtime use
import type { Aerospace } from './types'

/**
 * Collection of all aerospace instances
 * Fetched from https://aerospace.org.ai
 */
export const things: Promise<(Aerospace)[]> = fetch('https://aerospace.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Aerospace by ID
 */
export async function get(id: string): Promise<Aerospace | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://aerospace.org.ai/${id}`)
}

/**
 * Search aerospace by name or description
 */
export async function search(query: string): Promise<(Aerospace)[]> {
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
  '@context': 'https://aerospace.org.ai',
  '@id': 'https://aerospace.org.ai',
  name: 'aerospace.org.ai',
  parent: 'industries.org.ai',
  types: ['Aerospace']
} as const

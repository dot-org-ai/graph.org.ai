/**
 * people.org.ai
 *
 * Human beings.
 *
 * @example
 * ```typescript
 * import { Person, things } from 'people.org.ai'
 * ```
 *
 * @see https://people.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Person } from './types'

// Import types for runtime use
import type { Person } from './types'

/**
 * Collection of all people instances
 * Fetched from https://people.org.ai
 */
export const things: Promise<(Person)[]> = fetch('https://people.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Person by ID
 */
export async function get(id: string): Promise<Person | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://people.org.ai/${id}`)
}

/**
 * Search people by name or description
 */
export async function search(query: string): Promise<(Person)[]> {
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
  '@context': 'https://people.org.ai',
  '@id': 'https://people.org.ai',
  name: 'people.org.ai',
  parent: 'agents.org.ai',
  types: ['Person']
} as const

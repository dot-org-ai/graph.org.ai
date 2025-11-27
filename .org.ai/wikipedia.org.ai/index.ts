/**
 * wikipedia.org.ai
 *
 * Ontology package for wikipedia
 *
 * @example
 * ```typescript
 * import { Wikipedia, things } from 'wikipedia.org.ai'
 * ```
 *
 * @see https://wikipedia.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Wikipedia } from './types'

// Import types for runtime use
import type { Wikipedia } from './types'

/**
 * Collection of all wikipedia instances
 * Fetched from https://wikipedia.org.ai
 */
export const things: Promise<(Wikipedia)[]> = fetch('https://wikipedia.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Wikipedia by ID
 */
export async function get(id: string): Promise<Wikipedia | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://wikipedia.org.ai/${id}`)
}

/**
 * Search wikipedia by name or description
 */
export async function search(query: string): Promise<(Wikipedia)[]> {
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
  '@context': 'https://wikipedia.org.ai',
  '@id': 'https://wikipedia.org.ai',
  name: 'wikipedia.org.ai',
  parent: 'wiki.org.ai',
  types: ['Wikipedia']
} as const

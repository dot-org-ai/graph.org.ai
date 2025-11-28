/**
 * maritime.org.ai
 *
 * Ontology package for maritime industry
 *
 * @example
 * ```typescript
 * import { Maritime, things } from 'maritime.org.ai'
 * ```
 *
 * @see https://maritime.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Maritime } from './types'

// Import types for runtime use
import type { Maritime } from './types'

/**
 * Collection of all maritime instances
 * Fetched from https://maritime.org.ai
 */
export const things: Promise<(Maritime)[]> = fetch('https://maritime.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Maritime by ID
 */
export async function get(id: string): Promise<Maritime | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://maritime.org.ai/${id}`)
}

/**
 * Search maritime by name or description
 */
export async function search(query: string): Promise<(Maritime)[]> {
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
  '@context': 'https://maritime.org.ai',
  '@id': 'https://maritime.org.ai',
  name: 'maritime.org.ai',
  parent: 'logistics.org.ai',
  types: ['Maritime']
} as const

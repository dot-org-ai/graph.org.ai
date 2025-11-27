/**
 * enterprises.org.ai
 *
 * Ontology package for enterprises
 *
 * @example
 * ```typescript
 * import { Enterprises, things } from 'enterprises.org.ai'
 * ```
 *
 * @see https://enterprises.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Enterprises } from './types'

// Import types for runtime use
import type { Enterprises } from './types'

/**
 * Collection of all enterprises instances
 * Fetched from https://enterprises.org.ai
 */
export const things: Promise<(Enterprises)[]> = fetch('https://enterprises.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Enterprises by ID
 */
export async function get(id: string): Promise<Enterprises | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://enterprises.org.ai/${id}`)
}

/**
 * Search enterprises by name or description
 */
export async function search(query: string): Promise<(Enterprises)[]> {
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
  '@context': 'https://enterprises.org.ai',
  '@id': 'https://enterprises.org.ai',
  name: 'enterprises.org.ai',
  parent: 'business.org.ai',
  types: ['Enterprises']
} as const

/**
 * hospitality.org.ai
 *
 * Ontology package for hospitality
 *
 * @example
 * ```typescript
 * import { Hospitality, things } from 'hospitality.org.ai'
 * ```
 *
 * @see https://hospitality.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Hospitality } from './types'

// Import types for runtime use
import type { Hospitality } from './types'

/**
 * Collection of all hospitality instances
 * Fetched from https://hospitality.org.ai
 */
export const things: Promise<(Hospitality)[]> = fetch('https://hospitality.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Hospitality by ID
 */
export async function get(id: string): Promise<Hospitality | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://hospitality.org.ai/${id}`)
}

/**
 * Search hospitality by name or description
 */
export async function search(query: string): Promise<(Hospitality)[]> {
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
  '@context': 'https://hospitality.org.ai',
  '@id': 'https://hospitality.org.ai',
  name: 'hospitality.org.ai',
  parent: 'business.org.ai',
  types: ['Hospitality']
} as const

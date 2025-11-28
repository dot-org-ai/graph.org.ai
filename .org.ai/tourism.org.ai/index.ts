/**
 * tourism.org.ai
 *
 * Ontology package for tourism
 *
 * @example
 * ```typescript
 * import { Tourism, things } from 'tourism.org.ai'
 * ```
 *
 * @see https://tourism.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Tourism } from './types'

// Import types for runtime use
import type { Tourism } from './types'

/**
 * Collection of all tourism instances
 * Fetched from https://tourism.org.ai
 */
export const things: Promise<(Tourism)[]> = fetch('https://tourism.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Tourism by ID
 */
export async function get(id: string): Promise<Tourism | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://tourism.org.ai/${id}`)
}

/**
 * Search tourism by name or description
 */
export async function search(query: string): Promise<(Tourism)[]> {
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
  '@context': 'https://tourism.org.ai',
  '@id': 'https://tourism.org.ai',
  name: 'tourism.org.ai',
  parent: 'business.org.ai',
  types: ['Tourism']
} as const

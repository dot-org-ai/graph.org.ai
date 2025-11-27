/**
 * elements.org.ai
 *
 * Ontology package for elements
 *
 * @example
 * ```typescript
 * import { Elements, things } from 'elements.org.ai'
 * ```
 *
 * @see https://elements.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Elements } from './types'

// Import types for runtime use
import type { Elements } from './types'

/**
 * Collection of all elements instances
 * Fetched from https://elements.org.ai
 */
export const things: Promise<(Elements)[]> = fetch('https://elements.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Elements by ID
 */
export async function get(id: string): Promise<Elements | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://elements.org.ai/${id}`)
}

/**
 * Search elements by name or description
 */
export async function search(query: string): Promise<(Elements)[]> {
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
  '@context': 'https://elements.org.ai',
  '@id': 'https://elements.org.ai',
  name: 'elements.org.ai',
  parent: 'science.org.ai',
  types: ['Elements']
} as const

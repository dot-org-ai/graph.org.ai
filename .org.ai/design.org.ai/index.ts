/**
 * design.org.ai
 *
 * Ontology package for design
 *
 * @example
 * ```typescript
 * import { Design, things } from 'design.org.ai'
 * ```
 *
 * @see https://design.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Design } from './types'

// Import types for runtime use
import type { Design } from './types'

/**
 * Collection of all design instances
 * Fetched from https://design.org.ai
 */
export const things: Promise<(Design)[]> = fetch('https://design.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Design by ID
 */
export async function get(id: string): Promise<Design | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://design.org.ai/${id}`)
}

/**
 * Search design by name or description
 */
export async function search(query: string): Promise<(Design)[]> {
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
  '@context': 'https://design.org.ai',
  '@id': 'https://design.org.ai',
  name: 'design.org.ai',
  parent: 'media.org.ai',
  types: ['Design']
} as const

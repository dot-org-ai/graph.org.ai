/**
 * safety.org.ai
 *
 * Ontology package for safety
 *
 * @example
 * ```typescript
 * import { Safety, things } from 'safety.org.ai'
 * ```
 *
 * @see https://safety.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Safety } from './types'

// Import types for runtime use
import type { Safety } from './types'

/**
 * Collection of all safety instances
 * Fetched from https://safety.org.ai
 */
export const things: Promise<(Safety)[]> = fetch('https://safety.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Safety by ID
 */
export async function get(id: string): Promise<Safety | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://safety.org.ai/${id}`)
}

/**
 * Search safety by name or description
 */
export async function search(query: string): Promise<(Safety)[]> {
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
  '@context': 'https://safety.org.ai',
  '@id': 'https://safety.org.ai',
  name: 'safety.org.ai',
  parent: 'agi.org.ai',
  types: ['Safety']
} as const

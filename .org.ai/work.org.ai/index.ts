/**
 * work.org.ai
 *
 * Ontology package for work
 *
 * @example
 * ```typescript
 * import { Work, things } from 'work.org.ai'
 * ```
 *
 * @see https://work.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Work } from './types'

// Import types for runtime use
import type { Work } from './types'

/**
 * Collection of all work instances
 * Fetched from https://work.org.ai
 */
export const things: Promise<(Work)[]> = fetch('https://work.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Work by ID
 */
export async function get(id: string): Promise<Work | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://work.org.ai/${id}`)
}

/**
 * Search work by name or description
 */
export async function search(query: string): Promise<(Work)[]> {
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
  '@context': 'https://work.org.ai',
  '@id': 'https://work.org.ai',
  name: 'work.org.ai',
  parent: 'business.org.ai',
  types: ['Work']
} as const

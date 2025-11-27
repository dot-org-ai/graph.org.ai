/**
 * engineering.org.ai
 *
 * Ontology package for engineering
 *
 * @example
 * ```typescript
 * import { Engineering, things } from 'engineering.org.ai'
 * ```
 *
 * @see https://engineering.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Engineering } from './types'

// Import types for runtime use
import type { Engineering } from './types'

/**
 * Collection of all engineering instances
 * Fetched from https://engineering.org.ai
 */
export const things: Promise<(Engineering)[]> = fetch('https://engineering.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Engineering by ID
 */
export async function get(id: string): Promise<Engineering | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://engineering.org.ai/${id}`)
}

/**
 * Search engineering by name or description
 */
export async function search(query: string): Promise<(Engineering)[]> {
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
  '@context': 'https://engineering.org.ai',
  '@id': 'https://engineering.org.ai',
  name: 'engineering.org.ai',
  parent: 'work.org.ai',
  types: ['Engineering']
} as const

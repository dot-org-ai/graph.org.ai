/**
 * science.org.ai
 *
 * Systematic enterprise that builds and organizes knowledge.
 *
 * @example
 * ```typescript
 * import { Science, things } from 'science.org.ai'
 * ```
 *
 * @see https://science.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Science } from './types'

// Import types for runtime use
import type { Science } from './types'

/**
 * Collection of all science instances
 * Fetched from https://science.org.ai
 */
export const things: Promise<(Science)[]> = fetch('https://science.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Science by ID
 */
export async function get(id: string): Promise<Science | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://science.org.ai/${id}`)
}

/**
 * Search science by name or description
 */
export async function search(query: string): Promise<(Science)[]> {
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
  '@context': 'https://science.org.ai',
  '@id': 'https://science.org.ai',
  name: 'science.org.ai',
  parent: 'knowledge.org.ai',
  types: ['Science']
} as const

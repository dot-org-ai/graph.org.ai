/**
 * research.org.ai
 *
 * Ontology package for research
 *
 * @example
 * ```typescript
 * import { Research, things } from 'research.org.ai'
 * ```
 *
 * @see https://research.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Research } from './types'

// Import types for runtime use
import type { Research } from './types'

/**
 * Collection of all research instances
 * Fetched from https://research.org.ai
 */
export const things: Promise<(Research)[]> = fetch('https://research.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Research by ID
 */
export async function get(id: string): Promise<Research | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://research.org.ai/${id}`)
}

/**
 * Search research by name or description
 */
export async function search(query: string): Promise<(Research)[]> {
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
  '@context': 'https://research.org.ai',
  '@id': 'https://research.org.ai',
  name: 'research.org.ai',
  parent: 'knowledge.org.ai',
  types: ['Research']
} as const

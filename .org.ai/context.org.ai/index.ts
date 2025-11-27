/**
 * context.org.ai
 *
 * Ontology package for context
 *
 * @example
 * ```typescript
 * import { Context, things } from 'context.org.ai'
 * ```
 *
 * @see https://context.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Context } from './types'

// Import types for runtime use
import type { Context } from './types'

/**
 * Collection of all context instances
 * Fetched from https://context.org.ai
 */
export const things: Promise<(Context)[]> = fetch('https://context.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Context by ID
 */
export async function get(id: string): Promise<Context | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://context.org.ai/${id}`)
}

/**
 * Search context by name or description
 */
export async function search(query: string): Promise<(Context)[]> {
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
  '@context': 'https://context.org.ai',
  '@id': 'https://context.org.ai',
  name: 'context.org.ai',
  parent: 'agents.org.ai',
  types: ['Context']
} as const

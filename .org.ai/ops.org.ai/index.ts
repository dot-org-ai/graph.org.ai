/**
 * ops.org.ai
 *
 * Ontology package for ops
 *
 * @example
 * ```typescript
 * import { Ops, things } from 'ops.org.ai'
 * ```
 *
 * @see https://ops.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Ops } from './types'

// Import types for runtime use
import type { Ops } from './types'

/**
 * Collection of all ops instances
 * Fetched from https://ops.org.ai
 */
export const things: Promise<(Ops)[]> = fetch('https://ops.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Ops by ID
 */
export async function get(id: string): Promise<Ops | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://ops.org.ai/${id}`)
}

/**
 * Search ops by name or description
 */
export async function search(query: string): Promise<(Ops)[]> {
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
  '@context': 'https://ops.org.ai',
  '@id': 'https://ops.org.ai',
  name: 'ops.org.ai',
  parent: 'work.org.ai',
  types: ['Ops']
} as const

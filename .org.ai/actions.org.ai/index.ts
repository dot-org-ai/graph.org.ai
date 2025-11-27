/**
 * actions.org.ai
 *
 * Something done by an agent.
 *
 * @example
 * ```typescript
 * import { Action, things } from 'actions.org.ai'
 * ```
 *
 * @see https://actions.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Action } from './types'

// Import types for runtime use
import type { Action } from './types'

/**
 * Collection of all actions instances
 * Fetched from https://actions.org.ai
 */
export const things: Promise<(Action)[]> = fetch('https://actions.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Action by ID
 */
export async function get(id: string): Promise<Action | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://actions.org.ai/${id}`)
}

/**
 * Search actions by name or description
 */
export async function search(query: string): Promise<(Action)[]> {
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
  '@context': 'https://actions.org.ai',
  '@id': 'https://actions.org.ai',
  name: 'actions.org.ai',
  parent: 'verbs.org.ai',
  types: ['Action']
} as const

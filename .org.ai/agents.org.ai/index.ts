/**
 * agents.org.ai
 *
 * Autonomous or semi-autonomous actors.
 *
 * @example
 * ```typescript
 * import { Agent, things } from 'agents.org.ai'
 * ```
 *
 * @see https://agents.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Agent } from './types'

// Import types for runtime use
import type { Agent } from './types'

/**
 * Collection of all agents instances
 * Fetched from https://agents.org.ai
 */
export const things: Promise<(Agent)[]> = fetch('https://agents.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Agent by ID
 */
export async function get(id: string): Promise<Agent | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://agents.org.ai/${id}`)
}

/**
 * Search agents by name or description
 */
export async function search(query: string): Promise<(Agent)[]> {
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
  '@context': 'https://agents.org.ai',
  '@id': 'https://agents.org.ai',
  name: 'agents.org.ai',
  parent: 'nouns.org.ai',
  types: ['Agent']
} as const

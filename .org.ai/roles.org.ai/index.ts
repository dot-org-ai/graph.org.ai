/**
 * roles.org.ai
 *
 * Capabilities and functions assigned to agents.
 *
 * @example
 * ```typescript
 * import { Role, things } from 'roles.org.ai'
 * ```
 *
 * @see https://roles.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Role } from './types'

// Import types for runtime use
import type { Role } from './types'

/**
 * Collection of all roles instances
 * Fetched from https://roles.org.ai
 */
export const things: Promise<(Role)[]> = fetch('https://roles.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Role by ID
 */
export async function get(id: string): Promise<Role | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://roles.org.ai/${id}`)
}

/**
 * Search roles by name or description
 */
export async function search(query: string): Promise<(Role)[]> {
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
  '@context': 'https://roles.org.ai',
  '@id': 'https://roles.org.ai',
  name: 'roles.org.ai',
  parent: 'agents.org.ai',
  types: ['Role']
} as const

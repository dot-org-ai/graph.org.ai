/**
 * organizations.org.ai
 *
 * Structured groups of people.
 *
 * @example
 * ```typescript
 * import { Organization, things } from 'organizations.org.ai'
 * ```
 *
 * @see https://organizations.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Organization } from './types'

// Import types for runtime use
import type { Organization } from './types'

/**
 * Collection of all organizations instances
 * Fetched from https://organizations.org.ai
 */
export const things: Promise<(Organization)[]> = fetch('https://organizations.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Organization by ID
 */
export async function get(id: string): Promise<Organization | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://organizations.org.ai/${id}`)
}

/**
 * Search organizations by name or description
 */
export async function search(query: string): Promise<(Organization)[]> {
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
  '@context': 'https://organizations.org.ai',
  '@id': 'https://organizations.org.ai',
  name: 'organizations.org.ai',
  parent: 'agents.org.ai',
  types: ['Organization']
} as const

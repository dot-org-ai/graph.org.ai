/**
 * startups.org.ai
 *
 * New business ventures.
 *
 * @example
 * ```typescript
 * import { Startup, things } from 'startups.org.ai'
 * ```
 *
 * @see https://startups.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Startup } from './types'

// Import types for runtime use
import type { Startup } from './types'

/**
 * Collection of all startups instances
 * Fetched from https://startups.org.ai
 */
export const things: Promise<(Startup)[]> = fetch('https://startups.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Startup by ID
 */
export async function get(id: string): Promise<Startup | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://startups.org.ai/${id}`)
}

/**
 * Search startups by name or description
 */
export async function search(query: string): Promise<(Startup)[]> {
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
  '@context': 'https://startups.org.ai',
  '@id': 'https://startups.org.ai',
  name: 'startups.org.ai',
  parent: 'business.org.ai',
  types: ['Startup']
} as const

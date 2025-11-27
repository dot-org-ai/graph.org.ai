/**
 * readme.md.org.ai
 *
 * Standard specification for README.md files, describing projects and domains.
 *
 * @example
 * ```typescript
 * import { Readme, things } from 'readme.md.org.ai'
 * ```
 *
 * @see https://readme.md.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Readme } from './types'

// Import types for runtime use
import type { Readme } from './types'

/**
 * Collection of all readme.md instances
 * Fetched from https://readme.md.org.ai
 */
export const things: Promise<(Readme)[]> = fetch('https://readme.md.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Readme by ID
 */
export async function get(id: string): Promise<Readme | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://readme.md.org.ai/${id}`)
}

/**
 * Search readme.md by name or description
 */
export async function search(query: string): Promise<(Readme)[]> {
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
  '@context': 'https://readme.md.org.ai',
  '@id': 'https://readme.md.org.ai',
  name: 'readme.md.org.ai',
  parent: 'markdown.org.ai',
  types: ['Readme']
} as const

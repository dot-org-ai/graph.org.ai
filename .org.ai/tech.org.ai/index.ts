/**
 * tech.org.ai
 *
 * Technology stacks and software.
 *
 * @example
 * ```typescript
 * import { Technology, things } from 'tech.org.ai'
 * ```
 *
 * @see https://tech.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Technology, Stack } from './types'

// Import types for runtime use
import type { Technology, Stack } from './types'

/**
 * Collection of all tech instances
 * Fetched from https://tech.org.ai
 */
export const things: Promise<(Technology | Stack)[]> = fetch('https://tech.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Technology by ID
 */
export async function get(id: string): Promise<Technology | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://tech.org.ai/${id}`)
}

/**
 * Search tech by name or description
 */
export async function search(query: string): Promise<(Technology | Stack)[]> {
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
  '@context': 'https://tech.org.ai',
  '@id': 'https://tech.org.ai',
  name: 'tech.org.ai',
  parent: 'things.org.ai',
  types: ['Technology', 'Stack']
} as const

/**
 * robotics.org.ai
 *
 * Ontology package for robotics
 *
 * @example
 * ```typescript
 * import { Robotics, things } from 'robotics.org.ai'
 * ```
 *
 * @see https://robotics.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Robotics } from './types'

// Import types for runtime use
import type { Robotics } from './types'

/**
 * Collection of all robotics instances
 * Fetched from https://robotics.org.ai
 */
export const things: Promise<(Robotics)[]> = fetch('https://robotics.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Robotics by ID
 */
export async function get(id: string): Promise<Robotics | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://robotics.org.ai/${id}`)
}

/**
 * Search robotics by name or description
 */
export async function search(query: string): Promise<(Robotics)[]> {
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
  '@context': 'https://robotics.org.ai',
  '@id': 'https://robotics.org.ai',
  name: 'robotics.org.ai',
  parent: 'tech.org.ai',
  types: ['Robotics']
} as const

/**
 * schedules.org.ai
 *
 * Ontology package for schedules
 *
 * @example
 * ```typescript
 * import { Schedules, things } from 'schedules.org.ai'
 * ```
 *
 * @see https://schedules.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Schedules } from './types'

// Import types for runtime use
import type { Schedules } from './types'

/**
 * Collection of all schedules instances
 * Fetched from https://schedules.org.ai
 */
export const things: Promise<(Schedules)[]> = fetch('https://schedules.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Schedules by ID
 */
export async function get(id: string): Promise<Schedules | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://schedules.org.ai/${id}`)
}

/**
 * Search schedules by name or description
 */
export async function search(query: string): Promise<(Schedules)[]> {
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
  '@context': 'https://schedules.org.ai',
  '@id': 'https://schedules.org.ai',
  name: 'schedules.org.ai',
  parent: 'agents.org.ai',
  types: ['Schedules']
} as const

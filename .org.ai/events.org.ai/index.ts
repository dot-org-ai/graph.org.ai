/**
 * events.org.ai
 *
 * Unified event model connecting verbs to 5W+H (Who, What, Where, When, Why, How), extending EPCIS.
 *
 * @example
 * ```typescript
 * import { Event, things } from 'events.org.ai'
 * ```
 *
 * @see https://events.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Event } from './types'

// Import types for runtime use
import type { Event } from './types'

/**
 * Collection of all events instances
 * Fetched from https://events.org.ai
 */
export const things: Promise<(Event)[]> = fetch('https://events.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Event by ID
 */
export async function get(id: string): Promise<Event | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://events.org.ai/${id}`)
}

/**
 * Search events by name or description
 */
export async function search(query: string): Promise<(Event)[]> {
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
  '@context': 'https://events.org.ai',
  '@id': 'https://events.org.ai',
  name: 'events.org.ai',
  parent: 'verbs.org.ai',
  types: ['Event']
} as const

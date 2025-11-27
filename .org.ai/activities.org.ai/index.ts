/**
 * activities.org.ai
 *
 * Standardized definitions of ongoing actions and processes.
 *
 * @example
 * ```typescript
 * import { Activity, things } from 'activities.org.ai'
 * ```
 *
 * @see https://activities.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Activity } from './types'

// Import types for runtime use
import type { Activity } from './types'

/**
 * Collection of all activities instances
 * Fetched from https://activities.org.ai
 */
export const things: Promise<(Activity)[]> = fetch('https://activities.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Activity by ID
 */
export async function get(id: string): Promise<Activity | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://activities.org.ai/${id}`)
}

/**
 * Search activities by name or description
 */
export async function search(query: string): Promise<(Activity)[]> {
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
  '@context': 'https://activities.org.ai',
  '@id': 'https://activities.org.ai',
  name: 'activities.org.ai',
  parent: 'actions.org.ai',
  types: ['Activity']
} as const

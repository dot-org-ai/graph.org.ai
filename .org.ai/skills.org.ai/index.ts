/**
 * skills.org.ai
 *
 * Abilities required for tasks.
 *
 * @example
 * ```typescript
 * import { Skill, things } from 'skills.org.ai'
 * ```
 *
 * @see https://skills.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Skill } from './types'

// Import types for runtime use
import type { Skill } from './types'

/**
 * Collection of all skills instances
 * Fetched from https://skills.org.ai
 */
export const things: Promise<(Skill)[]> = fetch('https://skills.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Skill by ID
 */
export async function get(id: string): Promise<Skill | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://skills.org.ai/${id}`)
}

/**
 * Search skills by name or description
 */
export async function search(query: string): Promise<(Skill)[]> {
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
  '@context': 'https://skills.org.ai',
  '@id': 'https://skills.org.ai',
  name: 'skills.org.ai',
  parent: 'knowledge.org.ai',
  types: ['Skill']
} as const

/**
 * onet.org.ai
 *
 * Standardized occupational skills, tools, and technology classifications.
 *
 * @example
 * ```typescript
 * import { Occupation, things } from 'onet.org.ai'
 * ```
 *
 * @see https://onet.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Occupation, Task, Activity, Tool, Technology, Skill } from './types'

// Import types for runtime use
import type { Occupation, Task, Activity, Tool, Technology, Skill } from './types'

/**
 * Collection of all onet instances
 * Fetched from https://onet.org.ai
 */
export const things: Promise<(Occupation | Task | Activity | Tool | Technology | Skill)[]> = fetch('https://onet.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Occupation by ID
 */
export async function get(id: string): Promise<Occupation | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://onet.org.ai/${id}`)
}

/**
 * Search onet by name or description
 */
export async function search(query: string): Promise<(Occupation | Task | Activity | Tool | Technology | Skill)[]> {
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
  '@context': 'https://onet.org.ai',
  '@id': 'https://onet.org.ai',
  name: 'onet.org.ai',
  parent: 'standards.org.ai',
  types: ['Occupation', 'Task', 'Activity', 'Tool', 'Technology', 'Skill']
} as const

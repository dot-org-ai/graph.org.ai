/**
 * apqc.org.ai
 *
 * Standardized business process and activity classifications.
 *
 * @example
 * ```typescript
 * import { Process, things } from 'apqc.org.ai'
 * ```
 *
 * @see https://apqc.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Process, Activity, Task } from './types'

// Import types for runtime use
import type { Process, Activity, Task } from './types'

/**
 * Collection of all apqc instances
 * Fetched from https://apqc.org.ai
 */
export const things: Promise<(Process | Activity | Task)[]> = fetch('https://apqc.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Process by ID
 */
export async function get(id: string): Promise<Process | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://apqc.org.ai/${id}`)
}

/**
 * Search apqc by name or description
 */
export async function search(query: string): Promise<(Process | Activity | Task)[]> {
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
  '@context': 'https://apqc.org.ai',
  '@id': 'https://apqc.org.ai',
  name: 'apqc.org.ai',
  parent: 'standards.org.ai',
  types: ['Process', 'Activity', 'Task']
} as const

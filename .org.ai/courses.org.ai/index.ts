/**
 * courses.org.ai
 *
 * Ontology package for courses
 *
 * @example
 * ```typescript
 * import { Courses, things } from 'courses.org.ai'
 * ```
 *
 * @see https://courses.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Courses } from './types'

// Import types for runtime use
import type { Courses } from './types'

/**
 * Collection of all courses instances
 * Fetched from https://courses.org.ai
 */
export const things: Promise<(Courses)[]> = fetch('https://courses.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Courses by ID
 */
export async function get(id: string): Promise<Courses | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://courses.org.ai/${id}`)
}

/**
 * Search courses by name or description
 */
export async function search(query: string): Promise<(Courses)[]> {
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
  '@context': 'https://courses.org.ai',
  '@id': 'https://courses.org.ai',
  name: 'courses.org.ai',
  parent: 'education.org.ai',
  types: ['Courses']
} as const

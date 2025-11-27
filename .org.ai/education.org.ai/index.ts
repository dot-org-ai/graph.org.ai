/**
 * education.org.ai
 *
 * Learning, teaching, and training.
 *
 * @example
 * ```typescript
 * import { EducationalOrganization, things } from 'education.org.ai'
 * ```
 *
 * @see https://education.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { EducationalOrganization, Course } from './types'

// Import types for runtime use
import type { EducationalOrganization, Course } from './types'

/**
 * Collection of all education instances
 * Fetched from https://education.org.ai
 */
export const things: Promise<(EducationalOrganization | Course)[]> = fetch('https://education.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific EducationalOrganization by ID
 */
export async function get(id: string): Promise<EducationalOrganization | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://education.org.ai/${id}`)
}

/**
 * Search education by name or description
 */
export async function search(query: string): Promise<(EducationalOrganization | Course)[]> {
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
  '@context': 'https://education.org.ai',
  '@id': 'https://education.org.ai',
  name: 'education.org.ai',
  parent: 'knowledge.org.ai',
  types: ['EducationalOrganization', 'Course']
} as const

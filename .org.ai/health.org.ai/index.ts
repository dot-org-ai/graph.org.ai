/**
 * health.org.ai
 *
 * Health and medical related concepts.
 *
 * @example
 * ```typescript
 * import { MedicalEntity, things } from 'health.org.ai'
 * ```
 *
 * @see https://health.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { MedicalEntity } from './types'

// Import types for runtime use
import type { MedicalEntity } from './types'

/**
 * Collection of all health instances
 * Fetched from https://health.org.ai
 */
export const things: Promise<(MedicalEntity)[]> = fetch('https://health.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific MedicalEntity by ID
 */
export async function get(id: string): Promise<MedicalEntity | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://health.org.ai/${id}`)
}

/**
 * Search health by name or description
 */
export async function search(query: string): Promise<(MedicalEntity)[]> {
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
  '@context': 'https://health.org.ai',
  '@id': 'https://health.org.ai',
  name: 'health.org.ai',
  parent: 'science.org.ai',
  types: ['MedicalEntity']
} as const

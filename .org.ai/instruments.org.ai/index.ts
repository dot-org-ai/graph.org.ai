/**
 * instruments.org.ai
 *
 * Ontology package for instruments
 *
 * @example
 * ```typescript
 * import { Instruments, things } from 'instruments.org.ai'
 * ```
 *
 * @see https://instruments.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Instruments } from './types'

// Import types for runtime use
import type { Instruments } from './types'

/**
 * Collection of all instruments instances
 * Fetched from https://instruments.org.ai
 */
export const things: Promise<(Instruments)[]> = fetch('https://instruments.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Instruments by ID
 */
export async function get(id: string): Promise<Instruments | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://instruments.org.ai/${id}`)
}

/**
 * Search instruments by name or description
 */
export async function search(query: string): Promise<(Instruments)[]> {
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
  '@context': 'https://instruments.org.ai',
  '@id': 'https://instruments.org.ai',
  name: 'instruments.org.ai',
  parent: 'things.org.ai',
  types: ['Instruments']
} as const

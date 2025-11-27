/**
 * energy.org.ai
 *
 * Ontology package for energy
 *
 * @example
 * ```typescript
 * import { Energy, things } from 'energy.org.ai'
 * ```
 *
 * @see https://energy.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Energy } from './types'

// Import types for runtime use
import type { Energy } from './types'

/**
 * Collection of all energy instances
 * Fetched from https://energy.org.ai
 */
export const things: Promise<(Energy)[]> = fetch('https://energy.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Energy by ID
 */
export async function get(id: string): Promise<Energy | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://energy.org.ai/${id}`)
}

/**
 * Search energy by name or description
 */
export async function search(query: string): Promise<(Energy)[]> {
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
  '@context': 'https://energy.org.ai',
  '@id': 'https://energy.org.ai',
  name: 'energy.org.ai',
  parent: 'science.org.ai',
  types: ['Energy']
} as const

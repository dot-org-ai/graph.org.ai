/**
 * materials.org.ai
 *
 * Ontology package for materials
 *
 * @example
 * ```typescript
 * import { Materials, things } from 'materials.org.ai'
 * ```
 *
 * @see https://materials.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Materials } from './types'

// Import types for runtime use
import type { Materials } from './types'

/**
 * Collection of all materials instances
 * Fetched from https://materials.org.ai
 */
export const things: Promise<(Materials)[]> = fetch('https://materials.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Materials by ID
 */
export async function get(id: string): Promise<Materials | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://materials.org.ai/${id}`)
}

/**
 * Search materials by name or description
 */
export async function search(query: string): Promise<(Materials)[]> {
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
  '@context': 'https://materials.org.ai',
  '@id': 'https://materials.org.ai',
  name: 'materials.org.ai',
  parent: 'science.org.ai',
  types: ['Materials']
} as const

/**
 * code.org.ai
 *
 * Ontology package for code
 *
 * @example
 * ```typescript
 * import { Code, things } from 'code.org.ai'
 * ```
 *
 * @see https://code.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Code } from './types'

// Import types for runtime use
import type { Code } from './types'

/**
 * Collection of all code instances
 * Fetched from https://code.org.ai
 */
export const things: Promise<(Code)[]> = fetch('https://code.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Code by ID
 */
export async function get(id: string): Promise<Code | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://code.org.ai/${id}`)
}

/**
 * Search code by name or description
 */
export async function search(query: string): Promise<(Code)[]> {
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
  '@context': 'https://code.org.ai',
  '@id': 'https://code.org.ai',
  name: 'code.org.ai',
  parent: 'tech.org.ai',
  types: ['Code']
} as const

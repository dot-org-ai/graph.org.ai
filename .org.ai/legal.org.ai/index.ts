/**
 * legal.org.ai
 *
 * Legal documents and processes.
 *
 * @example
 * ```typescript
 * import { LegalService, things } from 'legal.org.ai'
 * ```
 *
 * @see https://legal.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { LegalService } from './types'

// Import types for runtime use
import type { LegalService } from './types'

/**
 * Collection of all legal instances
 * Fetched from https://legal.org.ai
 */
export const things: Promise<(LegalService)[]> = fetch('https://legal.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific LegalService by ID
 */
export async function get(id: string): Promise<LegalService | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://legal.org.ai/${id}`)
}

/**
 * Search legal by name or description
 */
export async function search(query: string): Promise<(LegalService)[]> {
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
  '@context': 'https://legal.org.ai',
  '@id': 'https://legal.org.ai',
  name: 'legal.org.ai',
  parent: 'law.org.ai',
  types: ['LegalService']
} as const

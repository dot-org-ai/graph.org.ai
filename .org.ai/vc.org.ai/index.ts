/**
 * vc.org.ai
 *
 * Venture Capital.
 *
 * @example
 * ```typescript
 * import { Investment, things } from 'vc.org.ai'
 * ```
 *
 * @see https://vc.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Investment } from './types'

// Import types for runtime use
import type { Investment } from './types'

/**
 * Collection of all vc instances
 * Fetched from https://vc.org.ai
 */
export const things: Promise<(Investment)[]> = fetch('https://vc.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Investment by ID
 */
export async function get(id: string): Promise<Investment | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://vc.org.ai/${id}`)
}

/**
 * Search vc by name or description
 */
export async function search(query: string): Promise<(Investment)[]> {
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
  '@context': 'https://vc.org.ai',
  '@id': 'https://vc.org.ai',
  name: 'vc.org.ai',
  parent: 'finance.org.ai',
  types: ['Investment']
} as const

/**
 * companies.org.ai
 *
 * Registered corporate entities.
 *
 * @example
 * ```typescript
 * import { Company, things } from 'companies.org.ai'
 * ```
 *
 * @see https://companies.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Company, Corporation } from './types'

// Import types for runtime use
import type { Company, Corporation } from './types'

/**
 * Collection of all companies instances
 * Fetched from https://companies.org.ai
 */
export const things: Promise<(Company | Corporation)[]> = fetch('https://companies.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Company by ID
 */
export async function get(id: string): Promise<Company | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://companies.org.ai/${id}`)
}

/**
 * Search companies by name or description
 */
export async function search(query: string): Promise<(Company | Corporation)[]> {
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
  '@context': 'https://companies.org.ai',
  '@id': 'https://companies.org.ai',
  name: 'companies.org.ai',
  parent: 'business.org.ai',
  types: ['Company', 'Corporation']
} as const

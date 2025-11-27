/**
 * contracts.org.ai
 *
 * Ontology package for contracts
 *
 * @example
 * ```typescript
 * import { Contracts, things } from 'contracts.org.ai'
 * ```
 *
 * @see https://contracts.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Contracts } from './types'

// Import types for runtime use
import type { Contracts } from './types'

/**
 * Collection of all contracts instances
 * Fetched from https://contracts.org.ai
 */
export const things: Promise<(Contracts)[]> = fetch('https://contracts.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Contracts by ID
 */
export async function get(id: string): Promise<Contracts | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://contracts.org.ai/${id}`)
}

/**
 * Search contracts by name or description
 */
export async function search(query: string): Promise<(Contracts)[]> {
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
  '@context': 'https://contracts.org.ai',
  '@id': 'https://contracts.org.ai',
  name: 'contracts.org.ai',
  parent: 'law.org.ai',
  types: ['Contracts']
} as const

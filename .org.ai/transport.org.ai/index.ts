/**
 * transport.org.ai
 *
 * Ontology package for transport
 *
 * @example
 * ```typescript
 * import { Transport, things } from 'transport.org.ai'
 * ```
 *
 * @see https://transport.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Transport } from './types'

// Import types for runtime use
import type { Transport } from './types'

/**
 * Collection of all transport instances
 * Fetched from https://transport.org.ai
 */
export const things: Promise<(Transport)[]> = fetch('https://transport.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Transport by ID
 */
export async function get(id: string): Promise<Transport | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://transport.org.ai/${id}`)
}

/**
 * Search transport by name or description
 */
export async function search(query: string): Promise<(Transport)[]> {
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
  '@context': 'https://transport.org.ai',
  '@id': 'https://transport.org.ai',
  name: 'transport.org.ai',
  parent: 'business.org.ai',
  types: ['Transport']
} as const

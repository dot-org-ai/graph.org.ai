/**
 * mcp.org.ai
 *
 * Ontology package for mcp
 *
 * @example
 * ```typescript
 * import { Mcp, things } from 'mcp.org.ai'
 * ```
 *
 * @see https://mcp.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Mcp } from './types'

// Import types for runtime use
import type { Mcp } from './types'

/**
 * Collection of all mcp instances
 * Fetched from https://mcp.org.ai
 */
export const things: Promise<(Mcp)[]> = fetch('https://mcp.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Mcp by ID
 */
export async function get(id: string): Promise<Mcp | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://mcp.org.ai/${id}`)
}

/**
 * Search mcp by name or description
 */
export async function search(query: string): Promise<(Mcp)[]> {
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
  '@context': 'https://mcp.org.ai',
  '@id': 'https://mcp.org.ai',
  name: 'mcp.org.ai',
  parent: 'agents.org.ai',
  types: ['Mcp']
} as const

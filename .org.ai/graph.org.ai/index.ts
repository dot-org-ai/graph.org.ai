/**
 * graph.org.ai
 *
 * The meta-graph definition and core ontology for the .org.ai ecosystem.
 *
 * @example
 * ```typescript
 * import { Graph, things } from 'graph.org.ai'
 * ```
 *
 * @see https://graph.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Graph, Ontology, Schema } from './types'

// Import types for runtime use
import type { Graph, Ontology, Schema } from './types'

/**
 * Collection of all graph instances
 * Fetched from https://graph.org.ai
 */
export const things: Promise<(Graph | Ontology | Schema)[]> = fetch('https://graph.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Graph by ID
 */
export async function get(id: string): Promise<Graph | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://graph.org.ai/${id}`)
}

/**
 * Search graph by name or description
 */
export async function search(query: string): Promise<(Graph | Ontology | Schema)[]> {
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
  '@context': 'https://graph.org.ai',
  '@id': 'https://graph.org.ai',
  name: 'graph.org.ai',
  parent: 'graph.org.ai',
  types: ['Graph', 'Ontology', 'Schema']
} as const

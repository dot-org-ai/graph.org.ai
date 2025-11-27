/**
 * workflows.org.ai
 *
 * Ontology package for workflows
 *
 * @example
 * ```typescript
 * import { Workflows, things } from 'workflows.org.ai'
 * ```
 *
 * @see https://workflows.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Workflows } from './types'

// Import types for runtime use
import type { Workflows } from './types'

/**
 * Collection of all workflows instances
 * Fetched from https://workflows.org.ai
 */
export const things: Promise<(Workflows)[]> = fetch('https://workflows.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Workflows by ID
 */
export async function get(id: string): Promise<Workflows | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://workflows.org.ai/${id}`)
}

/**
 * Search workflows by name or description
 */
export async function search(query: string): Promise<(Workflows)[]> {
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
  '@context': 'https://workflows.org.ai',
  '@id': 'https://workflows.org.ai',
  name: 'workflows.org.ai',
  parent: 'agents.org.ai',
  types: ['Workflows']
} as const

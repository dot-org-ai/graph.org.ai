/**
 * agents.md.org.ai
 *
 * Standard specification for AGENTS.md files, defining agent profiles and capabilities.
 *
 * @example
 * ```typescript
 * import { AgentProfile, things } from 'agents.md.org.ai'
 * ```
 *
 * @see https://agents.md.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { AgentProfile } from './types'

// Import types for runtime use
import type { AgentProfile } from './types'

/**
 * Collection of all agents.md instances
 * Fetched from https://agents.md.org.ai
 */
export const things: Promise<(AgentProfile)[]> = fetch('https://agents.md.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific AgentProfile by ID
 */
export async function get(id: string): Promise<AgentProfile | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://agents.md.org.ai/${id}`)
}

/**
 * Search agents.md by name or description
 */
export async function search(query: string): Promise<(AgentProfile)[]> {
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
  '@context': 'https://agents.md.org.ai',
  '@id': 'https://agents.md.org.ai',
  name: 'agents.md.org.ai',
  parent: 'markdown.org.ai',
  types: ['AgentProfile']
} as const

/**
 * tools.org.ai
 *
 * Instruments used to perform actions.
 *
 * @example
 * ```typescript
 * import { Tool, things } from 'tools.org.ai'
 * ```
 *
 * @see https://tools.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Tool } from './types'

// Import types for runtime use
import type { Tool } from './types'

/**
 * Collection of all tools instances
 * Fetched from https://tools.org.ai
 */
export const things: Promise<(Tool)[]> = fetch('https://tools.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Tool by ID
 */
export async function get(id: string): Promise<Tool | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://tools.org.ai/${id}`)
}

/**
 * Search tools by name or description
 */
export async function search(query: string): Promise<(Tool)[]> {
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
  '@context': 'https://tools.org.ai',
  '@id': 'https://tools.org.ai',
  name: 'tools.org.ai',
  parent: 'things.org.ai',
  types: ['Tool']
} as const

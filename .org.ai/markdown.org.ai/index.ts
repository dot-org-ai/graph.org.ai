/**
 * markdown.org.ai
 *
 * Ontology package for markdown
 *
 * @example
 * ```typescript
 * import { Markdown, things } from 'markdown.org.ai'
 * ```
 *
 * @see https://markdown.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Markdown } from './types'

// Import types for runtime use
import type { Markdown } from './types'

/**
 * Collection of all markdown instances
 * Fetched from https://markdown.org.ai
 */
export const things: Promise<(Markdown)[]> = fetch('https://markdown.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Markdown by ID
 */
export async function get(id: string): Promise<Markdown | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://markdown.org.ai/${id}`)
}

/**
 * Search markdown by name or description
 */
export async function search(query: string): Promise<(Markdown)[]> {
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
  '@context': 'https://markdown.org.ai',
  '@id': 'https://markdown.org.ai',
  name: 'markdown.org.ai',
  parent: 'things.org.ai',
  types: ['Markdown']
} as const

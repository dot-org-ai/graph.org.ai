/**
 * md.org.ai
 *
 * Standard Markdown file format conventions and specifications.
 *
 * @example
 * ```typescript
 * import { MarkdownFile, things } from 'md.org.ai'
 * ```
 *
 * @see https://md.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { MarkdownFile } from './types'

// Import types for runtime use
import type { MarkdownFile } from './types'

/**
 * Collection of all md instances
 * Fetched from https://md.org.ai
 */
export const things: Promise<(MarkdownFile)[]> = fetch('https://md.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific MarkdownFile by ID
 */
export async function get(id: string): Promise<MarkdownFile | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://md.org.ai/${id}`)
}

/**
 * Search md by name or description
 */
export async function search(query: string): Promise<(MarkdownFile)[]> {
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
  '@context': 'https://md.org.ai',
  '@id': 'https://md.org.ai',
  name: 'md.org.ai',
  parent: 'markdown.org.ai',
  types: ['MarkdownFile']
} as const

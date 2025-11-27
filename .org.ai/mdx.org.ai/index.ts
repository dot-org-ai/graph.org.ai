/**
 * mdx.org.ai
 *
 * MDXLD standard: YAML-LD embedded in MDX for structured data + content + code + UI.
 *
 * @example
 * ```typescript
 * import { MDXLD, things } from 'mdx.org.ai'
 * ```
 *
 * @see https://mdx.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { MDXLD } from './types'

// Import types for runtime use
import type { MDXLD } from './types'

/**
 * Collection of all mdx instances
 * Fetched from https://mdx.org.ai
 */
export const things: Promise<(MDXLD)[]> = fetch('https://mdx.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific MDXLD by ID
 */
export async function get(id: string): Promise<MDXLD | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://mdx.org.ai/${id}`)
}

/**
 * Search mdx by name or description
 */
export async function search(query: string): Promise<(MDXLD)[]> {
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
  '@context': 'https://mdx.org.ai',
  '@id': 'https://mdx.org.ai',
  name: 'mdx.org.ai',
  parent: 'markdown.org.ai',
  types: ['MDXLD']
} as const

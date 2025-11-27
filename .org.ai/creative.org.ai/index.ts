/**
 * creative.org.ai
 *
 * Creative works.
 *
 * @example
 * ```typescript
 * import { CreativeWork, things } from 'creative.org.ai'
 * ```
 *
 * @see https://creative.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { CreativeWork } from './types'

// Import types for runtime use
import type { CreativeWork } from './types'

/**
 * Collection of all creative instances
 * Fetched from https://creative.org.ai
 */
export const things: Promise<(CreativeWork)[]> = fetch('https://creative.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific CreativeWork by ID
 */
export async function get(id: string): Promise<CreativeWork | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://creative.org.ai/${id}`)
}

/**
 * Search creative by name or description
 */
export async function search(query: string): Promise<(CreativeWork)[]> {
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
  '@context': 'https://creative.org.ai',
  '@id': 'https://creative.org.ai',
  name: 'creative.org.ai',
  parent: 'media.org.ai',
  types: ['CreativeWork']
} as const

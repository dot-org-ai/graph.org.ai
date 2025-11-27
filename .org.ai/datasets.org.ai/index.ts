/**
 * datasets.org.ai
 *
 * Structured collections of data.
 *
 * @example
 * ```typescript
 * import { Dataset, things } from 'datasets.org.ai'
 * ```
 *
 * @see https://datasets.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Dataset } from './types'

// Import types for runtime use
import type { Dataset } from './types'

/**
 * Collection of all datasets instances
 * Fetched from https://datasets.org.ai
 */
export const things: Promise<(Dataset)[]> = fetch('https://datasets.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Dataset by ID
 */
export async function get(id: string): Promise<Dataset | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://datasets.org.ai/${id}`)
}

/**
 * Search datasets by name or description
 */
export async function search(query: string): Promise<(Dataset)[]> {
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
  '@context': 'https://datasets.org.ai',
  '@id': 'https://datasets.org.ai',
  name: 'datasets.org.ai',
  parent: 'knowledge.org.ai',
  types: ['Dataset']
} as const

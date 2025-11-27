/**
 * reports.org.ai
 *
 * Ontology package for reports
 *
 * @example
 * ```typescript
 * import { Reports, things } from 'reports.org.ai'
 * ```
 *
 * @see https://reports.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Reports } from './types'

// Import types for runtime use
import type { Reports } from './types'

/**
 * Collection of all reports instances
 * Fetched from https://reports.org.ai
 */
export const things: Promise<(Reports)[]> = fetch('https://reports.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Reports by ID
 */
export async function get(id: string): Promise<Reports | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://reports.org.ai/${id}`)
}

/**
 * Search reports by name or description
 */
export async function search(query: string): Promise<(Reports)[]> {
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
  '@context': 'https://reports.org.ai',
  '@id': 'https://reports.org.ai',
  name: 'reports.org.ai',
  parent: 'media.org.ai',
  types: ['Reports']
} as const

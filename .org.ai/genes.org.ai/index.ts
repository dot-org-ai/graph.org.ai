/**
 * genes.org.ai
 *
 * Ontology package for genes
 *
 * @example
 * ```typescript
 * import { Genes, things } from 'genes.org.ai'
 * ```
 *
 * @see https://genes.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Genes } from './types'

// Import types for runtime use
import type { Genes } from './types'

/**
 * Collection of all genes instances
 * Fetched from https://genes.org.ai
 */
export const things: Promise<(Genes)[]> = fetch('https://genes.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Genes by ID
 */
export async function get(id: string): Promise<Genes | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://genes.org.ai/${id}`)
}

/**
 * Search genes by name or description
 */
export async function search(query: string): Promise<(Genes)[]> {
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
  '@context': 'https://genes.org.ai',
  '@id': 'https://genes.org.ai',
  name: 'genes.org.ai',
  parent: 'science.org.ai',
  types: ['Genes']
} as const

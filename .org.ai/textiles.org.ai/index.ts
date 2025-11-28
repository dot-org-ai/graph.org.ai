/**
 * textiles.org.ai
 *
 * Ontology package for textiles industry
 *
 * @example
 * ```typescript
 * import { Textiles, TextileMills, Apparel, things } from 'textiles.org.ai'
 * ```
 *
 * @see https://textiles.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type {
  Textiles,
  TextileMills,
  TextileProducts,
  Apparel,
  TechnicalTextiles,
  SustainableTextiles,
  TextileTech
} from './types'

// Import types for runtime use
import type {
  Textiles,
  TextileMills,
  TextileProducts,
  Apparel,
  TechnicalTextiles,
  SustainableTextiles,
  TextileTech
} from './types'

/**
 * Collection of all textiles instances
 * Fetched from https://textiles.org.ai
 */
export const things: Promise<(Textiles)[]> = fetch('https://textiles.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Textiles by ID
 */
export async function get(id: string): Promise<Textiles | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://textiles.org.ai/${id}`)
}

/**
 * Search textiles by name or description
 */
export async function search(query: string): Promise<(Textiles)[]> {
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
  '@context': 'https://textiles.org.ai',
  '@id': 'https://textiles.org.ai',
  name: 'textiles.org.ai',
  parent: 'industries.org.ai',
  types: [
    'Textiles',
    'TextileMills',
    'TextileProducts',
    'Apparel',
    'TechnicalTextiles',
    'SustainableTextiles',
    'TextileTech'
  ]
} as const

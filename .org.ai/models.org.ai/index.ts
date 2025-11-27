/**
 * models.org.ai
 *
 * AI and Statistical Models.
 *
 * @example
 * ```typescript
 * import { AIModel, things } from 'models.org.ai'
 * ```
 *
 * @see https://models.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { AIModel, MLModel } from './types'

// Import types for runtime use
import type { AIModel, MLModel } from './types'

/**
 * Collection of all models instances
 * Fetched from https://models.org.ai
 */
export const things: Promise<(AIModel | MLModel)[]> = fetch('https://models.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific AIModel by ID
 */
export async function get(id: string): Promise<AIModel | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://models.org.ai/${id}`)
}

/**
 * Search models by name or description
 */
export async function search(query: string): Promise<(AIModel | MLModel)[]> {
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
  '@context': 'https://models.org.ai',
  '@id': 'https://models.org.ai',
  name: 'models.org.ai',
  parent: 'tech.org.ai',
  types: ['AIModel', 'MLModel']
} as const

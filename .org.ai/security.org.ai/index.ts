/**
 * security.org.ai
 *
 * Ontology package for security
 *
 * @example
 * ```typescript
 * import { Security, things } from 'security.org.ai'
 * ```
 *
 * @see https://security.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Security } from './types'

// Import types for runtime use
import type { Security } from './types'

/**
 * Collection of all security instances
 * Fetched from https://security.org.ai
 */
export const things: Promise<(Security)[]> = fetch('https://security.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Security by ID
 */
export async function get(id: string): Promise<Security | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://security.org.ai/${id}`)
}

/**
 * Search security by name or description
 */
export async function search(query: string): Promise<(Security)[]> {
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
  '@context': 'https://security.org.ai',
  '@id': 'https://security.org.ai',
  name: 'security.org.ai',
  parent: 'tech.org.ai',
  types: ['Security']
} as const

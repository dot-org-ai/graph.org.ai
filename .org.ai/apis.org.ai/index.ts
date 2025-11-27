/**
 * apis.org.ai
 *
 * Application Programming Interfaces.
 *
 * @example
 * ```typescript
 * import { WebAPI, things } from 'apis.org.ai'
 * ```
 *
 * @see https://apis.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { WebAPI } from './types'

// Import types for runtime use
import type { WebAPI } from './types'

/**
 * Collection of all apis instances
 * Fetched from https://apis.org.ai
 */
export const things: Promise<(WebAPI)[]> = fetch('https://apis.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific WebAPI by ID
 */
export async function get(id: string): Promise<WebAPI | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://apis.org.ai/${id}`)
}

/**
 * Search apis by name or description
 */
export async function search(query: string): Promise<(WebAPI)[]> {
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
  '@context': 'https://apis.org.ai',
  '@id': 'https://apis.org.ai',
  name: 'apis.org.ai',
  parent: 'tech.org.ai',
  types: ['WebAPI']
} as const

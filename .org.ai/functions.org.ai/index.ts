/**
 * functions.org.ai
 *
 * Functional units of execution or logic.
 *
 * @example
 * ```typescript
 * import { CodeFunction, things } from 'functions.org.ai'
 * ```
 *
 * @see https://functions.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { CodeFunction, GenerativeFunction, AgenticFunction, HumanFunction } from './types'

// Import types for runtime use
import type { CodeFunction, GenerativeFunction, AgenticFunction, HumanFunction } from './types'

/**
 * Collection of all functions instances
 * Fetched from https://functions.org.ai
 */
export const things: Promise<(CodeFunction | GenerativeFunction | AgenticFunction | HumanFunction)[]> = fetch('https://functions.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific CodeFunction by ID
 */
export async function get(id: string): Promise<CodeFunction | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://functions.org.ai/${id}`)
}

/**
 * Search functions by name or description
 */
export async function search(query: string): Promise<(CodeFunction | GenerativeFunction | AgenticFunction | HumanFunction)[]> {
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
  '@context': 'https://functions.org.ai',
  '@id': 'https://functions.org.ai',
  name: 'functions.org.ai',
  parent: 'nouns.org.ai',
  types: ['CodeFunction', 'GenerativeFunction', 'AgenticFunction', 'HumanFunction']
} as const

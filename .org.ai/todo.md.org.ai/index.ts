/**
 * todo.md.org.ai
 *
 * Standard specification for TODO.md files, tracking tasks and status.
 *
 * @example
 * ```typescript
 * import { Todo, things } from 'todo.md.org.ai'
 * ```
 *
 * @see https://todo.md.org.ai
 * @license CC-BY-SA-4.0
 */

// Re-export types
export type { Todo, Task } from './types'

// Import types for runtime use
import type { Todo, Task } from './types'

/**
 * Collection of all todo.md instances
 * Fetched from https://todo.md.org.ai
 */
export const things: Promise<(Todo | Task)[]> = fetch('https://todo.md.org.ai/things.json')
  .then(res => res.json())
  .catch(() => [])

/**
 * Get a specific Todo by ID
 */
export async function get(id: string): Promise<Todo | undefined> {
  const items = await things
  return items.find(item => item['@id'] === id || item['@id'] === `https://todo.md.org.ai/${id}`)
}

/**
 * Search todo.md by name or description
 */
export async function search(query: string): Promise<(Todo | Task)[]> {
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
  '@context': 'https://todo.md.org.ai',
  '@id': 'https://todo.md.org.ai',
  name: 'todo.md.org.ai',
  parent: 'markdown.org.ai',
  types: ['Todo', 'Task']
} as const

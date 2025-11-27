/**
 * todo.md.org.ai - Type Definitions
 *
 * Standard specification for TODO.md files, tracking tasks and status.
 *
 * @see https://todo.md.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Markdown } from 'markdown.org.ai'

/**
 * Todo - https://todo.md.org.ai/Todo
 */
export interface Todo extends Markdown {
  '@context': 'https://todo.md.org.ai'
  '@type': 'https://todo.md.org.ai/Todo'
  '@id': string
  name: string
  description?: string
}

/**
 * Task - https://todo.md.org.ai/Task
 */
export interface Task extends Markdown {
  '@context': 'https://todo.md.org.ai'
  '@type': 'https://todo.md.org.ai/Task'
  '@id': string
  name: string
  description?: string
}


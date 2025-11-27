/**
 * markdown.org.ai - Type Definitions
 *
 * Ontology types for markdown
 *
 * @see https://markdown.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Things } from 'things.org.ai'

/**
 * Markdown - https://markdown.org.ai/Markdown
 */
export interface Markdown extends Things {
  '@context': 'https://markdown.org.ai'
  '@type': 'https://markdown.org.ai/Markdown'
  '@id': string
  name: string
  description?: string
}


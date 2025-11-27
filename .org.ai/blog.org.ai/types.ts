/**
 * blog.org.ai - Type Definitions
 *
 * Ontology types for blog
 *
 * @see https://blog.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Media } from 'media.org.ai'

/**
 * Blog - https://blog.org.ai/Blog
 */
export interface Blog extends Media {
  '@context': 'https://blog.org.ai'
  '@type': 'https://blog.org.ai/Blog'
  '@id': string
  name: string
  description?: string
}


/**
 * news.org.ai - Type Definitions
 *
 * Ontology types for news
 *
 * @see https://news.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Media } from 'media.org.ai'

/**
 * News - https://news.org.ai/News
 */
export interface News extends Media {
  '@context': 'https://news.org.ai'
  '@type': 'https://news.org.ai/News'
  '@id': string
  name: string
  description?: string
}


/**
 * wikipedia.org.ai - Type Definitions
 *
 * Ontology types for wikipedia
 *
 * @see https://wikipedia.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Wiki } from 'wiki.org.ai'

/**
 * Wikipedia - https://wikipedia.org.ai/Wikipedia
 */
export interface Wikipedia extends Wiki {
  '@context': 'https://wikipedia.org.ai'
  '@type': 'https://wikipedia.org.ai/Wikipedia'
  '@id': string
  name: string
  description?: string
}


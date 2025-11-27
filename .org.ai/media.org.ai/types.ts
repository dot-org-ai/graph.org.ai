/**
 * media.org.ai - Type Definitions
 *
 * Ontology types for media
 *
 * @see https://media.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Things } from 'things.org.ai'

/**
 * Media - https://media.org.ai/Media
 */
export interface Media extends Things {
  '@context': 'https://media.org.ai'
  '@type': 'https://media.org.ai/Media'
  '@id': string
  name: string
  description?: string
}


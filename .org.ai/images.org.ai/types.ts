/**
 * images.org.ai - Type Definitions
 *
 * Ontology types for images
 *
 * @see https://images.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Media } from 'media.org.ai'

/**
 * Images - https://images.org.ai/Images
 */
export interface Images extends Media {
  '@context': 'https://images.org.ai'
  '@type': 'https://images.org.ai/Images'
  '@id': string
  name: string
  description?: string
}


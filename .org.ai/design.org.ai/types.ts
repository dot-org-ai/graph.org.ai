/**
 * design.org.ai - Type Definitions
 *
 * Ontology types for design
 *
 * @see https://design.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Media } from 'media.org.ai'

/**
 * Design - https://design.org.ai/Design
 */
export interface Design extends Media {
  '@context': 'https://design.org.ai'
  '@type': 'https://design.org.ai/Design'
  '@id': string
  name: string
  description?: string
}


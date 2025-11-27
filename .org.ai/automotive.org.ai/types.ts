/**
 * automotive.org.ai - Type Definitions
 *
 * Ontology types for automotive
 *
 * @see https://automotive.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Industries } from 'industries.org.ai'

/**
 * Automotive - https://automotive.org.ai/Automotive
 */
export interface Automotive extends Industries {
  '@context': 'https://automotive.org.ai'
  '@type': 'https://automotive.org.ai/Automotive'
  '@id': string
  name: string
  description?: string
}


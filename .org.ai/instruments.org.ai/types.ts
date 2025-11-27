/**
 * instruments.org.ai - Type Definitions
 *
 * Ontology types for instruments
 *
 * @see https://instruments.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Things } from 'things.org.ai'

/**
 * Instruments - https://instruments.org.ai/Instruments
 */
export interface Instruments extends Things {
  '@context': 'https://instruments.org.ai'
  '@type': 'https://instruments.org.ai/Instruments'
  '@id': string
  name: string
  description?: string
}


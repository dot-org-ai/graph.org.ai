/**
 * units.org.ai - Type Definitions
 *
 * Ontology types for units
 *
 * @see https://units.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Things } from 'things.org.ai'

/**
 * Units - https://units.org.ai/Units
 */
export interface Units extends Things {
  '@context': 'https://units.org.ai'
  '@type': 'https://units.org.ai/Units'
  '@id': string
  name: string
  description?: string
}


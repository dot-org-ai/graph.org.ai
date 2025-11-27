/**
 * equipment.org.ai - Type Definitions
 *
 * Ontology types for equipment
 *
 * @see https://equipment.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Things } from 'things.org.ai'

/**
 * Equipment - https://equipment.org.ai/Equipment
 */
export interface Equipment extends Things {
  '@context': 'https://equipment.org.ai'
  '@type': 'https://equipment.org.ai/Equipment'
  '@id': string
  name: string
  description?: string
}


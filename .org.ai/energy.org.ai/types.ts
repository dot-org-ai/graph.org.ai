/**
 * energy.org.ai - Type Definitions
 *
 * Ontology types for energy
 *
 * @see https://energy.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Science } from 'science.org.ai'

/**
 * Energy - https://energy.org.ai/Energy
 */
export interface Energy extends Science {
  '@context': 'https://energy.org.ai'
  '@type': 'https://energy.org.ai/Energy'
  '@id': string
  name: string
  description?: string
}


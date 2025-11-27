/**
 * gdpval.org.ai - Type Definitions
 *
 * Ontology types for gdpval
 *
 * @see https://gdpval.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Agi } from 'agi.org.ai'

/**
 * Gdpval - https://gdpval.org.ai/Gdpval
 */
export interface Gdpval extends Agi {
  '@context': 'https://gdpval.org.ai'
  '@type': 'https://gdpval.org.ai/Gdpval'
  '@id': string
  name: string
  description?: string
}


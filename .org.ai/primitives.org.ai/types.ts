/**
 * primitives.org.ai - Type Definitions
 *
 * Ontology types for primitives
 *
 * @see https://primitives.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

/**
 * Primitives - https://primitives.org.ai/Primitives
 */
export interface Primitives extends Thing {
  '@context': 'https://primitives.org.ai'
  '@type': 'https://primitives.org.ai/Primitives'
  '@id': string
  name: string
  description?: string
}


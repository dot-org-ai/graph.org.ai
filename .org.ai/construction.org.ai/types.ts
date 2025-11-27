/**
 * construction.org.ai - Type Definitions
 *
 * Ontology types for construction
 *
 * @see https://construction.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Industries } from 'industries.org.ai'

/**
 * Construction - https://construction.org.ai/Construction
 */
export interface Construction extends Industries {
  '@context': 'https://construction.org.ai'
  '@type': 'https://construction.org.ai/Construction'
  '@id': string
  name: string
  description?: string
}

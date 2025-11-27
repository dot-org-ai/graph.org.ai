/**
 * manufacturing.org.ai - Type Definitions
 *
 * Ontology types for manufacturing
 *
 * @see https://manufacturing.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Industries } from 'industries.org.ai'

/**
 * Manufacturing - https://manufacturing.org.ai/Manufacturing
 */
export interface Manufacturing extends Industries {
  '@context': 'https://manufacturing.org.ai'
  '@type': 'https://manufacturing.org.ai/Manufacturing'
  '@id': string
  name: string
  description?: string
}


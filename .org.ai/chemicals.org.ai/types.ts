/**
 * chemicals.org.ai - Type Definitions
 *
 * Ontology types for chemicals
 *
 * @see https://chemicals.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Science } from 'science.org.ai'

/**
 * Chemicals - https://chemicals.org.ai/Chemicals
 */
export interface Chemicals extends Science {
  '@context': 'https://chemicals.org.ai'
  '@type': 'https://chemicals.org.ai/Chemicals'
  '@id': string
  name: string
  description?: string
}


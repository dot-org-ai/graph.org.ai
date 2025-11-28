/**
 * utilities.org.ai - Type Definitions
 *
 * Ontology types for utilities
 *
 * @see https://utilities.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Science } from 'science.org.ai'

/**
 * Utilities - https://utilities.org.ai/Utilities
 */
export interface Utilities extends Science {
  '@context': 'https://utilities.org.ai'
  '@type': 'https://utilities.org.ai/Utilities'
  '@id': string
  name: string
  description?: string
  naicsCode?: string | string[]
  apqc?: string[]
  keywords?: string[]
}

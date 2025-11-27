/**
 * soc.org.ai - Type Definitions
 *
 * Standard Occupational Classification.
 *
 * @see https://soc.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Knowledge } from 'knowledge.org.ai'

/**
 * Soc - https://soc.org.ai/Soc
 */
export interface Soc extends Knowledge {
  '@context': 'https://soc.org.ai'
  '@type': 'https://soc.org.ai/Soc'
  '@id': string
  name: string
  description?: string
}


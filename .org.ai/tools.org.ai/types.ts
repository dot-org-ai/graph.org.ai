/**
 * tools.org.ai - Type Definitions
 *
 * Instruments used to perform actions.
 *
 * @see https://tools.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Things } from 'things.org.ai'

/**
 * Tool - https://tools.org.ai/Tool
 */
export interface Tool extends Things {
  '@context': 'https://tools.org.ai'
  '@type': 'https://tools.org.ai/Tool'
  '@id': string
  name: string
  description?: string
}


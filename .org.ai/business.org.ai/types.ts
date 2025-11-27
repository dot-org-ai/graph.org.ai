/**
 * business.org.ai - Type Definitions
 *
 * Commercial entities and concepts.
 *
 * @see https://business.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Things } from 'things.org.ai'

/**
 * Business - https://business.org.ai/Business
 */
export interface Business extends Things {
  '@context': 'https://business.org.ai'
  '@type': 'https://business.org.ai/Business'
  '@id': string
  name: string
  description?: string
}


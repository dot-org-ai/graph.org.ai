/**
 * knowledge.org.ai - Type Definitions
 *
 * Abstract information and concepts.
 *
 * @see https://knowledge.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Things } from 'things.org.ai'

/**
 * Knowledge - https://knowledge.org.ai/Knowledge
 */
export interface Knowledge extends Things {
  '@context': 'https://knowledge.org.ai'
  '@type': 'https://knowledge.org.ai/Knowledge'
  '@id': string
  name: string
  description?: string
}


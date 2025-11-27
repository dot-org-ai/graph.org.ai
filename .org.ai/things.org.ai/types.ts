/**
 * things.org.ai - Type Definitions
 *
 * The most generic type of item.
 *
 * @see https://things.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Schema } from 'schema.org.ai'

/**
 * Thing - https://things.org.ai/Thing
 */
export interface Thing extends Schema {
  '@context': 'https://things.org.ai'
  '@type': 'https://things.org.ai/Thing'
  '@id': string
  name: string
  description?: string
}


/**
 * properties.org.ai - Type Definitions
 *
 * Global property definitions.
 *
 * @see https://properties.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Schema } from 'schema.org.ai'

/**
 * Properties - https://properties.org.ai/Properties
 */
export interface Properties extends Schema {
  '@context': 'https://properties.org.ai'
  '@type': 'https://properties.org.ai/Properties'
  '@id': string
  name: string
  description?: string
}


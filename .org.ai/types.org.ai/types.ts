/**
 * types.org.ai - Type Definitions
 *
 * Global type definitions.
 *
 * @see https://types.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Schema } from 'schema.org.ai'

/**
 * Types - https://types.org.ai/Types
 */
export interface Types extends Schema {
  '@context': 'https://types.org.ai'
  '@type': 'https://types.org.ai/Types'
  '@id': string
  name: string
  description?: string
}


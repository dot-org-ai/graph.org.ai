/**
 * places.org.ai - Type Definitions
 *
 * Entities that have a somewhat fixed, physical extension. Includes GeoNames data.
 *
 * @see https://places.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Things } from 'things.org.ai'

/**
 * Place - https://places.org.ai/Place
 */
export interface Place extends Things {
  '@context': 'https://places.org.ai'
  '@type': 'https://places.org.ai/Place'
  '@id': string
  name: string
  description?: string
}

/**
 * Location - https://places.org.ai/Location
 */
export interface Location extends Things {
  '@context': 'https://places.org.ai'
  '@type': 'https://places.org.ai/Location'
  '@id': string
  name: string
  description?: string
}


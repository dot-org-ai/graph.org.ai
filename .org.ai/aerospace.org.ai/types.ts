/**
 * aerospace.org.ai - Type Definitions
 *
 * Ontology types for aerospace product and parts manufacturing
 *
 * @see https://aerospace.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Industries } from 'industries.org.ai'

/**
 * Aerospace - https://aerospace.org.ai/Aerospace
 *
 * Base type for aerospace industry entities including aircraft, spacecraft,
 * guided missiles, defense systems, and related parts manufacturing.
 */
export interface Aerospace extends Industries {
  '@context': 'https://aerospace.org.ai'
  '@type': 'https://aerospace.org.ai/Aerospace'
  '@id': string
  name: string
  description?: string
  naicsCode?: string
}

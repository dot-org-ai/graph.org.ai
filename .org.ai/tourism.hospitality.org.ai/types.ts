/**
 * tourism.org.ai - Type Definitions
 *
 * Ontology types for tourism
 *
 * @see https://tourism.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * Tourism - https://tourism.org.ai/Tourism
 */
export interface Tourism extends Business {
  '@context': 'https://tourism.org.ai'
  '@type': 'https://tourism.org.ai/Tourism'
  '@id': string
  name: string
  description?: string
  naicsCode?: string
  subsector?: string
}

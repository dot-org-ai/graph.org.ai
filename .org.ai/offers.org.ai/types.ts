/**
 * offers.org.ai - Type Definitions
 *
 * Ontology types for offers
 *
 * @see https://offers.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * Offers - https://offers.org.ai/Offers
 */
export interface Offers extends Business {
  '@context': 'https://offers.org.ai'
  '@type': 'https://offers.org.ai/Offers'
  '@id': string
  name: string
  description?: string
}


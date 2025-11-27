/**
 * logistics.org.ai - Type Definitions
 *
 * Ontology types for logistics
 *
 * @see https://logistics.org.ai
 * @license CC-BY-SA-4.0
 */

import type { Thing } from 'schema.org.ai'

import type { Business } from 'business.org.ai'

/**
 * Logistics - https://logistics.org.ai/Logistics
 */
export interface Logistics extends Business {
  '@context': 'https://logistics.org.ai'
  '@type': 'https://logistics.org.ai/Logistics'
  '@id': string
  name: string
  description?: string
}

